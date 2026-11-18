import { FishHappyLan } from '../lib/lan.js'

// 这个脚本模拟另一台已经打开联机开关的同事电脑。它先上线，发现本机的 DSH，
// 再向本机发邀请。这样可以在一个浏览器里验收“收到邀请”的浮层和接受后的客人视角。
const nickname = process.argv[2] || '测试同事乙'
const discoveryPort = Number(process.argv[3] || 45911)
const hostId = process.argv[4] || ''
const autoStart = process.argv[5] === '1'
const leaveAfterMs = Number(process.argv[6] || 0)
const inviter = new FishHappyLan({ nickname, discoveryPort })

await inviter.enable()
console.log(`[fake-inviter] ${nickname} 已上线，发现端口 ${discoveryPort}`)

let invited = false
const timer = setInterval(async () => {
  if (invited) return
  if (hostId) {
    // 同一台电脑上两个实例用了不同的发现端口，组播包只会送到 45873，
    // 后启动的这个实例收不到对方心跳，所以这里直接填入已知的房主身份。
    inviter.peers.set(hostId, {
      instanceId: hostId,
      nickname: '18385@spy',
      address: '127.0.0.1',
      host: '192.168.54.60',
      status: 'idle',
      roomId: null,
      roomPort: null,
      discoveryPort: 45873,
      lastSeen: Date.now()
    })
  }
  const status = inviter.getStatus()
  if (status.peers.length > 0) {
    console.log(`[fake-inviter] 在线同事：${status.peers.map((entry) => entry.nickname).join('、')}`)
  }
  const peer = status.peers.find((entry) => entry.nickname && entry.nickname !== nickname)
  if (!peer) return
  invited = true
  try {
    await inviter.invite(peer.instanceId)
    console.log(`[fake-inviter] 已邀请 ${peer.nickname}`)
  } catch (error) {
    console.log(`[fake-inviter] 邀请失败：${error.message}`)
    invited = false
  }
}, 1000)

let started = false
let startedAt = null
let leaving = false
const watcher = setInterval(async () => {
  if (leaving) return
  const status = inviter.getStatus()
  if (!status.room) return
  const humans = status.room.seats.filter((entry) => entry && entry.kind === 'human').length
  if (autoStart && !started && !status.room.started && humans >= 2) {
    started = true
    try {
      await inviter.startGame()
      console.log('[fake-inviter] 已让房主开始牌局')
    } catch (error) {
      started = false
      console.log(`[fake-inviter] 开始失败：${error.message}`)
    }
    return
  }
  if (status.room.started && !startedAt) startedAt = Date.now()
  if (startedAt && leaveAfterMs > 0 && Date.now() - startedAt >= leaveAfterMs) {
    leaving = true
    clearInterval(watcher)
    clearInterval(timer)
    try {
      await inviter.leave()
      console.log('[fake-inviter] 房主主动离开房间')
    } catch (error) {
      console.log(`[fake-inviter] 离开失败：${error.message}`)
    }
    setTimeout(() => process.exit(0), 500)
  }
}, 1000)

process.on('SIGINT', () => {
  clearInterval(timer)
  void inviter.dispose().finally(() => process.exit(0))
})
await new Promise((resolve) => setTimeout(resolve, 24 * 60 * 60 * 1000))
