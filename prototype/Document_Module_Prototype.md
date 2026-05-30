# FlowStudy 文档模块原型图与开发说明

本文档用于指导 Codex 开发 FlowStudy 前端文档模块。当前目标不是一次性做复杂 Notion，而是先完成一个可用的 Markdown 文档工作台：支持文档列表、分类整理、Markdown 编辑、属性设置、阅读预览、草稿保存，以及后续发布为博客。

---

## 1. 页面总览

文档模块建议先实现 4 个核心页面：

```text
/document
/document/workspace
/document/:id
/document/:id/edit
```

对应页面职责如下：

| 路由 | 页面 | 主要用途 |
|---|---|---|
| `/document` | DocumentListView | 文档列表、搜索、分类筛选、标签筛选 |
| `/document/workspace` | DocumentWorkspaceView | 文档工作台，左侧目录，中间编辑器，右侧属性和大纲 |
| `/document/:id` | DocumentReadView | 文档阅读页 |
| `/document/:id/edit` | DocumentEditView | 独立编辑页，适合从阅读页进入编辑 |

第一版开发优先级：

```text
1. DocumentWorkspaceView
2. DocumentListView
3. DocumentReadView
4. DocumentPublishDialog
```

---

## 2. 原型一：文档工作台 Desktop

```text
┌────────────────────────────────────────────────────────────────────────────────────┐
│ FlowStudy 文档工作台                                                               │
│ [返回] [新建文档] [搜索文档...]                         保存状态：已保存  [发布] [更多] │
├───────────────────┬──────────────────────────────────────┬─────────────────────────┤
│ 左侧：文档导航      │ 中间：Markdown 编辑区                  │ 右侧：属性 / 大纲          │
│                   │                                      │                         │
│ 我的文档            │ 标题输入：算法动态规划笔记              │ 文档属性                  │
│ ├─ 算法笔记          │ ┌──────────────────────────────────┐ │ 状态：私有文档             │
│ │  ├─ 动态规划       │ │ Markdown Editor                  │ │ 分类：算法笔记 / 动态规划   │
│ │  ├─ 图论           │ │                                  │ │ 标签：DP、算法、刷题       │
│ ├─ Java             │ │ ## 背包问题                       │ │ 摘要：用于记录 DP 学习...  │
│ ├─ 前端             │ │                                  │ │                         │
│ └─ FlowStudy        │ │ 这里是文档正文...                 │ │ 操作                    │
│                   │ │                                  │ │ [保存] [预览] [发布为博客] │
│ 最近编辑            │ └──────────────────────────────────┘ │                         │
│ - 背包问题           │                                      │ 文章大纲                  │
│ - Vue3 组件设计      │ 底部状态：字数 1260 / 自动保存 12:30    │ 1. 背包问题                │
│ - OJ 编辑器设计      │                                      │   1.1 01 背包             │
│                   │                                      │   1.2 完全背包             │
└───────────────────┴──────────────────────────────────────┴─────────────────────────┘
```

### 组件拆分

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
    ├── DocumentStatusBadge.vue
    ├── DocumentCategorySelect.vue
    ├── DocumentTagSelector.vue
    ├── DocumentSummaryInput.vue
    └── DocumentOutline.vue
```

### Codex 开发注意

```text
- 页面先用 mock 数据跑通。
- MarkdownEditor 先封装 md-editor-v3。
- 不要直接在页面里写 axios。
- 保存、发布、分类等操作通过 api/document.ts 封装。
- 本地草稿保存通过 useAutoSave + storage.ts，不要在组件中散落 localStorage。
```

---

## 3. 原型二：文档列表页

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ 文档中心                                                        [新建文档]    │
├──────────────────────────────────────────────────────────────────────────────┤
│ [搜索文档标题 / 内容]  分类：[全部 v]  标签：[全部 v]  状态：[全部 v] [重置]  │
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐ │
│ │ 背包问题学习笔记       │ │ Vue3 组件设计         │ │ OJ 编辑器设计         │ │
│ │ 私有文档 · 算法笔记     │ │ 已发布 · 前端          │ │ 草稿 · FlowStudy      │ │
│ │ 标签：DP / 算法        │ │ 标签：Vue3 / 架构      │ │ 标签：Monaco / OJ     │ │
│ │ 更新：2026-05-29      │ │ 更新：2026-05-28      │ │ 更新：2026-05-27      │ │
│ │ [阅读] [编辑] [更多]   │ │ [阅读] [编辑] [更多]   │ │ [继续编辑] [更多]      │ │
│ └──────────────────────┘ └──────────────────────┘ └──────────────────────┘ │
│                                                                              │
│ 分页：< 1 2 3 ... >                                                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 组件拆分

```text
DocumentListView.vue
├── DocumentFilterBar.vue
├── DocumentCardList.vue
│   └── DocumentCard.vue
└── PaginationBar.vue
```

### 交互

```text
- 点击“新建文档”创建空文档并进入 /document/workspace 或 /document/:id/edit。
- 点击“阅读”进入 /document/:id。
- 点击“编辑”进入 /document/:id/edit。
- 状态支持 draft/private/published/archived。
```

---

## 4. 原型三：文档阅读页

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ [返回文档中心]                                      [编辑] [发布为博客] [更多] │
├──────────────────────────────────────────────────────────────────────────────┤
│ 标题：背包问题学习笔记                                                        │
│ 分类：算法笔记 / 动态规划   标签：DP、算法、刷题   更新：2026-05-29           │
├──────────────────────────────────────────────────────────┬───────────────────┤
│ Markdown 渲染内容                                         │ 文章目录           │
│                                                          │ 1. 背包问题         │
│ # 背包问题                                               │ 2. 01 背包          │
│                                                          │ 3. 完全背包         │
│ 这里展示阅读态内容，支持代码高亮、表格、引用、公式。          │ 4. 多重背包         │
│                                                          │                   │
│ ```java                                                  │                   │
│ public class Solution { ... }                            │                   │
│ ```                                                      │                   │
└──────────────────────────────────────────────────────────┴───────────────────┘
```

### 组件拆分

```text
DocumentReadView.vue
├── DocumentReadHeader.vue
├── MarkdownRenderer.vue
└── DocumentOutline.vue
```

---

## 5. 原型四：发布为博客弹窗

```text
┌──────────────────────────────────────────────┐
│ 发布为博客                                    │
├──────────────────────────────────────────────┤
│ 博客标题： [背包问题学习笔记              ]   │
│ 摘要：     [用于记录动态规划背包问题...]      │
│ 封面：     [上传封面]                         │
│ 分类：     [算法学习 v]                       │
│ 标签：     [DP] [算法] [刷题] [+ 添加]        │
│ 可见性：   (●) 公开   ( ) 仅自己可见          │
│ 评论：     [x] 允许评论                       │
├──────────────────────────────────────────────┤
│                         [取消] [确认发布]     │
└──────────────────────────────────────────────┘
```

### 组件拆分

```text
DocumentPublishDialog.vue
├── BlogTitleInput
├── BlogSummaryInput
├── CoverUpload
├── TagSelector
└── VisibilityRadio
```

### 业务关系

```text
Document
  ↓ publishDocument(id, payload)
BlogPost
```

不要让博客模块和文档模块完全割裂。第一版可以先预留发布入口，接口未完成时使用 mock 或 disabled 状态。

---

## 6. 移动端适配原型

移动端不要强行三栏布局，建议改为顶部 tab：

```text
┌──────────────────────────────┐
│ 文档工作台        [保存] [发布] │
├──────────────────────────────┤
│ [目录] [编辑] [属性] [大纲]     │
├──────────────────────────────┤
│ 当前 Tab 内容                  │
│                              │
│ 如果选择“编辑”：               │
│ ┌──────────────────────────┐ │
│ │ 标题输入                  │ │
│ │ Markdown Editor           │ │
│ │                          │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

规则：

```text
- desktop：三栏工作台。
- tablet：左侧目录可折叠，中间编辑器优先。
- mobile：使用 tabs 切换目录、编辑、属性、大纲。
```

---

## 7. 推荐第一版文件结构

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
│   │   └── DocumentPublishDialog.vue
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

## 8. 推荐开发顺序

```text
1. 新增 document 路由。
2. 新增 DocumentListView 空页面。
3. 新增 DocumentWorkspaceView 三栏布局。
4. 封装 MarkdownEditor。
5. 实现 DocumentSidebar 和 DocumentTree mock 数据。
6. 实现 DocumentEditorPanel，包括标题和正文。
7. 实现 DocumentMetaPanel，包括标签、分类、摘要、大纲。
8. 实现 useAutoSave 本地草稿。
9. 实现 DocumentReadView 和 MarkdownRenderer。
10. 实现 DocumentPublishDialog。
11. 运行 lint/build。
12. 提交 PR。
```

---

## 9. 给 Codex 的开发提示词

可以直接使用以下提示词让 Codex 开发：

```text
请阅读 docs/frontend/Document_Module_Prototype.md，并基于该原型实现 FlowStudy 前端文档模块第一版。

开发要求：
1. 使用 Vue3 + Vite + TypeScript + <script setup>。
2. 页面包括 DocumentListView、DocumentWorkspaceView、DocumentReadView。
3. 先使用 mock 数据实现功能闭环，不直接依赖后端接口。
4. Markdown 编辑器封装为 components/markdown/MarkdownEditor.vue。
5. 文档模块组件放在 components/document。
6. 类型定义放在 types/document.ts。
7. 接口封装预留在 api/document.ts，不在页面组件中直接写 axios。
8. 本地草稿保存通过 useAutoSave 和 utils/storage.ts 实现。
9. 页面需要处理 loading、empty、error 状态。
10. 不要进行大范围架构重构，不要影响博客和 OJ 模块。
11. 完成后运行 pnpm lint 和 pnpm build。
```
