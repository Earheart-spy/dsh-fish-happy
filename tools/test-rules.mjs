import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

const source = fs.readFileSync('lib/client.js', 'utf8')
const instrumented = source.replace(
  'return { apply, inject }',
  `return { apply, inject, __rules: {
    createDeck, shuffle, sortHand, groupByRank, analyze, beats, findBeats,
    createDouDizhuGame, becomeLandlord, resolveBid, applyPlay, applyPass,
    chooseAiMove, chooseLead, createSnakeGame, queueSnakeDirection, stepSnake,
    randomFood
  } }`
)
if (instrumented === source) {
  throw new Error('没有找到导出替换点，测试脚本需要更新。')
}

let captured = null
const sandbox = {
  console,
  window: {
    __ModuleLoader__: {
      load(definition) {
        captured = definition
      }
    }
  }
}
sandbox.globalThis = sandbox
vm.runInNewContext(instrumented, sandbox, { filename: 'lib/client.js' })
assert.ok(captured, '模块加载器没有收到定义')
const React = {
  createElement() {
    return null
  },
  useCallback: (fn) => fn,
  useEffect() {},
  useRef() {},
  useState() {},
  useReducer() {},
  useSyncExternalStore() {}
}
const exportsObject = captured.factory((name) => {
  if (name === 'react') return React
  throw new Error(`Unexpected require: ${name}`)
})
const rules = exportsObject.__rules
const {
  createDeck,
  analyze,
  beats,
  findBeats,
  createDouDizhuGame,
  resolveBid,
  applyPlay,
  applyPass,
  chooseAiMove,
  createSnakeGame,
  queueSnakeDirection,
  stepSnake
} = rules

const deck = createDeck()
assert.equal(deck.length, 54)
const cardsOfRank = (rank, count = 4) => deck.filter((card) => card.rank === rank).slice(0, count)
const card = (rank, index = 0) => cardsOfRank(rank, index + 1)[index]

// 牌型识别
assert.equal(analyze([card(3)]).kind, 'single')
assert.equal(analyze(cardsOfRank(3, 2)).kind, 'pair')
assert.equal(analyze(cardsOfRank(3, 3)).kind, 'triple')
assert.equal(analyze(cardsOfRank(3, 4)).kind, 'bomb')
assert.equal(analyze([card(16), card(17)]).kind, 'rocket')
assert.equal(analyze([...cardsOfRank(3, 3), card(4)]).kind, 'triple_single')
assert.equal(analyze([...cardsOfRank(3, 3), ...cardsOfRank(4, 2)]).kind, 'triple_pair')
assert.equal(analyze([3, 4, 5, 6, 7].map((rank) => card(rank))).kind, 'straight')
assert.equal(analyze([3, 4, 5, 6].map((rank) => card(rank))), null)
assert.equal(analyze([...cardsOfRank(3, 2), ...cardsOfRank(4, 2), ...cardsOfRank(5, 2)]).kind, 'pair_straight')
assert.equal(analyze([...cardsOfRank(3, 3), ...cardsOfRank(4, 3)]).kind, 'airplane')
assert.equal(
  analyze([...cardsOfRank(3, 3), ...cardsOfRank(4, 3), card(5), card(6)]).kind,
  'airplane_single'
)
assert.equal(
  analyze([
    ...cardsOfRank(3, 3),
    ...cardsOfRank(4, 3),
    ...cardsOfRank(5, 2),
    ...cardsOfRank(6, 2)
  ]).kind,
  'airplane_pair'
)
assert.equal(
  analyze([...cardsOfRank(3, 3), ...cardsOfRank(4, 3), ...cardsOfRank(7, 3)]),
  null
)

// 大小比较
const pair4 = analyze(cardsOfRank(4, 2))
const pair5 = analyze(cardsOfRank(5, 2))
assert.equal(beats(pair5, pair4), true)
assert.equal(beats(pair4, pair5), false)
assert.equal(beats(analyze(cardsOfRank(3, 4)), pair5), true)
assert.equal(beats(analyze([card(16), card(17)]), analyze(cardsOfRank(15, 4))), true)
assert.equal(beats(analyze(cardsOfRank(15, 4)), analyze([card(16), card(17)])), false)
assert.equal(beats(analyze([3, 4, 5, 6, 7].map((rank) => card(rank))), pair5), false)

// 提示必须给出真正能压过的牌
const hand = [...cardsOfRank(3, 2), ...cardsOfRank(4, 2), ...cardsOfRank(5, 1), ...cardsOfRank(6, 1)]
const options = findBeats(hand, analyze(cardsOfRank(3, 2)))
assert.ok(options.length > 0)
for (const option of options) {
  assert.equal(beats(option.combo, analyze(cardsOfRank(3, 2))), true, '提示返回了压不过的牌')
}
assert.ok(findBeats(hand, analyze([card(16), card(17)])).length === 0)

// 农民让队友的牌时，座位动作和桌面提示都要说明原因，不能只写“不出”
let passSetup = createDouDizhuGame()
passSetup = resolveBid(passSetup, true)
const lastCards = [card(3)]
passSetup = {
  ...passSetup,
  turn: 1,
  lastPlay: { seat: 0, cards: lastCards, combo: analyze(lastCards) }
}
const teammatePass = applyPass(passSetup, 1, 'teammate')
assert.equal(teammatePass.actions[1].type, 'pass')
assert.equal(teammatePass.actions[1].reason, 'teammate')
assert.equal(teammatePass.notice.key, 'notice.teammatePass')
const ordinaryPass = applyPass(passSetup, 1)
assert.equal(ordinaryPass.actions[1].reason, null)
assert.equal(ordinaryPass.notice.key, 'notice.pass')

// 让三家都用电脑策略把整局打完，检查流程不会卡住，也不会出现非法出牌
let finishedGames = 0
for (let round = 0; round < 300; round += 1) {
  let state = createDouDizhuGame()
  state = resolveBid(state, round % 2 === 0)
  let bidAttempts = 0
  while (state.phase === 'bid') {
    bidAttempts += 1
    assert.ok(bidAttempts < 50, '连续重新发牌太多次，叫地主流程可能没有前进')
    state = resolveBid(state, true)
  }
  let steps = 0
  while (state.phase === 'play') {
    steps += 1
    assert.ok(steps < 400, '一局牌打了太久，可能陷入循环')
    const seat = state.turn
    const move = chooseAiMove(state)
    if (move.pass) {
      assert.ok(state.lastPlay, '桌面为空时电脑不应该选择不出')
      state = applyPass(state, seat)
    } else {
      const combo = analyze(move.cards)
      assert.ok(combo, '电脑选出了不合法牌型')
      assert.ok(
        beats(combo, state.lastPlay ? state.lastPlay.combo : null),
        '电脑出了压不过上一手的牌'
      )
      state = applyPlay(state, seat, move.cards, combo)
    }
  }
  assert.equal(state.phase, 'over')
  assert.ok(state.winner === 0 || state.winner === 1 || state.winner === 2)
  assert.equal(state.hands[state.winner].length, 0)
  finishedGames += 1
}
assert.equal(finishedGames, 300)

// 贪吃蛇基础规则
let snake = createSnakeGame()
assert.equal(snake.status, 'ready')
assert.equal(snake.body.length, 3)
snake = queueSnakeDirection(snake, { x: -1, y: 0 })
assert.equal(snake.status, 'ready', '开局时不应该允许直接反向')
snake = queueSnakeDirection(snake, { x: 0, y: -1 })
assert.equal(snake.status, 'running')
assert.equal(snake.pending.length, 1)
assert.equal(snake.pending[0].x, 0)
assert.equal(snake.pending[0].y, -1)

const eatingState = {
  ...createSnakeGame(),
  status: 'running',
  body: [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 }
  ],
  dir: { x: 1, y: 0 },
  pending: [],
  food: { x: 6, y: 5 }
}
const afterEating = stepSnake(eatingState)
assert.equal(afterEating.body.length, 4)
assert.equal(afterEating.score, 10)
assert.ok(afterEating.speed < eatingState.speed)

const wallState = {
  ...createSnakeGame(),
  status: 'running',
  body: [
    { x: 19, y: 5 },
    { x: 18, y: 5 }
  ],
  dir: { x: 1, y: 0 },
  pending: [],
  food: { x: 0, y: 0 }
}
assert.equal(stepSnake(wallState).status, 'over')

const selfState = {
  ...createSnakeGame(),
  status: 'running',
  body: [
    { x: 5, y: 5 },
    { x: 6, y: 5 },
    { x: 6, y: 6 },
    { x: 5, y: 6 },
    { x: 4, y: 6 },
    { x: 4, y: 5 }
  ],
  dir: { x: 0, y: 1 },
  pending: [],
  food: { x: 0, y: 0 }
}
assert.equal(stepSnake(selfState).status, 'over')

const allCells = []
for (let y = 0; y < 20; y += 1) {
  for (let x = 0; x < 20; x += 1) {
    if (x !== 19 || y !== 0) allCells.push({ x, y })
  }
}
const winBody = [
  { x: 18, y: 0 },
  ...allCells.filter((cell) => !(cell.x === 18 && cell.y === 0))
]
const winState = {
  ...createSnakeGame(),
  status: 'running',
  body: winBody,
  dir: { x: 1, y: 0 },
  pending: [],
  food: { x: 19, y: 0 }
}
const won = stepSnake(winState)
assert.equal(won.status, 'won')
assert.equal(won.body.length, 400)

console.log('规则测试全部通过：牌型、比较、提示、农民让牌原因、300 局完整对局、贪吃蛇吃食/撞墙/撞自己/满屏。')
