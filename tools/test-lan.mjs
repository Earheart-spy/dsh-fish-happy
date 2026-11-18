/**
 * 局域网联机服务的双实例集成测试。
 *
 * 测试只在本机开两个 UDP 发现端口和一条回环 TCP 连接，不接触公司局域网里
 * 的其他电脑。它验证发现邀请、票据接入、按座位裁剪手牌和房主退出的提示。
 */
import assert from 'node:assert/strict'
import { FishHappyLan, HOST_LEFT_TEXT } from '../lib/lan.js'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitFor(check, label, timeout = 5000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    const value = check()
    if (value) return value
    await sleep(40)
  }
  throw new Error(`等待超时：${label}`)
}

const host = new FishHappyLan({
  instanceId: 'test-host',
  nickname: '测试房主',
  discoveryPort: 45901
})
const guest = new FishHappyLan({
  instanceId: 'test-guest',
  nickname: '测试同事',
  discoveryPort: 45902
})

try {
  await host.enable()
  await guest.enable()

  // 正式环境里两个人靠组播心跳互相发现；测试里直接填写对方的地址，
  // 这样不会受 Windows 防火墙和网卡选择的影响。
  host.peers.set('test-guest', {
    instanceId: 'test-guest',
    nickname: '测试同事',
    address: '127.0.0.1',
    host: '127.0.0.1',
    status: 'idle',
    roomId: null,
    roomPort: null,
    discoveryPort: 45902,
    lastSeen: Date.now()
  })

  await host.invite('test-guest')
  const invitation = await waitFor(() => guest.getStatus().invitation, '客人收到邀请')
  assert.equal(invitation.fromNickname, '测试房主')

  await guest.answerInvite(invitation.id, true)
  await waitFor(
    () => host.getStatus().room?.seats.filter((entry) => entry.kind === 'human').length === 2,
    '房主看到客人入座'
  )
  assert.equal(host.getStatus().room.seats[1].nickname, '测试同事')

  host.startGame()
  const guestRoom = await waitFor(
    () => {
      const room = guest.getStatus().room
      return room && room.started ? room : null
    },
    '客人收到开局快照'
  )

  assert.equal(guestRoom.isHost, false, '客人不能误认为自己是房主')
  assert.equal(guestRoom.seat, 1)
  assert.equal(guestRoom.game.hand.length, 17)
  assert.deepEqual(guestRoom.game.handCounts, [17, 17, 17])
  assert.equal(guestRoom.game.landlord, null)
  assert.equal(guestRoom.game.bottom.length, 0, '地主确定前不能泄露底牌')

  const hostRoom = host.getStatus().room
  assert.equal(hostRoom.isHost, true)
  assert.equal(hostRoom.game.hand.length, 17, '房主快照也只给自己的十七张手牌')
  assert.deepEqual(hostRoom.game.handCounts, [17, 17, 17])
  assert.equal('hands' in hostRoom.game, false, '房主快照不能携带三家完整手牌')
  const hostCardIds = new Set(hostRoom.game.hand.map((card) => card.id))
  assert.ok(
    guestRoom.game.hand.every((card) => !hostCardIds.has(card.id)),
    '房主快照里不能出现客人的手牌'
  )

  host.leave()
  await waitFor(() => guest.getStatus().notice?.key === 'lan.notice.hostLeft', '客人收到房主退出提示')
  assert.equal(HOST_LEFT_TEXT, '房主摸鱼可能被抓住了，风紧撤呼！')

  console.log('局域网测试通过：邀请、票据入座、按座位裁剪手牌、房主退出提示。')
} finally {
  host.dispose()
  guest.dispose()
}
