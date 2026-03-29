# @karinjs/plugin-cef

[node-karin](https://github.com/KarinJS/Karin) 的 CEF 截图/渲染插件，基于 [cef-screenshot](https://github.com/sj817/cef-screenshot) 封装。

## 功能

- 基于 CEF 离屏渲染的超低内存网页截图
- 多浏览器进程 + 多标签页并发截图
- 全页截图、元素选择器截图
- 提供 Web 管理面板（通过 node-karin Web UI 配置）
- 配置热更新

## 安装

作为 [node-karin](https://github.com/KarinJS/Karin) 插件安装：

```bash
pnpm add @karinjs/plugin-cef -w
```

## 配置

插件首次运行时会自动生成默认配置文件，位于 `<karin数据目录>/@karinjs-plugin-cef/config/config.json`。

也可以通过 node-karin 的 Web 管理面板修改配置。

### 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `helperDir` | `string` | - | CEF helper 和运行时文件目录，为空则自动检测 |
| `browsers` | `number` | `1` | 浏览器进程数量（最大 5），每个进程是独立的 CEF 实例 |
| `tabs` | `number` | `3` | 每个浏览器进程的标签页数量（最大 10），总并发数 = browsers × tabs |
| `width` | `number` | `1920` | 默认视窗宽度（像素） |
| `height` | `number` | `1080` | 默认视窗高度（像素） |
| `delay` | `number` | `500` | 页面加载完成后的额外等待时间（毫秒） |
| `fullPage` | `boolean` | `true` | 是否截取完整页面（包括滚动区域） |

### 资源配置建议

- **低配置机器**：`browsers: 1, tabs: 3-5`（节省内存）
- **高配置机器**：`browsers: 2-5, tabs: 3-10`（最大化吞吐量）
- 总并发数 = `browsers × tabs`（最大 50）

## 开发

### 环境要求

- Node.js >= 22.6.0
- pnpm

### 目录结构

```
├── src/
│   ├── index.ts          # 插件入口，注册渲染器
│   ├── app.ts            # 开发模式入口
│   ├── web.config.ts     # Web 管理面板配置
│   ├── utils.ts          # 工具函数
│   ├── config/
│   │   └── index.ts      # 配置管理
│   └── __mocks__/        # 测试 mock
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── eslint.config.mjs
└── package.json
```

### 常用命令

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 运行测试
pnpm test

# 监听模式测试
pnpm test:watch

# 测试覆盖率
pnpm test:coverage

# Lint
pnpm lint

# 发布
pnpm pub
```

### 构建产物

构建输出到 `dist/` 目录，包含：

- `dist/index.js` - 插件入口
- `dist/web.config.js` - Web 管理面板配置
- `dist/*.d.ts` - 类型声明

## 协议

[MIT](LICENSE)
