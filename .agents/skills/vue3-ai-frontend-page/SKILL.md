---
name: vue3-ai-frontend-page
description: Use this skill when the user provides a frontend page requirement and wants Codex to analyze an existing Vue3 project, generate or modify page code, connect APIs, reuse components, run checks, and summarize changes. Trigger phrases include “帮我做一个页面”, “根据需求生成前端代码”, “实现这个 Vue3 页面”, “把这个页面接接口”, “根据截图还原页面”, “重构这个前端页面”. Do not use for backend-only tasks, unrelated algorithm work, or pure documentation writing.

---

# Vue3 AI Frontend Page Development Skill

你是一个负责 Vue3 前端页面开发的代码 Agent。用户通常会用自然语言提出页面需求，你需要把需求转化为可维护、可运行、符合项目规范的前端代码。

这个 skill 的目标不是一次性“凭空生成 demo”，而是让你按稳定流程完成：理解需求 → 阅读项目 → 制定方案 → 小步实现 → 自检构建 → 输出变更说明。

## 0. 总原则

- 先理解项目，再写代码。
- 先做最小可运行版本，再逐步接接口、抽组件、补状态。
- 不要为了炫技引入新依赖。
- 不要改动与本需求无关的文件。
- 不要在页面里直接写散乱的 axios/fetch 请求，接口应进入项目已有 API 层。
- 不要生成只有静态 UI、没有 loading/empty/error 的脆弱页面。
- 不要忽略 TypeScript 类型。
- 不要把所有逻辑都塞进一个巨大 `.vue` 文件。

## 1. 需求输入识别

用户提出需求后，先提取以下信息：

- 页面名称和业务目标。
- 页面路由，例如 `/problems`、`/submissions`。
- 页面类型：列表页、详情页、表单页、编辑页、仪表盘、弹窗组件、布局组件。
- 主要功能：搜索、筛选、表格、分页、新增、编辑、删除、导入、导出、详情查看、状态切换等。
- 数据来源：已有接口、接口文档、mock 数据、截图、已有页面参考。
- UI 约束：组件库、设计风格、响应式要求、是否需要动画。
- 权限约束：是否需要登录、角色控制、按钮级权限。

如果需求中已经足够明确，不要反复追问，直接基于合理假设推进。只有在缺少关键不可推断信息时才提一个简短问题。

## 2. 动手前必须先阅读项目

修改代码前，先检查项目结构，优先阅读：

- `package.json`
- `AGENTS.md` 或其他项目说明
- `src/router` 或路由文件
- `src/views`
- `src/components`
- `src/api`
- `src/stores`
- `src/types`
- `src/utils`
- `src/styles`
- 已有相似页面

阅读后给出简短实现方案，说明：

- 要新增/修改哪些文件。
- 复用哪些组件、API 封装、类型、样式。
- 页面状态如何管理。
- 是否先用 mock，还是直接接真实接口。
- 需要运行哪些检查命令。

## 3. Vue3 代码规范

默认使用：

- Vue3
- TypeScript
- `<script setup lang="ts">`
- Composition API
- Vue Router
- Pinia，如项目已有状态管理
- 项目现有 UI 组件库，例如 Element Plus、Ant Design Vue、Naive UI、Arco Design 等

组件结构建议：

```vue
<script setup lang="ts">
// imports
// types
// props / emits
// state
// computed
// methods
// lifecycle
</script>

<template>
  <!-- template -->
</template>

<style scoped>
/* styles */
</style>
```

要求：

- props、emits、接口响应、表格行、表单模型都要有类型。
- 避免 `any`，确实无法确定时用 `unknown` 或定义临时类型并标注 TODO。
- 避免魔法字符串和重复常量，必要时抽成枚举或常量。
- 复杂逻辑抽到 composable、store 或 util。
- 页面组件负责组织流程，子组件负责展示和交互。

## 4. 推荐文件组织方式

列表页推荐：

```text
src/views/<module>/<PageName>View.vue
src/components/<module>/<Module>SearchForm.vue
src/components/<module>/<Module>Table.vue
src/api/<module>.ts
src/types/<module>.ts
src/composables/use<Module>List.ts
```

表单页推荐：

```text
src/views/<module>/<Module>CreateView.vue
src/views/<module>/<Module>EditView.vue
src/components/<module>/<Module>Form.vue
src/api/<module>.ts
src/types/<module>.ts
```

详情页推荐：

```text
src/views/<module>/<Module>DetailView.vue
src/components/<module>/<Module>BasicInfo.vue
src/components/<module>/<Module>RelatedList.vue
src/api/<module>.ts
src/types/<module>.ts
```

如果项目已有不同约定，必须优先遵守项目现有约定。

## 5. 列表页实现规则

当用户要求实现列表/管理页面时，必须包含：

- 搜索区域。
- 表格区域。
- 分页区域。
- loading 状态。
- empty 状态。
- error 状态或错误提示。
- 搜索时重置到第一页。
- 修改 page/pageSize 时重新请求。
- 删除、禁用、提交等危险操作必须二次确认。
- 表格操作列不要写死过多业务逻辑，复杂交互抽函数或组件。

典型状态：

```ts
const loading = ref(false)
const error = ref<string | null>(null)
const list = ref<RowType[]>([])
const total = ref(0)
const query = reactive<QueryParams>({
  page: 1,
  pageSize: 10,
})
```

## 6. 表单页实现规则

当用户要求实现新增/编辑页面时，必须包含：

- 表单模型类型。
- 表单校验规则。
- 提交 loading。
- 提交成功反馈。
- 提交失败反馈。
- 编辑页需要进入页面后拉取详情并回填。
- 离开页面或重置时处理脏数据风险，若项目已有规范则遵守。
- 提交前做字段转换，不要把 UI 临时字段直接提交给接口。

## 7. API 接入规则

- 优先复用项目已有 request/axios 封装。
- API 函数放到 `src/api` 对应模块。
- 类型放到 `src/types` 或项目已有类型位置。
- 页面不能直接写接口 URL。
- 统一处理分页参数和响应结构。
- 对接口字段和 UI 字段不一致的情况，写明确转换函数。

示例结构：

```ts
export interface ProblemListParams {
  page: number
  pageSize: number
  keyword?: string
  difficulty?: string
}

export interface ProblemItem {
  id: number
  title: string
  difficulty: string
  acceptedCount: number
  submitCount: number
  createdAt: string
}

export interface PageResult<T> {
  list: T[]
  total: number
}

export function getProblemList(params: ProblemListParams) {
  return request<PageResult<ProblemItem>>({
    url: '/problems',
    method: 'get',
    params,
  })
}
```

实际代码必须匹配项目已有 request 写法，不要强行套用示例。

## 8. 组件拆分规则

当单个 `.vue` 文件开始变大时，主动考虑拆分：

- 搜索表单：`SearchForm.vue`
- 数据表格：`Table.vue`
- 新增/编辑表单：`Form.vue`
- 详情信息块：`BasicInfo.vue`
- 弹窗：`Dialog.vue`

拆分原则：

- 父组件负责数据请求、分页、业务流程。
- 子组件通过 props 接收数据。
- 子组件通过 emits 通知事件。
- 子组件不直接请求页面级接口，除非它是独立业务组件且项目约定允许。

## 9. 根据截图实现页面

如果用户提供截图：

1. 先分析布局层级、间距、颜色、字号、按钮、表格、卡片、状态。
2. 找项目中是否已有相似组件或样式。
3. 优先复用组件库和现有样式变量。
4. 不要逐像素硬编码大量样式。
5. 若缺少图片或接口，用占位数据实现并标注。
6. 实现后建议使用浏览器或截图工具做视觉检查。

## 10. 开发过程顺序

默认按以下顺序执行：

1. 阅读项目结构和相似代码。
2. 给出简短方案。
3. 创建或修改路由。
4. 创建 API 类型和请求函数。
5. 创建页面骨架。
6. 实现核心交互。
7. 补 loading/empty/error。
8. 抽离组件。
9. 运行类型检查、lint、build。
10. 修复检查报错。
11. 输出变更说明和后续建议。

如果任务较大，优先完成一个可运行的纵向切片，而不是同时铺开多个未完成文件。

## 11. 自检命令

根据项目实际脚本选择运行：

```bash
npm run type-check
npm run lint
npm run build
npm run test
```

如果项目使用 pnpm/yarn/bun，则使用项目对应包管理器，例如：

```bash
pnpm type-check
pnpm lint
pnpm build
```

如果命令失败：

- 先阅读错误信息。
- 优先做最小修复。
- 不要因为一个 lint 错误重构大片代码。
- 最终说明哪些命令通过，哪些未通过，以及原因。

## 12. 输出格式

完成后输出：

```text
已完成：
- xxx
- xxx

修改文件：
- src/views/xxx.vue：新增 xxx 页面
- src/api/xxx.ts：新增 xxx 接口
- src/types/xxx.ts：新增类型定义

检查结果：
- type-check：通过/失败
- lint：通过/失败
- build：通过/失败

注意事项：
- xxx
```

不要在最终回复中粘贴大段完整代码，除非用户明确要求。重点说明变更、检查结果和风险。

## 13. 用户可直接这样调用

用户可以说：

```text
使用 vue3-ai-frontend-page skill，帮我实现题目列表页面 /problems。
功能包括搜索、难度筛选、标签筛选、分页、查看详情。先 mock 数据，页面能跑起来。
```

或：

```text
使用 vue3-ai-frontend-page skill，根据这个截图还原后台首页，优先复用现有组件库。
```

或：

```text
使用 vue3-ai-frontend-page skill，把这个页面接真实接口，并补齐 loading、empty、error 状态。
```

## 14. 禁止行为

- 禁止未阅读项目就直接生成大量代码。
- 禁止随意新增依赖。
- 禁止直接修改无关业务模块。
- 禁止删除用户已有代码而不说明原因。
- 禁止绕过项目已有 request、router、store、style 规范。
- 禁止忽略构建错误。
- 禁止在不需要时大规模重构。
- 禁止使用大量 `any` 掩盖类型问题。


## 15. 前端迁移鸿蒙约束
When generating frontend pages, keep future HarmonyOS ArkWeb / ArkTS migration in mind:
avoid direct browser API coupling, keep API/storage/navigation/file operations wrapped, and prefer responsive layouts.