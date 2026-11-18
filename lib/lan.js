/**
 * 「鱼乐一下」的局域网联机服务。
 *
 * 这个模块只跑在 DSH 的主机进程里，负责三件事：
 * 1. 用 UDP 广播告诉同一局域网里的其他 DSH：这台电脑在线、愿不愿意一起玩；
 * 2. 房主用 TCP 开一个牌局端口，客人凭邀请里的票据连进来；
 * 3. 房主进程保存唯一的牌局状态，校验每个座位的操作，再把按座位裁剪过的
 *    快照发给各自页面。页面和主机之间用 DSH 自己的本地 HTTP 路由通信。
 *
 * 牌局状态只在房主一侧推进。单机模式仍然是浏览器里的本地组件，不会因为
 * 这个文件的存在而在后台运行。
 */
import dgram from 'node:dgram'
import net from 'node:net'
import os from 'node:os'
import crypto from 'node:crypto'
import {
  analyze,
  applyPass,
  applyPlay,
  becomeLandlord,
  beats,
  chooseAiMove,
  chooseLead,
  createDouDizhuGame,
  aiWantsLandlord,
  sortHand
} from './rules.js'

export const LAN_PROTOCOL = 1
export const LAN_DISCOVERY_PORT = Number(process.env.FH_DISCOVERY_PORT || 45873)
export const LAN_MULTICAST = '239.255.42.99'
const DISCOVERY_INTERVAL = 3000
const PEER_TTL = 12000
const INVITE_TTL = 15000
const BID_MS = 15000
const PLAY_MS = 30000
const AI_DELAY = 800
const DISCONNECT_GRACE = 15000
const MAX_FRAME = 64 * 1024
const BASE_STAKE = 500
const START_BEANS = 10000
const HOST_LEFT_TEXT = '房主摸鱼可能被抓住了，风紧撤呼！'

function now() {
  return Date.now()
}

function hashId(text) {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16)
}

/** 找一台电脑在局域网里最可能被其他电脑访问的 IPv4 地址。 */
function lanAddress() {
  const interfaces = os.networkInterfaces()
  const candidates = []
  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if (entry.family !== 'IPv4' || entry.internal) continue
      if (entry.address.startsWith('169.254.')) continue
      candidates.push(entry.address)
    }
  }
  const privateAddress = candidates.find(
    (address) => address.startsWith('192.168.') || address.startsWith('10.') || /^172\.(1[6-9]|2\d|3[01])\./.test(address)
  )
  return privateAddress || candidates[0] || '127.0.0.1'
}

/**
 * 生成一个只在本进程内有效的实例标识。
 *
 * 早期版本只用主机名和网卡地址，同一台电脑同时开两个 DSH 进程时会算出同一个值，
 * 两个进程互相把对方的心跳当成自己的心跳丢掉。现在加一段随机后缀，保证每次启动
 * 都是新的身份；局域网里重新上线会被当成新同事，不会接错旧的房间。
 */
function makeInstanceId() {
  let user = 'player'
  try {
    user = os.userInfo().username || user
  } catch {
    // 某些受限账号拿不到用户名，退回到固定值即可。
  }
  const macs = []
  for (const entries of Object.values(os.networkInterfaces())) {
    for (const entry of entries || []) {
      if (entry.mac && entry.mac !== '00:00:00:00:00:00') macs.push(entry.mac)
    }
  }
  return hashId(`${os.hostname()}|${user}|${macs.sort().join(',')}|${crypto.randomBytes(6).toString('hex')}`)
}

function makeNickname() {
  let user = 'player'
  try {
    user = os.userInfo().username || user
  } catch {
    // 拿不到用户名时仍然使用主机名。
  }
  return `${user}@${os.hostname()}`
}

function sendJson(socket, message) {
  if (!socket || socket.destroyed) return
  try {
    socket.write(`${JSON.stringify(message)}\n`)
  } catch {
    // 对端已经断开时写入会失败，交给 close 事件统一处理。
  }
}

function parseFrames(state, chunk, onMessage) {
  state.buffer += chunk
  if (state.buffer.length > MAX_FRAME * 2) {
    state.buffer = ''
    return
  }
  let index = state.buffer.indexOf('\n')
  while (index >= 0) {
    const line = state.buffer.slice(0, index).trim()
    state.buffer = state.buffer.slice(index + 1)
    if (line) {
      try {
        onMessage(JSON.parse(line))
      } catch {
        // 单条消息损坏不影响后面的消息。
      }
    }
    index = state.buffer.indexOf('\n')
  }
}

function seatKind(seat) {
  return seat ? seat.kind : 'empty'
}

function publicSeat(seat, index, game) {
  if (!seat) {
    return {
      seat: index,
      kind: 'empty',
      nickname: '',
      connected: false,
      auto: false,
      beans: 0,
      cards: 0
    }
  }
  return {
    seat: index,
    kind: seat.kind,
    instanceId: seat.instanceId || null,
    nickname: seat.nickname || '',
    connected: seat.kind === 'ai' ? true : seat.connected !== false,
    auto: Boolean(seat.auto),
    beans: seat.beans || 0,
    cards: game ? game.hands[index].length : 0
  }
}

export class FishHappyLan {
  constructor(options = {}) {
    this.instanceId = options.instanceId || makeInstanceId()
    this.nickname = options.nickname || makeNickname()
    this.host = lanAddress()
    this.discoveryPort = Number(options.discoveryPort || LAN_DISCOVERY_PORT)
    this.enabled = false
    this.udp = null
    this.heartbeat = null
    this.peers = new Map()
    this.invitation = null
    this.outgoing = new Map()
    this.notice = null
    this.room = null
    this.guestSocket = null
    this.disposed = false
  }

  /** 打开联机开关。默认不调用，所以插件安装后不会主动发广播。 */
  async enable() {
    if (this.enabled) return this.getStatus()
    this.enabled = true
    this.notice = null
    await this.openDiscovery()
    this.heartbeat = setInterval(() => {
      this.expirePeers()
      this.sendPresence()
      this.expireInvites()
    }, DISCOVERY_INTERVAL)
    if (typeof this.heartbeat.unref === 'function') this.heartbeat.unref()
    this.sendPresence()
    return this.getStatus()
  }

  /** 关闭联机开关。已经在房间里的先退出房间，再停掉广播。 */
  async disable() {
    if (this.room) await this.leave()
    this.enabled = false
    if (this.heartbeat) clearInterval(this.heartbeat)
    this.heartbeat = null
    if (this.udp) {
      try {
        this.udp.close()
      } catch {
        // 已经关闭的套接字再次关闭会抛错，忽略即可。
      }
    }
    this.udp = null
    this.peers.clear()
    this.invitation = null
    this.outgoing.clear()
    return this.getStatus()
  }

  /** 释放所有套接字和计时器。插件卸载或进程退出时调用。 */
  dispose() {
    this.disposed = true
    void this.disable()
    this.closeRoom('dispose')
  }

  async openDiscovery() {
    await new Promise((resolve, reject) => {
      const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true })
      this.udp = socket
      socket.on('error', (error) => {
        this.notice = { key: 'lan.notice.discoveryError', params: { message: error.message } }
        if (!this.enabled) reject(error)
      })
      socket.on('message', (buffer, info) => this.handleDatagram(buffer, info))
      socket.bind(this.discoveryPort, '0.0.0.0', () => {
        try {
          socket.addMembership(LAN_MULTICAST)
          socket.setMulticastTTL(1)
          socket.setMulticastLoopback(true)
          socket.setBroadcast(true)
        } catch {
          // 某些公司网络禁止组播，保留广播和手动邀请两条路。
        }
        resolve()
      })
      socket.once('listening', () => resolve())
      socket.once('error', reject)
    }).catch((error) => {
      this.enabled = false
      this.notice = { key: 'lan.notice.discoveryError', params: { message: error.message } }
    })
  }

  sendPresence() {
    if (!this.udp || !this.enabled) return
    const message = {
      t: 'fh-presence',
      protocol: LAN_PROTOCOL,
      instanceId: this.instanceId,
      nickname: this.nickname,
      host: this.host,
      status: this.room ? (this.room.isHost ? 'hosting' : 'playing') : 'idle',
      roomId: this.room ? this.room.id : null,
      roomPort: this.room && this.room.isHost ? this.room.port : null,
      discoveryPort: this.discoveryPort,
      at: now()
    }
    const buffer = Buffer.from(JSON.stringify(message))
    const send = (address, port = LAN_DISCOVERY_PORT) => {
      try {
        this.udp.send(buffer, 0, buffer.length, port, address)
      } catch {
        // 广播失败不阻塞心跳，下一轮再试。
      }
    }
    send(LAN_MULTICAST)
    send('255.255.255.255')
  }

  handleDatagram(buffer, info) {
    if (buffer.length > MAX_FRAME) return
    let message = null
    try {
      message = JSON.parse(buffer.toString('utf8'))
    } catch {
      return
    }
    if (!message || message.protocol !== LAN_PROTOCOL) return
    if (message.t === 'fh-presence') {
      if (message.instanceId === this.instanceId) return
      this.peers.set(message.instanceId, {
        instanceId: message.instanceId,
        nickname: message.nickname || message.instanceId,
        address: info.address,
        host: message.host || info.address,
        status: message.status || 'idle',
        roomId: message.roomId || null,
        roomPort: message.roomPort || null,
        discoveryPort: Number(message.discoveryPort) || LAN_DISCOVERY_PORT,
        lastSeen: now()
      })
      return
    }
    if (message.t === 'fh-invite') {
      this.receiveInvite(message, info)
      return
    }
    if (message.t === 'fh-invite-reply') {
      const pending = this.outgoing.get(message.invitationId)
      if (!pending) return
      this.outgoing.delete(message.invitationId)
      if (this.room) {
        if (message.accepted) {
          // 对方已经答应，后面由 hello 完成入座；清掉提示，避免旧的“邀请过期”挂在牌桌上。
          this.room.notice = null
        } else {
          this.room.notice = {
            key: 'lan.notice.declined',
            params: { name: pending.nickname || pending.instanceId }
          }
        }
      }
      return
    }
    if (message.t === 'fh-ping' && this.guestSocket) {
      sendJson(this.guestSocket, { t: 'fh-pong', at: now() })
    }
  }

  receiveInvite(message, info) {
    const replyInfo = { ...info, discoveryPort: Number(message.discoveryPort) || LAN_DISCOVERY_PORT }
    if (!this.enabled || this.room || this.invitation) {
      this.sendInviteReply(message.invitationId, false, replyInfo)
      return
    }
    if (!message.roomHost || !message.roomPort || !message.ticket || !message.roomId) return
    this.invitation = {
      id: message.invitationId,
      fromInstanceId: message.instanceId,
      fromNickname: message.nickname || message.instanceId,
      roomHost: message.roomHost,
      roomPort: Number(message.roomPort),
      roomId: message.roomId,
      ticket: message.ticket,
      expiresAt: Number(message.expiresAt) || now() + INVITE_TTL,
      address: info.address,
      discoveryPort: Number(message.discoveryPort) || LAN_DISCOVERY_PORT
    }
  }

  sendInviteReply(invitationId, accepted, info) {
    if (!this.udp || !info) return
    const message = {
      t: 'fh-invite-reply',
      protocol: LAN_PROTOCOL,
      invitationId,
      accepted,
      from: this.instanceId
    }
    const buffer = Buffer.from(JSON.stringify(message))
    try {
      const port = Number(info.discoveryPort) || LAN_DISCOVERY_PORT
      this.udp.send(buffer, 0, buffer.length, port, info.address)
    } catch {
      // 对方已经离开也无需重试。
    }
  }

  expirePeers() {
    const cutoff = now() - PEER_TTL
    for (const [id, peer] of this.peers) {
      if (peer.lastSeen < cutoff) this.peers.delete(id)
    }
  }

  expireInvites() {
    if (this.invitation && this.invitation.expiresAt < now()) {
      this.invitation = null
    }
    const cutoff = now()
    for (const [id, pending] of this.outgoing) {
      if (pending.expiresAt < cutoff) {
        this.outgoing.delete(id)
        if (this.room) {
          this.room.notice = {
            key: 'lan.notice.inviteExpired',
            params: { name: pending.nickname || pending.instanceId }
          }
        }
      }
    }
  }

  async invite(instanceId) {
    if (!this.enabled) throw new Error('请先打开联机开关。')
    const peer = this.peers.get(instanceId)
    if (!peer) throw new Error('这位同事已经离线。')
    if (this.room && !this.room.isHost) throw new Error('你已经在别人的房间里。')
    if (!this.room) await this.createHostRoom()
    if (this.room.game) throw new Error('牌局已经开始，不能中途邀请。')
    const occupied = this.room.seats.filter(Boolean).length
    if (occupied >= 3) throw new Error('房间已经坐满三个人。')
    const invitationId = crypto.randomUUID()
    const ticket = crypto.randomUUID()
    const expiresAt = now() + INVITE_TTL
    this.outgoing.set(invitationId, {
      invitationId,
      instanceId,
      nickname: peer.nickname,
      expiresAt
    })
    this.room.tickets.set(ticket, { expiresAt })
    const message = {
      t: 'fh-invite',
      protocol: LAN_PROTOCOL,
      invitationId,
      instanceId: this.instanceId,
      nickname: this.nickname,
      roomId: this.room.id,
      roomHost: this.host,
      roomPort: this.room.port,
      discoveryPort: this.discoveryPort,
      ticket,
      expiresAt
    }
    const buffer = Buffer.from(JSON.stringify(message))
    const targetPort = Number(peer.discoveryPort) || LAN_DISCOVERY_PORT
    await new Promise((resolve, reject) => {
      this.udp.send(buffer, 0, buffer.length, targetPort, peer.address, (error) => {
        if (error) reject(error)
        else resolve()
      })
    })
    return this.getStatus()
  }

  async createHostRoom() {
    const room = {
      id: crypto.randomUUID(),
      isHost: true,
      seats: [
        {
          kind: 'human',
          instanceId: this.instanceId,
          nickname: this.nickname,
          connected: true,
          auto: false,
          beans: START_BEANS
        },
        null,
        null
      ],
      tickets: new Map(),
      sockets: new Map(),
      server: null,
      port: null,
      game: null,
      deadline: null,
      turnTimer: null,
      notice: null,
      bidPasses: new Set(),
      settled: false
    }
    const server = net.createServer((socket) => this.onHostSocket(socket))
    room.server = server
    await new Promise((resolve, reject) => {
      server.once('error', reject)
      server.listen(0, '0.0.0.0', resolve)
    })
    room.port = server.address().port
    room.server.on('error', () => {
      if (room.notice) return
      room.notice = { key: 'lan.notice.roomError' }
    })
    this.room = room
    this.notice = null
    return room
  }

  onHostSocket(socket) {
    const room = this.room
    if (!room || !room.isHost) {
      socket.destroy()
      return
    }
    socket.setEncoding('utf8')
    socket.setTimeout(8000)
    const state = { buffer: '' }
    socket.on('data', (chunk) => {
      parseFrames(state, chunk, (message) => this.onGuestMessage(socket, message))
    })
    socket.on('timeout', () => {
      if (!socket.seat) socket.destroy()
    })
    socket.on('error', () => {
      // close 事件里会统一清理座位。
    })
    socket.on('close', () => this.onGuestClosed(socket))
  }

  onGuestMessage(socket, message) {
    const room = this.room
    if (!room || !room.isHost) return
    if (message.t === 'fh-hello') {
      if (socket.seat !== undefined) return
      const ticket = room.tickets.get(message.ticket)
      if (!ticket || ticket.expiresAt < now() || message.roomId !== room.id) {
        sendJson(socket, { t: 'fh-error', message: '邀请已经过期，请让房主重新邀请。' })
        socket.destroy()
        return
      }
      if (room.game) {
        sendJson(socket, { t: 'fh-error', message: '牌局已经开始，请等下一局。' })
        socket.destroy()
        return
      }
      const seat = [1, 2].find((index) => !room.seats[index])
      if (seat === undefined) {
        sendJson(socket, { t: 'fh-error', message: '房间已经坐满三个人。' })
        socket.destroy()
        return
      }
      room.tickets.delete(message.ticket)
      // 入座成功时清掉这个人的待回复邀请；否则邀请的过期计时器还会再写一条“邀请过期”。
      for (const [pendingId, pending] of this.outgoing) {
        if (pending.instanceId === message.instanceId) this.outgoing.delete(pendingId)
      }
      socket.seat = seat
      room.seats[seat] = {
        kind: 'human',
        instanceId: message.instanceId,
        nickname: message.nickname || message.instanceId,
        connected: true,
        auto: false,
        beans: START_BEANS
      }
      socket.instanceId = message.instanceId
      socket.lastSeen = now()
      room.sockets.set(message.instanceId, socket)
      sendJson(socket, {
        t: 'fh-welcome',
        protocol: LAN_PROTOCOL,
        seat,
        roomId: room.id,
        hostName: this.nickname,
        snapshot: this.guestSnapshot(seat)
      })
      this.broadcast()
      return
    }
    if (socket.seat === undefined) return
    if (message.t === 'fh-pong') {
      socket.lastSeen = now()
      return
    }
    if (message.t === 'fh-leave') {
      this.removeGuest(socket, true)
      return
    }
    if (message.t === 'fh-action') {
      try {
        this.applySeatAction(socket.seat, message.action || {})
      } catch (error) {
        sendJson(socket, { t: 'fh-error', message: error.message })
      }
      this.broadcast()
    }
  }

  onGuestClosed(socket) {
    if (socket.seat === undefined) return
    this.removeGuest(socket, false)
  }

  removeGuest(socket, graceful) {
    const room = this.room
    if (!room || socket.seat === undefined) return
    const seat = room.seats[socket.seat]
    if (seat) {
      seat.connected = false
      seat.autoAfter = now() + DISCONNECT_GRACE
      if (room.game && room.game.turn === socket.seat) {
        this.scheduleTurn()
      }
    }
    room.sockets.delete(socket.instanceId)
    socket.seat = undefined
    if (graceful) {
      sendJson(socket, { t: 'fh-bye' })
      socket.destroy()
    }
    this.broadcast()
  }

  async answerInvite(invitationId, accepted) {
    const invitation = this.invitation
    if (!invitation || invitation.id !== invitationId) throw new Error('没有找到这条邀请。')
    if (!accepted) {
      this.sendInviteReply(invitation.id, false, {
        address: invitation.address,
        discoveryPort: invitation.discoveryPort
      })
      this.invitation = null
      return this.getStatus()
    }
    // 先告诉房主“我接受”，房主就能把待回复邀请清掉；真正入座仍由下面的 hello 完成。
    this.sendInviteReply(invitation.id, true, {
      address: invitation.address,
      discoveryPort: invitation.discoveryPort
    })
    await this.connectToHost(invitation)
    return this.getStatus()
  }

  async connectToHost(invitation) {
    await new Promise((resolve, reject) => {
      const socket = net.connect({ host: invitation.roomHost, port: invitation.roomPort })
      const state = { buffer: '', settled: false }
      this.guestSocket = socket
      const finish = (error) => {
        if (state.settled) return
        state.settled = true
        if (error) {
          socket.destroy()
          this.guestSocket = null
          reject(error)
        } else {
          resolve()
        }
      }
      socket.setEncoding('utf8')
      socket.setTimeout(6000)
      socket.once('connect', () => {
        sendJson(socket, {
          t: 'fh-hello',
          protocol: LAN_PROTOCOL,
          instanceId: this.instanceId,
          nickname: this.nickname,
          roomId: invitation.roomId,
          ticket: invitation.ticket
        })
      })
      socket.on('data', (chunk) => {
        parseFrames(state, chunk, (message) => {
          if (message.t === 'fh-welcome') {
            this.room = {
              id: message.roomId,
              isHost: false,
              seat: message.seat,
              hostName: message.hostName || '',
              snapshot: message.snapshot
            }
            this.invitation = null
            this.notice = null
            socket.seat = message.seat
            finish()
            return
          }
          if (message.t === 'fh-state') {
            if (this.room) this.room.snapshot = message.room
            return
          }
          if (message.t === 'fh-room-closed') {
            this.notice = { key: 'lan.notice.hostLeft' }
            this.room = null
            this.guestSocket = null
            socket.destroy()
            finish()
            return
          }
          if (message.t === 'fh-error') {
            this.notice = { key: 'lan.notice.serverError', params: { message: message.message } }
            finish(new Error(message.message))
          }
        })
      })
      socket.on('timeout', () => {
        if (!this.room) finish(new Error('连接房主超时。'))
      })
      socket.on('error', (error) => {
        if (!this.room) finish(new Error(`连接房主失败：${error.message}`))
      })
      socket.on('close', () => {
        if (this.room && !this.room.isHost) {
          this.room = null
          this.guestSocket = null
          this.notice = { key: 'lan.notice.disconnected' }
        }
        if (!state.settled) finish(new Error('房主关闭了连接。'))
      })
    }).catch((error) => {
      this.notice = { key: 'lan.notice.connectFailed', params: { message: error.message } }
      throw error
    })
  }

  startGame() {
    const room = this.room
    if (!room || !room.isHost) throw new Error('只有房主可以开始牌局。')
    if (room.game && room.game.phase !== 'over') throw new Error('牌局已经开始了。')
    room.seats = room.seats.map((seat, index) =>
      seat || {
        kind: 'ai',
        instanceId: null,
        nickname: index === 1 ? '电脑甲' : '电脑乙',
        connected: true,
        auto: false,
        beans: START_BEANS
      }
    )
    room.game = createDouDizhuGame()
    room.bidPasses.clear()
    room.settled = false
    room.deadline = now() + BID_MS
    room.notice = { key: 'lan.notice.started' }
    this.broadcast()
    this.scheduleTurn()
    return this.getStatus()
  }

  async action(action) {
    const room = this.room
    if (!room) throw new Error('还没有进入房间。')
    if (!room.isHost) {
      if (!this.guestSocket) throw new Error('和房主的连接已经断开。')
      sendJson(this.guestSocket, { t: 'fh-action', action })
      return this.getStatus()
    }
    this.applySeatAction(0, action)
    this.broadcast()
    return this.getStatus()
  }

  applySeatAction(seat, action) {
    const room = this.room
    if (!room || !room.isHost) return
    if (!room.game) throw new Error('牌局还没有开始。')
    const player = room.seats[seat]
    if (!player) throw new Error('这个座位已经没有人。')
    if (action.type === 'trustee') {
      player.auto = Boolean(action.enabled)
      room.notice = {
        key: player.auto ? 'lan.notice.trusteeOn' : 'lan.notice.trusteeOff',
        params: { name: player.nickname }
      }
      this.scheduleTurn()
      return
    }
    if (room.game.phase === 'over') throw new Error('这一局已经结束了。')
    if (room.game.turn !== seat) throw new Error('现在还没有轮到你。')
    if (action.type === 'bid') {
      this.applyBid(seat, Boolean(action.call), false)
      return
    }
    if (action.type === 'pass') {
      if (!room.game.lastPlay || room.game.lastPlay.seat === seat) {
        throw new Error('现在轮到你先出牌，不能不出。')
      }
      player.auto = false
      room.game = applyPass(room.game, seat)
      this.afterGameAction()
      return
    }
    if (action.type === 'play') {
      const ids = new Set(Array.isArray(action.cards) ? action.cards : [])
      const cards = room.game.hands[seat].filter((card) => ids.has(card.id))
      if (cards.length !== ids.size || cards.length === 0) throw new Error('选中的牌不在你的手里。')
      const combo = analyze(cards)
      if (!combo) throw new Error('这手牌不符合斗地主牌型。')
      if (!beats(combo, room.game.lastPlay ? room.game.lastPlay.combo : null)) {
        throw new Error('这手牌压不过上家的牌。')
      }
      player.auto = false
      room.game = applyPlay(room.game, seat, cards, combo)
      this.afterGameAction()
      return
    }
    throw new Error('不支持的操作。')
  }

  applyBid(seat, call, auto) {
    const room = this.room
    if (!room.game || room.game.phase !== 'bid') return
    const player = room.seats[seat]
    if (!auto) player.auto = false
    if (call) {
      room.game = becomeLandlord(room.game, seat)
      room.bidPasses.clear()
      room.notice = { key: 'lan.notice.landlord', params: { name: player.nickname } }
      this.afterGameAction()
      return
    }
    room.bidPasses.add(seat)
    if (room.bidPasses.size >= 3) {
      room.game = createDouDizhuGame()
      room.bidPasses.clear()
      room.notice = { key: 'lan.notice.redeal' }
      room.deadline = now() + BID_MS
      this.scheduleTurn()
      this.broadcast()
      return
    }
    room.game = {
      ...room.game,
      turn: (seat + 1) % 3,
      seq: room.game.seq + 1,
      actions: room.game.actions.map((entry, index) => (index === seat ? { type: 'pass' } : entry))
    }
    room.notice = { key: 'lan.notice.bidPass', params: { name: player.nickname } }
    this.afterGameAction()
  }

  afterGameAction() {
    const room = this.room
    if (!room || !room.game) return
    if (room.game.phase === 'over') {
      this.settle()
      room.deadline = null
      this.clearTurnTimer()
      this.broadcast()
      return
    }
    room.deadline = now() + (room.game.phase === 'bid' ? BID_MS : PLAY_MS)
    this.scheduleTurn()
    this.broadcast()
  }

  scheduleTurn() {
    const room = this.room
    if (!room || !room.game) return
    this.clearTurnTimer()
    if (room.game.phase === 'over') return
    const seat = room.game.turn
    const player = room.seats[seat]
    if (!player) return
    if (player.kind === 'ai' || player.auto || player.connected === false) {
      const grace = player.connected === false ? Math.max(0, (player.autoAfter || 0) - now()) : 0
      const delay = Math.max(AI_DELAY, grace)
      room.turnTimer = setTimeout(() => this.autoMove(seat), delay)
    } else {
      room.turnTimer = setTimeout(() => this.handleTimeout(seat), Math.max(0, room.deadline - now()))
    }
    if (typeof room.turnTimer.unref === 'function') room.turnTimer.unref()
  }

  handleTimeout(seat) {
    const room = this.room
    if (!room || !room.game || room.game.phase === 'over' || room.game.turn !== seat) return
    const player = room.seats[seat]
    if (!player || player.kind === 'ai' || player.auto) return
    // 倒计时超时只替玩家走这一手，不能把座位改成永久托管。否则玩家只是
    // 一次没来得及出牌，下一轮就会继续被电脑代打，连手动取消的机会都没有。
    // 真正的托管只能由玩家点“托管”按钮设置；掉线接管仍由 connected=false
    // 在 scheduleTurn 里判断。
    room.notice = { key: 'lan.notice.timeout', params: { name: player.nickname } }
    this.broadcast()
    room.turnTimer = setTimeout(() => this.autoMove(seat), 500)
  }

  autoMove(seat) {
    const room = this.room
    if (!room || !room.game || room.game.phase === 'over' || room.game.turn !== seat) return
    if (room.game.phase === 'bid') {
      this.applyBid(seat, aiWantsLandlord(room.game.hands[seat]), true)
      return
    }
    const move = chooseAiMove(room.game)
    if (move.pass) {
      // 有上一手牌时，电脑说“不出”就是真的不出；只有自由出牌时才会没有
      // 可出的牌，这时用最小的一手兜底，避免牌局停住。
      if (room.game.lastPlay) {
        room.game = applyPass(room.game, seat)
      } else {
        const cards = chooseLead(room.game.hands[seat])
        const combo = analyze(cards)
        room.game = combo
          ? applyPlay(room.game, seat, cards, combo)
          : applyPass(room.game, seat)
      }
    } else {
      const combo = analyze(move.cards)
      room.game = combo
        ? applyPlay(room.game, seat, move.cards, combo)
        : applyPass(room.game, seat)
    }
    this.afterGameAction()
  }

  settle() {
    const room = this.room
    if (!room || !room.game || room.settled) return
    if (room.game.landlord === null || room.game.winner === null) return
    room.settled = true
    const stake = BASE_STAKE * (room.game.multiplier || 1)
    const landlord = room.game.landlord
    const winner = room.game.winner
    room.seats.forEach((player, seat) => {
      if (!player) return
      const delta = seat === landlord
        ? winner === seat
          ? stake * 2
          : -stake * 2
        : winner === landlord
          ? -stake
          : stake
      player.beans = Math.max(0, (player.beans || 0) + delta)
    })
    room.notice = {
      key: 'lan.notice.settled',
      params: {
        name: room.seats[winner].nickname,
        amount: String(stake)
      }
    }
  }

  clearTurnTimer() {
    if (!this.room) return
    if (this.room.turnTimer) clearTimeout(this.room.turnTimer)
    this.room.turnTimer = null
  }

  snapshot(seat) {
    const room = this.room
    if (!room) return null
    const game = room.game
    const ownHand = game && seat !== null && game.hands[seat] ? sortHand(game.hands[seat]) : []
    return {
      roomId: room.id,
      isHost: room.isHost,
      seat,
      hostName: room.isHost ? this.nickname : room.hostName || '',
      seats: room.seats.map((entry, index) => publicSeat(entry, index, game)),
      started: Boolean(game),
      phase: game ? game.phase : 'lobby',
      deadline: room.deadline,
      serverNow: now(),
      notice: room.notice,
      game: game
        ? {
            phase: game.phase,
            turn: game.turn,
            landlord: game.landlord,
            multiplier: game.multiplier || 1,
            winner: game.winner,
            bottom: game.landlord === null ? [] : game.bottom,
            lastPlay: game.lastPlay,
            actions: game.actions,
            seq: game.seq,
            hand: ownHand,
            handCounts: game.hands.map((hand) => hand.length)
          }
        : null
    }
  }

  guestSnapshot(seat) {
    const snapshot = this.snapshot(seat)
    if (!snapshot) return null
    // 房主生成的快照天然带着 isHost: true，转发给客人之前必须改写，
    // 否则客人的页面会误以为自己是房主，显示出开局和邀请按钮。
    return {
      ...snapshot,
      isHost: false,
      seat,
      hostName: this.nickname
    }
  }

  broadcast() {
    const room = this.room
    if (!room || !room.isHost) return
    for (const [instanceId, socket] of room.sockets) {
      if (socket.seat === undefined) continue
      sendJson(socket, { t: 'fh-state', room: this.guestSnapshot(socket.seat) })
      void instanceId
    }
  }

  async leave() {
    const room = this.room
    if (!room) return this.getStatus()
    if (room.isHost) {
      for (const socket of room.sockets.values()) {
        sendJson(socket, {
          t: 'fh-room-closed',
          message: HOST_LEFT_TEXT,
          reason: 'host-left'
        })
        socket.destroy()
      }
      room.sockets.clear()
      this.clearTurnTimer()
      for (const pending of room.tickets.keys()) {
        room.tickets.delete(pending)
      }
      if (room.server) {
        try {
          room.server.close()
        } catch {
          // 服务器已经关闭时忽略。
        }
      }
      this.room = null
      this.notice = { key: 'lan.notice.roomClosed' }
      return this.getStatus()
    }
    if (this.guestSocket) {
      sendJson(this.guestSocket, { t: 'fh-leave' })
      this.guestSocket.destroy()
    }
    this.guestSocket = null
    this.room = null
    return this.getStatus()
  }

  closeRoom() {
    if (this.room && this.room.isHost) {
      for (const socket of this.room.sockets.values()) socket.destroy()
      if (this.room.server) {
        try {
          this.room.server.close()
        } catch {
          // 忽略重复关闭。
        }
      }
    }
    this.room = null
  }

  getStatus() {
    const peers = [...this.peers.values()]
      .map((peer) => ({
        instanceId: peer.instanceId,
        nickname: peer.nickname,
        host: peer.host,
        status: peer.status,
        roomPort: peer.roomPort,
        lastSeen: peer.lastSeen
      }))
      .sort((left, right) => left.nickname.localeCompare(right.nickname, 'zh-CN'))
    const room =
      this.room && this.room.isHost
        ? this.snapshot(0)
        : this.room
          ? this.room.snapshot
          : null
    return {
      protocol: LAN_PROTOCOL,
      enabled: this.enabled,
      self: {
        instanceId: this.instanceId,
        nickname: this.nickname,
        host: this.host
      },
      peers,
      invitation: this.invitation
        ? {
            id: this.invitation.id,
            fromNickname: this.invitation.fromNickname,
            expiresAt: this.invitation.expiresAt
          }
        : null,
      room,
      notice: this.notice,
      now: now()
    }
  }
}

export function isLocalRequest(request) {
  const address = request.socket && request.socket.remoteAddress
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1'
}

export async function readJsonBody(request, limit = MAX_FRAME) {
  let size = 0
  const chunks = []
  for await (const chunk of request) {
    size += chunk.length
    if (size > limit) throw new Error('请求内容太大了。')
    chunks.push(chunk)
  }
  if (chunks.length === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new Error('请求内容不是合法的 JSON。')
  }
}

export function writeJson(response, status, body) {
  const text = JSON.stringify(body)
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(text)
  })
  response.end(text)
}

export { HOST_LEFT_TEXT }
