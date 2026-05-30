# FlowStudy 文档模块设计思路、组件选型与 Codex 开发提示词

本文档用于指导 Codex 开发 FlowStudy 前端文档模块第一版。目标是先完成文档模块功能闭环，再进行架构重构和公共能力抽离。

当前阶段不要把文档系统做成复杂 Notion，也不要在开发文档模块时大范围重构博客、OJ 或全局架构。当前目标是：**实现一个可用、可维护、可扩展的 Markdown 文档工作台**。

---

## 1. 当前开发目标

文档模块第一版需要完成以下能力：

```text
文档列表
新建文档
编辑文档
Markdown 实时预览
保存文档
本地草稿保存
分类 / 标签
文档阅读页
发布为博客入口
```

第一版先保证功能可用，后续再逐步增强：

```text
历史版本
全文搜索
拖拽排序
协同编辑
块编辑器
AI 总结
复杂权限
评论系统
```

---

## 2. 设计思想

### 2.1 文档模块不是普通表单页

文档模块不是简单的“标题 + 内容 + 保存按钮”表单，而是一个学习内容创作工作台。它应该支持用户长期写作、整理、沉淀知识，并能把整理好的内容发布为博客。

因此文档模块应该按工作台设计，而不是普通后台 CRUD 页面。

推荐核心布局：

```text
左侧：文档目录 / 分类 / 最近编辑
中间：标题 + Markdown 编辑器 / 预览
右侧：文档属性 / 标签 / 摘要 / 大纲 / 发布入口
```

---

### 2.2 文档和博客属于同一个内容系统

文档和博客不应该完全割裂。它们的区别主要是内容状态和可见范围。

推荐关系：

```text
Document：私有文档、学习笔记、草稿、知识整理
BlogPost：从 Document 发布出去的公开文章
```

推荐内容流转：

```text
新建文档
  ↓
编辑笔记
  ↓
保存草稿
  ↓
整理分类与标签
  ↓
完善摘要和发布信息
  ↓
发布为博客
```

这样用户不需要在“文档系统”和“博客系统”之间复制粘贴内容。

---

### 2.3 编辑能力要可复用

Markdown 编辑器、Markdown 渲染器、标签选择器、图片上传、草稿保存都不应该只服务文档模块。它们未来也会被博客、课程、题解、OJ 题面等模块复用。

因此第一版就应该有基本的封装意识：

```text
MarkdownEditor.vue      文档/博客/课程内容编辑可复用
MarkdownRenderer.vue    文档阅读/博客详情/OJ 题面可复用
TagSelector.vue         文档/博客/题目标签可复用
ImageUpload.vue         文档图片/博客封面可复用
useAutoSave.ts          文档草稿/OJ 代码草稿可复用
```

---

### 2.4 当前先做功能，后续再重构

当前策略：

```text
先完成文档模块功能
  ↓
推送 PR
  ↓
功能稳定后再开 refactor 分支
  ↓
抽离公共编辑器、渲染器、布局和草稿逻辑
```

不要在文档模块开发 PR 中顺手重构博客和 OJ，否则 PR 会变大，Review 困难，出问题后也不容易回滚。

---

## 3. 推荐组件选型

### 3.1 Markdown 编辑器：md-editor-v3

推荐使用：

```bash
pnpm add md-editor-v3
```

用途：

```text
文档编辑
Markdown 实时预览
图片插入
代码块
表格
引用
公式/扩展能力
主题切换
```

建议封装：

```text
src/components/markdown/MarkdownEditor.vue
```

不要在页面中直接大面积使用第三方组件。封装一层后，后续如果换成 Milkdown / Tiptap，只需要改封装组件。

推荐封装接口：

```vue
<MarkdownEditor
  v-model="content"
  :placeholder="'开始写文档...'"
  :disabled="saving"
  @upload-image="handleUploadImage"
/>
```

建议第一版能力：

```text
双向绑定 content
支持 placeholder
支持 disabled/loading
支持图片上传回调
支持主题配置
支持编辑/预览模式
```

---

### 3.2 Markdown 阅读渲染：MarkdownRenderer

第一版可以先使用 `md-editor-v3` 的预览组件能力，但建议封装一个独立阅读组件：

```text
src/components/markdown/MarkdownRenderer.vue
```

用途：

```text
文档阅读页
博客详情页
OJ 题面展示
课程内容展示
```

长期应该支持：

```text
Markdown 渲染
代码高亮
XSS 清理
标题锚点
文章目录
数学公式
图片预览
```

如果后续需要自己控制渲染流程，可以引入：

```bash
pnpm add markdown-it dompurify highlight.js
```

设计原则：

```text
公开展示内容不能直接使用未经处理的 HTML
用户输入内容需要安全过滤
Markdown 样式应统一，不要每个页面写一套
```

---

### 3.3 UI 基础组件：Element Plus

如果项目已经使用 Element Plus，则文档模块优先复用它。

可使用组件：

```text
ElButton
ElInput
ElForm
ElDialog
ElDrawer
ElTree
ElTreeSelect
ElTag
ElSelect
ElUpload
ElDropdown
ElEmpty
ElSkeleton
ElMessage
ElMessageBox
```

建议用途：

```text
ElTree             文档目录树
ElTreeSelect       分类选择
ElTag              标签展示
ElSelect           状态/分类/标签筛选
ElDialog           发布为博客弹窗
ElDrawer           移动端属性面板
ElUpload           图片上传/封面上传
ElEmpty            空文档状态
ElSkeleton         loading 骨架屏
```

---

### 3.4 分栏布局：CSS Grid/Flex，后续可接 splitpanes

第一版可以先用 CSS Grid 或 Flex 实现固定三栏布局，减少依赖和复杂度。

推荐 desktop 布局：

```text
grid-template-columns: 260px minmax(0, 1fr) 300px
```

后续如果需要拖拽调整宽度，再引入：

```bash
pnpm add splitpanes
```

建议后续封装：

```text
src/components/common/SplitWorkspace.vue
```

使用场景：

```text
文档工作台
OJ 刷题页
在线实验页
```

---

### 3.5 图片上传：Element Plus Upload + api/upload.ts

文档中需要支持图片插入。不要让编辑器直接请求上传接口，应该走统一封装。

推荐结构：

```text
MarkdownEditor.vue
  ↓
MarkdownUploadAdapter.ts
  ↓
api/upload.ts
  ↓
后端上传接口
```

推荐文件：

```text
src/api/upload.ts
src/components/common/ImageUpload.vue
src/components/markdown/MarkdownUploadAdapter.ts
```

第一版如果后端上传接口未完成，可以先 mock 返回图片 URL，但要保留接口封装位置。

---

### 3.6 标签选择：DocumentTagSelector / 通用 TagSelector

第一版可以先写在文档模块中：

```text
src/components/document/DocumentTagSelector.vue
```

后续重构为通用组件：

```text
src/components/common/TagSelector.vue
```

功能：

```text
展示已有标签
添加标签
删除标签
从候选标签中选择
限制标签数量
```

---

### 3.7 文章大纲：DocumentOutline

大纲可以从 Markdown 标题中解析：

```text
# 一级标题
## 二级标题
### 三级标题
```

第一版可以用简单正则解析标题：

```text
/^#{1,3}\s+(.+)$/
```

后续可以和 MarkdownRenderer 的标题锚点统一。

组件：

```text
src/components/document/DocumentOutline.vue
```

用途：

```text
文档工作台右侧大纲
文档阅读页右侧目录
博客详情页右侧目录
```

---

### 3.8 草稿保存：useAutoSave + storage.ts

文档模块必须支持草稿保护。

推荐封装：

```text
src/composables/useAutoSave.ts
src/utils/storage.ts
```

草稿 key：

```text
document:draft:{documentId}
```

新建文档还没有 id 时：

```text
document:draft:new
```

保存内容：

```ts
{
  title: string
  content: string
  summary?: string
  categoryId?: number
  tags: string[]
  updatedAt: string
}
```

推荐流程：

```text
用户输入
  ↓
debounce 1000~2000ms
  ↓
保存到本地草稿
  ↓
用户点击保存
  ↓
调用 updateDocument / createDocument
  ↓
保存成功后清理本地草稿
```

不要在组件里直接散落：

```ts
localStorage.setItem(...)
localStorage.getItem(...)
```

统一通过：

```text
utils/storage.ts
```

这样未来适配移动端或 HarmonyOS ArkWeb 时更容易替换实现。

---

## 4. 页面设计

### 4.1 DocumentWorkspaceView：文档工作台

路由建议：

```text
/document/workspace
/document/:id/edit
```

布局：

```text
顶部：返回、新建、搜索、保存状态、发布按钮
左侧：分类树、最近编辑、文档列表
中间：标题输入、MarkdownEditor、保存状态
右侧：文档属性、标签、摘要、大纲、发布为博客
```

推荐组件：

```text
DocumentWorkspaceView.vue
├── DocumentTopbar.vue
├── DocumentSidebar.vue
│   ├── DocumentTree.vue
│   └── RecentDocumentList.vue
├── DocumentEditorPanel.vue
│   ├── DocumentTitleInput.vue
│   └── MarkdownEditor.vue
└── DocumentMetaPanel.vue
    ├── DocumentCategorySelect.vue
    ├── DocumentTagSelector.vue
    ├── DocumentSummaryInput.vue
    ├── DocumentOutline.vue
    └── DocumentPublishDialog.vue
```

交互要求：

```text
点击新建文档：创建空文档或进入本地草稿模式
点击左侧文档：加载文档详情
编辑内容：触发本地自动保存
点击保存：调用 api/document.ts
点击发布为博客：打开 DocumentPublishDialog
离开页面：如果存在未保存内容，应提示用户
```

---

### 4.2 DocumentListView：文档列表页

路由：

```text
/document
```

布局：

```text
顶部：标题 + 新建文档按钮
筛选区：搜索、分类、标签、状态
内容区：文档卡片列表或表格
底部：分页
```

推荐组件：

```text
DocumentListView.vue
├── DocumentFilterBar.vue
├── DocumentCardList.vue
│   └── DocumentCard.vue
└── PaginationBar.vue
```

文档卡片展示：

```text
标题
摘要
状态
分类
标签
更新时间
阅读按钮
编辑按钮
更多操作
```

状态：

```text
draft：草稿
private：私有文档
published：已发布
archived：归档
```

---

### 4.3 DocumentReadView：文档阅读页

路由：

```text
/document/:id
```

布局：

```text
顶部：返回、编辑、发布为博客、更多
主体：标题、分类、标签、更新时间、MarkdownRenderer
右侧：文章目录
```

推荐组件：

```text
DocumentReadView.vue
├── DocumentReadHeader.vue
├── MarkdownRenderer.vue
└── DocumentOutline.vue
```

阅读页不应该包含编辑逻辑，只负责展示和跳转。

---

### 4.4 DocumentPublishDialog：发布为博客弹窗

用途：

```text
从 Document 生成 BlogPost
```

字段：

```text
博客标题
摘要
封面
分类
标签
可见性
是否允许评论
```

推荐组件：

```text
DocumentPublishDialog.vue
```

业务流程：

```text
点击发布为博客
  ↓
打开弹窗
  ↓
自动带入文档标题、摘要、标签
  ↓
用户确认发布设置
  ↓
调用 publishDocument(id, payload)
  ↓
生成 BlogPost
  ↓
更新文档状态为 published
```

第一版如果后端接口未完成，可以先 mock，按钮文案标注“暂未接入后端”。

---

## 5. 移动端与响应式设计

desktop：

```text
三栏布局：左目录 + 中编辑器 + 右属性
```

tablet：

```text
左侧目录可折叠
右侧属性可以 Drawer 展示
中间编辑器优先显示
```

mobile：

```text
顶部操作栏
Tab 切换：目录 / 编辑 / 属性 / 大纲
不要强行显示三栏
```

移动端 Tab：

```text
[目录] [编辑] [属性] [大纲]
```

核心规则：

```text
触摸设备不依赖 hover
按钮大小适合点击
编辑器高度自适应
弹窗在移动端使用全屏 Drawer 或底部弹出
```

---

## 6. 推荐目录结构

第一版可以按下面结构开发：

```text
src/
├── views/
│   └── document/
│       ├── DocumentListView.vue
│       ├── DocumentWorkspaceView.vue
│       ├── DocumentEditView.vue
│       └── DocumentReadView.vue
│
├── components/
│   ├── document/
│   │   ├── DocumentTopbar.vue
│   │   ├── DocumentSidebar.vue
│   │   ├── DocumentTree.vue
│   │   ├── RecentDocumentList.vue
│   │   ├── DocumentEditorPanel.vue
│   │   ├── DocumentMetaPanel.vue
│   │   ├── DocumentOutline.vue
│   │   ├── DocumentFilterBar.vue
│   │   ├── DocumentCard.vue
│   │   ├── DocumentPublishDialog.vue
│   │   └── DocumentTagSelector.vue
│   │
│   └── markdown/
│       ├── MarkdownEditor.vue
│       └── MarkdownRenderer.vue
│
├── api/
│   ├── document.ts
│   └── upload.ts
│
├── types/
│   └── document.ts
│
├── composables/
│   ├── useDocumentList.ts
│   ├── useDocumentEditor.ts
│   └── useAutoSave.ts
│
└── utils/
    ├── storage.ts
    └── markdown.ts
```

---

## 7. 类型设计

推荐文件：

```text
src/types/document.ts
```

推荐类型：

```ts
export type DocumentStatus = 'draft' | 'private' | 'published' | 'archived'

export interface DocumentItem {
  id: number
  title: string
  summary?: string
  categoryId?: number
  categoryName?: string
  tags: string[]
  status: DocumentStatus
  updatedAt: string
  createdAt: string
  publishedAt?: string
}

export interface DocumentDetail extends DocumentItem {
  content: string
}

export interface DocumentCategory {
  id: number
  name: string
  parentId?: number
  children?: DocumentCategory[]
}

export interface DocumentQuery {
  keyword?: string
  categoryId?: number
  tag?: string
  status?: DocumentStatus
  page?: number
  pageSize?: number
}

export interface CreateDocumentPayload {
  title: string
  content?: string
  categoryId?: number
  tags?: string[]
}

export interface UpdateDocumentPayload {
  title?: string
  content?: string
  summary?: string
  categoryId?: number
  tags?: string[]
  status?: DocumentStatus
}

export interface PublishDocumentPayload {
  title: string
  summary: string
  coverUrl?: string
  tags: string[]
  visible: boolean
  allowComment: boolean
}
```

---

## 8. API 封装设计

推荐文件：

```text
src/api/document.ts
```

推荐函数：

```ts
export function getDocumentList(params: DocumentQuery) {}

export function getDocumentDetail(id: number) {}

export function createDocument(data: CreateDocumentPayload) {}

export function updateDocument(id: number, data: UpdateDocumentPayload) {}

export function deleteDocument(id: number) {}

export function getDocumentCategories() {}

export function createDocumentCategory(data: CreateCategoryPayload) {}

export function updateDocumentCategory(id: number, data: UpdateCategoryPayload) {}

export function deleteDocumentCategory(id: number) {}

export function publishDocument(id: number, data: PublishDocumentPayload) {}
```

页面中禁止直接写：

```ts
axios.get(...)
fetch(...)
```

推荐调用链：

```text
View
  ↓
composable
  ↓
api/document.ts
  ↓
api/request.ts
```

---

## 9. Composable 设计

### 9.1 useDocumentList

职责：

```text
文档列表查询
搜索
筛选
分页
loading
empty
error
```

返回：

```ts
{
  list,
  query,
  loading,
  error,
  pagination,
  fetchList,
  resetQuery,
  changePage
}
```

---

### 9.2 useDocumentEditor

职责：

```text
加载文档详情
编辑标题
编辑内容
更新属性
保存文档
发布文档
保存状态
未保存变更判断
```

返回：

```ts
{
  document,
  form,
  loading,
  saving,
  dirty,
  loadDocument,
  saveDocument,
  publishDocument,
  resetForm
}
```

---

### 9.3 useAutoSave

职责：

```text
监听编辑内容
debounce 保存草稿
恢复草稿
清理草稿
```

返回：

```ts
{
  lastSavedAt,
  hasDraft,
  restoreDraft,
  clearDraft
}
```

---

## 10. 样式与交互规范

### 10.1 状态必须完整

页面需要处理：

```text
loading
empty
error
success
saving
saved
unsaved
```

不要只做正常数据状态。

---

### 10.2 空状态

文档列表为空时展示：

```text
你还没有创建文档
[新建第一篇文档]
```

分类为空时展示：

```text
暂无分类
[新建分类]
```

---

### 10.3 错误状态

接口失败时展示：

```text
文档加载失败
[重试]
```

保存失败时：

```text
保存失败，已保留本地草稿
```

---

### 10.4 离开页面提醒

如果存在未保存变更，离开编辑页前应提示：

```text
当前文档还有未保存内容，确定离开吗？
```

第一版可以先实现基础提示，后续再优化。

---

## 11. 第一版开发顺序

推荐 Codex 按这个顺序开发：

```text
1. 阅读项目已有路由、组件、api、types、styles。
2. 新增 document 路由。
3. 新增 types/document.ts。
4. 新增 api/document.ts，先提供 mock 或预留接口函数。
5. 新增 MarkdownEditor.vue。
6. 新增 MarkdownRenderer.vue。
7. 新增 DocumentListView.vue。
8. 新增 DocumentWorkspaceView.vue。
9. 新增 DocumentSidebar、DocumentTree、DocumentEditorPanel、DocumentMetaPanel。
10. 新增 useDocumentList。
11. 新增 useDocumentEditor。
12. 新增 useAutoSave 和 utils/storage.ts。
13. 新增 DocumentReadView。
14. 新增 DocumentPublishDialog。
15. 补充 loading、empty、error 状态。
16. 做基础响应式适配。
17. 运行 pnpm lint 和 pnpm build。
```

---

## 12. 不应该做的事

当前文档模块开发阶段，不要做这些：

```text
不要大范围重构博客模块
不要大范围重构 OJ 模块
不要把所有状态塞进 Pinia
不要在 Vue 页面里直接写 axios
不要在组件中到处写 localStorage
不要一次性引入 Tiptap / Milkdown / 大量编辑器依赖
不要做复杂协同编辑
不要修改后端接口路径
不要改变已有博客和 OJ 路由
不要提交 node_modules、dist、.env、.vite
```

---

## 13. AGENTS.md 建议追加内容

可以把以下内容加入项目的 `AGENTS.md`：

```md
## Document Module Development

When developing the frontend document module:

- Read `docs/frontend/Document_Module_Design_Guide.md` and `docs/frontend/Document_Module_Prototype.md` first.
- The first version should focus on a usable Markdown document workspace, not a Notion-like block editor.
- Document and blog belong to the same content system. Document is private writing; BlogPost is public content published from a Document.
- Use `md-editor-v3` through a wrapper component `components/markdown/MarkdownEditor.vue`.
- Use a separate `components/markdown/MarkdownRenderer.vue` for reading pages and future blog/OJ reuse.
- Do not call axios/fetch directly in Vue pages. Use `src/api/document.ts`.
- Do not scatter localStorage in components. Use `utils/storage.ts` and `useAutoSave.ts`.
- Keep document module feature development separate from later architecture refactoring.
- Do not refactor blog or OJ modules unless explicitly requested.
```

---

## 14. 最终给 Codex 的开发提示词

下面这段可以直接复制给 Codex 使用。

```text
请开发 FlowStudy 前端文档模块第一版。

在修改代码前，请先阅读：
1. AGENTS.md
2. docs/frontend/FlowStudy_Frontend_Architecture_Refactor_Guide.md
3. docs/frontend/Document_Module_Prototype.md
4. docs/frontend/Document_Module_Design_Guide.md
5. package.json
6. src/router
7. src/views/blog
8. src/views/oj
9. src/components
10. src/api
11. src/types

目标：
实现一个可用的 Markdown 文档工作台，而不是复杂 Notion 块编辑器。

本次范围：
1. 新增文档列表页 `/document`
2. 新增文档工作台 `/document/workspace`
3. 新增文档阅读页 `/document/:id`
4. 新增文档编辑页 `/document/:id/edit`，可以复用工作台
5. 新增发布为博客弹窗入口，但如果后端接口未完成，可以先 mock 或 disabled
6. 先使用 mock 数据实现功能闭环，不要依赖后端接口必须可用

技术要求：
1. 使用 Vue3 + Vite + TypeScript + `<script setup lang="ts">`
2. Markdown 编辑器使用 `md-editor-v3`，但必须封装为 `src/components/markdown/MarkdownEditor.vue`
3. Markdown 阅读渲染封装为 `src/components/markdown/MarkdownRenderer.vue`
4. 文档相关组件放在 `src/components/document`
5. 文档页面放在 `src/views/document`
6. 文档类型定义放在 `src/types/document.ts`
7. 文档接口预留在 `src/api/document.ts`
8. 自动保存逻辑封装为 `src/composables/useAutoSave.ts`
9. 本地存储统一通过 `src/utils/storage.ts`
10. 不要在页面组件里直接写 axios/fetch
11. 不要在页面组件里直接散落 localStorage
12. 不要重构博客模块和 OJ 模块
13. 不要改变已有路由和已有页面行为

页面要求：
1. DocumentListView 包含搜索、分类筛选、标签筛选、状态筛选、文档卡片列表、空状态
2. DocumentWorkspaceView 使用三栏布局：左侧目录/最近编辑，中间标题+Markdown 编辑器，右侧属性/标签/摘要/大纲/发布入口
3. DocumentReadView 展示标题、分类、标签、更新时间、Markdown 渲染内容和文章目录
4. DocumentPublishDialog 包含博客标题、摘要、封面、标签、可见性、是否允许评论
5. 页面必须处理 loading、empty、error、saving、saved 状态
6. 编辑内容需要本地草稿自动保存
7. 移动端不要强行三栏，使用折叠或 Tab 思路做基础适配

开发流程：
1. 先总结当前项目结构和将要新增/修改的文件，不要立即改代码
2. 等确认后再实现
3. 小步修改，不要一次性重构整个项目
4. 实现后运行 pnpm lint 和 pnpm build
5. 最后输出修改文件列表、测试结果、剩余风险和后续重构建议
```

---

## 15. 本文档参考的组件能力

- `md-editor-v3`：Vue3 Markdown 编辑器，适合第一版文档编辑器封装。
- `Element Plus`：Vue3 UI 组件库，可用于 Tree、Form、Dialog、Upload、Tag、Empty 等基础组件。
- `splitpanes`：Vue 分栏拖拽组件，后续可用于工作台布局增强。
- `markdown-it` / `DOMPurify` / `highlight.js`：后续可用于更可控的 Markdown 渲染、安全清理和代码高亮。

当前第一版建议尽量少引入依赖：

```bash
pnpm add md-editor-v3
```

如果需要拖拽分栏，再引入：

```bash
pnpm add splitpanes
```

如果需要独立 Markdown 安全渲染，再引入：

```bash
pnpm add markdown-it dompurify highlight.js
```
