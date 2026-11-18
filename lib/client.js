window.__ModuleLoader__.load({
  id: 'dsh-fish-happy',
  factory: (require) => {
    const React = require('react')
    const h = React.createElement

    /** 侧边栏入口和主面板共用的标识，两者必须完全一致。 */
    const PANEL_ID = 'fish-happy'
    /** 侧边栏里的排序值，数值越小越靠上。 */
    const PANEL_ORDER = 40
    /** 本插件在语言服务里占用的命名空间。 */
    const NS = 'fish-happy'
    /** 贪吃蛇最高分保存在浏览器本地，关闭页面后仍然保留。 */
    const SNAKE_BEST_KEY = 'dsh-fish-happy:snake-best'
    /** 贪吃蛇棋盘的列数和行数。 */
    const SNAKE_COLS = 20
    const SNAKE_ROWS = 20
    /** 叫地主最多想多久，时间到了就自动不叫。 */
    const DDZ_BID_SECONDS = 15
    /** 轮到自己出牌时最多想多久，时间到了就自动按规则处理。 */
    const DDZ_PLAY_SECONDS = 30
    /** 发牌动画持续的时间，动画结束后才允许叫地主。 */
    const DDZ_DEAL_MS = 1300
    /** 新玩家的初始欢乐豆数量。 */
    const DDZ_START_BEANS = 10000
    /** 每局的基础底注，输赢按这个数结算。 */
    const DDZ_BASE_STAKE = 500
    /** 欢乐豆不够底注时，系统补发的数量。 */
    const DDZ_RELIEF_BEANS = 1000
    /** 一局里炸弹最多把倍数翻到多少，避免结算数字大得离谱。 */
    const DDZ_MAX_MULTIPLIER = 16
    /** 人类玩家的欢乐豆余额保存在浏览器本地。 */
    const DDZ_BEAN_KEY = 'dsh-fish-happy:ddz-beans'
    /** 联机接口都挂在 DSH 本机 Web 服务的这个前缀下面。 */
    const LAN_BASE = '/plugins/dsh-fish-happy/lan'
    /** 浏览器本地记录联机开关，用来决定全局邀请浮层要不要开始轮询。 */
    const LAN_FLAG_KEY = 'dsh-fish-happy:lan-enabled'

    /**
     * 界面文案字典。
     *
     * 这里同时准备中文和英文两份。插件通过宿主机的语言服务取当前语言，
     * 所以用户在设置里切换语言后，重新投影出来的文字会跟着变化。
     */
    const DICTS = {
      zh: {
        'panel.label': '鱼乐一下',
        'list.kicker': '轻量小游戏',
        'list.title': '鱼乐一下',
        'list.subtitle': '工作间隙，挑一局小游戏放松几分钟。游戏只在打开这个面板时运行。',
        'list.footnote': '单机游戏离开面板后就会停止；联机牌局由房主进程继续运行，直到牌局结束或你离开牌桌。',
        'list.open': '开始游戏',
        'card.badge': '单人',
        'card.snake.title': '贪吃蛇',
        'card.snake.desc': '吃掉红点让身体变长，别撞上墙，也别咬到自己的尾巴。',
        'card.snake.tag1': '经典',
        'card.snake.tag2': '键盘可玩',
        'card.ddz.title': '斗地主',
        'card.ddz.desc': '你和两位电脑玩家同桌，三人斗地主单机版，随时来一局。',
        'card.ddz.tag1': '纸牌',
        'card.ddz.tag2': '两位电脑对手',
        'card.lan.title': '局域网斗地主',
        'card.lan.badge': '联机',
        'card.lan.desc': '和同一局域网里的同事开一桌，人不够时电脑补位。',
        'card.lan.tag1': '联机',
        'card.lan.tag2': '同事同桌',
        'game.backToList': '游戏列表',
        'game.backToChat': '返回会话',
        'game.restart': '重开',
        'snake.score': '本局得分',
        'snake.best': '最高分',
        'snake.length': '蛇身长度',
        'snake.pause': '暂停',
        'snake.resume': '继续',
        'snake.ready.title': '准备好了吗',
        'snake.ready.text': '用方向键或 W A S D 控制方向，空格键暂停。',
        'snake.start': '开始',
        'snake.paused.title': '已暂停',
        'snake.paused.text': '按空格键，或者点下面的继续按钮回到游戏。',
        'snake.over.title': '撞到了',
        'snake.over.text': '这一局到此为止，活动一下再来。',
        'snake.won.title': '满屏了',
        'snake.won.text': '整个棋盘都被你占满了，没有地方再放食物。',
        'snake.again': '再来一局',
        'snake.newBest': '新纪录',
        'snake.controls': '方向键 / W A S D 移动 · 空格暂停',
        'snake.dpad': '方向控制',
        'seat.you': '你',
        'seat.left': '电脑甲',
        'seat.right': '电脑乙',
        'ddz.title': '斗地主',
        'ddz.badge': '单人 · 三人局',
        'ddz.landlord': '地主',
        'ddz.farmer': '农民',
        'ddz.bottom': '底牌',
        'ddz.cardsLeft': '剩 {count} 张',
        'ddz.hand': '你的手牌',
        'ddz.turn.you': '轮到你出牌',
        'ddz.turn.other': '{name} 正在想牌…',
        'ddz.bid.you': '你先决定要不要当地主',
        'ddz.bid.title': '这手牌叫地主吗',
        'ddz.bid.text': '叫地主后，三张底牌会归你，你先出牌。',
        'ddz.bid.call': '叫地主',
        'ddz.bid.pass': '不叫',
        'ddz.play': '出牌',
        'ddz.hint': '提示',
        'ddz.pass': '不出',
        'ddz.passTeammate': '队友的牌，不压',
        'ddz.played': '出牌',
        'ddz.selectedCombo': '已选 {count} 张 · {combo}',
        'ddz.selectedInvalid': '已选 {count} 张 · 牌型不合法',
        'ddz.notSelected': '点牌选中，再按出牌',
        'ddz.dragHint': '点按选牌；按住鼠标横向拖动，可以连续选中多张。',
        'ddz.ready.kicker': '单机斗地主',
        'ddz.ready.title': '准备开始',
        'ddz.ready.text': '点开始后发牌，发完牌进入叫地主。',
        'ddz.ready.start': '开始游戏',
        'ddz.ready.beans': '你带着 {amount} 欢乐豆入场，本局底注 {stake}。',
        'ddz.dealing.title': '正在发牌',
        'ddz.dealing.text': '十七张手牌正在发到三家手里。',
        'ddz.beans': '欢乐豆 {amount}',
        'ddz.beansShort': '{amount} 豆',
        'ddz.stake': '底注 {amount}',
        'ddz.multiplier': '倍数 ×{value}',
        'ddz.beansDelta': '本局 {delta} 欢乐豆',
        'ddz.beansBalance': '余额 {amount} 欢乐豆',
        'ddz.beansRelief': '欢乐豆不足，系统补了 {amount}。',
        'ddz.trustee': '托管',
        'ddz.trusteeOn': '取消托管',
        'ddz.trusteeTag': '托管中',
        'ddz.autoSuggested': '时间快到了，已按提示选好，点“出牌”确认。',
        'ddz.mustPass': '要不起，点“不出”继续。',
        'ddz.countdown': '剩 {seconds} 秒',
        'ddz.invalid': '这几张牌凑不成合法牌型',
        'ddz.cannotBeat': '这手牌压不过上家的牌',
        'ddz.noHint': '没有能压过的牌，可以不出',
        'ddz.win': '你赢了',
        'ddz.lose': '你输了',
        'ddz.win.landlord': '地主获胜，两位农民都没能拦住你。',
        'ddz.win.farmer': '农民获胜，你和队友一起把地主拉下马。',
        'ddz.lose.landlord': '农民配合得更好，这一局地主输了。',
        'ddz.lose.farmer': '地主的牌更顺，下一局再找机会。',
        'ddz.again': '再来一局',
        'ddz.roleLine': '本局身份：{role}',
        'lan.kicker': '局域网联机',
        'lan.title': '和同事玩一局',
        'lan.subtitle': '只发现同样打开联机开关的同事。找不到人时，可以确认双方在同一网段。',
        'lan.fairness': '房主和客人拿到的是同一份按座位裁剪的牌局，房主页面也只显示自己的手牌。',
        'lan.disabled.title': '联机还没有开启',
        'lan.disabled.text': '开启后，这台电脑每三秒发一次局域网心跳，同事才能看到你。关闭后心跳立即停止。',
        'lan.enable': '开启联机',
        'lan.disable': '关闭联机',
        'lan.online': '在线同事',
        'lan.noPeers': '还没有发现同事。请让对方也打开鱼乐一下并开启联机。',
        'lan.refresh': '刷新',
        'lan.invite': '邀请',
        'lan.invited': '已邀请',
        'lan.accept': '接受',
        'lan.decline': '拒绝',
        'lan.inviteFrom': '{name} 邀请你加入牌桌',
        'lan.inviteHint': '同意后会进入房主的牌桌，空位由电脑补齐。',
        'lan.room': '牌桌',
        'lan.waiting': '等待房主开始',
        'lan.host': '房主',
        'lan.guest': '客人',
        'lan.ai': '电脑',
        'lan.start': '开始牌局',
        'lan.again': '再来一局',
        'lan.leave': '离开牌桌',
        'lan.trustee': '托管',
        'lan.trusteeOff': '取消托管',
        'lan.you': '你',
        'lan.turnYou': '轮到你出牌',
        'lan.bidTurn': '轮到你叫地主',
        'lan.waitBid': '等待其他玩家叫地主',
        'lan.otherTurn': '等待 {name}',
        'lan.pass': '不出',
        'lan.play': '出牌',
        'lan.hint': '提示',
        'lan.selected': '已选 {count} 张',
        'lan.invalid': '这几张牌凑不成合法牌型。',
        'lan.cannotBeat': '这手牌压不过上家的牌。',
        'lan.mustPass': '要不起，点“不出”继续。',
        'lan.win': '你赢了',
        'lan.lose': '你输了',
        'lan.hostLeft': '房主摸鱼可能被抓住了，风紧撤呼！',
        'lan.waitHost': '等待房主重新开局',
        'lan.seatEmpty': '空位（电脑补）',
        'lan.beans': '{amount} 豆',
        'lan.connected': '在线',
        'lan.disconnected': '掉线，电脑托管',
        'lan.notice.started': '牌局开始了',
        'lan.notice.settled': '本局结束',
        'lan.notice.landlord': '{name} 成为地主',
        'lan.notice.bidPass': '{name} 不叫',
        'lan.notice.redeal': '三家都不叫，重新发牌',
        'lan.notice.trusteeOn': '{name} 开启了托管',
        'lan.notice.trusteeOff': '{name} 取消了托管',
        'lan.notice.timeout': '{name} 超时，电脑接管',
        'lan.notice.declined': '{name} 拒绝了邀请',
        'lan.notice.inviteExpired': '{name} 的邀请已经过期',
        'lan.notice.discoveryError': '局域网发现失败：{message}',
        'lan.notice.connectFailed': '连接房主失败：{message}',
        'lan.notice.serverError': '房主返回错误：{message}',
        'lan.notice.disconnected': '和房主的连接断开了',
        'lan.notice.hostLeft': '房主摸鱼可能被抓住了，风紧撤呼！',
        'lan.notice.roomClosed': '房间已经关闭',
        'lan.notice.disconnectedRoom': '房主已经离开，牌桌关闭了',
        'notice.pass': '{name} 选择不出',
        'notice.teammatePass': '{name} 不压队友的牌',
        'notice.newRound': '两家都不要，新一轮自由出牌',
        'notice.landlord': '{name} 成为地主',
        'notice.redeal': '两位电脑都没有叫地主，重新发牌',
        'combo.single': '单张',
        'combo.pair': '对子',
        'combo.triple': '三张',
        'combo.triple_single': '三带一',
        'combo.triple_pair': '三带二',
        'combo.straight': '顺子',
        'combo.pair_straight': '连对',
        'combo.airplane': '飞机',
        'combo.airplane_single': '飞机带单',
        'combo.airplane_pair': '飞机带对',
        'combo.bomb': '炸弹',
        'combo.rocket': '王炸',
        'card.joker.small': '小王',
        'card.joker.big': '大王'
      },
      en: {
        'panel.label': 'Fish Happy',
        'list.kicker': 'Quick games',
        'list.title': 'Fish Happy',
        'list.subtitle': 'Pick a small game and take a short break. Games run only while this panel is open.',
        'list.footnote': 'Single-player games stop when you leave the panel. A LAN table keeps running in the host process until the round ends or you leave the table.',
        'list.open': 'Play',
        'card.badge': 'Solo',
        'card.snake.title': 'Snake',
        'card.snake.desc': 'Eat the red dots to grow. Do not hit the wall or bite your own tail.',
        'card.snake.tag1': 'Classic',
        'card.snake.tag2': 'Keyboard friendly',
        'card.ddz.title': 'Dou Dizhu',
        'card.ddz.desc': 'A three-player card game, solo against two computer players. Jump in whenever you like.',
        'card.ddz.tag1': 'Cards',
        'card.ddz.tag2': 'Two computer rivals',
        'card.lan.title': 'LAN Dou Dizhu',
        'card.lan.badge': 'Multiplayer',
        'card.lan.desc': 'Open a table with coworkers on the same network. Computers fill empty seats.',
        'card.lan.tag1': 'LAN',
        'card.lan.tag2': 'Play with coworkers',
        'game.backToList': 'Games',
        'game.backToChat': 'Back to chat',
        'game.restart': 'Restart',
        'snake.score': 'Score',
        'snake.best': 'Best',
        'snake.length': 'Length',
        'snake.pause': 'Pause',
        'snake.resume': 'Resume',
        'snake.ready.title': 'Ready?',
        'snake.ready.text': 'Use the arrow keys or W A S D to steer. Press Space to pause.',
        'snake.start': 'Start',
        'snake.paused.title': 'Paused',
        'snake.paused.text': 'Press Space, or use the resume button below, to keep playing.',
        'snake.over.title': 'Ouch',
        'snake.over.text': 'That run is over. Stretch a little and try again.',
        'snake.won.title': 'Board cleared',
        'snake.won.text': 'The whole board is yours. There is nowhere left to place food.',
        'snake.again': 'Play again',
        'snake.newBest': 'New best',
        'snake.controls': 'Arrow keys / W A S D to move · Space to pause',
        'snake.dpad': 'Direction pad',
        'seat.you': 'You',
        'seat.left': 'Computer A',
        'seat.right': 'Computer B',
        'ddz.title': 'Dou Dizhu',
        'ddz.badge': 'Solo · Three players',
        'ddz.landlord': 'Landlord',
        'ddz.farmer': 'Farmer',
        'ddz.bottom': 'Bottom cards',
        'ddz.cardsLeft': '{count} left',
        'ddz.hand': 'Your hand',
        'ddz.turn.you': 'Your turn to play',
        'ddz.turn.other': '{name} is thinking…',
        'ddz.bid.you': 'You decide first whether to take the landlord role',
        'ddz.bid.title': 'Take the landlord role?',
        'ddz.bid.text': 'If you call, the three bottom cards join your hand and you lead the first round.',
        'ddz.bid.call': 'Call landlord',
        'ddz.bid.pass': 'Pass',
        'ddz.play': 'Play',
        'ddz.hint': 'Hint',
        'ddz.pass': 'Pass',
        'ddz.passTeammate': 'Teammate’s play, hold back',
        'ddz.played': 'Played',
        'ddz.selectedCombo': '{count} selected · {combo}',
        'ddz.selectedInvalid': '{count} selected · not a legal combination',
        'ddz.notSelected': 'Select cards, then press Play',
        'ddz.dragHint': 'Tap cards to select; hold and drag across them to select a run.',
        'ddz.ready.kicker': 'Solo Dou Dizhu',
        'ddz.ready.title': 'Ready to start',
        'ddz.ready.text': 'Press start to deal. Bidding begins when the cards are out.',
        'ddz.ready.start': 'Start game',
        'ddz.ready.beans': 'You bring {amount} Happy Beans. Base stake: {stake}.',
        'ddz.dealing.title': 'Dealing',
        'ddz.dealing.text': 'Seventeen cards are on their way to each seat.',
        'ddz.beans': 'Happy Beans {amount}',
        'ddz.beansShort': '{amount} beans',
        'ddz.stake': 'Stake {amount}',
        'ddz.multiplier': 'Multiplier ×{value}',
        'ddz.beansDelta': 'This round: {delta} Happy Beans',
        'ddz.beansBalance': 'Balance: {amount} Happy Beans',
        'ddz.beansRelief': 'Not enough beans. The table added {amount}.',
        'ddz.trustee': 'Trustee',
        'ddz.trusteeOn': 'Cancel trustee',
        'ddz.trusteeTag': 'Trustee on',
        'ddz.autoSuggested': 'Time is short. A suggested play is selected; press Play to confirm.',
        'ddz.mustPass': 'You cannot beat it. Press Pass to continue.',
        'ddz.countdown': '{seconds}s left',
        'ddz.invalid': 'Those cards do not form a legal combination',
        'ddz.cannotBeat': 'That combination cannot beat the previous play',
        'ddz.noHint': 'Nothing can beat it. You can pass.',
        'ddz.win': 'You win',
        'ddz.lose': 'You lose',
        'ddz.win.landlord': 'The landlord wins. Neither farmer could stop you.',
        'ddz.win.farmer': 'The farmers win. You and your partner took the landlord down.',
        'ddz.lose.landlord': 'The farmers worked together better. The landlord loses this one.',
        'ddz.lose.farmer': 'The landlord had the smoother hand. Try again next round.',
        'ddz.again': 'Play again',
        'ddz.roleLine': 'Your role: {role}',
        'lan.kicker': 'LAN multiplayer',
        'lan.title': 'Play with coworkers',
        'lan.subtitle': 'Only coworkers who also turned on LAN discovery can see each other. If nobody appears, make sure you are on the same subnet.',
        'lan.fairness': 'The host and every guest receive the same seat-scoped table. The host page also shows only its own hand.',
        'lan.disabled.title': 'LAN play is off',
        'lan.disabled.text': 'When enabled, this computer sends a LAN heartbeat every three seconds so coworkers can find you. Turning it off stops the heartbeat immediately.',
        'lan.enable': 'Turn on LAN play',
        'lan.disable': 'Turn off LAN play',
        'lan.online': 'Coworkers online',
        'lan.noPeers': 'No coworkers found yet. Ask them to open Fish Happy and turn on LAN play.',
        'lan.refresh': 'Refresh',
        'lan.invite': 'Invite',
        'lan.invited': 'Invited',
        'lan.accept': 'Accept',
        'lan.decline': 'Decline',
        'lan.inviteFrom': '{name} invited you to a table',
        'lan.inviteHint': 'Accepting joins the host table. Computers fill any empty seats.',
        'lan.room': 'Table',
        'lan.waiting': 'Waiting for the host to start',
        'lan.host': 'Host',
        'lan.guest': 'Guest',
        'lan.ai': 'Computer',
        'lan.start': 'Start round',
        'lan.again': 'Play again',
        'lan.leave': 'Leave table',
        'lan.trustee': 'Trustee',
        'lan.trusteeOff': 'Cancel trustee',
        'lan.you': 'You',
        'lan.turnYou': 'Your turn to play',
        'lan.bidTurn': 'Your turn to bid',
        'lan.waitBid': 'Waiting for the other players to bid',
        'lan.otherTurn': 'Waiting for {name}',
        'lan.pass': 'Pass',
        'lan.play': 'Play',
        'lan.hint': 'Hint',
        'lan.selected': '{count} selected',
        'lan.invalid': 'Those cards do not form a legal combination.',
        'lan.cannotBeat': 'That combination cannot beat the previous play.',
        'lan.mustPass': 'You cannot beat it. Press Pass to continue.',
        'lan.win': 'You win',
        'lan.lose': 'You lose',
        'lan.hostLeft': 'The host bailed out. Time to scatter!',
        'lan.waitHost': 'Waiting for the host to start another round',
        'lan.seatEmpty': 'Empty (computer fills in)',
        'lan.beans': '{amount} beans',
        'lan.connected': 'Online',
        'lan.disconnected': 'Disconnected, computer playing',
        'lan.notice.started': 'The round has started',
        'lan.notice.settled': 'The round is over',
        'lan.notice.landlord': '{name} is the landlord',
        'lan.notice.bidPass': '{name} passes the bid',
        'lan.notice.redeal': 'Nobody bid. Dealing again.',
        'lan.notice.trusteeOn': '{name} turned on the trustee',
        'lan.notice.trusteeOff': '{name} turned off the trustee',
        'lan.notice.timeout': '{name} timed out. The computer takes over.',
        'lan.notice.declined': '{name} declined the invitation',
        'lan.notice.inviteExpired': 'The invitation from {name} has expired',
        'lan.notice.discoveryError': 'LAN discovery failed: {message}',
        'lan.notice.connectFailed': 'Could not connect to the host: {message}',
        'lan.notice.serverError': 'The host returned an error: {message}',
        'lan.notice.disconnected': 'The connection to the host dropped',
        'lan.notice.hostLeft': 'The host bailed out. Time to scatter!',
        'lan.notice.roomClosed': 'The room is closed',
        'lan.notice.disconnectedRoom': 'The host left and the table closed',
        'notice.pass': '{name} passes',
        'notice.teammatePass': '{name} holds back for a teammate',
        'notice.newRound': 'Both players passed. The table is open again.',
        'notice.landlord': '{name} is the landlord',
        'notice.redeal': 'Neither computer called. Dealing again.',
        'combo.single': 'single',
        'combo.pair': 'pair',
        'combo.triple': 'triple',
        'combo.triple_single': 'triple with a single',
        'combo.triple_pair': 'triple with a pair',
        'combo.straight': 'straight',
        'combo.pair_straight': 'pair straight',
        'combo.airplane': 'airplane',
        'combo.airplane_single': 'airplane with singles',
        'combo.airplane_pair': 'airplane with pairs',
        'combo.bomb': 'bomb',
        'combo.rocket': 'rocket',
        'card.joker.small': 'Little Joker',
        'card.joker.big': 'Big Joker'
      }
    }

    /**
     * 在语言服务还没有接好时使用的兜底翻译。
     *
     * 它按页面根元素的 lang 属性挑中文或英文，保证插件刚挂载的那一瞬间
     * 也不会把内部键名直接显示给用户。
     */
    function fallbackTranslate(key, params) {
      const language = (typeof document !== 'undefined' && document.documentElement.lang) || 'zh'
      const dict = language.toLowerCase().startsWith('zh') ? DICTS.zh : DICTS.en
      let text = dict[key] ?? key
      if (params) {
        for (const [name, value] of Object.entries(params)) {
          text = text.replaceAll(`{${name}}`, String(value))
        }
      }
      return text
    }

    /** 当前正在使用的翻译函数，apply 接好语言服务后会替换掉兜底版本。 */
    let translate = fallbackTranslate

    /** 把当前语言服务返回的翻译函数接进来。 */
    function setTranslate(next) {
      translate = typeof next === 'function' ? next : fallbackTranslate
    }

    /** 翻译一个文案键，并替换其中的 {name} 占位符。 */
    function tr(key, params) {
      return translate(key, params)
    }

    /** 把欢乐豆数字排成带千位分隔的写法，结算时更容易读。 */
    function formatBeans(amount) {
      const value = Number.isFinite(Number(amount)) ? Number(amount) : 0
      return value.toLocaleString('zh-CN')
    }

    /** 从浏览器本地读出人类玩家的欢乐豆余额；没有记录时返回初始值。 */
    function readBeans() {
      try {
        const raw = window.localStorage.getItem(DDZ_BEAN_KEY)
        if (raw !== null && raw.trim() !== '') {
          const saved = Number(raw)
          if (Number.isFinite(saved) && saved >= 0) return Math.floor(saved)
        }
      } catch (error) {
        console.warn('[fish-happy] 读取欢乐豆余额失败，先使用初始值。', error)
      }
      return DDZ_START_BEANS
    }

    /** 把人类玩家的欢乐豆余额写回浏览器；写入失败只记录警告，不打断游戏。 */
    function writeBeans(amount) {
      try {
        window.localStorage.setItem(DDZ_BEAN_KEY, String(Math.max(0, Math.floor(amount))))
      } catch (error) {
        console.warn('[fish-happy] 保存欢乐豆余额失败。', error)
      }
    }

    /**
     * 调用本机的联机接口。
     *
     * 接口只接受本机页面的请求，所以这里直接用同源相对地址，不拼接主机名。
     * 服务器返回的错误信息会原样抛给调用方，方便界面显示“邀请已过期”之类的
     * 具体原因，而不是只显示一个失败码。
     */
    async function lanRequest(path, body) {
      const options = body === undefined
        ? { method: 'GET' }
        : {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          }
      const response = await fetch(`${LAN_BASE}/${path}`, options)
      let data = null
      try {
        data = await response.json()
      } catch {
        data = null
      }
      if (!response.ok) {
        throw new Error((data && data.error) || `联机接口返回 ${response.status}`)
      }
      return data
    }

    // #region fish-happy-rules
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

    /**
     * 把拖动框选出来的一堆牌，收敛成一手合法的牌。
     *
     * 玩家横向拖动时，手指经过的范围往往比真正要出的牌多。例如手牌是
     * 556778999，上一手是 34567，从 5 拖到 9 会框住九张牌，但真正能出的
     * 只有 56789。这里先看框住的牌能不能压过上一手；不能压或者桌面为空时，
     * 就让规则挑一手最自然的牌。实在凑不出合法牌型时，保留玩家原来的选择，
     * 让他自己看清哪几张不对。
     */
    function compactSelection(hand, ids, previousCombo) {
      const wanted = new Set(ids)
      const cards = hand.filter((card) => wanted.has(card.id))
      if (cards.length <= 1) return ids
      if (previousCombo) {
        const replies = findBeats(cards, previousCombo)
        if (replies.length > 0) return replies[0].cards.map((card) => card.id)
        return ids
      }
      const lead = chooseLead(cards)
      if (lead.length > 0) return lead.map((card) => card.id)
      return ids
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

    // #endregion

    /**
     * 保存插件运行时拿到的服务。
     *
     * 组件挂载时从这里取语言服务和布局服务。布局服务要等到用户点击时才解析，
     * 避免插件启动顺序不同导致取到空值。
     */
    const runtime = { ctx: null, locale: null }

    /** 取布局服务，负责在游戏列表和会话之间切换。 */
    function getLayout() {
      if (!runtime.ctx) return null
      if (typeof runtime.ctx.get !== 'function') return null
      return runtime.ctx.get('layout') || null
    }

    /** 回到会话主界面。 */
    function leaveToConversation() {
      const layout = getLayout()
      if (!layout || typeof layout.selectPanel !== 'function') return
      try {
        layout.selectPanel(null)
      } catch (error) {
        console.warn('[fish-happy] 无法通过空值返回会话，改为直接选择会话面板。', error)
        try {
          layout.selectPanel('conversation')
        } catch (secondError) {
          console.warn('[fish-happy] 返回会话失败。', secondError)
        }
      }
    }

    /** 读取贪吃蛇最高分；浏览器禁用本地存储时返回零。 */
    function readSnakeBest() {
      try {
        const raw = window.localStorage.getItem(SNAKE_BEST_KEY)
        const value = raw ? Number.parseInt(raw, 10) : 0
        return Number.isFinite(value) && value > 0 ? value : 0
      } catch (error) {
        return 0
      }
    }

    /** 把最高分写进本地存储；写入失败不影响游戏。 */
    function saveSnakeBest(score) {
      try {
        window.localStorage.setItem(SNAKE_BEST_KEY, String(score))
      } catch (error) {
        // 浏览器可能禁用本地存储，这里保持安静即可。
      }
    }

    /** 把一条提示记录翻译成当前语言的句子。 */
    function noticeText(notice) {
      if (!notice) return ''
      const params = { ...(notice.params || {}) }
      if (params.nameKey) {
        params.name = tr(params.nameKey)
        delete params.nameKey
      }
      return tr(notice.key, params)
    }

    /** 侧边栏里的鱼形图标。图标只用描边，颜色继承按钮文字颜色。 */
    function FishGlyph({ size = 16, entryId }) {
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.3,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
          'data-dsh-panel-entry': entryId
        },
        h('path', {
          d: 'M2.2 8.2c1.9-3 4.9-4.3 7.7-3.8l2.3 3.5-2.3 3.6c-2.8.6-5.8-.7-7.7-3.3Z'
        }),
        h('path', { d: 'M12.1 5.2 14.3 3v10l-2.2-2.2' }),
        h('circle', { cx: 5.4, cy: 7.6, r: 0.7, fill: 'currentColor', stroke: 'none' }),
        h('path', { d: 'M5.8 9.5c.7.5 1.5.5 2.2.1' }),
        h('path', { d: 'M2.1 3.4v1.8M1.2 4.3h1.8' })
      )
    }

    /** 侧边栏入口组件。外层壳子负责按钮、提示和选中态，这里只画图标。 */
    function FishHappyPanelIcon({ size }) {
      return h(FishGlyph, { size: size || 16, entryId: PANEL_ID })
    }

    /** 一条小蛇的线稿，用在游戏卡片上。 */
    function SnakeGlyph() {
      return h(
        'svg',
        {
          viewBox: '0 0 32 32',
          width: 28,
          height: 28,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.9,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true'
        },
        h('path', { d: 'M5 25c0-3.3 2.6-6 6-6h5.2a5 5 0 0 0 0-10H10a4 4 0 0 1-4-4' }),
        h('circle', { cx: 7.2, cy: 5.2, r: 1.5, fill: 'currentColor', stroke: 'none' }),
        h('path', { d: 'M23.2 8.5 27 6M24 13h4.5' })
      )
    }

    /** 两张叠在一起的扑克牌线稿，用在游戏卡片上。 */
    function CardsGlyph() {
      return h(
        'svg',
        {
          viewBox: '0 0 32 32',
          width: 28,
          height: 28,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true'
        },
        h('rect', { x: 7, y: 4.5, width: 13, height: 19, rx: 2.4 }),
        h('path', { d: 'M13.5 9.5 16 13l2.5-3.5' }),
        h('path', { d: 'M16 13v5.5M13.4 17h5.2' }),
        h('rect', { x: 12.5, y: 8.5, width: 13, height: 19, rx: 2.4 })
      )
    }

    /** 局域网联机图标：三台电脑通过一条线连在一起。 */
    function LanGlyph() {
      return h(
        'svg',
        {
          viewBox: '0 0 32 32',
          width: 28,
          height: 28,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true'
        },
        h('rect', { x: 5, y: 8, width: 8, height: 6, rx: 1.4 }),
        h('rect', { x: 19, y: 8, width: 8, height: 6, rx: 1.4 }),
        h('rect', { x: 12, y: 19, width: 8, height: 6, rx: 1.4 }),
        h('path', { d: 'M13 11h6M9 14v5h3M23 14v5h-3M16 19v-3' })
      )
    }

    /** 向左箭头，用在返回按钮上。 */
    function ChevronLeftGlyph() {
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: 14,
          height: 14,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true'
        },
        h('path', { d: 'm10 3-5 5 5 5' })
      )
    }

    /** 向右箭头，用在开始游戏的按钮上。 */
    function ArrowRightGlyph() {
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: 14,
          height: 14,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true'
        },
        h('path', { d: 'm6 3 5 5-5 5' })
      )
    }

    /** 关闭图标，用在返回会话的按钮上。 */
    function CloseGlyph() {
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: 14,
          height: 14,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinecap: 'round',
          'aria-hidden': 'true'
        },
        h('path', { d: 'm4 4 8 8M12 4l-8 8' })
      )
    }

    /** 玩家头像里的小人图标，避免头像和名字都写成“你”造成重复。 */
    function PlayerGlyph({ size = 15 }) {
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
          'aria-hidden': 'true'
        },
        h('circle', { cx: '8', cy: '5.1', r: '2.35' }),
        h('path', { d: 'M3.5 13.1c.6-2.5 2.4-3.8 4.5-3.8s3.9 1.3 4.5 3.8' })
      )
    }

    /** 一张游戏卡片。整张卡片就是一个按钮，点哪里都能进入游戏。 */
    function GameCard({ titleKey, descKey, tagKeys, tone, icon, onOpen }) {
      return h(
        'button',
        {
          type: 'button',
          className: `fh-game-card fh-tone-${tone}`,
          onClick: onOpen
        },
        h('span', { className: 'fh-game-card-glow', 'aria-hidden': 'true' }),
        h(
          'span',
          { className: 'fh-game-card-top' },
          h('span', { className: 'fh-game-icon' }, icon),
          h('span', { className: 'fh-badge' }, tr(tone === 'lan' ? 'card.lan.badge' : 'card.badge'))
        ),
        h('span', { className: 'fh-game-name' }, tr(titleKey)),
        h('span', { className: 'fh-game-desc' }, tr(descKey)),
        h(
          'span',
          { className: 'fh-tags' },
          tagKeys.map((key) => h('span', { key, className: 'fh-tag' }, tr(key)))
        ),
        h(
          'span',
          { className: 'fh-game-open' },
          h('span', null, tr('list.open')),
          h(ArrowRightGlyph)
        )
      )
    }

    /** 游戏列表页。 */
    function GameList({ onOpen, onClose }) {
      return h(
        'div',
        { className: 'fh-page fh-list-page' },
        h(
          'div',
          { className: 'fh-list-head' },
          h(
            'div',
            { className: 'fh-list-heading' },
            h('p', { className: 'fh-kicker' }, tr('list.kicker')),
            h('h1', { className: 'fh-title' }, tr('list.title')),
            h('p', { className: 'fh-subtitle' }, tr('list.subtitle'))
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'fh-btn fh-btn-ghost fh-close',
              onClick: onClose,
              title: tr('game.backToChat')
            },
            h(CloseGlyph),
            h('span', null, tr('game.backToChat'))
          )
        ),
        h(
          'div',
          { className: 'fh-cards' },
          h(GameCard, {
            titleKey: 'card.snake.title',
            descKey: 'card.snake.desc',
            tagKeys: ['card.snake.tag1', 'card.snake.tag2'],
            tone: 'snake',
            icon: h(SnakeGlyph),
            onOpen: () => onOpen('snake')
          }),
          h(GameCard, {
            titleKey: 'card.ddz.title',
            descKey: 'card.ddz.desc',
            tagKeys: ['card.ddz.tag1', 'card.ddz.tag2'],
            tone: 'ddz',
            icon: h(CardsGlyph),
            onOpen: () => onOpen('ddz')
          }),
          h(GameCard, {
            titleKey: 'card.lan.title',
            descKey: 'card.lan.desc',
            tagKeys: ['card.lan.tag1', 'card.lan.tag2'],
            tone: 'lan',
            icon: h(LanGlyph),
            onOpen: () => onOpen('lan')
          })
        ),
        h('p', { className: 'fh-footnote' }, tr('list.footnote'))
      )
    }

    /** 一个小统计块，显示得分、最高分或者蛇身长度。 */
    function StatBlock({ label, value }) {
      return h(
        'div',
        { className: 'fh-stat' },
        h('span', { className: 'fh-stat-label' }, label),
        h('strong', { className: 'fh-stat-value' }, String(value))
      )
    }

    /**
     * 画贪吃蛇棋盘。
     *
     * 颜色全部现场从元素的计算样式里读宿主主题变量，因此切换明暗主题后
     * 重新调用这个函数就能得到正确的背景和线条颜色，不需要写死两套配色。
     */
    function drawSnakeBoard(canvas, game) {
      if (!canvas) return
      const context = canvas.getContext('2d')
      if (!context) return
      const cssSize = Math.max(220, Math.floor(canvas.clientWidth || 480))
      const ratio = window.devicePixelRatio || 1
      const pixelSize = Math.round(cssSize * ratio)
      if (canvas.width !== pixelSize || canvas.height !== pixelSize) {
        canvas.width = pixelSize
        canvas.height = pixelSize
      }
      const styles = window.getComputedStyle(canvas)
      const read = (name, fallback) => {
        const value = styles.getPropertyValue(name)
        return value && value.trim() ? value.trim() : fallback
      }
      const boardColor = read('--dsw-alias-bg-layer-2', '#f1f2f4')
      const borderColor = read('--dsw-alias-border-l1', '#d8dbe2')
      const snakeColor = read('--dsw-alias-brand-primary', '#4d6bfe')
      const foodColor = read('--dsw-alias-state-error-primary', '#d94a45')
      const cell = cssSize / SNAKE_COLS

      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, cssSize, cssSize)
      context.fillStyle = boardColor
      context.fillRect(0, 0, cssSize, cssSize)

      context.save()
      context.strokeStyle = borderColor
      context.globalAlpha = 0.45
      context.lineWidth = 1
      for (let index = 1; index < SNAKE_COLS; index += 1) {
        const offset = Math.round(index * cell) + 0.5
        context.beginPath()
        context.moveTo(offset, 0)
        context.lineTo(offset, cssSize)
        context.stroke()
        context.beginPath()
        context.moveTo(0, offset)
        context.lineTo(cssSize, offset)
        context.stroke()
      }
      context.restore()

      const drawRounded = (x, y, width, height, radius) => {
        context.beginPath()
        if (typeof context.roundRect === 'function') {
          context.roundRect(x, y, width, height, radius)
        } else {
          context.rect(x, y, width, height)
        }
      }

      if (game.food) {
        const centerX = (game.food.x + 0.5) * cell
        const centerY = (game.food.y + 0.5) * cell
        context.fillStyle = foodColor
        context.beginPath()
        context.arc(centerX, centerY, cell * 0.28, 0, Math.PI * 2)
        context.fill()
        context.fillStyle = boardColor
        context.globalAlpha = 0.5
        context.beginPath()
        context.arc(centerX - cell * 0.08, centerY - cell * 0.08, cell * 0.07, 0, Math.PI * 2)
        context.fill()
        context.globalAlpha = 1
      }

      const segments = game.body.slice().reverse()
      for (const segment of segments) {
        context.fillStyle = snakeColor
        drawRounded(
          segment.x * cell + cell * 0.08,
          segment.y * cell + cell * 0.08,
          cell * 0.84,
          cell * 0.84,
          cell * 0.26
        )
        context.fill()
      }

      const head = game.body[0]
      if (head) {
        const neck = game.body[1] || head
        const directionX = Math.sign(head.x - neck.x || game.dir.x)
        const directionY = Math.sign(head.y - neck.y || game.dir.y)
        const perpendicularX = -directionY
        const perpendicularY = directionX
        const centerX = (head.x + 0.5) * cell
        const centerY = (head.y + 0.5) * cell
        context.fillStyle = boardColor
        const eyeRadius = Math.max(1.2, cell * 0.075)
        const forward = cell * 0.16
        const sideways = cell * 0.18
        const eyeOneX = centerX + directionX * forward + perpendicularX * sideways
        const eyeOneY = centerY + directionY * forward + perpendicularY * sideways
        const eyeTwoX = centerX + directionX * forward - perpendicularX * sideways
        const eyeTwoY = centerY + directionY * forward - perpendicularY * sideways
        context.beginPath()
        context.arc(eyeOneX, eyeOneY, eyeRadius, 0, Math.PI * 2)
        context.arc(eyeTwoX, eyeTwoY, eyeRadius, 0, Math.PI * 2)
        context.fill()
      }
    }

    /** 贪吃蛇游戏。组件卸载时计时器和监听器会一起清理。 */
    function SnakeGame() {
      const [game, setGame] = React.useState(createSnakeGame)
      const [best, setBest] = React.useState(readSnakeBest)
      const [newBest, setNewBest] = React.useState(false)
      const canvasRef = React.useRef(null)
      const gameRef = React.useRef(game)
      gameRef.current = game

      const restart = React.useCallback(() => {
        setNewBest(false)
        setGame(createSnakeGame())
      }, [])

      const togglePause = React.useCallback(() => {
        setGame((previous) => {
          if (previous.status === 'running') return { ...previous, status: 'paused' }
          if (previous.status === 'paused') return { ...previous, status: 'running' }
          return previous
        })
      }, [])

      const start = React.useCallback(() => {
        setGame((previous) =>
          previous.status === 'ready' ? { ...previous, status: 'running' } : previous
        )
      }, [])

      // 只有游戏处于运行状态时才安排下一帧；暂停、结束或者组件卸载都会取消计时器。
      React.useEffect(() => {
        if (game.status !== 'running') return undefined
        const timer = window.setTimeout(() => {
          setGame((previous) => stepSnake(previous))
        }, game.speed)
        return () => window.clearTimeout(timer)
      }, [game])

      // 一局结束时登记最高分。只有分数超过历史记录才写入本地存储。
      React.useEffect(() => {
        if (game.status !== 'over' && game.status !== 'won') return
        if (game.score > best) {
          setBest(game.score)
          setNewBest(true)
          saveSnakeBest(game.score)
        } else {
          setNewBest(false)
        }
        // 这里只在游戏结束时判断一次，所以故意只依赖状态。
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [game.status])

      // 页面被切到后台时自动暂停，避免用户离开后蛇还在走。
      React.useEffect(() => {
        const onVisibilityChange = () => {
          if (!document.hidden) return
          setGame((previous) =>
            previous.status === 'running' ? { ...previous, status: 'paused' } : previous
          )
        }
        document.addEventListener('visibilitychange', onVisibilityChange)
        return () => document.removeEventListener('visibilitychange', onVisibilityChange)
      }, [])

      // 键盘控制：方向键和 W A S D 转向，空格暂停或继续。
      React.useEffect(() => {
        const onKeyDown = (event) => {
          const target = event.target
          if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
          if (target && target.isContentEditable) return
          const key = event.key
          let direction = null
          if (key === 'ArrowUp' || key === 'w' || key === 'W') direction = { x: 0, y: -1 }
          else if (key === 'ArrowDown' || key === 's' || key === 'S') direction = { x: 0, y: 1 }
          else if (key === 'ArrowLeft' || key === 'a' || key === 'A') direction = { x: -1, y: 0 }
          else if (key === 'ArrowRight' || key === 'd' || key === 'D') direction = { x: 1, y: 0 }
          if (direction) {
            event.preventDefault()
            setGame((previous) => queueSnakeDirection(previous, direction))
            return
          }
          if (key === ' ' || key === 'Spacebar') {
            event.preventDefault()
            setGame((previous) => {
              if (previous.status === 'running') return { ...previous, status: 'paused' }
              if (previous.status === 'paused') return { ...previous, status: 'running' }
              return previous
            })
          }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
      }, [])

      const draw = React.useCallback(() => {
        if (canvasRef.current) drawSnakeBoard(canvasRef.current, gameRef.current)
      }, [])

      // 棋盘内容变化时立刻重画。
      React.useEffect(() => {
        draw()
      }, [game, draw])

      // 窗口尺寸变化和主题切换都会改变棋盘颜色，因此重新读取主题变量并重画。
      React.useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return undefined
        let resizeObserver = null
        if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
          resizeObserver = new ResizeObserver(() => draw())
          resizeObserver.observe(canvas.parentElement)
        }
        let themeObserver = null
        if (typeof MutationObserver !== 'undefined') {
          themeObserver = new MutationObserver(() => draw())
          themeObserver.observe(document.documentElement, { attributes: true })
          if (document.body) themeObserver.observe(document.body, { attributes: true })
        }
        const onWindowResize = () => draw()
        window.addEventListener('resize', onWindowResize)
        return () => {
          if (resizeObserver) resizeObserver.disconnect()
          if (themeObserver) themeObserver.disconnect()
          window.removeEventListener('resize', onWindowResize)
        }
      }, [draw])

      let overlay = null
      if (game.status === 'ready') {
        overlay = {
          title: tr('snake.ready.title'),
          text: tr('snake.ready.text'),
          action: tr('snake.start'),
          onAction: start
        }
      } else if (game.status === 'paused') {
        overlay = {
          title: tr('snake.paused.title'),
          text: tr('snake.paused.text'),
          action: tr('snake.resume'),
          onAction: togglePause
        }
      } else if (game.status === 'over') {
        overlay = {
          title: tr('snake.over.title'),
          text: tr('snake.over.text'),
          action: tr('snake.again'),
          onAction: restart
        }
      } else if (game.status === 'won') {
        overlay = {
          title: tr('snake.won.title'),
          text: tr('snake.won.text'),
          action: tr('snake.again'),
          onAction: restart
        }
      }

      const directionButton = (label, direction, extraClass) =>
        h(
          'button',
          {
            type: 'button',
            className: `fh-dpad-btn ${extraClass || ''}`,
            'aria-label': label,
            onClick: () => setGame((previous) => queueSnakeDirection(previous, direction))
          },
          label
        )

      return h(
        'section',
        { className: 'fh-game fh-snake-game', 'aria-label': tr('card.snake.title') },
        h(
          'div',
          { className: 'fh-game-title-row' },
          h(
            'div',
            { className: 'fh-game-heading' },
            h('p', { className: 'fh-kicker' }, tr('card.snake.tag1')),
            h('h2', { className: 'fh-game-title' }, tr('card.snake.title')),
            h('p', { className: 'fh-game-sub' }, tr('card.snake.desc'))
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'fh-btn fh-btn-ghost',
              onClick: togglePause,
              disabled: game.status !== 'running' && game.status !== 'paused'
            },
            game.status === 'paused' ? tr('snake.resume') : tr('snake.pause')
          )
        ),
        h(
          'div',
          { className: 'fh-stats' },
          h(StatBlock, { label: tr('snake.score'), value: game.score }),
          h(StatBlock, { label: tr('snake.best'), value: best }),
          h(StatBlock, { label: tr('snake.length'), value: game.body.length })
        ),
        h(
          'div',
          { className: 'fh-board' },
          h('canvas', {
            ref: canvasRef,
            className: 'fh-canvas',
            role: 'img',
            'aria-label': tr('card.snake.title')
          }),
          overlay
            ? h(
                'div',
                { className: 'fh-board-overlay' },
                h(
                  'div',
                  { className: 'fh-overlay-card' },
                  newBest && (game.status === 'over' || game.status === 'won')
                    ? h('span', { className: 'fh-new-best' }, tr('snake.newBest'))
                    : null,
                  h('h3', null, overlay.title),
                  h('p', null, overlay.text),
                  (game.status === 'over' || game.status === 'won') && newBest
                    ? h(
                        'p',
                        { className: 'fh-overlay-score' },
                        `${tr('snake.score')} ${game.score}`
                      )
                    : null,
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'fh-btn fh-btn-primary',
                      onClick: overlay.onAction
                    },
                    overlay.action
                  )
                )
              )
            : null
        ),
        h('p', { className: 'fh-controls' }, tr('snake.controls')),
        h(
          'div',
          { className: 'fh-dpad', role: 'group', 'aria-label': tr('snake.dpad') },
          directionButton('↑', { x: 0, y: -1 }, 'fh-dpad-up'),
          directionButton('←', { x: -1, y: 0 }, 'fh-dpad-left'),
          directionButton('↓', { x: 0, y: 1 }, 'fh-dpad-down'),
          directionButton('→', { x: 1, y: 0 }, 'fh-dpad-right')
        )
      )
    }

    /** 一张背面朝上的牌，只画花纹，不承载文字。 */
    function CardBack({ size = 'normal' }) {
      return h(
        'span',
        { className: `fh-card-back fh-card-back-${size}`, 'aria-hidden': 'true' },
        h('span', { className: 'fh-card-back-mark' })
      )
    }

    /**
     * 一张扑克牌。
     *
     * 手牌传入 onClick 时渲染成按钮，可以点击选中；桌面上的牌不传 onClick，
     * 渲染成普通元素，避免用户误以为能点。
     */
    function PlayingCard({
      card,
      selected = false,
      disabled = false,
      onClick,
      onPointerDown,
      onPointerOver,
      small = false
    }) {
      const isJoker = Boolean(card.joker)
      const rankText = isJoker ? (card.rank === 17 ? '大' : '小') : RANK_TEXT[card.rank]
      const centerText = isJoker ? '王' : card.symbol
      const label = isJoker
        ? tr(card.rank === 17 ? 'card.joker.big' : 'card.joker.small')
        : `${rankText}${card.symbol}`
      const className = [
        'fh-playing-card',
        small ? 'fh-playing-card-small' : '',
        selected ? 'is-selected' : '',
        card.red ? 'is-red' : '',
        isJoker ? 'is-joker' : ''
      ]
        .filter(Boolean)
        .join(' ')
      const content = [
        h('span', { key: 'rank', className: 'fh-card-rank' }, rankText),
        h('span', { key: 'center', className: 'fh-card-center' }, centerText)
      ]
      if (typeof onClick !== 'function') {
        return h(
          'span',
          { className, 'aria-hidden': small ? 'true' : undefined, title: label },
          content
        )
      }
      return h(
        'button',
        {
          type: 'button',
          className,
          onClick,
          onPointerDown,
          onPointerOver,
          draggable: false,
          disabled,
          'aria-pressed': selected,
          'aria-label': label,
          title: label
        },
        content
      )
    }

    /**
     * 把某位玩家本轮打出的牌画在他的座位旁边。
     *
     * 之前三家的牌都挤在牌桌中央，后出的牌会盖住先出的牌，看不出上一家
     * 或上上家到底出了什么。现在每位玩家的出牌跟着自己的座位走。
     */
    function PlayedCards({ action }) {
      if (!action || action.type !== 'play' || !action.cards || action.cards.length === 0) {
        return null
      }
      return h(
        'div',
        { className: 'fh-played-cards' },
        action.cards.map((card) => h(PlayingCard, { key: card.id, card, small: true }))
      )
    }

    /** 一位电脑玩家的座位。 */
    function AiSeat({ seat, state, beans }) {
      const count = state.hands[seat].length
      const roleKey =
        state.landlord === null
          ? null
          : state.landlord === seat
            ? 'ddz.landlord'
            : 'ddz.farmer'
      const active = state.phase === 'play' && state.turn === seat
      const action = state.actions[seat]
      const backCount = Math.min(6, Math.max(1, Math.ceil(count / 3)))
      return h(
        'div',
        { className: `fh-seat${active ? ' is-active' : ''}` },
        h(
          'div',
          { className: 'fh-seat-top' },
          h('span', { className: 'fh-avatar', 'aria-hidden': 'true' }, seat === 1 ? 'A' : 'B'),
          h(
            'div',
            { className: 'fh-seat-meta' },
            h('strong', null, tr(seatNameKey(seat))),
            roleKey ? h('span', { className: 'fh-role' }, tr(roleKey)) : null
          )
        ),
        h(
          'div',
          { className: 'fh-mini-backs', 'aria-hidden': 'true' },
          Array.from({ length: backCount }, (_, index) =>
            h(CardBack, { key: index, size: 'mini' })
          )
        ),
        h('p', { className: 'fh-seat-count' }, tr('ddz.cardsLeft', { count })),
        h('p', { className: 'fh-seat-beans' }, tr('ddz.beansShort', { amount: formatBeans(beans) })),
        action
          ? h(
              'div',
              { className: 'fh-seat-play' },
              h(
                'span',
                { className: 'fh-seat-action' },
                action.type === 'pass'
                  ? action.reason === 'teammate'
                    ? tr('ddz.passTeammate')
                    : tr('ddz.pass')
                  : tr(`combo.${action.combo.kind}`)
              ),
              h(PlayedCards, { action })
            )
          : null
      )
    }

    /** 斗地主游戏。人类固定在零号座位，另外两家由本地规则驱动。 */
    function DouDizhuGame() {
      const [state, setState] = React.useState(createDouDizhuGame)
      const [beans, setBeans] = React.useState(() => [
        readBeans(),
        DDZ_START_BEANS,
        DDZ_START_BEANS
      ])
      const [started, setStarted] = React.useState(false)
      const [dealing, setDealing] = React.useState(false)
      const [trustee, setTrustee] = React.useState(false)
      const [selected, setSelected] = React.useState([])
      const [errorKey, setErrorKey] = React.useState(null)
      const [suggestKey, setSuggestKey] = React.useState(null)
      const [countdown, setCountdown] = React.useState(null)
      const [dragging, setDragging] = React.useState(false)
      const [reliefNotice, setReliefNotice] = React.useState(null)
      const [lastDelta, setLastDelta] = React.useState(null)
      const dragRef = React.useRef(null)
      const suppressClickRef = React.useRef(false)
      const timeoutHandlerRef = React.useRef(null)
      const autoSuggestRef = React.useRef(null)
      const settledRef = React.useRef(false)
      const humanHandRef = React.useRef(null)
      const toggleCardRef = React.useRef(null)
      const previousComboRef = React.useRef(null)
      const humanHand = state.hands[0]
      humanHandRef.current = humanHand
      previousComboRef.current = state.lastPlay ? state.lastPlay.combo : null
      const selectedSet = new Set(selected)
      const selectedCards = humanHand.filter((card) => selectedSet.has(card.id))
      const selectedCombo = selectedCards.length > 0 ? analyze(selectedCards) : null
      const humanTurn = started && state.phase === 'play' && state.turn === 0
      const canSelect = humanTurn
      const previousCombo = state.lastPlay ? state.lastPlay.combo : null
      const legalReplies =
        humanTurn && previousCombo ? findBeats(humanHand, previousCombo) : []
      const mustPass = Boolean(humanTurn && previousCombo && legalReplies.length === 0)

      // 电脑轮到时稍等一会儿再出牌，让用户能看清桌面上发生了什么。
      React.useEffect(() => {
        if (!started || state.phase !== 'play' || state.turn === 0) return undefined
        const timer = window.setTimeout(() => {
          setState((previous) => {
            if (previous.phase !== 'play' || previous.turn === 0) return previous
            const move = chooseAiMove(previous)
            if (move.pass) return applyPass(previous, previous.turn, move.reason)
            const combo = analyze(move.cards)
            if (!combo) return applyPass(previous, previous.turn)
            return applyPlay(previous, previous.turn, move.cards, combo)
          })
        }, 720)
        return () => window.clearTimeout(timer)
      }, [started, state.phase, state.turn, state.seq])

      // 发牌动画期间先不让叫地主和计时器启动，动画结束后再进入正式牌局。
      React.useEffect(() => {
        if (!dealing) return undefined
        const timer = window.setTimeout(() => {
          setDealing(false)
          setStarted(true)
        }, DDZ_DEAL_MS)
        return () => window.clearTimeout(timer)
      }, [dealing])

      // 桌面每走一手牌就清空旧选择。否则用户上一轮选中的牌会一直留着，
      // 轮到自己时再按出牌，就会看到一张早就过时的“压不过”提示。
      React.useEffect(() => {
        setSelected([])
        setErrorKey(null)
        setSuggestKey(null)
        autoSuggestRef.current = null
      }, [state.seq])

      // 鼠标松开或离开窗口时结束拖动。拖动过程中如果划过了牌，浏览器随后
      // 还会补发一次点击，这里记下标记，让那次点击不要重复切换选牌。
      // 没有划动就是一次普通点击，这里直接切换选中的牌，避免依赖浏览器
      // 是否把 pointerdown 后的 click 补发完整。
      React.useEffect(() => {
        const finishDrag = (event) => {
          const drag = dragRef.current
          if (!drag) return
          dragRef.current = null
          setDragging(false)
          suppressClickRef.current = true
          if (event.type !== 'pointerup') return
          if (!drag.moved) {
            const card = humanHandRef.current[drag.anchor]
            if (card) toggleCardRef.current?.(card)
            return
          }
          if (drag.additive) {
            const raw = selectCardRange(
              humanHandRef.current,
              drag.initial,
              drag.anchor,
              drag.lastIndex,
              true
            )
            setSelected(compactSelection(humanHandRef.current, raw, previousComboRef.current))
          }
        }
        window.addEventListener('pointerup', finishDrag)
        window.addEventListener('pointercancel', finishDrag)
        return () => {
          window.removeEventListener('pointerup', finishDrag)
          window.removeEventListener('pointercancel', finishDrag)
        }
      }, [])

      const restart = React.useCallback(() => {
        setSelected([])
        setErrorKey(null)
        setSuggestKey(null)
        setTrustee(false)
        setDealing(false)
        setStarted(false)
        setCountdown(null)
        setReliefNotice(null)
        setLastDelta(null)
        dragRef.current = null
        setDragging(false)
        autoSuggestRef.current = null
        settledRef.current = false
        setState(createDouDizhuGame())
      }, [])

      /**
       * 点击开始按钮后才进入牌局。
       *
       * 如果欢乐豆已经不够一局底注，就先补一笔救济金；发牌动画期间所有
       * 计时器仍然停着，动画结束后才允许叫地主。
       */
      const startGame = () => {
        if (dealing) return
        setSelected([])
        setErrorKey(null)
        setSuggestKey(null)
        setTrustee(false)
        setLastDelta(null)
        settledRef.current = false
        autoSuggestRef.current = null
        if (beans[0] < DDZ_BASE_STAKE) {
          setBeans((previous) => {
            const next = previous.slice()
            next[0] += DDZ_RELIEF_BEANS
            writeBeans(next[0])
            return next
          })
          setReliefNotice(DDZ_RELIEF_BEANS)
        } else {
          setReliefNotice(null)
        }
        setDealing(true)
      }

      const commitBid = (call, auto = false) => {
        if (!auto) setTrustee(false)
        setSelected([])
        setErrorKey(null)
        setSuggestKey(null)
        setState((previous) => resolveBid(previous, call))
      }

      const toggleCard = (card) => {
        if (!canSelect) return
        setTrustee(false)
        setErrorKey(null)
        setSuggestKey(null)
        setSelected((previous) =>
          previous.includes(card.id)
            ? previous.filter((id) => id !== card.id)
            : [...previous, card.id]
        )
      }
      toggleCardRef.current = toggleCard

      /**
       * 开始一次拖动选牌。
       *
       * 只在鼠标左键、并且轮到自己时生效；触摸屏仍然用点按选牌，避免和
       * 横向滚动手牌的手势冲突。起点牌如果原本没选中，这一段就整体加选；
       * 起点牌原本已选中，这一段就整体取消。
       */
      const beginDrag = (index, event) => {
        if (!canSelect) return
        if (event.pointerType !== 'mouse' || event.button !== 0) return
        setTrustee(false)
        setSuggestKey(null)
        const card = humanHand[index]
        if (!card) return
        suppressClickRef.current = false
        dragRef.current = {
          anchor: index,
          lastIndex: index,
          additive: !selectedSet.has(card.id),
          initial: selected.slice(),
          moved: false
        }
        setDragging(true)
      }

      /** 鼠标划过一张牌时，按起点到当前位置的整段范围重新计算选牌。 */
      const enterCard = (index) => {
        const drag = dragRef.current
        if (!drag || !canSelect) return
        if (drag.lastIndex === index) return
        drag.moved = true
        drag.lastIndex = index
        setErrorKey(null)
        setSuggestKey(null)
        const raw = selectCardRange(humanHand, drag.initial, drag.anchor, index, drag.additive)
        setSelected(
          drag.additive ? compactSelection(humanHand, raw, previousCombo) : raw
        )
      }

      /** 点击一张牌。刚完成拖动时浏览器补发的点击要被忽略。 */
      const handleCardClick = (card) => {
        if (suppressClickRef.current) {
          suppressClickRef.current = false
          return
        }
        toggleCard(card)
      }

      const playSelected = () => {
        if (!humanTurn) return
        setTrustee(false)
        setSuggestKey(null)
        const cards = humanHand.filter((card) => selectedSet.has(card.id))
        if (cards.length === 0) return
        const combo = analyze(cards)
        if (!combo) {
          setErrorKey('ddz.invalid')
          return
        }
        if (!beats(combo, state.lastPlay ? state.lastPlay.combo : null)) {
          setErrorKey('ddz.cannotBeat')
          return
        }
        setSelected([])
        setErrorKey(null)
        setState((previous) => {
          if (previous.phase !== 'play' || previous.turn !== 0) return previous
          const currentCombo = analyze(cards)
          if (!currentCombo) return previous
          if (!beats(currentCombo, previous.lastPlay ? previous.lastPlay.combo : null)) {
            return previous
          }
          return applyPlay(previous, 0, cards, currentCombo)
        })
      }

      const passTurn = () => {
        if (!humanTurn) return
        if (!state.lastPlay || state.lastPlay.seat === 0) return
        setTrustee(false)
        setSuggestKey(null)
        setSelected([])
        setErrorKey(null)
        setState((previous) => {
          if (previous.phase !== 'play' || previous.turn !== 0) return previous
          if (!previous.lastPlay || previous.lastPlay.seat === 0) return previous
          return applyPass(previous, 0)
        })
      }

      /**
       * 给出提示。首次按提示选出第一手可以出的牌，再按一次就换下一手；
       * 如果根本没有能压过上家的牌，就清空旧选择并说明只能不出。
       */
      const hint = () => {
        if (!humanTurn) return
        setTrustee(false)
        setSuggestKey(null)
        const previousCombo = state.lastPlay ? state.lastPlay.combo : null
        if (!previousCombo) {
          const cards = chooseLead(humanHand)
          setSelected(cards.map((card) => card.id))
          setErrorKey(null)
          return
        }
        const options = findBeats(humanHand, previousCombo)
        if (options.length === 0) {
          setSelected([])
          setErrorKey('ddz.noHint')
          return
        }
        const current = new Set(selected)
        const currentIndex = options.findIndex(
          (option) =>
            option.cards.length === selected.length &&
            option.cards.every((card) => current.has(card.id))
        )
        const nextOption = options[(currentIndex + 1) % options.length]
        setSelected(nextOption.cards.map((card) => card.id))
        setErrorKey(null)
      }

      /**
       * 倒计时归零时自动处理。
       *
       * 叫地主阶段自动不叫；出牌阶段优先替玩家打出已经选好的合法牌，
       * 没有选牌时，领出打规则给出的最小一手，跟牌则自动不出。
       * 所有状态更新都放在函数式更新里，这样计时器晚到一步时也不会覆盖
       * 已经变化的对局。
       */
      const handleTimeout = () => {
        if (state.phase === 'bid') {
          commitBid(false, true)
          return
        }
        if (state.phase !== 'play' || state.turn !== 0) return
        const chosen = humanHand.filter((card) => selectedSet.has(card.id))
        const chosenCombo = chosen.length > 0 ? analyze(chosen) : null
        const canPlay = Boolean(
          chosenCombo && (!previousCombo || beats(chosenCombo, previousCombo))
        )
        setSelected([])
        setErrorKey(null)
        setSuggestKey(null)
        setState((previous) => {
          if (previous.phase !== 'play' || previous.turn !== 0) return previous
          if (canPlay) return applyPlay(previous, 0, chosen, chosenCombo)
          if (previous.lastPlay && previous.lastPlay.seat !== 0) {
            return applyPass(previous, 0)
          }
          const cards = chooseLead(previous.hands[0])
          const combo = analyze(cards)
          if (!combo) return previous
          return applyPlay(previous, 0, cards, combo)
        })
      }
      timeoutHandlerRef.current = handleTimeout

      // 叫地主和轮到自己出牌时开始读秒。桌面每变化一次就重新计时；
      // 换到电脑行动或本局结束时，清掉数字，不在后台留下计时器。
      React.useEffect(() => {
        const bidding = started && state.phase === 'bid'
        const playing = started && state.phase === 'play' && state.turn === 0
        if (!bidding && !playing) {
          setCountdown(null)
          return undefined
        }
        const total = bidding ? DDZ_BID_SECONDS : DDZ_PLAY_SECONDS
        const deadline = Date.now() + total * 1000
        setCountdown(total)
        const timer = window.setInterval(() => {
          const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
          setCountdown(left)
          if (left <= 0) {
            window.clearInterval(timer)
            timeoutHandlerRef.current?.()
          }
        }, 200)
        return () => window.clearInterval(timer)
      }, [started, state.phase, state.turn, state.seq])

      // 倒计时只剩五秒时，如果玩家还没选牌，就自动按提示选出一手，
      // 让他只需要确认“出牌”；如果根本压不过，就只提示去点“不出”。
      React.useEffect(() => {
        if (!started || trustee || !humanTurn) return
        if (countdown === null || countdown > 5) return
        if (autoSuggestRef.current === state.seq) return
        autoSuggestRef.current = state.seq
        if (selected.length > 0) return
        const options = previousCombo
          ? findBeats(humanHand, previousCombo)
          : [{ cards: chooseLead(humanHand) }]
        if (!options.length || !options[0].cards.length) {
          setSelected([])
          setSuggestKey('ddz.mustPass')
          return
        }
        setSelected(options[0].cards.map((card) => card.id))
        setSuggestKey('ddz.autoSuggested')
        setErrorKey(null)
      }, [
        started,
        trustee,
        humanTurn,
        countdown,
        state.seq,
        selected.length,
        humanHand,
        previousCombo
      ])

      // 托管模式：轮到自己时，电脑会替你叫地主或出牌。停留时间比普通电脑
      // 稍长一点，让玩家来得及点“取消托管”自己接管。
      React.useEffect(() => {
        if (!started || !trustee || state.phase === 'over' || state.turn !== 0) {
          return undefined
        }
        const timer = window.setTimeout(() => {
          if (state.phase === 'bid') {
            const call =
              aiWantsLandlord(state.hands[0]) ||
              (state.notice && state.notice.key === 'notice.redeal')
            commitBid(Boolean(call), true)
            return
          }
          if (state.phase !== 'play') return
          setSelected([])
          setSuggestKey(null)
          setState((previous) => {
            if (previous.phase !== 'play' || previous.turn !== 0) return previous
            const move = chooseAiMove(previous)
            if (move.pass) return applyPass(previous, 0, move.reason)
            const combo = analyze(move.cards)
            if (!combo) return applyPass(previous, 0)
            return applyPlay(previous, 0, move.cards, combo)
          })
        }, 760)
        return () => window.clearTimeout(timer)
      }, [started, trustee, state.phase, state.turn, state.seq])

      // 一局结束后按底注和倍数结算欢乐豆。人类余额会写进浏览器本地，
      // 两位电脑的余额只在本局页面里保留。
      React.useEffect(() => {
        if (!started || state.phase !== 'over' || settledRef.current) return
        if (state.landlord === null || state.winner === null) return
        settledRef.current = true
        const stake = DDZ_BASE_STAKE * (state.multiplier || 1)
        const deltaFor = (seat) => {
          if (seat === state.landlord) {
            return state.winner === seat ? stake * 2 : -stake * 2
          }
          return state.winner === state.landlord ? -stake : stake
        }
        const humanDelta = deltaFor(0)
        setBeans((previous) => {
          const next = previous.map((value, seat) =>
            Math.max(0, value + deltaFor(seat))
          )
          writeBeans(next[0])
          return next
        })
        setLastDelta(humanDelta)
      }, [started, state.phase, state.winner, state.landlord, state.multiplier])

      const roleKey =
        state.landlord === null ? null : state.landlord === 0 ? 'ddz.landlord' : 'ddz.farmer'
      const humanWon = state.winner === 0
      const resultDetailKey =
        state.landlord === 0
          ? humanWon
            ? 'ddz.win.landlord'
            : 'ddz.lose.landlord'
          : humanWon
            ? 'ddz.win.farmer'
            : 'ddz.lose.farmer'

      let turnText = ''
      if (state.phase === 'bid') {
        turnText = tr('ddz.bid.you')
      } else if (state.phase === 'play') {
        turnText =
          state.turn === 0
            ? tr('ddz.turn.you')
            : tr('ddz.turn.other', { name: tr(seatNameKey(state.turn)) })
      }

      const countdownText = countdown === null ? '' : tr('ddz.countdown', { seconds: countdown })
      const countdownClass = `fh-countdown${countdown !== null && countdown <= 5 ? ' is-urgent' : ''}`
      const selectionText =
        selected.length === 0
          ? tr('ddz.notSelected')
          : selectedCombo
            ? tr('ddz.selectedCombo', {
                count: selected.length,
                combo: tr(`combo.${selectedCombo.kind}`)
              })
            : tr('ddz.selectedInvalid', { count: selected.length })

      const bidOrPlay =
        state.phase === 'bid'
          ? h(
              'div',
              { className: 'fh-bid-panel' },
              h(
                'div',
                { className: 'fh-bid-text' },
                h('strong', null, tr('ddz.bid.title')),
                h('span', null, tr('ddz.bid.text')),
                countdown !== null
                  ? h(
                      'span',
                      { className: countdownClass, role: 'timer', 'aria-live': 'off' },
                      countdownText
                    )
                  : null
              ),
              h(
                'div',
                { className: 'fh-actions' },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'fh-btn fh-btn-primary',
                    onClick: () => commitBid(true)
                  },
                  tr('ddz.bid.call')
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'fh-btn fh-btn-ghost',
                    onClick: () => commitBid(false)
                  },
                  tr('ddz.bid.pass')
                )
              )
            )
          : state.phase === 'play'
            ? h(
                'div',
                { className: 'fh-play-panel' },
                suggestKey
                  ? h(
                      'p',
                      {
                        className: `fh-suggest${suggestKey === 'ddz.mustPass' ? ' is-warn' : ''}`,
                        role: 'status'
                      },
                      tr(suggestKey)
                    )
                  : null,
                errorKey
                  ? h('p', { className: 'fh-error', role: 'alert' }, tr(errorKey))
                  : h('p', { className: 'fh-selection' }, selectionText),
                h(
                  'div',
                  { className: 'fh-actions' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'fh-btn fh-btn-ghost',
                      onClick: hint,
                      disabled: !humanTurn
                    },
                    tr('ddz.hint')
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: `fh-btn fh-btn-ghost${((mustPass && humanTurn) || suggestKey === 'ddz.mustPass') ? ' is-recommended' : ''}`,
                      onClick: passTurn,
                      disabled: !humanTurn || !state.lastPlay || state.lastPlay.seat === 0
                    },
                    tr('ddz.pass')
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: `fh-btn fh-btn-primary${suggestKey === 'ddz.autoSuggested' && selected.length > 0 ? ' is-recommended' : ''}`,
                      onClick: playSelected,
                      disabled: !humanTurn || selected.length === 0
                    },
                    tr('ddz.play')
                  )
                )
              )
            : null

      const humanDeltaText =
        lastDelta === null ? '' : `${lastDelta > 0 ? '+' : ''}${formatBeans(lastDelta)}`

      const header = h(
        'div',
        { className: 'fh-game-title-row' },
        h(
          'div',
          { className: 'fh-game-heading' },
          h('p', { className: 'fh-kicker' }, tr('ddz.badge')),
          h('h2', { className: 'fh-game-title' }, tr('ddz.title')),
          h(
            'p',
            { className: 'fh-game-sub' },
            roleKey
              ? tr('ddz.roleLine', { role: tr(roleKey) })
              : started
                ? tr('ddz.bid.you')
                : tr('card.ddz.desc')
          )
        ),
        started
          ? h(
              'div',
              { className: 'fh-game-tools' },
              h(
                'button',
                {
                  type: 'button',
                  className: `fh-btn fh-btn-ghost${trustee ? ' is-active' : ''}`,
                  onClick: () => {
                    setTrustee((value) => !value)
                    setSuggestKey(null)
                  },
                  'aria-pressed': trustee ? 'true' : 'false'
                },
                trustee ? tr('ddz.trusteeOn') : tr('ddz.trustee')
              ),
              h(
                'button',
                { type: 'button', className: 'fh-btn fh-btn-ghost', onClick: restart },
                tr('game.restart')
              )
            )
          : null
      )

      const beanRow = h(
        'div',
        { className: 'fh-bean-row' },
        h(
          'span',
          { className: 'fh-bean-chip' },
          tr('ddz.beans', { amount: formatBeans(beans[0]) })
        ),
        h(
          'span',
          { className: 'fh-bean-meta' },
          tr('ddz.stake', { amount: formatBeans(DDZ_BASE_STAKE) })
        ),
        h(
          'span',
          { className: 'fh-bean-meta' },
          tr('ddz.multiplier', { value: state.multiplier || 1 })
        )
      )

      // 发牌期间 started 还是 false，必须把发牌页排在准备页前面判断；
      // 否则点击开始后仍然停在准备页，发牌动画永远没有机会显示。
      if (!started && !dealing) {
        return h(
          'section',
          { className: 'fh-game fh-ddz-game', 'aria-label': tr('card.ddz.title') },
          header,
          h(
            'div',
            { className: 'fh-ddz-table fh-ddz-ready' },
            h(
              'div',
              { className: 'fh-ready-overlay' },
              h(
                'div',
                { className: 'fh-ready-card' },
                h('p', { className: 'fh-kicker' }, tr('ddz.ready.kicker')),
                h('h3', null, tr('ddz.ready.title')),
                h('p', null, tr('ddz.ready.text')),
                h(
                  'p',
                  { className: 'fh-ready-beans' },
                  tr('ddz.ready.beans', {
                    amount: formatBeans(beans[0]),
                    stake: formatBeans(DDZ_BASE_STAKE)
                  })
                ),
                reliefNotice
                  ? h(
                      'p',
                      { className: 'fh-relief' },
                      tr('ddz.beansRelief', { amount: formatBeans(reliefNotice) })
                    )
                  : null,
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'fh-btn fh-btn-primary fh-btn-start',
                    onClick: startGame
                  },
                  tr('ddz.ready.start')
                )
              )
            )
          )
        )
      }

      if (dealing) {
        return h(
          'section',
          { className: 'fh-game fh-ddz-game', 'aria-label': tr('card.ddz.title') },
          header,
          h(
            'div',
            { className: 'fh-ddz-table fh-ddz-dealing' },
            h(
              'div',
              { className: 'fh-deal-stage' },
              h(
                'div',
                { className: 'fh-deal-fan' },
                Array.from({ length: 9 }, (_, index) =>
                  h(
                    'div',
                    {
                      key: index,
                      className: 'fh-deal-card',
                      style: { '--i': index }
                    },
                    h(CardBack, { size: 'small' })
                  )
                )
              ),
              h('p', { className: 'fh-deal-title' }, tr('ddz.dealing.title')),
              h('p', { className: 'fh-deal-text' }, tr('ddz.dealing.text'))
            )
          )
        )
      }

      return h(
        'section',
        { className: 'fh-game fh-ddz-game', 'aria-label': tr('card.ddz.title') },
        header,
        beanRow,
        h(
          'div',
          { className: 'fh-ddz-table' },
          h(
            'div',
            { className: 'fh-ai-row' },
            h(AiSeat, { seat: 1, state, beans: beans[1] }),
            h(
              'div',
              { className: 'fh-bottom-block' },
              h('span', { className: 'fh-bottom-label' }, tr('ddz.bottom')),
              h(
                'div',
                { className: 'fh-bottom-cards' },
                state.landlord === null
                  ? [0, 1, 2].map((index) => h(CardBack, { key: index, size: 'small' }))
                  : state.bottom.map((card) =>
                      h(PlayingCard, { key: card.id, card, small: true })
                    )
              )
            ),
            h(AiSeat, { seat: 2, state, beans: beans[2] })
          ),
          h(
            'div',
            { className: 'fh-table-center' },
            state.notice
              ? h('p', { className: 'fh-notice' }, noticeText(state.notice))
              : null,
            state.phase === 'play'
              ? h(
                  'p',
                  { className: 'fh-turn' },
                  h('span', null, turnText),
                  trustee
                    ? h('span', { className: 'fh-trustee-tag' }, tr('ddz.trusteeTag'))
                    : null,
                  humanTurn && countdown !== null
                    ? h(
                        'span',
                        { className: countdownClass, role: 'timer', 'aria-live': 'off' },
                        countdownText
                      )
                    : null
                )
              : null
          ),
          h(
            'div',
            { className: `fh-self${humanTurn ? ' is-active' : ''}` },
            h(
              'div',
              { className: 'fh-self-head' },
              h(
                'div',
                { className: 'fh-self-name' },
                h('span', { className: 'fh-avatar' }, h(PlayerGlyph, { size: 15 })),
                h('strong', null, tr('seat.you')),
                roleKey ? h('span', { className: 'fh-role' }, tr(roleKey)) : null
              ),
              h(
                'span',
                { className: 'fh-self-count' },
                tr('ddz.cardsLeft', { count: humanHand.length })
              )
            ),
            state.actions[0]
              ? h(
                  'div',
                  { className: 'fh-self-play' },
                  h('span', { className: 'fh-self-play-label' }, tr('ddz.played')),
                  state.actions[0].type === 'pass'
                    ? h('span', { className: 'fh-played-pass' }, tr('ddz.pass'))
                    : h(PlayedCards, { action: state.actions[0] })
                )
              : null,
            h(
              'div',
              {
                className: `fh-hand${dragging ? ' is-dragging' : ''}`,
                role: 'group',
                'aria-label': tr('ddz.hand')
              },
              humanHand.map((card, index) =>
                h(PlayingCard, {
                  key: card.id,
                  card,
                  selected: selectedSet.has(card.id),
                  disabled: !canSelect,
                  onClick: () => handleCardClick(card),
                  onPointerDown: (event) => beginDrag(index, event),
                  onPointerOver: () => enterCard(index)
                })
              )
            ),
            canSelect
              ? h('p', { className: 'fh-drag-hint' }, tr('ddz.dragHint'))
              : null
          ),
          bidOrPlay,
          state.phase === 'over'
            ? h(
                'div',
                { className: 'fh-result-overlay' },
                h(
                  'div',
                  { className: 'fh-result-card' },
                  h('p', { className: 'fh-result-kicker' }, tr('ddz.title')),
                  h('h3', null, humanWon ? tr('ddz.win') : tr('ddz.lose')),
                  h('p', null, tr(resultDetailKey)),
                  lastDelta !== null
                    ? h(
                        'p',
                        { className: 'fh-result-beans' },
                        tr('ddz.beansDelta', { delta: humanDeltaText })
                      )
                    : null,
                  h(
                    'p',
                    { className: 'fh-result-balance' },
                    tr('ddz.beansBalance', { amount: formatBeans(beans[0]) })
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'fh-btn fh-btn-primary',
                      onClick: restart
                    },
                    tr('ddz.again')
                  )
                )
              )
            : null
        )
      )
    }

    /** 主面板页面。列表和游戏在同一个组件里切换，离开面板即卸载全部游戏状态。 */
    /** 牌桌上的一个真人或电脑座位。 */
    function LanSeat({ entry, active, showCards = false, action = null }) {
      if (!entry) return null
      const role = entry.kind === 'empty'
        ? null
        : entry.kind === 'ai'
          ? tr('lan.ai')
          : entry.seat === 0
            ? tr('lan.host')
            : tr('lan.guest')
      return h(
        'div',
        { className: `fh-lan-seat${active ? ' is-active' : ''}` },
        h(
          'div',
          { className: 'fh-lan-seat-name' },
          h('span', { className: 'fh-avatar' }, h(PlayerGlyph, { size: 14 })),
          h('strong', null, entry.kind === 'empty' ? tr('lan.seatEmpty') : entry.nickname)
        ),
        h(
          'div',
          { className: 'fh-lan-seat-meta' },
          role ? h('span', { className: 'fh-role' }, role) : null,
          entry.kind !== 'empty'
            ? h('span', null, tr('lan.beans', { amount: formatBeans(entry.beans) }))
            : null
        ),
        entry.kind !== 'empty' && (showCards || entry.connected === false)
          ? h(
              'div',
              { className: 'fh-lan-seat-cards' },
              showCards ? tr('ddz.cardsLeft', { count: entry.cards || 0 }) : null,
              entry.connected === false
                ? h('span', { className: 'fh-lan-offline' }, tr('lan.disconnected'))
                : null
            )
          : null,
        action
          ? h(
              'div',
              { className: 'fh-lan-seat-play' },
              h(
                'span',
                { className: 'fh-seat-action' },
                action.type === 'pass'
                  ? action.reason === 'teammate'
                    ? tr('ddz.passTeammate')
                    : tr('lan.pass')
                  : tr(`combo.${action.combo.kind}`)
              ),
              h(PlayedCards, { action })
            )
          : null
      )
    }

    /**
     * 联机牌桌。
     *
     * 这里不自己跑规则，也不自己跑电脑。所有出牌都由房主的进程校验，
     * 页面只负责把当前座位看到的手牌画出来，并把用户动作发回房主。
     */
    function LanTable({ snapshot, onAction, onLeave, onStart, busy }) {
      const game = snapshot.game
      const seat = snapshot.seat
      const seats = snapshot.seats || []
      const [selected, setSelected] = React.useState([])
      const [errorKey, setErrorKey] = React.useState(null)
      const [tick, setTick] = React.useState(0)
      const dragRef = React.useRef(null)
      const suppressClickRef = React.useRef(false)
      const skewRef = React.useRef(0)
      const handRef = React.useRef(null)
      const toggleSelectedRef = React.useRef(null)
      const previousComboRef = React.useRef(null)
      const hand = game.hand || []
      handRef.current = hand
      const selectedSet = new Set(selected)
      const selectedCards = hand.filter((card) => selectedSet.has(card.id))
      const selectedCombo = selectedCards.length > 0 ? analyze(selectedCards) : null
      const humanTurn = game.phase === 'play' && game.turn === seat
      const bidTurn = game.phase === 'bid' && game.turn === seat
      const previousCombo = game.lastPlay ? game.lastPlay.combo : null
      previousComboRef.current = previousCombo
      const mustPass = Boolean(humanTurn && previousCombo && findBeats(hand, previousCombo).length === 0)
      const seatInfo = seats[seat] || {}
      const otherSeats = [0, 1, 2].filter((index) => index !== seat)

      React.useEffect(() => {
        setSelected([])
        setErrorKey(null)
      }, [game.seq])

      React.useEffect(() => {
        skewRef.current = Date.now() - (snapshot.serverNow || Date.now())
      }, [snapshot.serverNow])

      React.useEffect(() => {
        const timer = window.setInterval(() => setTick((value) => value + 1), 300)
        return () => window.clearInterval(timer)
      }, [])

      React.useEffect(() => {
        const finishDrag = (event) => {
          const drag = dragRef.current
          if (!drag) return
          dragRef.current = null
          suppressClickRef.current = true
          if (event.type !== 'pointerup') return
          if (!drag.moved) {
            const card = handRef.current[drag.anchor]
            if (card) toggleSelectedRef.current?.(card)
            return
          }
          if (drag.add) {
            const raw = selectCardRange(
              handRef.current,
              drag.initial,
              drag.anchor,
              drag.last,
              true
            )
            setSelected(compactSelection(handRef.current, raw, previousComboRef.current))
          }
        }
        window.addEventListener('pointerup', finishDrag)
        window.addEventListener('pointercancel', finishDrag)
        return () => {
          window.removeEventListener('pointerup', finishDrag)
          window.removeEventListener('pointercancel', finishDrag)
        }
      }, [])

      const remaining =
        snapshot.deadline === null || snapshot.deadline === undefined
          ? null
          : Math.max(0, Math.ceil((snapshot.deadline - (Date.now() - skewRef.current)) / 1000))
      const countdownClass = `fh-countdown${remaining !== null && remaining <= 5 ? ' is-urgent' : ''}`

      const beginDrag = (index, event) => {
        if (!humanTurn || event.button !== 0) return
        const card = hand[index]
        if (!card) return
        const initial = selected.slice()
        const add = !initial.includes(card.id)
        dragRef.current = { anchor: index, last: index, initial, add, moved: false }
        setErrorKey(null)
      }

      const enterCard = (index) => {
        const drag = dragRef.current
        if (!humanTurn || !drag || drag.last === index) return
        drag.last = index
        drag.moved = true
        const raw = selectCardRange(hand, drag.initial, drag.anchor, index, drag.add)
        setSelected(drag.add ? compactSelection(hand, raw, previousCombo) : raw)
      }

      const toggleSelected = (card) => {
        if (!humanTurn) return
        setErrorKey(null)
        setSelected((previous) =>
          previous.includes(card.id)
            ? previous.filter((id) => id !== card.id)
            : [...previous, card.id]
        )
      }
      toggleSelectedRef.current = toggleSelected

      const clickCard = (card) => {
        if (suppressClickRef.current) {
          suppressClickRef.current = false
          return
        }
        toggleSelected(card)
      }

      const send = async (action) => {
        try {
          await onAction(action)
          setErrorKey(null)
        } catch (error) {
          setErrorKey(error.message)
        }
      }

      const play = () => {
        if (!selectedCombo) {
          setErrorKey(tr('lan.invalid'))
          return
        }
        if (previousCombo && !beats(selectedCombo, previousCombo)) {
          setErrorKey(tr('lan.cannotBeat'))
          return
        }
        send({ type: 'play', cards: selectedCards.map((card) => card.id) })
      }

      const hint = () => {
        const options = previousCombo ? findBeats(hand, previousCombo) : [chooseLead(hand)]
        if (!options || options.length === 0) {
          setSelected([])
          setErrorKey(tr('lan.mustPass'))
          return
        }
        setSelected(options[0].map((card) => card.id))
        setErrorKey(null)
      }

      const leave = async () => {
        try {
          await onLeave()
        } catch (error) {
          setErrorKey(error.message)
        }
      }

      const turnName = seats[game.turn] ? seats[game.turn].nickname : ''
      const landlordWon = game.landlord !== null && game.winner === game.landlord
      const humanWon = game.landlord === null
        ? false
        : game.landlord === seat
          ? landlordWon
          : !landlordWon
      // 叫地主还没结束时，三家都还没有确定身份。这里返回 null，避免提前把所有人标成“农民”。
      const roleKey = game.landlord === null
        ? null
        : game.landlord === seat
          ? 'ddz.landlord'
          : 'ddz.farmer'
      const seatLabel = (index) => {
        const entry = seats[index]
        return entry ? entry.nickname : turnName
      }

      return h(
        'div',
        { className: 'fh-lan-table-wrap' },
        h(
          'div',
          { className: 'fh-lan-table-head' },
          h(
            'div',
            { className: 'fh-lan-room-name' },
            h('strong', null, tr('lan.room')),
            roleKey ? h('span', { className: 'fh-role' }, tr(roleKey)) : null
          ),
          h(
            'div',
            { className: 'fh-lan-actions' },
            h(
              'button',
              {
                type: 'button',
                className: `fh-btn fh-btn-ghost${seatInfo.auto ? ' is-active' : ''}`,
                onClick: () => send({ type: 'trustee', enabled: !seatInfo.auto }),
                disabled: busy
              },
              tr(seatInfo.auto ? 'lan.trusteeOff' : 'lan.trustee')
            ),
            h(
              'button',
              { type: 'button', className: 'fh-btn fh-btn-ghost', onClick: leave, disabled: busy },
              tr('lan.leave')
            )
          )
        ),
        h(
          'div',
          { className: 'fh-ddz-table' },
          h(
            'div',
            { className: 'fh-ai-row' },
            h(LanSeat, {
              entry: seats[otherSeats[0]],
              active: game.turn === otherSeats[0] && game.phase !== 'over',
              showCards: true,
              action: game.actions ? game.actions[otherSeats[0]] : null
            }),
            h(
              'div',
              { className: 'fh-bottom-block' },
              h('span', { className: 'fh-bottom-label' }, tr('ddz.bottom')),
              h(
                'div',
                { className: 'fh-bottom-cards' },
                game.landlord === null
                  ? [0, 1, 2].map((index) => h(CardBack, { key: index, size: 'small' }))
                  : game.bottom.map((card) => h(PlayingCard, { key: card.id, card, small: true }))
              )
            ),
            h(LanSeat, {
              entry: seats[otherSeats[1]],
              active: game.turn === otherSeats[1] && game.phase !== 'over',
              showCards: true,
              action: game.actions ? game.actions[otherSeats[1]] : null
            })
          ),
          h(
            'div',
            { className: 'fh-table-center' },
            snapshot.notice
              ? h('p', { className: 'fh-notice' }, noticeText(snapshot.notice))
              : null,
            game.phase === 'play'
              ? h(
                  'p',
                  { className: 'fh-turn' },
                  h(
                    'span',
                    null,
                    game.turn === seat
                      ? tr('lan.turnYou')
                      : tr('lan.otherTurn', { name: seatLabel(game.turn) })
                  ),
                  seatInfo.auto ? h('span', { className: 'fh-trustee-tag' }, tr('ddz.trusteeTag')) : null,
                  remaining !== null
                    ? h(
                        'span',
                        { className: countdownClass, role: 'timer', 'aria-live': 'off' },
                        tr('ddz.countdown', { seconds: remaining })
                      )
                    : null
                )
              : null
          ),
          h(
            'div',
            { className: `fh-self${humanTurn ? ' is-active' : ''}` },
            h(
              'div',
              { className: 'fh-self-head' },
              h(
                'div',
                { className: 'fh-self-name' },
                h('span', { className: 'fh-avatar' }, h(PlayerGlyph, { size: 15 })),
                h('strong', null, tr('lan.you')),
                roleKey ? h('span', { className: 'fh-role' }, tr(roleKey)) : null
              ),
              h('span', { className: 'fh-self-count' }, tr('ddz.cardsLeft', { count: hand.length }))
            ),
            game.actions && game.actions[seat]
              ? h(
                  'div',
                  { className: 'fh-self-play' },
                  h('span', { className: 'fh-self-play-label' }, tr('ddz.played')),
                  game.actions[seat].type === 'pass'
                    ? h('span', { className: 'fh-played-pass' }, tr('lan.pass'))
                    : h(PlayedCards, { action: game.actions[seat] })
                )
              : null,
            h(
              'div',
              {
                className: 'fh-hand',
                role: 'group',
                'aria-label': tr('ddz.hand')
              },
              hand.map((card, index) =>
                h(PlayingCard, {
                  key: card.id,
                  card,
                  selected: selectedSet.has(card.id),
                  disabled: !humanTurn,
                  onClick: () => clickCard(card),
                  onPointerDown: (event) => beginDrag(index, event),
                  onPointerOver: () => enterCard(index)
                })
              )
            ),
            humanTurn ? h('p', { className: 'fh-drag-hint' }, tr('ddz.dragHint')) : null
          ),
          game.phase === 'bid'
            ? h(
                'div',
                { className: 'fh-bid-panel' },
                h(
                  'div',
                  { className: 'fh-bid-text' },
                  h('strong', null, bidTurn ? tr('lan.bidTurn') : tr('lan.waitBid')),
                  remaining !== null
                    ? h(
                        'span',
                        { className: countdownClass, role: 'timer', 'aria-live': 'off' },
                        tr('ddz.countdown', { seconds: remaining })
                      )
                    : null
                ),
                h(
                  'div',
                  { className: 'fh-actions' },
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'fh-btn fh-btn-primary',
                          disabled: !bidTurn || busy,
                          onClick: () => send({ type: 'bid', call: true })
                        },
                        tr('ddz.bid.call')
                      ),
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'fh-btn fh-btn-ghost',
                          disabled: !bidTurn || busy,
                          onClick: () => send({ type: 'bid', call: false })
                        },
                        tr('ddz.bid.pass')
                      )
                    )
              )
            : game.phase === 'play'
              ? h(
                  'div',
                  { className: 'fh-play-panel' },
                  errorKey
                    ? h('p', { className: 'fh-error', role: 'alert' }, errorKey)
                    : h(
                        'p',
                        { className: 'fh-selection' },
                        selected.length === 0
                          ? tr('ddz.notSelected')
                          : selectedCombo
                            ? tr('ddz.selectedCombo', {
                                count: selected.length,
                                combo: tr(`combo.${selectedCombo.kind}`)
                              })
                            : tr('lan.selected', { count: selected.length })
                      ),
                  mustPass && humanTurn
                    ? h('p', { className: 'fh-suggest is-warn' }, tr('lan.mustPass'))
                    : null,
                  h(
                    'div',
                    { className: 'fh-actions' },
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'fh-btn fh-btn-ghost',
                        onClick: hint,
                        disabled: !humanTurn || busy
                      },
                      tr('lan.hint')
                    ),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: `fh-btn fh-btn-ghost${(mustPass && humanTurn) ? ' is-recommended' : ''}`,
                        onClick: () => send({ type: 'pass' }),
                        disabled: !humanTurn || !game.lastPlay || game.lastPlay.seat === seat || busy
                      },
                      tr('lan.pass')
                    ),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'fh-btn fh-btn-primary',
                        onClick: play,
                        disabled: !humanTurn || selected.length === 0 || busy
                      },
                      tr('lan.play')
                    )
                  )
                )
              : null,
          game.phase === 'over'
            ? h(
                'div',
                { className: 'fh-result-overlay' },
                h(
                  'div',
                  { className: 'fh-result-card' },
                  h('p', { className: 'fh-result-kicker' }, tr('lan.room')),
                  h('h3', null, humanWon ? tr('lan.win') : tr('lan.lose')),
                  h('p', null, landlordWon ? tr('ddz.win.landlord') : tr('ddz.win.farmer')),
                  h(
                    'p',
                    { className: 'fh-result-balance' },
                    tr('lan.beans', { amount: formatBeans(seatInfo.beans) })
                  ),
                  snapshot.isHost
                    ? h(
                        'button',
                        {
                          type: 'button',
                          className: 'fh-btn fh-btn-primary',
                          onClick: onStart,
                          disabled: busy
                        },
                        tr('lan.again')
                      )
                    : h('p', { className: 'fh-wait-host' }, tr('lan.waitHost'))
                )
              )
            : null
        )
      )
    }

    /** 联机大厅和牌桌。只在游戏面板打开时轮询本机状态，不轮询就不联网。 */
    function LanLobby({ onClose }) {
      const [status, setStatus] = React.useState(null)
      const [busy, setBusy] = React.useState(false)
      const [error, setError] = React.useState(null)

      const refresh = React.useCallback(async () => {
        try {
          const next = await lanRequest('status')
          setStatus(next)
          setError(null)
        } catch (failure) {
          setError(failure.message)
        }
      }, [])

      React.useEffect(() => {
        let alive = true
        const poll = async () => {
          try {
            const next = await lanRequest('status')
            if (alive) {
              setStatus(next)
              setError(null)
            }
          } catch (failure) {
            if (alive) setError(failure.message)
          }
        }
        poll()
        const timer = window.setInterval(poll, 1500)
        return () => {
          alive = false
          window.clearInterval(timer)
        }
      }, [])

      const act = async (path, body) => {
        setBusy(true)
        setError(null)
        try {
          const result = await lanRequest(path, body)
          setStatus(result)
          if (path === 'enable') {
            window.localStorage.setItem(LAN_FLAG_KEY, body.enabled ? '1' : '0')
            window.dispatchEvent(new Event(body.enabled ? 'fh:lan-enabled' : 'fh:lan-disabled'))
          }
          return result
        } catch (failure) {
          setError(failure.message)
          throw failure
        } finally {
          setBusy(false)
        }
      }

      if (!status) {
        return h(
          'div',
          { className: 'fh-page fh-lan-page' },
          h('p', { className: 'fh-subtitle' }, error || '正在读取联机状态…')
        )
      }

      const room = status.room
      const peers = status.peers || []
      // 联机关闭后，上一局留下的“房间已经关闭”不再展示，避免重新进入时看到过期提示。
      const notice = status.enabled ? (room && room.notice) || status.notice : null
      const humans = room ? room.seats.filter((entry) => entry.kind === 'human').length : 0
      const availablePeers = peers.filter(
        (peer) => !room || !room.seats.some((entry) => entry.instanceId === peer.instanceId)
      )
      const enable = () => act('enable', { enabled: true })
      const disable = () => act('enable', { enabled: false })
      const reply = (accepted) => act('reply', { id: status.invitation.id, accepted })
      const start = () => act('start', {})
      const leave = () => act('leave', {})

      return h(
        'div',
        { className: 'fh-page fh-lan-page' },
        h(
          'div',
          { className: 'fh-list-head' },
          h(
            'div',
            { className: 'fh-list-heading' },
            h('p', { className: 'fh-kicker' }, tr('lan.kicker')),
            h('h1', { className: 'fh-title' }, tr('lan.title')),
            h('p', { className: 'fh-subtitle' }, tr('lan.subtitle')),
            h('p', { className: 'fh-lan-fairness' }, tr('lan.fairness'))
          ),
          h(
            'button',
            { type: 'button', className: 'fh-btn fh-btn-ghost fh-close', onClick: onClose },
            h(CloseGlyph),
            h('span', null, tr('game.backToList'))
          )
        ),
        error ? h('p', { className: 'fh-error', role: 'alert' }, error) : null,
        notice
          ? h('p', { className: 'fh-notice fh-lan-notice' }, noticeText(notice))
          : null,
        status.invitation
          ? h(
              'div',
              { className: 'fh-lan-invite' },
              h('strong', null, tr('lan.inviteFrom', { name: status.invitation.fromNickname })),
              h('p', null, tr('lan.inviteHint')),
              h(
                'div',
                { className: 'fh-actions' },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'fh-btn fh-btn-primary',
                    onClick: () => reply(true),
                    disabled: busy
                  },
                  tr('lan.accept')
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'fh-btn fh-btn-ghost',
                    onClick: () => reply(false),
                    disabled: busy
                  },
                  tr('lan.decline')
                )
              )
            )
          : null,
        !status.enabled
          ? h(
              'section',
              { className: 'fh-lan-panel' },
              h('h2', null, tr('lan.disabled.title')),
              h('p', null, tr('lan.disabled.text')),
              h(
                'button',
                {
                  type: 'button',
                  className: 'fh-btn fh-btn-primary',
                  onClick: enable,
                  disabled: busy
                },
                tr('lan.enable')
              )
            )
          : h(
              React.Fragment,
              null,
              h(
                'div',
                { className: 'fh-lan-toolbar' },
                h('p', { className: 'fh-lan-self' }, `${status.self.nickname} · ${status.self.host}`),
                h(
                  'div',
                  { className: 'fh-actions' },
                  h(
                    'button',
                    { type: 'button', className: 'fh-btn fh-btn-ghost', onClick: refresh, disabled: busy },
                    tr('lan.refresh')
                  ),
                  h(
                    'button',
                    { type: 'button', className: 'fh-btn fh-btn-ghost', onClick: disable, disabled: busy },
                    tr('lan.disable')
                  )
                )
              ),
              room
                ? h(
                    React.Fragment,
                    null,
                    !room.started
                      ? h(
                          'div',
                          { className: 'fh-lan-room-head' },
                          h('h2', null, tr('lan.room')),
                          h(
                            'span',
                            { className: 'fh-role' },
                            room.isHost ? tr('lan.host') : tr('lan.guest')
                          )
                        )
                      : null,
                    !room.started
                      ? h(
                          'div',
                          { className: 'fh-lan-seats' },
                          room.seats.map((entry) => h(LanSeat, { key: entry.seat, entry }))
                        )
                      : null,
                    room.isHost && !room.started && humans < 3 && availablePeers.length > 0
                      ? h(
                          'section',
                          { className: 'fh-lan-panel fh-lan-peer-panel' },
                          h('h2', null, tr('lan.online')),
                          h(
                            'div',
                            { className: 'fh-lan-peers' },
                            availablePeers.map((peer) =>
                              h(
                                'div',
                                { key: peer.instanceId, className: 'fh-lan-peer' },
                                h(
                                  'div',
                                  null,
                                  h('strong', null, peer.nickname),
                                  h('p', null, peer.host)
                                ),
                                h(
                                  'button',
                                  {
                                    type: 'button',
                                    className: 'fh-btn fh-btn-primary',
                                    onClick: () =>
                                      act('invite', { instanceId: peer.instanceId }),
                                    disabled: busy
                                  },
                                  tr('lan.invite')
                                )
                              )
                            )
                          )
                        )
                      : null,
                    !room.started
                      ? h(
                          'div',
                          { className: 'fh-lan-room-foot' },
                          h(
                            'p',
                            { className: 'fh-subtitle' },
                            room.isHost
                              ? humans < 3
                                ? tr('lan.inviteHint')
                                : tr('lan.start')
                              : tr('lan.waiting')
                          ),
                          room.isHost
                            ? h(
                                'button',
                                {
                                  type: 'button',
                                  className: 'fh-btn fh-btn-primary',
                                  onClick: start,
                                  disabled: busy
                                },
                                tr('lan.start')
                              )
                            : null,
                          h(
                            'button',
                            { type: 'button', className: 'fh-btn fh-btn-ghost', onClick: leave, disabled: busy },
                            tr('lan.leave')
                          )
                        )
                      : null,
                    room.started
                      ? h(LanTable, {
                          snapshot: room,
                          onAction: async (action) => {
                            await act('action', action)
                          },
                          onLeave: leave,
                          onStart: start,
                          busy
                        })
                      : null
                  )
                : h(
                    'section',
                    { className: 'fh-lan-panel' },
                    h('h2', null, tr('lan.online')),
                    peers.length === 0
                      ? h('p', null, tr('lan.noPeers'))
                      : h(
                          'div',
                          { className: 'fh-lan-peers' },
                          peers.map((peer) =>
                            h(
                              'div',
                              { key: peer.instanceId, className: 'fh-lan-peer' },
                              h(
                                'div',
                                null,
                                h('strong', null, peer.nickname),
                                h('p', null, peer.host)
                              ),
                              h(
                                'button',
                                {
                                  type: 'button',
                                  className: 'fh-btn fh-btn-primary',
                                  onClick: () => act('invite', { instanceId: peer.instanceId }),
                                  disabled: busy
                                },
                                tr('lan.invite')
                              )
                            )
                          )
                        )
                  )
            )
      )
    }

    /** 会话页顶部的邀请提示。只在用户开启过联机时才轮询。 */
    function LanInviteOverlay() {
      const [invitation, setInvitation] = React.useState(null)
      const [busy, setBusy] = React.useState(false)

      React.useEffect(() => {
        let alive = true
        let timer = null
        const poll = async () => {
          if (!alive) return
          let enabled = false
          try {
            enabled = window.localStorage.getItem(LAN_FLAG_KEY) === '1'
          } catch {
            enabled = false
          }
          if (!enabled) {
            setInvitation(null)
            timer = window.setTimeout(poll, 5000)
            return
          }
          try {
            const status = await lanRequest('status')
            if (alive) setInvitation(status.invitation)
          } catch {
            // 邀请浮层不显示错误，避免在用户工作时弹出无意义的提示。
          }
          timer = window.setTimeout(poll, 2500)
        }
        poll()
        const start = () => {
          if (timer === null) poll()
        }
        window.addEventListener('fh:lan-enabled', start)
        return () => {
          alive = false
          if (timer !== null) window.clearTimeout(timer)
          window.removeEventListener('fh:lan-enabled', start)
        }
      }, [])

      if (!invitation) return null

      const respond = async (accepted) => {
        setBusy(true)
        try {
          await lanRequest('reply', { id: invitation.id, accepted })
          setInvitation(null)
          if (accepted) {
            try {
              window.sessionStorage.setItem('dsh-fish-happy:lan-open', '1')
            } catch {
              // 会话存储不可用时，仍然可以用下面的事件通知已经挂载的页面。
            }
            const layout = runtime.ctx.get('layout')
            layout?.selectPanel?.(PANEL_ID)
            window.dispatchEvent(new Event('fh:lan-open'))
          }
        } catch {
          // 邀请可能已经过期，下一次轮询会清掉这条提示。
        } finally {
          setBusy(false)
        }
      }

      return h(
        'div',
        { className: 'fh-lan-toast', role: 'alert' },
        h('strong', null, tr('lan.inviteFrom', { name: invitation.fromNickname })),
        h('p', null, tr('lan.inviteHint')),
        h(
          'div',
          { className: 'fh-actions' },
          h(
            'button',
            {
              type: 'button',
              className: 'fh-btn fh-btn-primary',
              onClick: () => respond(true),
              disabled: busy
            },
            tr('lan.accept')
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'fh-btn fh-btn-ghost',
              onClick: () => respond(false),
              disabled: busy
            },
            tr('lan.decline')
          )
        )
      )
    }

    function FishHappyPage() {
      const [view, setView] = React.useState('list')
      const [, forceRender] = React.useReducer((value) => value + 1, 0)
      const locale = runtime.locale

      // 宿主切换语言时重新渲染一次，让已经挂载的页面也换成新语言。
      React.useEffect(() => {
        if (!locale || typeof locale.subscribe !== 'function') return undefined
        return locale.subscribe(() => forceRender())
      }, [locale])

      const close = React.useCallback(() => leaveToConversation(), [])

      // 用户在会话里接受邀请时，主面板可能刚被切过来。如果事件比页面挂载更早，
      // 就用会话级标记补上这次跳转，保证接受邀请后直接落在联机页而不是游戏列表。
      React.useEffect(() => {
        const openLan = () => setView('lan')
        window.addEventListener('fh:lan-open', openLan)
        try {
          if (window.sessionStorage.getItem('dsh-fish-happy:lan-open') === '1') {
            window.sessionStorage.removeItem('dsh-fish-happy:lan-open')
            setView('lan')
          }
        } catch {
          // 会话存储不可用时只依赖事件；页面已经打开时事件仍然有效。
        }
        return () => window.removeEventListener('fh:lan-open', openLan)
      }, [])

      return h(
        'div',
        { className: 'fh-root', 'data-fish-happy-view': view },
        h(
          'div',
          { className: 'fh-frame' },
          view === 'list'
            ? h(GameList, { onOpen: setView, onClose: close })
            : view === 'lan'
              ? h(LanLobby, { onClose: () => setView('list') })
              : h(
                  'div',
                  { className: 'fh-page fh-game-page' },
                  h(
                    'div',
                    { className: 'fh-game-head' },
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'fh-btn fh-btn-ghost',
                        onClick: () => setView('list')
                      },
                      h(ChevronLeftGlyph),
                      h('span', null, tr('game.backToList'))
                    ),
                    h(
                      'span',
                      { className: 'fh-game-crumb' },
                      tr(view === 'snake' ? 'card.snake.title' : 'card.ddz.title')
                    ),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'fh-btn fh-btn-ghost',
                        onClick: close
                      },
                      h(CloseGlyph),
                      h('span', null, tr('game.backToChat'))
                    )
                  ),
                  view === 'snake' ? h(SnakeGame) : h(DouDizhuGame)
                )
        )
      )
    }

    /** 游戏界面样式。所有颜色都引用宿主主题变量，明暗主题会自动跟着切换。 */
    const CSS = `
.fh-root,
.fh-root * {
  box-sizing: border-box;
}

.fh-root {
  --fh-accent: var(--dsw-alias-brand-primary, #4d6bfe);
  --fh-accent-ink: color-mix(in srgb, var(--fh-accent) 72%, var(--fh-text));
  --fh-bg: var(--dsw-alias-bg-base, #f7f8fa);
  --fh-surface: var(--dsw-alias-bg-layer-1, #ffffff);
  --fh-surface-2: var(--dsw-alias-bg-layer-2, #eef0f4);
  --fh-border: color-mix(in srgb, var(--dsw-alias-label-primary, #1c2330) 16%, transparent);
  --fh-border-strong: color-mix(in srgb, var(--dsw-alias-label-primary, #1c2330) 26%, transparent);
  --fh-text: var(--dsw-alias-label-primary, #1c2330);
  --fh-text-2: var(--dsw-alias-label-secondary, #566173);
  --fh-text-3: var(--dsw-alias-label-tertiary, #7c8798);
  --fh-danger: var(--dsw-alias-state-error-primary, #c9413b);
  --fh-font: var(--dsw-font-family, system-ui, -apple-system, "Segoe UI", sans-serif);

  height: 100%;
  min-height: 0;
  overflow: auto;
  color: var(--fh-text);
  font-family: var(--fh-font);
  background-color: var(--fh-bg);
  background-image:
    radial-gradient(900px 520px at 12% -10%, color-mix(in srgb, var(--fh-accent) 14%, transparent), transparent 70%),
    radial-gradient(760px 440px at 100% 0%, color-mix(in srgb, var(--fh-accent) 7%, transparent), transparent 68%);
}

.fh-frame {
  max-width: 1120px;
  min-height: 100%;
  margin: 0 auto;
  padding: 40px clamp(20px, 4vw, 56px) 48px;
}

.fh-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 14px;
  border: 1px solid transparent;
  border-radius: 10px;
  font: inherit;
  font-size: 13px;
  line-height: 1.2;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease,
    transform 0.16s ease;
}

.fh-btn:focus-visible,
.fh-game-card:focus-visible,
.fh-playing-card:focus-visible,
.fh-dpad-btn:focus-visible {
  outline: 2px solid var(--fh-accent);
  outline-offset: 2px;
}

.fh-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.fh-btn-ghost {
  color: var(--fh-text-2);
  background: color-mix(in srgb, var(--fh-surface) 72%, transparent);
  border-color: var(--fh-border);
}

.fh-btn-ghost:hover:not(:disabled) {
  color: var(--fh-text);
  background: var(--fh-surface-2);
}

.fh-btn-primary {
  color: var(--dsw-alias-label-primary-foreground, #ffffff);
  background: var(--fh-accent);
  border-color: transparent;
  box-shadow: 0 8px 20px -10px color-mix(in srgb, var(--fh-accent) 55%, transparent);
}

.fh-btn-primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--fh-accent) 88%, var(--fh-text));
}

.fh-list-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 34px;
}

.fh-list-heading {
  max-width: 660px;
}

.fh-kicker {
  margin: 0 0 10px;
  font-size: 11px;
  line-height: 1.4;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fh-accent);
}

.fh-title {
  margin: 0;
  font-size: clamp(28px, 3.2vw, 38px);
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.fh-subtitle {
  max-width: 620px;
  margin: 14px 0 0;
  font-size: 14px;
  line-height: 1.8;
  color: var(--fh-text-2);
}

.fh-close {
  flex: none;
}

.fh-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 22px;
  max-width: 880px;
}

.fh-game-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow: hidden;
  padding: 26px;
  border: 1px solid var(--fh-border);
  border-radius: 20px;
  font: inherit;
  color: var(--fh-text);
  text-align: left;
  background: var(--fh-surface);
  cursor: pointer;
  box-shadow: 0 1px 2px color-mix(in srgb, var(--fh-text) 6%, transparent);
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.fh-tone-snake {
  --fh-tone: var(--fh-accent);
}

.fh-tone-ddz {
  --fh-tone: var(--fh-accent);
}

.fh-tone-lan {
  --fh-tone: var(--dsw-alias-state-success-primary, #2f9e6e);
}

.fh-game-card:hover {
  border-color: color-mix(in srgb, var(--fh-tone) 42%, var(--fh-border));
  transform: translateY(-3px);
  box-shadow: 0 24px 48px -30px color-mix(in srgb, var(--fh-text) 45%, transparent);
}

.fh-game-card-glow {
  position: absolute;
  top: -96px;
  right: -76px;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--fh-tone) 20%, transparent),
    transparent 70%
  );
}

.fh-game-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.fh-game-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border: 1px solid color-mix(in srgb, var(--fh-tone) 22%, transparent);
  border-radius: 15px;
  color: var(--fh-tone);
  background: color-mix(in srgb, var(--fh-tone) 12%, var(--fh-surface));
}

.fh-badge {
  padding: 5px 9px;
  border: 1px solid var(--fh-border);
  border-radius: 999px;
  font-size: 11px;
  line-height: 1;
  color: var(--fh-text-2);
  background: color-mix(in srgb, var(--fh-surface-2) 72%, transparent);
}

.fh-game-name {
  margin-bottom: 8px;
  font-size: 20px;
  line-height: 1.3;
  font-weight: 650;
}

.fh-game-desc {
  min-height: 48px;
  margin-bottom: 18px;
  font-size: 13px;
  line-height: 1.75;
  color: var(--fh-text-2);
}

.fh-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 22px;
}

.fh-tag {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  line-height: 1.3;
  color: var(--fh-text-2);
  background: color-mix(in srgb, var(--fh-surface-2) 76%, transparent);
}

.fh-game-open {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
  font-size: 13px;
  font-weight: 600;
  color: var(--fh-accent);
}

.fh-game-open svg {
  transition: transform 0.16s ease;
}

.fh-game-card:hover .fh-game-open svg {
  transform: translateX(2px);
}

.fh-footnote {
  max-width: 700px;
  margin: 34px 0 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--fh-text-3);
}

.fh-game-page {
  max-width: 1040px;
  margin: 0 auto;
}

.fh-game-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
  padding: 6px 0;
}

.fh-game-crumb {
  flex: 1;
  overflow: hidden;
  font-size: 12px;
  color: var(--fh-text-3);
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fh-game {
  position: relative;
  max-width: 940px;
  margin: 0 auto;
}

.fh-game-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.fh-game-heading {
  max-width: 660px;
}

.fh-game-title {
  margin: 0 0 8px;
  font-size: clamp(24px, 2.6vw, 30px);
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: -0.015em;
}

.fh-game-sub {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--fh-text-2);
}

.fh-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.fh-stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid var(--fh-border);
  border-radius: 14px;
  background: var(--fh-surface);
}

.fh-stat-label {
  font-size: 11px;
  line-height: 1.3;
  color: var(--fh-text-3);
}

.fh-stat-value {
  font-size: 22px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.fh-board {
  position: relative;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid var(--fh-border);
  border-radius: 20px;
  background: var(--fh-surface-2);
  box-shadow: 0 24px 60px -40px color-mix(in srgb, var(--fh-text) 55%, transparent);
}

.fh-canvas {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
}

.fh-board-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: color-mix(in srgb, var(--fh-bg) 56%, transparent);
  backdrop-filter: blur(5px);
}

.fh-overlay-card {
  width: 100%;
  max-width: 320px;
  padding: 22px;
  border: 1px solid var(--fh-border);
  border-radius: 18px;
  text-align: center;
  background: var(--fh-surface);
  box-shadow: 0 28px 70px -36px color-mix(in srgb, var(--fh-text) 55%, transparent);
}

.fh-overlay-card h3 {
  margin: 0 0 8px;
  font-size: 20px;
  line-height: 1.3;
}

.fh-overlay-card p {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.65;
  color: var(--fh-text-2);
}

.fh-overlay-card .fh-overlay-score {
  margin: 0 0 14px;
  font-weight: 600;
  color: var(--fh-text);
  font-variant-numeric: tabular-nums;
}

.fh-new-best {
  display: inline-block;
  margin-bottom: 12px;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 11px;
  line-height: 1.2;
  font-weight: 600;
  color: var(--fh-accent);
  background: color-mix(in srgb, var(--fh-accent) 12%, transparent);
}

.fh-controls {
  margin: 14px 0 12px;
  font-size: 11px;
  line-height: 1.6;
  text-align: center;
  color: var(--fh-text-3);
}

.fh-dpad {
  display: grid;
  grid-template-columns: repeat(3, 46px);
  grid-template-rows: repeat(2, 46px);
  gap: 6px;
  justify-content: center;
  margin: 0 auto;
}

.fh-dpad-btn {
  display: grid;
  place-items: center;
  border: 1px solid var(--fh-border);
  border-radius: 12px;
  font: inherit;
  font-size: 18px;
  line-height: 1;
  color: var(--fh-text-2);
  background: var(--fh-surface);
  cursor: pointer;
  transition: background-color 0.14s ease, border-color 0.14s ease, transform 0.14s ease;
  touch-action: manipulation;
}

.fh-dpad-btn:hover {
  border-color: color-mix(in srgb, var(--fh-accent) 40%, var(--fh-border));
  background: var(--fh-surface-2);
}

.fh-dpad-btn:active {
  transform: scale(0.96);
}

.fh-dpad-up {
  grid-column: 2;
  grid-row: 1;
}

.fh-dpad-left {
  grid-column: 1;
  grid-row: 2;
}

.fh-dpad-down {
  grid-column: 2;
  grid-row: 2;
}

.fh-dpad-right {
  grid-column: 3;
  grid-row: 2;
}

.fh-card-back {
  display: inline-grid;
  place-items: center;
  flex: none;
  overflow: hidden;
  border: 1px solid var(--fh-border-strong);
  border-radius: 6px;
  background: repeating-linear-gradient(
    135deg,
    color-mix(in srgb, var(--fh-accent) 26%, var(--fh-surface)) 0 5px,
    color-mix(in srgb, var(--fh-accent) 6%, var(--fh-surface)) 5px 10px
  );
  box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--fh-surface) 65%, transparent);
}

.fh-card-back-normal {
  width: 44px;
  height: 62px;
}

.fh-card-back-small {
  width: 34px;
  height: 48px;
}

.fh-card-back-mini {
  width: 22px;
  height: 31px;
  border-radius: 4px;
}

.fh-card-back-mark {
  width: 42%;
  height: 42%;
  border: 1px solid color-mix(in srgb, var(--fh-accent) 42%, transparent);
  border-radius: 50%;
  opacity: 0.85;
}

.fh-playing-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 52px;
  height: 74px;
  padding: 0;
  border: 1px solid var(--fh-border);
  border-radius: 8px;
  font: inherit;
  color: var(--fh-text);
  background: var(--fh-surface);
  box-shadow: 0 2px 5px color-mix(in srgb, var(--fh-text) 10%, transparent);
  user-select: none;
}

button.fh-playing-card {
  cursor: pointer;
}

.fh-playing-card .fh-card-rank {
  font-size: 13px;
  line-height: 1;
  font-weight: 700;
}

.fh-playing-card .fh-card-center {
  font-size: 22px;
  line-height: 1;
}

.fh-playing-card.is-red {
  color: var(--fh-danger);
}

.fh-playing-card.is-joker .fh-card-center {
  font-size: 20px;
}

.fh-playing-card-small {
  width: 36px;
  height: 50px;
  border-radius: 6px;
  box-shadow: 0 1px 3px color-mix(in srgb, var(--fh-text) 10%, transparent);
}

.fh-playing-card-small .fh-card-rank {
  font-size: 10px;
}

.fh-playing-card-small .fh-card-center {
  font-size: 15px;
}

.fh-playing-card.is-selected {
  border-color: var(--fh-accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--fh-accent) 24%, transparent),
    0 10px 18px -12px color-mix(in srgb, var(--fh-text) 55%, transparent);
}

.fh-playing-card:disabled {
  cursor: default;
}

.fh-playing-card:disabled:not(.is-selected) {
  opacity: 0.94;
}

.fh-seat {
  min-width: 0;
  padding: 12px;
  border: 1px solid transparent;
  border-radius: 16px;
  background: color-mix(in srgb, var(--fh-bg) 32%, transparent);
  transition: border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease;
}

.fh-seat.is-active {
  border-color: color-mix(in srgb, var(--fh-accent) 42%, transparent);
  background: color-mix(in srgb, var(--fh-accent) 7%, var(--fh-surface));
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--fh-accent) 16%, transparent);
}

.fh-seat-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fh-avatar {
  display: grid;
  place-items: center;
  flex: none;
  width: 34px;
  height: 34px;
  border: 1px solid color-mix(in srgb, var(--fh-accent) 25%, transparent);
  border-radius: 50%;
  font-size: 13px;
  line-height: 1;
  font-weight: 700;
  color: var(--fh-accent);
  background: color-mix(in srgb, var(--fh-accent) 14%, var(--fh-surface));
}

.fh-seat-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.fh-seat-meta strong {
  overflow: hidden;
  font-size: 13px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fh-role {
  display: inline-flex;
  align-self: flex-start;
  padding: 2px 7px;
  border: 1px solid color-mix(in srgb, var(--fh-accent) 22%, transparent);
  border-radius: 999px;
  font-size: 10px;
  line-height: 1.3;
  font-weight: 600;
  color: var(--fh-accent-ink);
  background: color-mix(in srgb, var(--fh-accent) 12%, transparent);
}

.fh-mini-backs {
  display: flex;
  margin: 12px 0 8px;
  padding-left: 2px;
}

.fh-mini-backs .fh-card-back-mini {
  margin-left: -10px;
}

.fh-mini-backs .fh-card-back-mini:first-child {
  margin-left: 0;
}

.fh-seat-count {
  margin: 0;
  font-size: 11px;
  line-height: 1.4;
  color: var(--fh-text-3);
  font-variant-numeric: tabular-nums;
}

.fh-seat-action {
  display: block;
  margin: 6px 0 0;
  font-size: 11px;
  line-height: 1.4;
  font-weight: 600;
  color: var(--fh-accent);
}

.fh-played-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 5px;
}

.fh-self-play {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 8px;
  border: 1px solid var(--fh-border);
  border-radius: 10px;
  background: color-mix(in srgb, var(--fh-surface-2) 72%, transparent);
}

.fh-self-play-label {
  flex: none;
  font-size: 11px;
  font-weight: 600;
  color: var(--fh-text-3);
}

.fh-played-pass {
  font-size: 11px;
  color: var(--fh-text-3);
}

.fh-ddz-table {
  position: relative;
  padding: 24px;
  border: 1px solid var(--fh-border);
  border-radius: 24px;
  background:
    radial-gradient(
      120% 90% at 50% 0%,
      color-mix(in srgb, var(--fh-accent) 12%, transparent),
      transparent 66%
    ),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--fh-surface) 88%, var(--fh-accent)),
      var(--fh-surface)
    );
  box-shadow: 0 30px 70px -48px color-mix(in srgb, var(--fh-text) 60%, transparent);
}

.fh-ai-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: start;
  gap: 18px;
}

.fh-bottom-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: 4px;
}

.fh-bottom-label {
  font-size: 11px;
  line-height: 1.3;
  color: var(--fh-text-3);
}

.fh-bottom-cards {
  display: flex;
  gap: 4px;
}

.fh-table-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 128px;
  margin: 8px 0;
  padding: 14px 8px;
}

.fh-notice {
  margin: 0;
  padding: 6px 12px;
  border: 1px solid var(--fh-border);
  border-radius: 999px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--fh-text-2);
  background: color-mix(in srgb, var(--fh-surface-2) 80%, transparent);
}

.fh-last-play {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.fh-last-play-name {
  flex: none;
  margin-right: 2px;
  padding: 2px 8px;
  border: 1px solid var(--fh-border);
  border-radius: 999px;
  font-size: 11px;
  line-height: 1.5;
  font-weight: 600;
  color: var(--fh-text-2);
  background: color-mix(in srgb, var(--fh-surface-2) 82%, transparent);
}

.fh-combo {
  margin-left: 6px;
  font-size: 11px;
  color: var(--fh-text-3);
}

.fh-table-empty {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--fh-text-3);
}

.fh-turn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  font-weight: 600;
  color: var(--fh-accent);
}

.fh-countdown {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-width: 62px;
  padding: 3px 9px;
  border: 1px solid color-mix(in srgb, var(--fh-accent) 28%, transparent);
  border-radius: 999px;
  font-size: 11px;
  line-height: 1.4;
  font-weight: 600;
  color: var(--fh-accent-ink);
  background: color-mix(in srgb, var(--fh-accent) 12%, transparent);
  font-variant-numeric: tabular-nums;
}

.fh-countdown.is-urgent {
  color: var(--fh-danger);
  border-color: color-mix(in srgb, var(--fh-danger) 34%, transparent);
  background: color-mix(in srgb, var(--fh-danger) 12%, transparent);
  animation: fh-countdown-pulse 1s ease-in-out infinite;
}

@keyframes fh-countdown-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.55;
  }
}

.fh-self {
  margin-top: 4px;
  padding-top: 14px;
  border-top: 1px solid var(--fh-border);
}

.fh-self-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.fh-self-name {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 13px;
}

.fh-self-name .fh-avatar {
  width: 28px;
  height: 28px;
  font-size: 12px;
}

.fh-self-count {
  flex: none;
  font-size: 11px;
  line-height: 1.4;
  color: var(--fh-text-3);
  font-variant-numeric: tabular-nums;
}

.fh-hand {
  display: flex;
  align-items: flex-end;
  min-height: 118px;
  padding: 20px 6px 8px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  user-select: none;
}

.fh-hand.is-dragging,
.fh-hand.is-dragging .fh-playing-card {
  cursor: grabbing;
}

.fh-drag-hint {
  margin: 4px 0 0;
  font-size: 11px;
  line-height: 1.6;
  color: var(--fh-text-3);
}

.fh-hand .fh-playing-card {
  flex: none;
  margin-left: -16px;
  transition: transform 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease;
}

.fh-hand .fh-playing-card:first-child {
  margin-left: 0;
}

.fh-hand .fh-playing-card.is-selected {
  z-index: 2;
  transform: translateY(-14px);
}

.fh-bid-panel {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 14px;
  padding: 16px;
  border: 1px solid var(--fh-border);
  border-radius: 16px;
  background: color-mix(in srgb, var(--fh-surface-2) 55%, transparent);
}

.fh-bid-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fh-bid-text strong {
  font-size: 13px;
  line-height: 1.4;
}

.fh-bid-text span {
  font-size: 12px;
  line-height: 1.6;
  color: var(--fh-text-2);
}

.fh-bid-text .fh-countdown {
  align-self: flex-start;
  margin-top: 2px;
  font-size: 11px;
  line-height: 1.4;
  color: var(--fh-accent);
}

.fh-bid-text .fh-countdown.is-urgent {
  color: var(--fh-danger);
  border-color: color-mix(in srgb, var(--fh-danger) 34%, transparent);
  background: color-mix(in srgb, var(--fh-danger) 12%, transparent);
}

.fh-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.fh-play-panel {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
}

.fh-selection {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--fh-text-2);
}

.fh-error {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  font-weight: 600;
  color: var(--fh-danger);
}

.fh-result-overlay {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: grid;
  place-items: center;
  padding: 24px;
  border-radius: 24px;
  background: color-mix(in srgb, var(--fh-bg) 62%, transparent);
  backdrop-filter: blur(6px);
}

.fh-result-card {
  width: 100%;
  max-width: 360px;
  padding: 28px;
  border: 1px solid var(--fh-border);
  border-radius: 20px;
  text-align: center;
  background: var(--fh-surface);
  box-shadow: 0 34px 80px -40px color-mix(in srgb, var(--fh-text) 60%, transparent);
}

.fh-result-kicker {
  margin: 0 0 8px;
  font-size: 11px;
  line-height: 1.4;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fh-accent);
}

.fh-result-card h3 {
  margin: 0 0 10px;
  font-size: 24px;
  line-height: 1.3;
}

.fh-result-card p:not(.fh-result-kicker) {
  margin: 0 0 18px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--fh-text-2);
}

.fh-result-beans,
.fh-result-balance {
  font-variant-numeric: tabular-nums;
}

.fh-result-beans {
  font-weight: 600;
  color: var(--fh-accent-ink) !important;
}

.fh-result-balance {
  color: var(--fh-text-3) !important;
}

.fh-game-tools {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.fh-btn.is-active {
  color: var(--fh-accent-ink);
  border-color: color-mix(in srgb, var(--fh-accent) 36%, transparent);
  background: color-mix(in srgb, var(--fh-accent) 13%, var(--fh-surface));
}

.fh-btn.is-recommended {
  border-color: var(--fh-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--fh-accent) 22%, transparent);
  animation: fh-recommend-pulse 1.2s ease-in-out infinite;
}

@keyframes fh-recommend-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--fh-accent) 22%, transparent);
  }
  50% {
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--fh-accent) 10%, transparent);
  }
}

.fh-bean-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  margin: -4px 0 16px;
}

.fh-bean-chip {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border: 1px solid color-mix(in srgb, var(--fh-accent) 28%, transparent);
  border-radius: 999px;
  font-size: 12px;
  line-height: 1.5;
  font-weight: 600;
  color: var(--fh-accent-ink);
  background: color-mix(in srgb, var(--fh-accent) 11%, transparent);
  font-variant-numeric: tabular-nums;
}

.fh-bean-meta {
  font-size: 11px;
  line-height: 1.5;
  color: var(--fh-text-3);
  font-variant-numeric: tabular-nums;
}

.fh-seat-beans {
  margin: 4px 0 0;
  font-size: 11px;
  line-height: 1.4;
  color: var(--fh-text-3);
  font-variant-numeric: tabular-nums;
}

.fh-suggest {
  flex-basis: 100%;
  margin: 0;
  padding: 8px 12px;
  border: 1px solid color-mix(in srgb, var(--fh-accent) 28%, transparent);
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--fh-accent-ink);
  background: color-mix(in srgb, var(--fh-accent) 9%, transparent);
}

.fh-suggest.is-warn {
  color: var(--fh-danger);
  border-color: color-mix(in srgb, var(--fh-danger) 32%, transparent);
  background: color-mix(in srgb, var(--fh-danger) 9%, transparent);
}

.fh-trustee-tag {
  flex: none;
  padding: 2px 7px;
  border: 1px solid color-mix(in srgb, var(--fh-accent) 24%, transparent);
  border-radius: 999px;
  font-size: 10px;
  line-height: 1.4;
  font-weight: 600;
  color: var(--fh-accent-ink);
  background: color-mix(in srgb, var(--fh-accent) 10%, transparent);
}

.fh-ddz-ready,
.fh-ddz-dealing {
  display: grid;
  place-items: center;
  min-height: 420px;
  overflow: hidden;
}

.fh-ready-overlay {
  display: grid;
  place-items: center;
  width: 100%;
  padding: 20px;
}

.fh-ready-card {
  width: 100%;
  max-width: 420px;
  padding: 34px 30px;
  border: 1px solid var(--fh-border);
  border-radius: 22px;
  text-align: center;
  background: var(--fh-surface);
  box-shadow: 0 34px 80px -44px color-mix(in srgb, var(--fh-text) 58%, transparent);
}

.fh-ready-card h3 {
  margin: 0 0 10px;
  font-size: 26px;
  line-height: 1.3;
}

.fh-ready-card p {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--fh-text-2);
}

.fh-ready-beans {
  padding: 9px 12px;
  border: 1px solid var(--fh-border);
  border-radius: 12px;
  background: color-mix(in srgb, var(--fh-surface-2) 62%, transparent);
  font-size: 12px !important;
  color: var(--fh-text) !important;
  font-variant-numeric: tabular-nums;
}

.fh-relief {
  color: var(--fh-danger) !important;
  font-size: 12px !important;
}

.fh-btn-start {
  margin-top: 8px;
  padding: 11px 28px;
  font-size: 14px;
}

.fh-deal-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.fh-deal-fan {
  position: relative;
  width: 280px;
  height: 150px;
  margin-bottom: 6px;
}

.fh-deal-card {
  position: absolute;
  bottom: 0;
  left: 50%;
  opacity: 0;
  transform: translateX(-50%) rotate(calc((var(--i) - 4) * 7deg));
  transform-origin: 50% 120%;
  animation: fh-deal-in 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
  animation-delay: calc(var(--i) * 65ms);
}

@keyframes fh-deal-in {
  from {
    opacity: 0;
    transform: translate(-50%, 26px) rotate(calc((var(--i) - 4) * 7deg)) scale(0.92);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0) rotate(calc((var(--i) - 4) * 7deg)) scale(1);
  }
}

.fh-deal-title {
  margin: 10px 0 0;
  font-size: 20px;
  line-height: 1.4;
  font-weight: 700;
}

.fh-deal-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--fh-text-3);
}

.fh-lan-page {
  max-width: 980px;
  margin: 0 auto;
}

.fh-lan-fairness {
  max-width: 680px;
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--fh-text-3);
}

.fh-lan-panel {
  padding: 22px;
  border: 1px solid var(--fh-border);
  border-radius: 18px;
  background: var(--fh-surface);
}

.fh-lan-panel h2 {
  margin: 0 0 8px;
  font-size: 18px;
  line-height: 1.4;
}

.fh-lan-panel > p {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--fh-text-2);
}

.fh-lan-toolbar,
.fh-lan-room-head,
.fh-lan-room-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.fh-lan-toolbar {
  margin-bottom: 18px;
  padding: 12px 14px;
  border: 1px solid var(--fh-border);
  border-radius: 14px;
  background: var(--fh-surface);
}

.fh-lan-self {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--fh-text-2);
  font-variant-numeric: tabular-nums;
}

.fh-lan-invite {
  margin-bottom: 18px;
  padding: 18px;
  border: 1px solid color-mix(in srgb, var(--fh-accent) 30%, transparent);
  border-radius: 16px;
  background: color-mix(in srgb, var(--fh-accent) 9%, var(--fh-surface));
}

.fh-lan-invite .fh-actions {
  margin-top: 12px;
}

.fh-lan-invite p {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--fh-text-2);
}

.fh-lan-peers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 10px;
}

.fh-lan-peer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--fh-border);
  border-radius: 14px;
  background: var(--fh-surface);
}

.fh-lan-peer strong {
  display: block;
  font-size: 13px;
  line-height: 1.5;
}

.fh-lan-peer p {
  margin: 3px 0 0;
  font-size: 11px;
  line-height: 1.5;
  color: var(--fh-text-3);
}

.fh-lan-seats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 16px 0;
}

.fh-lan-seat {
  min-height: 104px;
  padding: 14px;
  border: 1px solid var(--fh-border);
  border-radius: 16px;
  background: var(--fh-surface);
  transition: border-color 0.16s ease, box-shadow 0.16s ease;
}

.fh-lan-seat.is-active {
  border-color: color-mix(in srgb, var(--fh-accent) 52%, var(--fh-border));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--fh-accent) 12%, transparent);
}

.fh-lan-seat-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fh-lan-seat-name strong {
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fh-lan-seat-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  margin-top: 8px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--fh-text-3);
  font-variant-numeric: tabular-nums;
}

.fh-lan-seat-cards {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--fh-text-2);
}

.fh-lan-seat-play {
  margin-top: 4px;
}

.fh-lan-offline {
  padding: 1px 6px;
  border: 1px solid color-mix(in srgb, var(--fh-danger) 28%, transparent);
  border-radius: 999px;
  color: var(--fh-danger);
}

.fh-lan-room-head h2 {
  margin: 0;
  font-size: 18px;
}

.fh-lan-room-foot {
  margin-top: 14px;
}

.fh-lan-room-foot .fh-subtitle {
  flex: 1 1 240px;
  margin: 0;
}

.fh-lan-table-wrap {
  margin-top: 4px;
}

.fh-lan-table-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.fh-lan-room-name {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  line-height: 1.5;
}

.fh-lan-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.fh-wait-host {
  margin: 0 !important;
  font-size: 12px !important;
  color: var(--fh-text-3) !important;
}

.fh-lan-toast {
  position: fixed;
  top: 68px;
  right: 24px;
  z-index: 2147483000;
  width: min(440px, calc(100vw - 32px));
  padding: 16px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, #1c2330) 18%, transparent);
  border-radius: 16px;
  pointer-events: auto;
  color: var(--dsw-alias-label-primary, #1c2330);
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  font-family: var(--dsw-font-family, system-ui, -apple-system, "Segoe UI", sans-serif);
  box-shadow: 0 24px 60px -24px color-mix(in srgb, var(--dsw-alias-label-primary, #1c2330) 55%, transparent);

  --fh-accent: var(--dsw-alias-brand-primary, #4d6bfe);
  --fh-text: var(--dsw-alias-label-primary, #1c2330);
  --fh-text-2: var(--dsw-alias-label-secondary, #566173);
  --fh-text-3: var(--dsw-alias-label-tertiary, #7c8798);
  --fh-surface: var(--dsw-alias-bg-layer-1, #ffffff);
  --fh-surface-2: var(--dsw-alias-bg-layer-2, #eef0f4);
  --fh-border: color-mix(in srgb, var(--dsw-alias-label-primary, #1c2330) 16%, transparent);
}

.fh-lan-toast strong {
  display: block;
  font-size: 14px;
  line-height: 1.5;
}

.fh-lan-toast p {
  margin: 4px 0 12px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--dsw-alias-label-secondary, #566173);
}

.fh-lan-toast .fh-actions {
  justify-content: flex-start;
}

@media (max-width: 760px) {
  .fh-lan-toast {
    top: 64px;
    right: 16px;
    left: 16px;
    width: auto;
  }

  .fh-lan-seats {
    grid-template-columns: 1fr;
  }

  .fh-lan-room-foot,
  .fh-lan-toolbar {
    align-items: flex-start;
  }

  .fh-lan-room-foot .fh-actions {
    width: 100%;
  }
}

@media (max-width: 760px) {
  .fh-frame {
    padding: 24px 16px 32px;
  }

  .fh-list-head {
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
  }

  .fh-close {
    align-self: flex-start;
  }

  .fh-game-head {
    flex-wrap: wrap;
    gap: 10px;
  }

  .fh-game-crumb {
    order: 3;
    flex-basis: 100%;
    text-align: left;
  }

  .fh-game-title-row {
    flex-direction: column;
    gap: 14px;
  }

  .fh-ddz-table {
    padding: 14px;
    border-radius: 18px;
  }

  .fh-ai-row {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .fh-bottom-block {
    grid-column: 1 / -1;
    grid-row: 1;
  }

  .fh-seat {
    grid-row: 2;
  }

  .fh-table-center {
    min-height: 108px;
  }

  .fh-hand {
    padding-top: 18px;
  }

  .fh-hand .fh-playing-card {
    width: 46px;
    height: 66px;
    margin-left: -14px;
  }

  .fh-hand .fh-playing-card .fh-card-center {
    font-size: 19px;
  }

  .fh-result-overlay {
    border-radius: 18px;
  }

  .fh-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .fh-game-tools {
    justify-content: flex-start;
  }

  .fh-ddz-ready,
  .fh-ddz-dealing {
    min-height: 360px;
  }

  .fh-ready-card {
    padding: 26px 20px;
  }

  .fh-deal-fan {
    transform: scale(0.88);
  }
}

@media (max-width: 440px) {
  .fh-cards {
    grid-template-columns: 1fr;
  }

  .fh-stats {
    gap: 8px;
  }

  .fh-stat {
    padding: 12px;
  }

  .fh-stat-value {
    font-size: 19px;
  }

  .fh-hand .fh-playing-card {
    width: 42px;
    height: 61px;
  }

  .fh-bid-panel {
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fh-root *,
  .fh-root *::before,
  .fh-root *::after {
    transition: none !important;
    animation: none !important;
  }
}
`

    /**
     * 把样式挂到页面里。
     *
     * 重复挂载时直接复用已有的样式标签，卸载插件时再由返回的清理函数移除。
     */
    function injectStyles() {
      const marker = 'dsh-fish-happy/game.css'
      const existing = document.querySelector(`style[data-plugin-css="${marker}"]`)
      if (existing) return () => {}
      const style = document.createElement('style')
      style.setAttribute('data-plugin', 'dsh-fish-happy')
      style.setAttribute('data-plugin-css', marker)
      style.textContent = CSS
      document.head.appendChild(style)
      return () => {
        style.remove()
      }
    }

    /** 插件激活时向宿主注册侧边栏入口和主面板。 */
    function apply(ctx, config) {
      runtime.ctx = ctx
      const locale =
        ctx.locale || (typeof ctx.get === 'function' ? ctx.get('locale') : null)
      runtime.locale = locale || null

      if (locale && typeof locale.register === 'function' && typeof locale.bind === 'function') {
        ctx.effect(() => locale.register(NS, DICTS), 'fish-happy: dictionaries')
        setTranslate(locale.bind(NS))
      }

      ctx.effect(() => injectStyles(), 'fish-happy: styles')

      const disposers = []
      const slots = ctx.slots
      if (!slots || typeof slots.inject !== 'function') {
        console.error('[fish-happy] 宿主没有提供插槽服务，游戏面板无法注册。')
        return
      }
      try {
        disposers.push(
          slots.inject('sidebar.panellist', () =>
            slots.register(
              {
                name: 'sidebar.panellist',
                id: PANEL_ID,
                order: PANEL_ORDER,
                label: () => tr('panel.label')
              },
              FishHappyPanelIcon
            )
          )
        )
        disposers.push(
          slots.inject('main', () =>
            slots.register(
              {
                name: 'main',
                key: PANEL_ID
              },
              FishHappyPage
            )
          )
        )
        disposers.push(
          slots.inject('shell.overlay', () =>
            slots.register(
              {
                name: 'shell.overlay',
                id: 'fish-happy-invite',
                order: 20
              },
              LanInviteOverlay
            )
          )
        )
      } catch (error) {
        console.error('[fish-happy] 注册游戏面板失败。', error)
      }

      ctx.effect(
        () => () => {
          // 插件被停用或热更新时，如果当前正停在这个面板，先回到会话，避免主区域留下空面板。
          const layout =
            runtime.ctx && typeof runtime.ctx.get === 'function'
              ? runtime.ctx.get('layout')
              : null
          try {
            const activePanelId = layout?.panelInfo?.getSnapshot?.().activePanelId
            if (activePanelId === PANEL_ID) layout.selectPanel(null)
          } catch (error) {
            console.warn('[fish-happy] 离开游戏面板时遇到错误。', error)
          }
          for (const dispose of disposers.splice(0)) {
            if (typeof dispose === 'function') dispose()
          }
        },
        'fish-happy: ui mounts'
      )
    }

    const inject = ['slots', 'locale', 'layout']

    return { apply, inject }
  }
})
