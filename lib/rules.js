/**
 * 斗地主和贪吃蛇的纯规则。
 *
 * 这个文件由 tools/sync-rules.mjs 从 lib/client.js 的规则区自动生成，
 * 请不要直接修改；改规则请改客户端源码，再重新运行同步脚本。
 * 主机进程用这些函数做联机牌局的权威判断，浏览器仍然使用客户端里的同一份源码。
 */

const SNAKE_COLS = 20
const SNAKE_ROWS = 20
const DDZ_MAX_MULTIPLIER = 16

    // 这一区域只放不依赖浏览器和 React 的纯函数，方便单独测试。

    const RANK_TEXT = {
      3: '3',
      4: '4',
      5: '5',
      6: '6',
      7: '7',
      8: '8',
      9: '9',
      10: '10',
      11: 'J',
      12: 'Q',
      13: 'K',
      14: 'A',
      15: '2',
      16: '小',
      17: '大'
    }

    const SUITS = [
      { key: 'spade', symbol: '♠', red: false, index: 0 },
      { key: 'heart', symbol: '♥', red: true, index: 1 },
      { key: 'club', symbol: '♣', red: false, index: 2 },
      { key: 'diamond', symbol: '♦', red: true, index: 3 }
    ]

    /** 生成一副完整的五十四个牌面。 */
    function createDeck() {
      const deck = []
      for (let rank = 3; rank <= 15; rank += 1) {
        for (const suit of SUITS) {
          deck.push({
            id: `${rank}-${suit.key}`,
            rank,
            suit: suit.key,
            symbol: suit.symbol,
            red: suit.red,
            suitIndex: suit.index,
            joker: false
          })
        }
      }
      deck.push({
        id: 'joker-small',
        rank: 16,
        suit: 'joker',
        symbol: '王',
        red: false,
        suitIndex: 4,
        joker: true
      })
      deck.push({
        id: 'joker-big',
        rank: 17,
        suit: 'joker',
        symbol: '王',
        red: true,
        suitIndex: 5,
        joker: true
      })
      return deck
    }

    /** 用 Fisher-Yates 算法打乱一副牌。 */
    function shuffle(cards) {
      const result = cards.slice()
      for (let index = result.length - 1; index > 0; index -= 1) {
        const other = Math.floor(Math.random() * (index + 1))
        const temp = result[index]
        result[index] = result[other]
        result[other] = temp
      }
      return result
    }

    /** 按点数从大到小整理手牌，同点数时按花色排序。 */
    function sortHand(cards) {
      return cards.slice().sort((left, right) => {
        if (left.rank !== right.rank) return right.rank - left.rank
        return left.suitIndex - right.suitIndex
      })
    }

    /** 把牌按点数分组，结果里每个点数对应一个数组。 */
    function groupByRank(cards) {
      const groups = new Map()
      for (const card of cards) {
        const group = groups.get(card.rank)
        if (group) group.push(card)
        else groups.set(card.rank, [card])
      }
      for (const group of groups.values()) {
        group.sort((left, right) => left.suitIndex - right.suitIndex)
      }
      return groups
    }

    /**
     * 按拖动范围更新选中的牌。
     *
     * 拖动开始时记录最初选中的牌，之后每次划过一张牌，都从这份最初状态重新
     * 计算整段范围。这样用户把鼠标拖回来时，划过的牌会重新取消选中，不会
     * 因为反复累加而选乱。additive 为真表示把范围加进选中集合，为假表示
     * 把范围从选中集合里去掉。返回值仍然按手牌原本的顺序排列。
     */
    function selectCardRange(hand, initialIds, anchor, current, additive) {
      const start = Math.min(anchor, current)
      const end = Math.max(anchor, current)
      const selected = new Set(initialIds)
      for (let index = start; index <= end; index += 1) {
        const card = hand[index]
        if (!card) continue
        if (additive) selected.add(card.id)
        else selected.delete(card.id)
      }
      return hand.filter((card) => selected.has(card.id)).map((card) => card.id)
    }

    /** 判断一排点数是不是连续的一段。 */
    function isConsecutive(ranks) {
      if (ranks.length === 0) return false
      for (let index = 1; index < ranks.length; index += 1) {
        if (ranks[index] !== ranks[index - 1] + 1) return false
      }
      return ranks[ranks.length - 1] <= 14
    }

    /**
     * 在点数计数表里找出长度为 length 的连续三张组。
     *
     * 返回值里 start 是这段连续点数的起点，end 是终点，ranks 是完整的点数列表。
     * 如果找不到符合条件的连续段，就返回空数组。
     */
    function findTripleRuns(counts, length) {
      const triples = []
      for (const [rank, count] of counts) {
        if (rank <= 14 && count >= 3) triples.push(rank)
      }
      triples.sort((left, right) => left - right)
      const runs = []
      for (let index = 0; index + length <= triples.length; index += 1) {
        const start = triples[index]
        let ok = true
        for (let offset = 1; offset < length; offset += 1) {
          if (triples[index + offset] !== start + offset) {
            ok = false
            break
          }
        }
        if (!ok) continue
        const ranks = []
        for (let offset = 0; offset < length; offset += 1) ranks.push(start + offset)
        runs.push({ start, end: start + length - 1, ranks })
      }
      return runs
    }

    /**
     * 判断一组牌属于哪种牌型。
     *
     * 返回对象里 kind 表示牌型名称，rank 表示比较大小用的主点数，
     * len 表示这手牌的张数。牌型不合法时返回 null。
     */
    function analyze(cards) {
      if (!Array.isArray(cards) || cards.length === 0) return null
      const counts = new Map()
      for (const card of cards) {
        counts.set(card.rank, (counts.get(card.rank) || 0) + 1)
      }
      const ranks = [...counts.keys()].sort((left, right) => left - right)
      const total = cards.length
      const countOf = (rank) => counts.get(rank) || 0

      if (total === 2 && countOf(16) === 1 && countOf(17) === 1) {
        return { kind: 'rocket', rank: 17, len: 2 }
      }
      if (total === 4 && ranks.length === 1) {
        return { kind: 'bomb', rank: ranks[0], len: 4 }
      }
      if (total === 1) {
        return { kind: 'single', rank: ranks[0], len: 1 }
      }
      if (total === 2 && ranks.length === 1) {
        return { kind: 'pair', rank: ranks[0], len: 2 }
      }
      if (total === 3 && ranks.length === 1) {
        return { kind: 'triple', rank: ranks[0], len: 3 }
      }
      if (total === 4 && ranks.length === 2) {
        const tripleRank = ranks.find((rank) => countOf(rank) === 3)
        if (tripleRank !== undefined) {
          return { kind: 'triple_single', rank: tripleRank, len: 4 }
        }
      }
      if (total === 5 && ranks.length === 2) {
        const tripleRank = ranks.find((rank) => countOf(rank) === 3)
        const pairRank = ranks.find((rank) => countOf(rank) === 2)
        if (tripleRank !== undefined && pairRank !== undefined) {
          return { kind: 'triple_pair', rank: tripleRank, len: 5 }
        }
      }
      if (total >= 5 && ranks.length === total && isConsecutive(ranks)) {
        return { kind: 'straight', rank: ranks[ranks.length - 1], len: total }
      }
      if (total >= 6 && total % 2 === 0 && ranks.length === total / 2) {
        if (ranks.every((rank) => countOf(rank) === 2) && isConsecutive(ranks)) {
          return { kind: 'pair_straight', rank: ranks[ranks.length - 1], len: total }
        }
      }
      if (total >= 6 && total % 3 === 0 && ranks.length === total / 3) {
        if (ranks.every((rank) => countOf(rank) === 3) && isConsecutive(ranks)) {
          return { kind: 'airplane', rank: ranks[ranks.length - 1], len: total }
        }
      }
      if (total >= 10 && total % 5 === 0) {
        const length = total / 5
        for (const run of findTripleRuns(counts, length)) {
          const runSet = new Set(run.ranks)
          let rest = 0
          let restRanks = 0
          let valid = true
          for (const [rank, count] of counts) {
            if (runSet.has(rank)) {
              if (count > 3) valid = false
              continue
            }
            if (count !== 2) valid = false
            rest += count
            restRanks += 1
          }
          if (valid && rest === length * 2 && restRanks === length) {
            return { kind: 'airplane_pair', rank: run.end, len: total }
          }
        }
      }
      if (total >= 8 && total % 4 === 0) {
        const length = total / 4
        for (const run of findTripleRuns(counts, length)) {
          const runSet = new Set(run.ranks)
          let rest = 0
          let valid = true
          for (const [rank, count] of counts) {
            if (runSet.has(rank)) {
              if (count > 3) valid = false
              continue
            }
            rest += count
          }
          if (valid && rest === length) {
            return { kind: 'airplane_single', rank: run.end, len: total }
          }
        }
      }
      return null
    }

    /** 判断当前牌型能不能压过桌面上的牌型。桌面为空时永远可以出牌。 */
    function beats(current, previous) {
      if (!previous) return true
      if (!current) return false
      if (current.kind === 'rocket') return true
      if (previous.kind === 'rocket') return false
      if (current.kind === 'bomb') {
        return previous.kind !== 'bomb' || current.rank > previous.rank
      }
      if (previous.kind === 'bomb') return false
      if (current.kind !== previous.kind) return false
      if (current.len !== previous.len) return false
      return current.rank > previous.rank
    }

    /**
     * 从手牌里找出所有能压过上一手牌的出法。
     *
     * 结果按代价从低到高排序：普通牌型排在前面，炸弹其次，王炸最后。
     * 每个候选项都带 cards（具体要出的牌）和 combo（牌型分析结果）。
     */
    function findBeats(hand, previous) {
      if (!previous) return []
      const groups = groupByRank(hand)
      const ranks = [...groups.keys()].sort((left, right) => left - right)
      const results = []
      const seen = new Set()
      const rankHas = (rank, count) => (groups.get(rank) || []).length >= count
      const take = (rank, count) => (groups.get(rank) || []).slice(0, count)
      const push = (cards) => {
        if (!cards || cards.length === 0) return
        const combo = analyze(cards)
        if (!combo || !beats(combo, previous)) return
        const key = cards.map((card) => card.id).sort().join(',')
        if (seen.has(key)) return
        seen.add(key)
        results.push({ cards: sortHand(cards), combo })
      }

      if (previous.kind === 'single') {
        for (const rank of ranks) push([groups.get(rank)[0]])
      } else if (previous.kind === 'pair') {
        for (const rank of ranks) {
          if (rankHas(rank, 2)) push(take(rank, 2))
        }
      } else if (previous.kind === 'triple') {
        for (const rank of ranks) {
          if (rankHas(rank, 3)) push(take(rank, 3))
        }
      } else if (previous.kind === 'triple_single') {
        for (const tripleRank of ranks) {
          if (tripleRank <= previous.rank || !rankHas(tripleRank, 3)) continue
          for (const wingRank of ranks) {
            if (wingRank === tripleRank) continue
            push([...take(tripleRank, 3), take(wingRank, 1)[0]])
          }
        }
      } else if (previous.kind === 'triple_pair') {
        for (const tripleRank of ranks) {
          if (tripleRank <= previous.rank || !rankHas(tripleRank, 3)) continue
          for (const wingRank of ranks) {
            if (wingRank === tripleRank || !rankHas(wingRank, 2)) continue
            push([...take(tripleRank, 3), ...take(wingRank, 2)])
          }
        }
      } else if (previous.kind === 'straight') {
        const length = previous.len
        for (let start = 3; start + length - 1 <= 14; start += 1) {
          const end = start + length - 1
          if (end <= previous.rank) continue
          const cards = []
          let valid = true
          for (let rank = start; rank <= end; rank += 1) {
            if (!rankHas(rank, 1)) {
              valid = false
              break
            }
            cards.push(take(rank, 1)[0])
          }
          if (valid) push(cards)
        }
      } else if (previous.kind === 'pair_straight') {
        const length = previous.len
        const pairs = length / 2
        for (let start = 3; start + pairs - 1 <= 14; start += 1) {
          const end = start + pairs - 1
          if (end <= previous.rank) continue
          const cards = []
          let valid = true
          for (let rank = start; rank <= end; rank += 1) {
            if (!rankHas(rank, 2)) {
              valid = false
              break
            }
            cards.push(...take(rank, 2))
          }
          if (valid) push(cards)
        }
      } else if (previous.kind === 'airplane') {
        const triples = previous.len / 3
        for (const run of findTripleRuns(groupCounts(groups), triples)) {
          if (run.end <= previous.rank) continue
          const cards = []
          for (const rank of run.ranks) cards.push(...take(rank, 3))
          push(cards)
        }
      } else if (previous.kind === 'airplane_single') {
        const triples = previous.len / 4
        for (const run of findTripleRuns(groupCounts(groups), triples)) {
          if (run.end <= previous.rank) continue
          const runSet = new Set(run.ranks)
          const cards = []
          for (const rank of run.ranks) cards.push(...take(rank, 3))
          const pool = []
          for (const rank of ranks) {
            if (runSet.has(rank)) continue
            pool.push(...groups.get(rank))
          }
          pool.sort((left, right) => left.rank - right.rank)
          if (pool.length < triples) continue
          cards.push(...pool.slice(0, triples))
          push(cards)
        }
      } else if (previous.kind === 'airplane_pair') {
        const triples = previous.len / 5
        for (const run of findTripleRuns(groupCounts(groups), triples)) {
          if (run.end <= previous.rank) continue
          const runSet = new Set(run.ranks)
          const cards = []
          for (const rank of run.ranks) cards.push(...take(rank, 3))
          let pairCount = 0
          for (const rank of ranks) {
            if (runSet.has(rank) || !rankHas(rank, 2)) continue
            cards.push(...take(rank, 2))
            pairCount += 1
            if (pairCount === triples) break
          }
          if (pairCount === triples) push(cards)
        }
      }

      if (previous.kind !== 'rocket') {
        for (const rank of ranks) {
          if (!rankHas(rank, 4)) continue
          if (previous.kind === 'bomb' && rank <= previous.rank) continue
          push(take(rank, 4))
        }
        if (rankHas(16, 1) && rankHas(17, 1)) {
          push([take(16, 1)[0], take(17, 1)[0]])
        }
      }

      results.sort((left, right) => {
        const weight = (combo) => {
          if (combo.kind === 'rocket') return 1000
          if (combo.kind === 'bomb') return 100
          return 0
        }
        return (
          weight(left.combo) - weight(right.combo) ||
          left.combo.rank - right.combo.rank ||
          left.cards.length - right.cards.length
        )
      })
      return results
    }

    /** 把按点数分组的牌表转换成点数到张数的计数表。 */
    function groupCounts(groups) {
      const counts = new Map()
      for (const [rank, cards] of groups) counts.set(rank, cards.length)
      return counts
    }

    /** 找出手牌里最长的一段连续点数，用来决定电脑先出什么顺子。 */
    function longestRun(ranks) {
      let best = []
      let current = []
      for (const rank of ranks) {
        if (current.length === 0 || rank === current[current.length - 1] + 1) {
          current.push(rank)
        } else {
          current = [rank]
        }
        if (current.length > best.length) best = current.slice()
      }
      return best
    }

    /**
     * 电脑主动出牌时挑一组牌。
     *
     * 策略很直接：能一次出完就一次出完；否则先出最长的顺子，再出最小的单张，
     * 尽量把大牌和炸弹留到后面。
     */
    function chooseLead(hand) {
      const whole = analyze(hand)
      if (whole) return hand
      const groups = groupByRank(hand)
      const ranks = [...groups.keys()].sort((left, right) => left - right)
      const straightRanks = ranks.filter(
        (rank) => rank <= 14 && (groups.get(rank) || []).length < 4
      )
      const run = longestRun(straightRanks)
      if (run.length >= 5) {
        return run.map((rank) => groups.get(rank)[0])
      }
      const lowSingles = ranks.filter(
        (rank) => (groups.get(rank) || []).length === 1 && rank < 15
      )
      if (lowSingles.length > 0) return [groups.get(lowSingles[0])[0]]
      const pairs = ranks.filter((rank) => {
        const count = (groups.get(rank) || []).length
        return count >= 2 && count < 4
      })
      if (pairs.length > 0) return groups.get(pairs[0]).slice(0, 2)
      const triples = ranks.filter((rank) => (groups.get(rank) || []).length === 3)
      if (triples.length > 0) return groups.get(triples[0]).slice(0, 3)
      const plain = ranks.filter((rank) => (groups.get(rank) || []).length < 4)
      const pool = plain.length > 0 ? plain : ranks
      return [groups.get(pool[0])[0]]
    }

    /** 判断电脑拿到这手牌后愿不愿意叫地主。 */
    function aiWantsLandlord(hand) {
      let score = 0
      const groups = groupByRank(hand)
      for (const card of hand) {
        if (card.rank === 17) score += 5
        else if (card.rank === 16) score += 4
        else if (card.rank === 15) score += 2
        else if (card.rank === 14) score += 1
      }
      for (const cards of groups.values()) {
        if (cards.length === 4) score += 5
        else if (cards.length === 3) score += 1
      }
      return score >= 6
    }

    /** 返回某个座位在文案字典里对应的称呼键。 */
    function seatNameKey(seat) {
      if (seat === 0) return 'seat.you'
      if (seat === 1) return 'seat.left'
      return 'seat.right'
    }

    /**
     * 发一副新牌，进入叫地主阶段。
     *
     * 人类玩家固定在零号座位，另外两个座位是电脑。发牌顺序不影响结果，
     * 这里只是把五十四张牌切成十七、十七、十七和三张底牌。
     */
    function createDouDizhuGame(deckInput) {
      const deck = deckInput ? deckInput.slice() : shuffle(createDeck())
      return {
        phase: 'bid',
        hands: [
          sortHand(deck.slice(0, 17)),
          sortHand(deck.slice(17, 34)),
          sortHand(deck.slice(34, 51))
        ],
        bottom: sortHand(deck.slice(51, 54)),
        landlord: null,
        turn: 0,
        lastPlay: null,
        actions: [null, null, null],
        winner: null,
        notice: null,
        multiplier: 1,
        seq: 0
      }
    }

    /** 把某个座位设为地主，把三张底牌并进他的手牌，然后进入出牌阶段。 */
    function becomeLandlord(state, seat) {
      const hands = state.hands.map((hand, index) =>
        index === seat ? sortHand([...hand, ...state.bottom]) : hand
      )
      return {
        ...state,
        hands,
        landlord: seat,
        phase: 'play',
        turn: seat,
        lastPlay: null,
        actions: [null, null, null],
        notice: { key: 'notice.landlord', params: { nameKey: seatNameKey(seat) } },
        seq: state.seq + 1
      }
    }

    /**
     * 处理人类玩家的叫地主选择。
     *
     * 人类先决定；如果人类不叫，两位电脑依次按手牌强度决定。三个人都不叫时
     * 重新发牌，避免一局游戏卡在叫牌阶段。
     */
    function resolveBid(state, call) {
      if (state.phase !== 'bid') return state
      if (call) return becomeLandlord(state, 0)
      for (const seat of [1, 2]) {
        if (aiWantsLandlord(state.hands[seat])) return becomeLandlord(state, seat)
      }
      const next = createDouDizhuGame()
      return { ...next, notice: { key: 'notice.redeal' } }
    }

    /**
     * 让某个座位打出一手牌。
     *
     * 函数会从手牌里移除这些牌，记录桌面上的上一手牌和该座位的最近动作，
     * 然后切换到下一个座位。如果出完牌后手牌为空，这一局立刻结束。
     */
    function applyPlay(state, seat, cards, combo) {
      if (!combo) return state
      const played = new Set(cards.map((card) => card.id))
      const hands = state.hands.map((hand, index) =>
        index === seat ? hand.filter((card) => !played.has(card.id)) : hand
      )
      const actions = state.actions.slice()
      actions[seat] = { type: 'play', cards, combo }
      const doubled = combo.kind === 'bomb' || combo.kind === 'rocket'
      const multiplier = doubled
        ? Math.min((state.multiplier || 1) * 2, DDZ_MAX_MULTIPLIER)
        : state.multiplier || 1
      const next = {
        ...state,
        hands,
        actions,
        lastPlay: { seat, cards, combo },
        turn: (seat + 1) % 3,
        notice: null,
        multiplier,
        seq: state.seq + 1
      }
      if (hands[seat].length === 0) {
        return { ...next, phase: 'over', winner: seat, turn: seat, lastPlay: null }
      }
      return next
    }

    /**
     * 让某个座位选择不出。
     *
     * `reason` 只用于界面说明，例如农民为了配合队友而主动让牌。它不参与
     * 规则判断；没有传时就显示普通的“不出”。
     *
     * 如果下一个座位正好是上一手牌的主人，说明另外两家都不要，桌面清空，
     * 由上一手牌的主人重新自由出牌。
     */
    function applyPass(state, seat, reason = null) {
      const nextSeat = (seat + 1) % 3
      const actions = state.actions.slice()
      actions[seat] = { type: 'pass', reason }
      const next = {
        ...state,
        actions,
        turn: nextSeat,
        notice: {
          key: reason === 'teammate' ? 'notice.teammatePass' : 'notice.pass',
          params: { nameKey: seatNameKey(seat) }
        },
        seq: state.seq + 1
      }
      if (state.lastPlay && state.lastPlay.seat === nextSeat) {
        return {
          ...next,
          lastPlay: null,
          actions: [null, null, null],
          notice: { key: 'notice.newRound' }
        }
      }
      return next
    }

    /**
     * 电脑决定这一轮怎么走。
     *
     * 农民不会压自己队友的牌；只有当地主快出完、或者自己手里牌很少时，
     * 电脑才会动用炸弹。找不到能压过的牌就选择不出。
     */
    function chooseAiMove(state) {
      const seat = state.turn
      const hand = state.hands[seat]
      const lastPlay = state.lastPlay
      const landlord = state.landlord
      const isFarmer = seat !== landlord
      const teammate = isFarmer
        ? [0, 1, 2].find((other) => other !== seat && other !== landlord)
        : null
      if (lastPlay && isFarmer && lastPlay.seat === teammate) {
        return { pass: true, reason: 'teammate' }
      }
      if (!lastPlay) {
        const cards = chooseLead(hand)
        return cards.length > 0 ? { cards } : { pass: true }
      }
      const candidates = findBeats(hand, lastPlay.combo)
      if (candidates.length === 0) return { pass: true }
      const finishers = candidates.filter((candidate) => candidate.cards.length === hand.length)
      if (finishers.length > 0) return { cards: finishers[0].cards }
      const opponentSeats = isFarmer
        ? [landlord]
        : [0, 1, 2].filter((other) => other !== landlord)
      const opponentMin = Math.min(...opponentSeats.map((other) => state.hands[other].length))
      const urgent = opponentMin <= 2 || hand.length <= 6
      const normal = candidates.filter(
        (candidate) => candidate.combo.kind !== 'bomb' && candidate.combo.kind !== 'rocket'
      )
      if (normal.length > 0) return { cards: normal[0].cards }
      if (urgent) return { cards: candidates[0].cards }
      return { pass: true }
    }

    /** 生成一个不会落在蛇身上的食物位置；棋盘已经占满时返回 null。 */
    function randomFood(body) {
      const occupied = new Set(body.map((segment) => `${segment.x},${segment.y}`))
      const free = []
      for (let y = 0; y < SNAKE_ROWS; y += 1) {
        for (let x = 0; x < SNAKE_COLS; x += 1) {
          if (!occupied.has(`${x},${y}`)) free.push({ x, y })
        }
      }
      if (free.length === 0) return null
      return free[Math.floor(Math.random() * free.length)]
    }

    /** 创建一局还没开始的贪吃蛇。 */
    function createSnakeGame() {
      const body = [
        { x: 7, y: 10 },
        { x: 6, y: 10 },
        { x: 5, y: 10 }
      ]
      return {
        body,
        dir: { x: 1, y: 0 },
        pending: [],
        food: randomFood(body),
        score: 0,
        status: 'ready',
        speed: 180
      }
    }

    /**
     * 记录玩家按下的方向。
     *
     * 游戏同时只接受最多两个待执行方向，避免快速连按时蛇身出现不自然的折返。
     * 反方向会被忽略，因为那样会立刻撞到自己的脖子。
     */
    function queueSnakeDirection(state, dir) {
      if (state.status === 'ready') {
        if (dir.x === -state.dir.x && dir.y === -state.dir.y) return state
        return { ...state, status: 'running', pending: [dir] }
      }
      if (state.status !== 'running') return state
      const last = state.pending.length > 0 ? state.pending[state.pending.length - 1] : state.dir
      if (dir.x === -last.x && dir.y === -last.y) return state
      if (dir.x === last.x && dir.y === last.y) return state
      return { ...state, pending: [...state.pending, dir].slice(-2) }
    }

    /**
     * 推进贪吃蛇一帧。
     *
     * 函数先取一个待执行方向，再计算新蛇头的位置并判断撞墙和撞自己。
     * 吃到食物时身体变长、分数增加、移动速度略微加快；棋盘占满时结束游戏。
     */
    function stepSnake(state) {
      if (state.status !== 'running') return state
      let dir = state.dir
      const pending = state.pending.slice()
      while (pending.length > 0) {
        const candidate = pending[0]
        pending.shift()
        if (candidate.x === -dir.x && candidate.y === -dir.y) continue
        if (candidate.x === dir.x && candidate.y === dir.y) continue
        dir = candidate
        break
      }
      const head = { x: state.body[0].x + dir.x, y: state.body[0].y + dir.y }
      if (head.x < 0 || head.x >= SNAKE_COLS || head.y < 0 || head.y >= SNAKE_ROWS) {
        return { ...state, dir, pending, status: 'over' }
      }
      const eating = state.food !== null && head.x === state.food.x && head.y === state.food.y
      const obstacle = eating ? state.body : state.body.slice(0, -1)
      if (obstacle.some((segment) => segment.x === head.x && segment.y === head.y)) {
        return { ...state, dir, pending, status: 'over' }
      }
      const body = [head, ...state.body]
      if (!eating) body.pop()
      if (!eating) return { ...state, body, dir, pending }
      const score = state.score + 10
      const speed = Math.max(75, state.speed - 4)
      const food = randomFood(body)
      return {
        ...state,
        body,
        dir,
        pending,
        food,
        score,
        speed,
        status: food === null ? 'won' : 'running'
      }
    }

export { RANK_TEXT, SUITS, createDeck, shuffle, sortHand, groupByRank, selectCardRange, isConsecutive, findTripleRuns, analyze, beats, findBeats, groupCounts, longestRun, chooseLead, aiWantsLandlord, seatNameKey, createDouDizhuGame, becomeLandlord, resolveBid, applyPlay, applyPass, chooseAiMove, randomFood, createSnakeGame, queueSnakeDirection, stepSnake }
