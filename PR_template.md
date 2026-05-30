# Pull Request

## Description

本次 PR 完成 **文档模块 UI 第一版**，包含文档列表、文档编辑工作台、文档阅读页与发布弹窗，并与现有站点导航/AI 侧栏风格对齐。

核心目标：
- 提供可用的 Markdown 文档工作流（创建、编辑、保存、阅读、发布）
- 保持与现有 `articals` / OJ 页面一致的交互体验
- 控制改动范围，不重构既有 OJ 与文章业务逻辑

## Motivation

- 补齐 FlowStudy 文档能力，形成“学习记录 -> 结构化沉淀 -> 阅读分享”的闭环。
- 降低后续接入真实后端 API 的成本（类型、API、composable 已预置）。
- 统一 UI 架构与组件复用模式，避免页面级散乱实现。

## Related Issue

N/A

## Scope

- [x] `frontend`：文档模块页面、组件、样式、路由
- [ ] `core`
- [ ] `judge`
- [ ] `ai`
- [x] `docs`（PR 文档与模块说明补充）
- [ ] `infra`
- [ ] 数据库表结构变更
- [ ] 消息队列契约变更
- [ ] 后端 RESTful API 变更

## Changes

### Frontend

- 新增文档路由：
  - `/document`（文档列表）
  - `/document/workspace`（新建文档工作台）
  - `/document/:id`（文档阅读页）
  - `/document/:id/edit`（文档编辑页）

- 新增文档页面：
  - `src/views/document/DocumentListView.vue`
  - `src/views/document/DocumentWorkspaceView.vue`
  - `src/views/document/DocumentReadView.vue`

- 新增/完善文档组件：
  - `src/components/document/DocumentFilterBar.vue`
  - `src/components/document/DocumentCard.vue`
  - `src/components/document/DocumentSidebar.vue`
  - `src/components/document/DocumentMetaPanel.vue`
  - `src/components/document/DocumentOutline.vue`
  - `src/components/document/DocumentPublishDialog.vue`

- 新增 markdown 组件封装：
  - `src/components/markdown/MarkdownEditor.vue`
  - `src/components/markdown/MarkdownRenderer.vue`

- 新增数据层与逻辑层：
  - `src/types/document.ts`
  - `src/api/document.ts`（mock 文档数据）
  - `src/composables/useDocumentList.ts`
  - `src/composables/useDocumentEditor.ts`
  - `src/composables/useAutoSave.ts`
  - `src/utils/storage.ts`

- 编辑页交互增强：
  - 三栏布局（目录 / 编辑 / 属性）可拖拽调宽
  - 自动保存草稿（localStorage 封装）
  - 未保存离开提示

- 阅读页交互增强：
  - 复用 `articals` 阅读框架样式（顶栏 + 三栏 + AI 侧栏）
  - 左侧目录改为 markdown 标题目录
  - 增加目录锚点跳转（点击目录平滑滚动到正文标题）

- 样式调整：
  - `src/style.css` 增加文档模块样式段
  - 文档编辑页与阅读页背景/分栏风格向现有页面对齐

### Dependency

- `flowstudy-web/package.json`
  - 新增：`md-editor-v3`
  - 注意：请使用 npm 可安装的实际版本（建议 `latest` 或锁定现网可用版本）

## Test Plan

- [x] 手动验证主要功能流
- [ ] 单元测试（本次未新增）
- [ ] 接口联调（当前为 mock）
- [ ] E2E 自动化（本次未新增）

建议本地验证命令：

```bash
cd flowstudy-web
npm install
npm run type-check
npm run lint
npm run build
npm run dev
```

手动验收要点：
1. 进入 `/document` 可搜索/筛选并跳转文档。
2. 进入 `/document/workspace` 可编辑并自动保存草稿。
3. 编辑页三栏宽度可拖拽调整，布局稳定无重叠。
4. 进入 `/document/:id` 后，左侧目录点击可锚点跳转到正文标题。
5. 点击头像菜单“笔记本”可跳转到 `/document`。

## Screenshots / Logs

建议附图：
1. 文档列表页截图（筛选栏 + 卡片列表）
2. 文档编辑页截图（三栏拖拽前后）
3. 文档阅读页截图（左目录锚点跳转 + AI 侧栏）

## Risks

- [x] 全局样式变更风险（`src/style.css` 增量较大）
- [x] 第三方编辑器样式/高度兼容性风险（`md-editor-v3`）
- [ ] 后端接口兼容性风险（当前 mock）
- [ ] 数据迁移风险

风险说明：
- 文档模块样式与阅读/OJ布局共享部分全局样式，需回归关键页面（首页、文章页、OJ页、文档页）在主流分辨率下的展示。

## Rollback Plan

- [x] 直接 `git revert` 本次 PR
- [ ] 数据库回滚（无）
- [ ] 配置回滚（无）

说明：
- 本次改动不涉及数据库和后端契约，回滚仅需代码层面回滚。

## Checklist

- [x] 已自检改动文件
- [x] 无临时调试代码
- [x] Commit Message 遵循规范（Conventional Commits）
- [x] 无敏感信息提交
- [x] 已说明风险与回滚方案

## Additional Notes

- 建议合并前由 Reviewer 重点回归：
  - 文档编辑页高度铺满表现
  - 三栏拖拽边界条件
  - 阅读页目录锚点跳转与 AI 侧栏共存场景
