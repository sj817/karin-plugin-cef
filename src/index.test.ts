import fs from 'node:fs'
import path from 'node:path'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('index', () => {
  const tmpDir = path.resolve(import.meta.dirname, '../.tmp-test-index')

  beforeEach(async () => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true })
    }
    fs.mkdirSync(tmpDir, { recursive: true })

    vi.doMock('node-karin/root', () => ({
      basePath: tmpDir,
    }))

    vi.resetModules()
  })

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true })
    }
    vi.restoreAllMocks()
  })

  it('应该导出 cef-screenshot 的 init、screenshot、shutdown 函数', async () => {
    const indexModule = await import('./index')
    expect(indexModule.init).toBeDefined()
    expect(typeof indexModule.init).toBe('function')
    expect(indexModule.screenshot).toBeDefined()
    expect(typeof indexModule.screenshot).toBe('function')
    expect(indexModule.shutdown).toBeDefined()
    expect(typeof indexModule.shutdown).toBe('function')
  })

  it('应该调用 cef-screenshot init 并注册渲染器', async () => {
    const { init } = await import('cef-screenshot')
    const { registerRender } = await import('node-karin')

    await import('./index')

    // 等待 main() 执行完
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(init).toHaveBeenCalled()
    expect(registerRender).toHaveBeenCalled()
    expect(registerRender).toHaveBeenCalledWith('@karinjs/plugin-cef', expect.any(Function))
  })

  it('渲染器回调应该调用 screenshot 并返回 base64', async () => {
    const { screenshot } = await import('cef-screenshot')
    const { registerRender, renderTpl } = await import('node-karin')

    const mockRenderTpl = renderTpl as ReturnType<typeof vi.fn>
    mockRenderTpl.mockReturnValue({
      file: 'https://example.com/page.html',
      encoding: 'base64',
    })

    await import('./index')
    await new Promise((resolve) => setTimeout(resolve, 50))

    // 从 registerRender 调用中获取回调
    const renderCallback = (registerRender as ReturnType<typeof vi.fn>).mock.calls[0][1]
    expect(renderCallback).toBeDefined()

    const result = await renderCallback({ encoding: 'base64' })

    expect(screenshot).toHaveBeenCalled()
    expect(typeof result).toBe('string')
  })

  it('HMR 事件应该触发 shutdown 和 init', async () => {
    const { init, shutdown } = await import('cef-screenshot')
    const { karin } = await import('node-karin')

    await import('./index')
    await new Promise((resolve) => setTimeout(resolve, 50))

    // 获取 karin.on 注册的 HMR 回调
    const mockOn = karin.on as ReturnType<typeof vi.fn>
    const hmrCall = mockOn.mock.calls.find(
      (call: unknown[]) => call[0] === 'karin-plugin-cef-hmr'
    )
    expect(hmrCall).toBeDefined()

    // 触发 HMR
    const hmrCallback = hmrCall![1]
    await hmrCallback()

    // shutdown 应该被调用（init 之后的 HMR 中再次 shutdown）
    expect(shutdown).toHaveBeenCalled()
    // init 应该被调用了至少两次（初始化 + HMR 重启）
    expect((init as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThanOrEqual(2)
  })
})
