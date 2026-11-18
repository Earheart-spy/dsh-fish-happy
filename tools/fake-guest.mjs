import { FishHappyLan } from '../lib/lan.js'

// 这个脚本模拟一台已经打开联机开关的同事电脑。它不画界面，
// 只负责让房主的页面能完成邀请、入座和出牌流程，方便在单个浏览器里验收房主侧界面。
const nickname = process.argv[2] || '测试同事'
const discoveryPort = Number(process.argv[3] || 45910)
const guest = new FishHappyLan({ nickname, discoveryPort })

let accepted = false
let acted = null

function lowestSingle(hand) {
  if (!hand || hand.length === 0) return null
  const sorted = [...hand].sort((left, right) => left.rank - right.rank)
  return [sorted[0]]
}

async function tick() {
  const status = guest.getStatus()
  if (status.invitation && !accepted) {
    accepted = true
    try {
      await guest.answerInvite(status.invitation.id, true)
      console.log(`[fake-guest] 接受邀请：${status.invitation.fromNickname}`)
    } catch (error) {
      console.log(`[fake-guest] 接受邀请失败：${error.message}`)
    }
  }
  const room = status.room
  if (!room || !room.game) return
  const game = room.game
  const key = `${game.phase}:${game.turn}:${game.seq}:${room.seat}`
  if (game.turn !== room.seat || key === acted) return
  acted = key
  try {
    if (game.phase === 'bid') {
      await guest.action({ type: 'bid', call: false })
      console.log('[fake-guest] 不叫')
    } else if (game.phase === 'play') {
      if (game.lastPlay) {
        await guest.action({ type: 'pass' })
        console.log('[fake-guest] 不出')
      } else {
        const cards = lowestSingle(game.hand)
        if (cards) {
          await guest.action({ type: 'play', cards: cards.map((card) => card.id) })
          console.log(`[fake-guest] 出 ${cards[0].rank}`)
        }
      }
    }
  } catch (error) {
    console.log(`[fake-guest] 操作失败：${error.message}`)
  }
}

await guest.enable()
console.log(`[fake-guest] ${nickname} 已上线，发现端口 ${discoveryPort}`)
setInterval(() => {
  void tick()
}, 700)
// Electron 以 Node 方式运行时，标准输入关闭会让进程提前退出；这里挂一个长时间计时器保持进程活着。
await new Promise((resolve) => setTimeout(resolve, 24 * 60 * 60 * 1000))
