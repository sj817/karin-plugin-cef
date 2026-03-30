import fs from 'node:fs'
import path from 'node:path'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// node-karin 和 node-karin/root 已经在 vitest.config.ts 中通过 alias 被 mock

describe('config', () => {
  const tmpDir = path.resolve(import.meta.dirname, '../../.tmp-test-config')
  let configModule: typeof import('./index')

  beforeEach(async () => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true })
    }
    fs.mkdirSync(tmpDir, { recursive: true })

    // 重新 mock basePath 指向临时目录
    vi.doMock('node-karin/root', () => ({
      basePath: tmpDir,
    }))

    vi.resetModules()
    configModule = await import('./index')
  })

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true })
    }
    vi.restoreAllMocks()
  })

  it('应该导出插件名称和版本', () => {
    expect(configModule.pluginName).toBeTruthy()
    expect(configModule.pluginVersion).toBeTruthy()
    expect(configModule.pluginName).toContain('karinjs')
  })

  it('应该导出 HMR_KEY', () => {
    expect(configModule.HMR_KEY).toBe('karin-plugin-cef-hmr')
  })

  it('应该导出 CefConfig 类型并在默认配置中使用', () => {
    const config = configModule.getConfig()
    expect(config).toBeDefined()
    expect(typeof config).toBe('object')
  })

  it('getConfig 应该返回包含默认值的配置', () => {
    const config = configModule.getConfig()
    expect(config.browsers).toBe(1)
    expect(config.tabs).toBe(3)
    expect(config.width).toBe(1920)
    expect(config.height).toBe(1080)
  })

  it('saveConfig 应该保存并可重新读取配置', async () => {
    const { karin } = await import('node-karin')

    const newConfig = {
      ...configModule.getConfig(),
      browsers: 2,
      tabs: 5,
    }

    configModule.saveConfig(newConfig)

    const loaded = configModule.getConfig()
    expect(loaded.browsers).toBe(2)
    expect(loaded.tabs).toBe(5)
    expect(karin.emit).toHaveBeenCalledWith(configModule.HMR_KEY, newConfig)
  })

  it('saveConfig 应该在配置 JSON 中正确持久化', () => {
    configModule.saveConfig({
      ...configModule.getConfig(),
      browsers: 4,
    })

    const raw = fs.readFileSync(configModule.configPath, 'utf-8')
    const parsed = JSON.parse(raw)
    expect(parsed.browsers).toBe(4)
  })

  it('saveConfig 应该可以保存 helperDir', () => {
    configModule.saveConfig({
      ...configModule.getConfig(),
      helperDir: '/custom/path',
    })

    const loaded = configModule.getConfig()
    expect(loaded.helperDir).toBe('/custom/path')
  })

  it('saveConfig 应该可以保存 width 和 height', () => {
    configModule.saveConfig({
      ...configModule.getConfig(),
      width: 1280,
      height: 720,
    })

    const loaded = configModule.getConfig()
    expect(loaded.width).toBe(1280)
    expect(loaded.height).toBe(720)
  })
})
