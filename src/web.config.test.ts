import fs from 'node:fs'
import path from 'node:path'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('web.config', () => {
  const tmpDir = path.resolve(import.meta.dirname, '../.tmp-test-webconfig')
  let webConfigModule: typeof import('./web.config')

  beforeEach(async () => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true })
    }
    fs.mkdirSync(tmpDir, { recursive: true })

    vi.doMock('node-karin/root', () => ({
      basePath: tmpDir,
    }))

    vi.resetModules()
    webConfigModule = await import('./web.config')
  })

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true })
    }
    vi.restoreAllMocks()
  })

  it('应该导出 info 信息', () => {
    const config = webConfigModule.default
    expect(config.info).toBeDefined()
    expect(config.info.id).toBe('@karinjs/plugin-cef')
    expect(config.info.name).toBe('渲染器插件')
    expect(config.info.version).toBeTruthy()
    expect(config.info.author).toBeDefined()
    expect(config.info.author!.length).toBeGreaterThan(0)
  })

  it('应该返回组件列表', () => {
    const config = webConfigModule.default
    const componentsList = config.components()
    expect(componentsList).toBeInstanceOf(Array)
    expect(componentsList.length).toBeGreaterThan(0)
  })

  it('save 应该返回成功', () => {
    const config = webConfigModule.default
    const result = config.save({
      browsers: 2,
      tabs: 5,
      width: 1280,
      height: 800,
    })
    expect(result.success).toBe(true)
    expect(result.message).toBeTruthy()
  })

  it('save 应该正确持久化配置', async () => {
    const config = webConfigModule.default
    config.save({
      browsers: 3,
      tabs: 8,
      width: 1440,
      height: 900,
    })

    const { getConfig } = await import('./config/index')
    const loaded = getConfig()
    expect(loaded.browsers).toBe(3)
    expect(loaded.tabs).toBe(8)
    expect(loaded.width).toBe(1440)
    expect(loaded.height).toBe(900)
  })

  it('save 应该将字符串数字转换为数字类型', () => {
    const config = webConfigModule.default
    const result = config.save({
      browsers: '2' as unknown as number,
      tabs: '5' as unknown as number,
      width: '1280' as unknown as number,
      height: '800' as unknown as number,
    })
    expect(result.success).toBe(true)
  })
})
