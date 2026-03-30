import path from 'node:path'
import { init, screenshot, shutdown } from 'cef-screenshot'
import { logger, registerRender, renderTpl, karin, type Snapka } from 'node-karin'
import { pluginName, pluginVersion, getConfig, HMR_KEY } from './config'
import { formatBytes, getScreenshotByteSize } from './utils'

import type { ScreenshotOptions, SlicedScreenshotOptions } from 'cef-screenshot'

const main = async () => {
  const config = getConfig()
  await init({
    helperDir: config.helperDir,
    browsers: config.browsers,
    tabs: config.tabs,
  })

  karin.on(HMR_KEY, async () => {
    await shutdown()
    const newConfig = getConfig()
    await init({
      helperDir: newConfig.helperDir,
      browsers: newConfig.browsers,
      tabs: newConfig.tabs,
    })
  })

  const name = '@karinjs/plugin-cef'
  registerRender(name, async (options: Snapka) => {
    options.encoding = 'base64'
    const data = renderTpl(options)
    data.encoding = options.encoding

    const time = Date.now()
    const url = typeof data?.file === 'string' ? data.file : ''
    if (!url) {
      throw new Error('渲染模板未提供有效的文件路径')
    }

    const sliceHeight = (() => {
      if (data.multiPage === true) return 1200
      if (typeof data.multiPage === 'number') return data.multiPage
      return 0
    })()

    const cfg: SlicedScreenshotOptions = {
      delay: 300,
      width: config.width,
      height: config.height,
      fullPage: data.fullPage,
      selector: data.selector || 'container',
      sliceHeight
    }

    const bufs = await screenshot(url, cfg) as Buffer | Buffer[]

    const result = Array.isArray(bufs) ? bufs.map(v => v.toString('base64')) : bufs.toString('base64')
    const fileName = typeof data?.file === 'string' ? path.basename(data.file) : 'unknown'

    const sizeBytes = getScreenshotByteSize(result, options.encoding)
    const sizeStr = typeof sizeBytes === 'number' ? `大小: ${logger.green(formatBytes(sizeBytes))} ` : ''

    logger.info(
      `[${name}][${fileName}] 截图完成 ${sizeStr}耗时: ${logger.green(Date.now() - time + '')} ms`
    )

    return result
  })

  logger.info(`${logger.violet(`[插件:${pluginVersion}]`)} ${logger.green(pluginName)} 初始化完成~`)
}

main()

export { init, screenshot, shutdown } from 'cef-screenshot'
export type { InitOptions, ScreenshotOptions, SlicedScreenshotOptions } from 'cef-screenshot'
