/**
 * 把客户端里的纯规则区同步成主机端可以直接导入的模块。
 *
 * 斗地主规则只写一份，放在 lib/client.js 的 fish-happy-rules 区域里。
 * 主机进程不能加载客户端脚本，所以这里把同一段源码抽出来，加上导出，
 * 生成 lib/rules.js。改完规则后必须重新运行本脚本，否则主机端的牌局
 * 判断会和浏览器里的单机版不一致。
 *
 * 运行方式（Electron 作为 Node 运行时）：
 *   $env:ELECTRON_RUN_AS_NODE='1'
 *   & $env:DSH_NODE_EXECUTABLE tools/sync-rules.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const clientPath = join(root, 'lib', 'client.js')
const targetPath = join(root, 'lib', 'rules.js')

const source = readFileSync(clientPath, 'utf8')
const startMarker = '// #region fish-happy-rules'
const endMarker = '// #endregion'
const start = source.indexOf(startMarker)
if (start < 0) throw new Error('lib/client.js 里找不到规则区开始标记。')
const end = source.indexOf(endMarker, start)
if (end < 0) throw new Error('lib/client.js 里找不到规则区结束标记。')

const region = source
  .slice(start + startMarker.length, end)
  .replace(/^\s*\n/, '')
  .replace(/\s+$/, '')

const constantBlock = [
  'const SNAKE_COLS = 20',
  'const SNAKE_ROWS = 20',
  'const DDZ_MAX_MULTIPLIER = 16',
  ''
].join('\n')

const exportNames = [
  'RANK_TEXT',
  'SUITS',
  'createDeck',
  'shuffle',
  'sortHand',
  'groupByRank',
  'selectCardRange',
  'isConsecutive',
  'findTripleRuns',
  'analyze',
  'beats',
  'findBeats',
  'compactSelection',
  'groupCounts',
  'longestRun',
  'chooseLead',
  'aiWantsLandlord',
  'seatNameKey',
  'createDouDizhuGame',
  'becomeLandlord',
  'resolveBid',
  'applyPlay',
  'applyPass',
  'chooseAiMove',
  'randomFood',
  'createSnakeGame',
  'queueSnakeDirection',
  'stepSnake'
]

const output = [
  '/**',
  ' * 斗地主和贪吃蛇的纯规则。',
  ' *',
  ' * 这个文件由 tools/sync-rules.mjs 从 lib/client.js 的规则区自动生成，',
  ' * 请不要直接修改；改规则请改客户端源码，再重新运行同步脚本。',
  ' * 主机进程用这些函数做联机牌局的权威判断，浏览器仍然使用客户端里的同一份源码。',
  ' */',
  '',
  constantBlock,
  region,
  '',
  `export { ${exportNames.join(', ')} }`,
  ''
].join('\n')

writeFileSync(targetPath, output, 'utf8')
console.log(`已生成 ${targetPath}，共 ${output.length} 个字符。`)
