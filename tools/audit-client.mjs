import fs from 'node:fs'

const source = fs.readFileSync('lib/client.js', 'utf8')
const dictStart = source.indexOf('const DICTS = {')
const zhStart = source.indexOf('zh: {', dictStart)
const enStart = source.indexOf('en: {', zhStart)
const dictEnd = source.indexOf('\n    }', enStart)
const zhBlock = source.slice(zhStart, enStart)
const enBlock = source.slice(enStart, dictEnd)

const keysOf = (block) => [...block.matchAll(/^\s+'([^']+)':/gm)].map((match) => match[1])
const zhKeys = new Set(keysOf(zhBlock))
const enKeys = new Set(keysOf(enBlock))

const missingInZh = [...enKeys].filter((key) => !zhKeys.has(key))
const missingInEn = [...zhKeys].filter((key) => !enKeys.has(key))
if (missingInZh.length || missingInEn.length) {
  console.error('中英文字典不一致', { missingInZh, missingInEn })
  process.exit(1)
}

const used = new Set()
for (const match of source.matchAll(/'((?:panel|list|card|game|snake|seat|ddz|notice|combo)\.[a-z0-9_.]+)'/g)) {
  used.add(match[1])
}
for (const match of source.matchAll(/tr\(\s*'([^']+)'/g)) {
  used.add(match[1])
}
for (const key of used) {
  if (!/^(panel|list|card|game|snake|seat|ddz|notice|combo)\./.test(key)) {
    continue
  }
  if (!zhKeys.has(key)) {
    console.error(`界面里用了不存在的文案键：${key}`)
    process.exit(1)
  }
}

const unused = [...zhKeys].filter((key) => !used.has(key))
console.log(`字典键检查通过：中文 ${zhKeys.size} 个，英文 ${enKeys.size} 个，界面使用 ${used.size} 个。`)
if (unused.length) console.log('暂时没有用到的键：', unused.join(', '))

const cssStart = source.indexOf('const CSS = `')
const cssEnd = source.indexOf('\n`', cssStart)
if (cssStart < 0 || cssEnd < 0) {
  console.error('没有找到样式字符串。')
  process.exit(1)
}
const css = source.slice(cssStart, cssEnd)
// 关键帧内部的 0%、50%、100% 不是页面选择器，它们只描述动画进度，
// 不会命中宿主元素，所以检查作用域时要把这些片段跳过。
const selectors = [...css.matchAll(/(?:^|\n)\s*([^{}@\n][^{}]*?)\s*\{/g)]
  .flatMap((match) => match[1].split(','))
  .map((selector) => selector.trim())
  .filter(Boolean)
  .filter((selector) => !/^(?:from|to|\d+%)$/.test(selector))
const unsafe = selectors.filter((selector) => !selector.includes('.fh-'))
if (unsafe.length) {
  console.error('发现没有限定在 .fh- 类名下的样式选择器，可能污染宿主界面：', unsafe)
  process.exit(1)
}
console.log(`样式选择器共 ${selectors.length} 个，全部限定在 .fh- 类名下。`)
