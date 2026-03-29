import fs from 'node:fs'
import path from 'node:path'
import { karin } from 'node-karin'
import pkg from '../../package.json'
import { basePath } from 'node-karin/root'

/**
 * 插件配置类型，包含 cef-screenshot 初始化选项和默认截图参数
 */
export interface CefConfig {
  /** 包含 cef_screenshot_helper 和 CEF 运行时文件的目录 */
  helperDir?: string
  /** 浏览器进程数量（默认 1，最大 5） */
  browsers?: number
  /** 每个浏览器进程的标签页数量（默认 3，最大 10） */
  tabs?: number
  /** 默认视窗宽度（像素），默认 1920 */
  width?: number
  /** 默认视窗高度（像素），默认 1080 */
  height?: number
  /** 页面加载完成后的额外等待时间（毫秒），默认 500 */
  delay?: number
  /** 是否截取完整页面（包括滚动区域），默认 true */
  fullPage?: boolean
}

/**
 * 热更新key
 */
export const HMR_KEY = 'karin-plugin-cef-hmr'

/**
 * 默认配置
 */
const defaultConfig: CefConfig = {
  browsers: 1,
  tabs: 3,
  width: 1920,
  height: 1080,
  delay: 500,
  fullPage: true,
}

/** 插件名称 */
export const pluginName = pkg.name.replace(/\//g, '-')
/** 插件版本 */
export const pluginVersion = pkg.version
/** 配置文件路径 */
export const configPath = path.resolve(basePath, pluginName, 'config', 'config.json')

/**
 * 初始化配置
 */
const init = () => {
  /** 判断文件是否存在 不存在则创建 */
  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(path.dirname(configPath), { recursive: true })
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))
  }
}

/**
 * 获取配置
 */
export const getConfig = (): CefConfig => {
  const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  return { ...defaultConfig, ...data }
}

/**
 * 保存配置
 * @param config 配置
 */
export const saveConfig = (config: CefConfig) => {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  karin.emit(HMR_KEY, config)
}

export { pkg }

init()
