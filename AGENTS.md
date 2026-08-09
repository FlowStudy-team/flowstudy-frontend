# flowstudy-frontend Agent Guide

## Service Responsibility

`flowstudy-frontend` 是 FlowStudy Web 前端，负责用户界面、路由、鉴权状态、Core API 调用、AI SSE 调用、教程/博客/题目/文档页面和 OJ 交互。它不负责业务数据持久化、判题沙箱、后端鉴权实现或生产基础设施。

## Technology Stack

- Vue 3、Vite、TypeScript：见 `flowstudy-web/package.json`
- Pinia：鉴权和 AI 状态
- Vue Router：路由和登录守卫
- Monaco Editor：OJ 代码编辑器
- TipTap、md-editor-v3：文档/Markdown 编辑

## Important Entry Points

- 应用入口：`flowstudy-web/src/main.ts`
- 路由：`flowstudy-web/src/router/index.ts`
- 统一请求：`flowstudy-web/src/api/request.ts`
- 鉴权状态：`flowstudy-web/src/store/modules/auth.ts`
- AI 状态：`flowstudy-web/src/store/modules/ai.ts`
- 构建：`flowstudy-web/package.json`、`vite.config.ts`
- 环境：`flowstudy-web/.env.example`

## Key Modules

- `src/api/modules/auth.ts`：登录、注册、当前用户
- `src/api/modules/articles.ts`：教程/博客接口
- `src/api/oj.ts`：已接入 Core 的 OJ 题目、运行、提交、结果轮询
- `src/api/modules/ai.ts`：AI SSE 调用
- `src/api/document.ts`：文档中心接口
- `src/views/oj/OjProblemDetailView.vue`：OJ 主页面
- `src/components/oj/*`：编辑器、测试用例、结果展示
- `src/components/ai/*`：AI 侧边栏/抽屉
- `src/views/document/*`：文档中心

## External Dependencies

- Core HTTP API：默认 `VITE_API_BASE_URL=/api/v1`
- AI 服务：`fetch('/ai/api/v1/ai/chat')`，Vite proxy 到 `http://localhost:8000`
- 浏览器 localStorage：token、代码草稿、文档编辑模式

## Contracts

- REST API：[../flowstudy-infra/docs/05-restful-api-contract.md](../flowstudy-infra/docs/05-restful-api-contract.md)
- OpenAPI：[../flowstudy-infra/docs/api/FlowStudy_Apifox_OpenAPI.yaml](../flowstudy-infra/docs/api/FlowStudy_Apifox_OpenAPI.yaml)
- 错误码：[../flowstudy-infra/docs/06-result-error-code-contract.md](../flowstudy-infra/docs/06-result-error-code-contract.md)
- 前端设计：[../flowstudy-infra/docs/12-frontend-design.md](../flowstudy-infra/docs/12-frontend-design.md)
- 前后端对接：[../flowstudy-infra/docs/frontend/FlowStudy_Frontend_Backend_Integration_Guide.md](../flowstudy-infra/docs/frontend/FlowStudy_Frontend_Backend_Integration_Guide.md)

当前已知：`src/api/modules/problems.ts` 是旧模拟实现；新 OJ 主链路在 `src/api/oj.ts`。

## Environment Variables

入口：`flowstudy-web/.env.example`

- `VITE_API_BASE_URL=/api/v1`

不要把敏感 token、后端密码或模型 key 写入前端源码。

## Validation Commands

在 `flowstudy-web` 目录运行：

```bash
npm install
npm run type-check
npm run lint
npm run build
npm run dev
```

当前未发现单元测试或 E2E 测试命令。

## Modification Rules

- API 修改必须与 Core Controller、OpenAPI 和 infra REST 文档保持一致。
- 不得硬编码生产 API 地址；使用环境变量和 Vite proxy。
- 不得将敏感 token 写入源码；token 只通过封装 storage 管理。
- 修改鉴权状态时必须检查登录、刷新、401 清理和退出逻辑。
- 新增业务 API 需放在 `src/api`，不要在页面里散落 `fetch`。
- 修改 OJ 状态枚举必须同步 Core/Judge 状态。

## Task Completion Checklist

完成任务时说明：修改了什么、为什么修改、运行了哪些命令、哪些验证通过、哪些未验证、是否影响契约、是否需要更新 infra 文档。
