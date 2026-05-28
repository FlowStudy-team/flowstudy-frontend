# AGENTS.md

## 项目技术栈

本项目使用 Vue3 + Vite + TypeScript。
组件使用 `<script setup lang="ts">`。
状态管理使用 Pinia。
接口请求统一放在 `src/api`。
页面放在 `src/views`。
通用组件放在 `src/components`。
组合式逻辑放在 `src/composables`。

## 代码规范

- 不要随意新增依赖。
- 不要直接在页面中写死接口地址。
- 不要在组件中直接写复杂业务逻辑，复杂逻辑应抽到 composable 或 store。
- 所有 props、emits、接口返回值都要写 TypeScript 类型。
- 页面需要处理 loading、empty、error 三种状态。
- 修改后运行：
  - npm run type-check
  - npm run lint
  - npm run build

## UI 规范

- 页面布局优先复用已有 Layout、Card、Table、Form 组件。
- 表格页面需要支持分页、搜索、刷新。
- 表单页面需要有校验规则。
- 删除、提交等危险操作必须有二次确认。
- 
## 跨端与鸿蒙兼容约束

本项目当前以前端 Web 为主，但后续可能适配 HarmonyOS 应用。因此前端开发时需要遵守以下约束：

- 后端接口应保持平台无关，前端通过统一的 `src/api` 请求封装访问后端，不允许在页面组件中直接写 `fetch` 或 `axios` 请求。
- 登录认证优先使用 `Authorization: Bearer Token` 这类移动端友好的方式，避免强依赖浏览器 Cookie。
- 浏览器环境能力必须封装，不要在业务组件中直接大量使用 `window`、`document`、`localStorage`、`sessionStorage`、`location.href`。
- 本地存储统一通过 `src/utils/storage.ts` 或同类工具封装。
- 页面跳转统一通过 Vue Router 或项目封装的导航工具处理，避免散落的浏览器跳转逻辑。
- 文件上传、下载、预览、外链打开等能力应单独封装，方便未来在 HarmonyOS ArkWeb 或 ArkTS 原生端替换实现。
- 页面布局应尽量支持响应式设计，避免只适配 PC 宽屏后台。
- 表格页面在移动端应考虑卡片化、折叠字段或横向滚动方案。
- 交互设计不要依赖 hover 才能使用，按钮、表单、弹窗应适合触摸设备。
- 复杂业务逻辑应放在 `composables`、`stores`、`api`、`utils` 中，不要和 `.vue` 页面 UI 强耦合。
- 避免在核心业务页面中直接强依赖 Web-only 库；如必须使用，应通过组件或工具层隔离。