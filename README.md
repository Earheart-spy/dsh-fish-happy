# 鱼乐一下

左侧边栏里的轻量游戏角。工作间隙想放松几分钟时，打开它挑一局小游戏，玩完再回到会话。

![斗地主牌桌](<docs/images/table.png>)

当前内置三个游戏入口：

- **贪吃蛇**：方向键或 W A S D 控制方向，空格暂停。吃到红点加十分，蛇身变长，速度会慢慢加快；撞墙或者咬到自己就结束。
- **斗地主（单人）**：你和两位电脑玩家同桌。进入后先点「开始游戏」，看九张牌展开的发牌动画，发完牌才进入叫地主。点牌选中，按住鼠标横向拖过连续的牌可以一次选多张；叫地主有十五秒、出牌有三十秒读秒，最后五秒会变红。倒计时剩五秒时，如果你还没选牌，界面会自动选好一手推荐牌，或者提示你要不起；这时可以快速确认出牌，也可以点「不出」。没空操作时可以点「托管」，电脑会替你叫牌和出牌。每局按底注和倍数结算欢乐豆，炸弹会把倍数翻倍；豆子不够时补一千救济金。两个农民不会互相压牌，遇到队友出的牌时电脑座位会写“队友的牌，不压”。每家的出牌都放在各自座位下方，自己的出牌放在手牌上方，不会再混到桌面中央。
- **局域网斗地主**：和同一局域网里的同事开一桌，最多三个人，空位由电脑补齐。联机开关默认关闭，第一次进入时点「开启联机」才会开始在局域网里广播自己的在线状态。房主在在线同事列表里邀请一到两人，对方接受后入座，房主点「开始牌局」。牌局由房主进程统一判定，房主页面和客人一样只能看到自己的手牌；房主进程为了校验牌型会在内存里持有三家手牌，但不会把别人的手牌发给页面。客人掉线超过十五秒、或者轮到自己时超过读秒时间，电脑会接管这一席。房主主动退出牌桌时，真实客人会看到“房主摸鱼可能被抓住了，风紧撤呼！”并回到联机大厅。

![联机大厅](<docs/images/lan-lobby.png>)

## 怎么使用

1. 在左侧边栏点击鱼形图标，进入「鱼乐一下」。
2. 页面上会以卡片形式列出三个游戏入口，点击任意一张卡片进入游戏。
3. 游戏页左上角的「游戏列表」可以退回卡片页，右上角的「返回会话」直接回到聊天。
4. 联机斗地主需要双方都打开「鱼乐一下」并开启联机开关；如果找不到同事，先确认两台电脑在同一网段，再点「刷新」。
5. 语言跟随宿主设置，在中文和英文之间切换后，面板文字会一起变化。

## 安装到另一台电脑

### 最快：一条命令（Windows）

在另一台电脑上打开 PowerShell，执行：

```powershell
irm https://raw.githubusercontent.com/Earheart-spy/dsh-fish-happy/main/install.ps1 | iex
```

这条命令会自动完成四件事：

1. 把仓库下载到 `%USERPROFILE%\Documents\dsh\fish-happy`；没有 Git 时会自动改用 ZIP 下载。
2. 找到当前用户的 DSH `desktop` profile。
3. 把这个插件写进 profile 的 `dependencies` 和 `dsh.profile.bundles`。
4. 在 profile 的 `node_modules` 下建立指向插件目录的 Junction。

安装完成后，完全退出 DSH 桌面端再重新打开，左侧边栏就会出现鱼形「鱼乐一下」图标。

想换下载目录时，先设置环境变量再执行同一条命令：

```powershell
$env:DSH_FISH_HAPPY_DIR='D:\dsh-fish-happy'; irm https://raw.githubusercontent.com/Earheart-spy/dsh-fish-happy/main/install.ps1 | iex
```

如果 PowerShell 的脚本执行策略拦住了命令，用这一条：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/Earheart-spy/dsh-fish-happy/main/install.ps1 | iex"
```

下面的手动步骤作为备用，适合想自己控制目录，或者一条命令因为网络原因失败的情况。

### 准备

- 这台电脑已经安装 DeepSeek Harness 桌面版，版本不低于 `0.2.2-rc.2`。
- 电脑上有 Git；没有 Git 也可以在 GitHub 页面点 `Code` → `Download ZIP`，解压后使用解压目录。
- 不需要单独安装 Node.js，插件运行在 DSH 自带的运行时里。

### 1. 下载仓库

```powershell
git clone https://github.com/Earheart-spy/dsh-fish-happy.git
```

假设克隆到 `C:\Users\你的用户名\Documents\dsh\fish-happy`。用 ZIP 下载时，目录名通常是 `dsh-fish-happy-main`，效果一样。

### 2. 安装成 DSH 的 bundle

DSH 插件必须注册到 profile 的 bundle 列表里，不能只把目录复制到 `node_modules`。在 DSH 里新开一个对话，让助手执行：

```text
plugin_manager action=install_bundle target=<仓库的绝对路径>
```

Windows 示例：

```text
plugin_manager action=install_bundle target=C:\Users\你的用户名\Documents\dsh\fish-happy
```

macOS 或 Linux 示例：

```text
plugin_manager action=install_bundle target=/Users/你的用户名/Documents/dsh/fish-happy
```

成功时会返回 `enabled: true`、`application: "applied"`。如果提示已经安装过，说明这个目录已经注册，不需要重复安装。

### 3. 打开插件

刷新 DSH 页面，左侧边栏会出现鱼形「鱼乐一下」图标；看不到就重启一次 DSH 桌面端。插件默认不开启联机，也不会自动开始任何一局游戏。

### 4. 两台电脑联机测试

1. 两台电脑都按上面的步骤安装，并确认在同一个局域网、同一个网段。
2. 两边都打开「鱼乐一下」→「局域网斗地主」→「开启联机」。
3. 如果 Windows 弹出防火墙提示，允许 DSH 访问专用网络；否则对方收不到心跳，也连不上房间。
4. 在在线同事列表里点「邀请」，对方页面会弹出邀请；接受后房主点「开始牌局」。
5. 联机开关默认关闭；关闭后立即停止发送发现广播，也不会保留后台房间。

### 5. 更新插件

```powershell
cd C:\Users\你的用户名\Documents\dsh\fish-happy
git pull
```

客户端改动会由 DSH 热更新；如果改到了 `lib/index.js`、`lib/lan.js` 或 `cordis.patch.yml`，在插件管理里把 `dsh-fish-happy` 禁用再启用一次，或者重启 DSH。

## 运行方式

- 单机游戏只在打开对应游戏界面时运行；离开面板、切回会话或者关闭页面后，贪吃蛇的计时器和斗地主的电脑出牌计时器都会取消。
- 贪吃蛇检测到页面被切到后台时会自动暂停，不会继续在后台走。
- 打开插件不会自动开始任何一局单机游戏：贪吃蛇停在「准备好了吗」，斗地主停在准备页，等你点「开始游戏」并发完牌。
- 联机牌局是例外：房主进程需要继续维持牌局和读秒，因此进入联机房间后即使切回会话，牌局仍会运行；点「离开牌桌」或牌局结束才会停止。联机开关默认关闭，关闭时不会在后台发送任何发现广播。

## 主题适配

界面颜色全部来自宿主提供的 `--dsw-alias-*` 主题变量，没有写死浅色或深色背景：

- 页面底色使用 `--dsw-alias-bg-base`，卡片和桌面使用 `--dsw-alias-bg-layer-1/2`。
- 文字、强调色、错误提示分别使用宿主的文字、品牌色和状态色变量。
- 边框用文字色混合出低透明度描边，因为宿主亮色主题提供的边框色是白色半透明，直接用在白底上几乎看不见。
- 贪吃蛇的 canvas 在每次绘制时从计算样式里读取主题变量，并监听页面根元素的属性变化；切换明暗主题后会立刻按新颜色重画。

因此浅色主题下页面是浅色，深色主题下页面是深色，不会出现浅色主题配深色游戏背景的情况。

## 开发

```powershell
# 检查客户端脚本能否被解析
$env:ELECTRON_RUN_AS_NODE='1'
& $env:DSH_NODE_EXECUTABLE -e "const fs=require('fs'); new Function(fs.readFileSync('lib/client.js','utf8')); console.log('OK')"

# 跑规则测试：牌型、比较、提示、农民让牌原因、三百局完整对局、贪吃蛇碰撞
& $env:DSH_NODE_EXECUTABLE tools/test-rules.mjs

# 跑局域网测试：邀请、票据入座、按座位裁剪手牌、房主退出提示
& $env:DSH_NODE_EXECUTABLE tools/test-lan.mjs

# 修改客户端规则后，重新生成主机端共用的规则文件
& $env:DSH_NODE_EXECUTABLE tools/sync-rules.mjs

# 检查中英文字典和样式作用域
& $env:DSH_NODE_EXECUTABLE tools/audit-client.mjs
```

安装到当前 profile：

```text
plugin_manager action=install_bundle target=<仓库的绝对路径>
```

## 目录

- `lib/index.js`：主机端入口，注册联机发现和房间使用的本地 HTTP 路由。
- `lib/lan.js`：主机端联机实现，包括 UDP 发现、TCP 房间、房主权威判定、按座位裁剪快照和电脑托管。
- `lib/rules.js`：由 `tools/sync-rules.mjs` 从 `lib/client.js` 的规则区生成，供主机端复用同一套发牌和牌型规则。
- `lib/client.js`：全部界面、单机规则、联机界面、样式和槽位注册。
- `locale/zh.json`、`locale/en.json`：插件在插件列表里的标题和说明。
- `icon.svg`：侧边栏入口使用的鱼形图标。
- `cordis.patch.yml`：把插件包插入当前 profile 的 bundle 配置。
- `docs/DETAIL.md`：实现细节、槽位契约和测试范围。
- `tools/`：规则同步、规则测试、联机测试、字典和样式检查，以及两个用于验收的假客人脚本。
