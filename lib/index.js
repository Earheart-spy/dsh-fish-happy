/**
 * 「鱼乐一下」的主机端入口。
 *
 * 浏览器里的单机游戏不需要这个进程参与。这里的服务只在用户主动打开联机
 * 开关后才开始监听局域网广播和房间端口；插件加载时不会主动联网，也不会
 * 在后台运行牌局。
 */
import { FishHappyLan, isLocalRequest, readJsonBody, writeJson } from './lan.js'

export const name = 'fish-happy'
export const inject = ['webServer']

const ROUTE_PREFIX = '/plugins/dsh-fish-happy/lan'

function rejectNonLocal(request, response) {
  if (isLocalRequest(request)) return false
  writeJson(response, 403, { error: '联机接口只允许本机页面访问。' })
  return true
}

function methodNotAllowed(response) {
  writeJson(response, 405, { error: '请求方法不对。' })
}

export function apply(ctx) {
  const lan = new FishHappyLan()
  const makeRoute = (name, handler) => ({
    kind: 'exact',
    path: `${ROUTE_PREFIX}/${name}`,
    handler
  })

  const readAction = async (request, response) => {
    if (rejectNonLocal(request, response)) return
    if (request.method !== 'POST') {
      methodNotAllowed(response)
      return
    }
    try {
      const body = await readJsonBody(request)
      writeJson(response, 200, await lan.action(body))
    } catch (error) {
      writeJson(response, 400, { error: error.message })
    }
  }

  const readReply = async (request, response) => {
    if (rejectNonLocal(request, response)) return
    if (request.method !== 'POST') {
      methodNotAllowed(response)
      return
    }
    try {
      const body = await readJsonBody(request)
      writeJson(response, 200, await lan.answerInvite(body.id, Boolean(body.accepted)))
    } catch (error) {
      writeJson(response, 400, { error: error.message })
    }
  }

  const routes = [
    makeRoute('status', (request, response) => {
      if (rejectNonLocal(request, response)) return
      if (request.method !== 'GET') {
        methodNotAllowed(response)
        return
      }
      writeJson(response, 200, lan.getStatus())
    }),
    makeRoute('enable', async (request, response) => {
      if (rejectNonLocal(request, response)) return
      if (request.method !== 'POST') {
        methodNotAllowed(response)
        return
      }
      try {
        const body = await readJsonBody(request)
        writeJson(response, 200, body.enabled ? await lan.enable() : await lan.disable())
      } catch (error) {
        writeJson(response, 400, { error: error.message })
      }
    }),
    makeRoute('invite', async (request, response) => {
      if (rejectNonLocal(request, response)) return
      if (request.method !== 'POST') {
        methodNotAllowed(response)
        return
      }
      try {
        const body = await readJsonBody(request)
        writeJson(response, 200, await lan.invite(body.instanceId))
      } catch (error) {
        writeJson(response, 400, { error: error.message })
      }
    }),
    makeRoute('reply', readReply),
    makeRoute('start', (request, response) => {
      if (rejectNonLocal(request, response)) return
      if (request.method !== 'POST') {
        methodNotAllowed(response)
        return
      }
      try {
        writeJson(response, 200, lan.startGame())
      } catch (error) {
        writeJson(response, 400, { error: error.message })
      }
    }),
    makeRoute('action', readAction),
    makeRoute('leave', async (request, response) => {
      if (rejectNonLocal(request, response)) return
      if (request.method !== 'POST') {
        methodNotAllowed(response)
        return
      }
      try {
        writeJson(response, 200, await lan.leave())
      } catch (error) {
        writeJson(response, 400, { error: error.message })
      }
    })
  ]

  for (const route of routes) {
    ctx.effect(() => ctx.webServer.register(route), `fish-happy: ${route.path}`)
  }
  ctx.effect(() => () => lan.dispose(), 'fish-happy: 联机服务清理')
}
