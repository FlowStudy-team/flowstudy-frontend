# 01. FlowStudy Frontend 必要界面清单

本文基于 `00-project-overview.md` 归纳前端界面需求，目标是覆盖 FlowStudy 的完整学习闭环：登录 -> 阅读 -> 练习 -> 提交判题 -> AI 问答 -> 学习反馈。

## 1. MVP 必须有（第一阶段）

### 1.1 认证与基础框架

1. 登录页 `/login`
- 账号密码登录
- 表单校验、loading、error 状态

2. 注册页 `/register`
- 邮箱/密码/确认密码
- 表单校验、loading、error 状态

3. 全局应用壳（App Shell）
- 顶部导航（课程入口、题库入口、个人中心）
- 侧边导航（学习模块切换）
- 全局通知/错误提示位

### 1.2 学习主流程

4. 文章列表页 `/articles`
- 搜索、分类筛选、分页、刷新
- 文章卡片：标题、标签、难度、更新时间

5. 文章阅读页 `/articles/:articleId`
- Markdown 渲染
- 章节目录导航
- 阅读进度记录（滚动、停留时长）

6. 章节详情页 `/articles/:articleId/chapters/:chapterId`
- 章节内容
- 关联练习题入口
- AI 提问快捷入口

7. 题目详情页 `/problems/:problemId`
- 题目描述、输入输出说明、样例、约束
- 支持语言选择

8. 在线编程页（可与题目详情合并）
- Monaco Editor
- 代码运行/提交按钮
- 提交中状态反馈

9. 提交结果页（或结果面板）
- 判题结果：Accepted / Wrong Answer / TLE / RE / CE
- 运行时、内存、测试点详情

10. AI 侧边栏（全局可呼出）
- 基于上下文问答
- 流式输出（SSE）
- 历史问答列表

### 1.3 用户信息

11. 个人中心首页 `/me`
- 基本信息
- 最近学习记录
- 最近提交记录

12. 我的提交列表 `/me/submissions`
- 搜索、筛选、分页、刷新
- 点击查看单次提交详情

## 2. 第二阶段应有（MVP 后）

13. 学习笔记页 `/me/notes`
- AI 自动生成笔记展示
- 支持编辑/收藏/导出 Markdown

14. 学习画像页 `/me/insights`
- 错误类型分布
- 学习时长趋势
- 章节掌握度

15. 学习路径推荐页 `/learning-path`
- 推荐下一篇文章/下一题
- 推荐理由展示

16. 通知中心 `/notifications`
- 判题完成通知
- 系统消息

## 3. 管理端界面（若前后端共仓）

17. 登录页 `/admin/login`
18. 内容管理 `/admin/articles`（文章/章节 CRUD）
19. 题目管理 `/admin/problems`（题目/测试用例 CRUD）
20. 提交监控 `/admin/submissions`（状态筛查、失败重试）
21. 用户管理 `/admin/users`
22. AI 配置页 `/admin/ai`（Prompt 模板、模型开关）

## 4. 通用状态页（全局必备）

23. 404 页面
24. 403 页面
25. 500 页面
26. 全局空状态组件（Empty）
27. 全局加载骨架（Loading/Skeleton）
28. 全局错误重试组件（Error + Retry）

## 5. FlowStudy 前端建议目录映射（与界面对应）

- `src/views/auth`: 登录、注册
- `src/views/articles`: 列表、阅读、章节
- `src/views/problems`: 题目详情、代码编辑、结果
- `src/views/profile`: 个人中心、提交、笔记、画像
- `src/views/admin`: 管理端页面（若启用）
- `src/components/ai`: AI 侧边栏、消息流组件
- `src/components/common`: Empty、Loading、Error、ConfirmDialog

## 6. 推荐实施顺序

1. 登录/注册 + App Shell
2. 文章列表 + 文章阅读 + 章节页
3. 题目详情 + 代码编辑 + 提交结果
4. AI 侧边栏 + 流式问答
5. 个人中心 + 提交记录
6. 学习笔记/画像（第二阶段）

