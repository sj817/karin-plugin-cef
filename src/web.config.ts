import { components } from 'node-karin'
import { getConfig, pkg, saveConfig } from './config/index'
import type { CefConfig } from './config/index'
import type { ComponentConfig, GetConfigResponse } from 'node-karin'

const webConfig: {
  info: GetConfigResponse['info'],
  components: () => ComponentConfig[],
  save: (config: CefConfig) => {
    success: boolean,
    message: string
  }
} = {
  info: {
    id: pkg.name,
    name: '渲染器插件',
    version: pkg.version,
    description: pkg.description,
    author: [
      {
        name: 'sj817',
        home: 'https://sj817.com',
        avatar: 'https://github.com/sj817.png',
      }
    ],
    icon: {
      name: 'search',
      size: 24,
      color: '#0078d4',
    }
  },
  /** 动态渲染的组件 */
  components: () => {
    const config = getConfig()
    return [
      components.input.string('helperDir', {
        label: 'CEF Helper 目录',
        description: '包含 cef_screenshot_helper 和 CEF 运行时文件的目录，为空则自动检测',
        defaultValue: config.helperDir || '',
        isRequired: false,
        className: 'inline-block p-2',
      }),
      components.divider.create('divider0'),
      components.input.number('browsers', {
        label: '浏览器进程数',
        description: '浏览器进程数量，每个进程是独立的 CEF 实例（默认 1，最大 5）',
        defaultValue: (config.browsers || 1) + '',
        className: 'inline-block p-2',
        rules: [
          {
            min: 1,
            max: 5,
            error: '浏览器进程数必须在1-5之间'
          }
        ]
      }),
      components.input.number('tabs', {
        label: '每进程标签页数',
        description: '每个浏览器进程的标签页数量（默认 3，最大 10），总并发数 = 浏览器进程数 × 标签页数',
        defaultValue: (config.tabs || 3) + '',
        className: 'inline-block p-2',
        rules: [
          {
            min: 1,
            max: 10,
            error: '标签页数必须在1-10之间'
          }
        ]
      }),
      components.divider.create('divider1'),
      components.input.number('width', {
        label: '默认视窗宽度',
        description: '默认视窗宽度（像素），默认 1920',
        defaultValue: (config.width || 1920) + '',
        className: 'inline-block p-2',
        rules: [
          {
            min: 1,
            max: 10000,
            error: '视窗宽度必须在1-10000之间'
          }
        ]
      }),
      components.input.number('height', {
        label: '默认视窗高度',
        description: '默认视窗高度（像素），默认 1080',
        defaultValue: (config.height || 1080) + '',
        className: 'inline-block p-2',
        rules: [
          {
            min: 1,
            max: 10000,
            error: '视窗高度必须在1-10000之间'
          }
        ]
      }),
      components.divider.create('divider2'),
      components.input.number('delay', {
        label: '页面加载等待',
        description: '页面加载完成后的额外等待时间（毫秒），默认 500',
        defaultValue: (config.delay || 500) + '',
        className: 'inline-block p-2',
        rules: [
          {
            min: 0,
            max: 30000,
            error: '等待时间必须在0-30000之间'
          }
        ]
      }),
      components.switch.create('fullPage', {
        label: '全页截图',
        description: '是否截取完整页面（包括滚动区域），关闭则仅截取视窗可见区域',
        defaultSelected: config.fullPage !== false,
        color: 'success',
      }),
    ]
  },

  /** 前端点击保存之后调用的方法 */
  save: (config: CefConfig) => {
    const browsers = Number(config.browsers) || 1
    const tabs = Number(config.tabs) || 3
    const width = Number(config.width) || 1920
    const height = Number(config.height) || 1080
    const delay = Number(config.delay) || 500

    config = {
      ...config,
      browsers: Math.max(1, Math.min(5, browsers)),
      tabs: Math.max(1, Math.min(10, tabs)),
      width: Math.max(1, Math.min(10000, width)),
      height: Math.max(1, Math.min(10000, height)),
      delay: Math.max(0, Math.min(30000, delay)),
    }

    saveConfig(config)
    return {
      success: true,
      message: '好了哦 φ(>ω<*)'
    }
  }
}
export default webConfig
