# InqAsst 代理指南

## 目的

- 使用此仓库构建 InqAsst v1，一个移动优先的内部应用。
- 保持根文档简短且耐用。这里只放稳定且高频的规则。
- 明确区分当前仓库现实与目标实现状态。

## 首先阅读

1. `设计文档_v1.9_开发指导.md`
2. `移动端开发计划_v1.md`
3. `design.pen`
4. 若存在最新 `./*-handoff.md`，将其作为补充上下文一并阅读
5. `app/`
6. `components/`
7. `CLAUDE.md` 和 `AGENTS.md`

## 当前现实

- 仓库已初始化为 Next.js App Router 工程，并已绑定 Git 远端 `origin`。
- 当前已存在的前端骨架：
  - `app/login`
  - `app/role-select`（仅保留兼容跳转，当前会重定向回 `/login`）
  - `app/teacher/home`
  - `app/teacher/no-class`
  - `app/teacher/attendance/demo`
  - `app/teacher/attendance/demo/roster`（兼容重定向）
  - `app/teacher/home/roster`
  - `app/teacher/me`
  - `app/admin/home`
  - `app/admin/course-teachers`
  - `app/admin/control`
  - `app/admin/control/[classId]`
  - `app/admin/course-settings`
  - `app/admin/course-settings/[courseId]/students`
  - `app/admin/course-settings/[courseId]/students/new`
  - `app/admin/course-settings/[courseId]/students/import`
  - `app/admin/course-settings/[courseId]/students/[studentId]/edit`
  - `app/admin/unarrived`
  - `app/admin/emergency`
  - `app/admin/emergency/course/[courseId]`
  - `app/admin/emergency/course/[courseId]/select-teacher`
  - `app/admin/emergency/course/[courseId]/external-teacher`
  - `app/admin/me`
  - `app/admin/time-settings`
  - `app/admin/time-settings/[settingKey]`
  - `app/admin/time-settings/[settingKey]/picker`
- shadcn/ui 已接入，基础组件位于 `components/ui/`。
- 业务组件位于 `components/app/`。
- 已建立 `lib/domain/`、`lib/services/`、`lib/mocks/` 分层。
- `design.pen` 的变量通过 `scripts/sync-pencil-tokens.mjs` 生成到 `app/pencil-tokens.css`。
- 登录页、老师首页、点名页、管理首页、点名总控、未到学生、老师设置页、课程与班级设置页及学生名单子页面已按 `design.pen` 结构做过一轮高保真重构，不再是单纯骨架卡片页。
- 当前管理端点名相关已实现能力：
  - 班级名单页支持单个学生状态切换
  - 未到学生列表支持直接修改学生状态
  - 班级名单页支持“先选择一批学生，再批量修改状态”的批量操作闭环

## 目标状态

- v1 范围仅限移动端 H5/PWA。本阶段不要开发 Web 管理台。
- 保持一个按角色分流的单应用：
  - `/login`
  - `/teacher/*`
  - `/admin/*`
- 一个手机号只允许对应一个角色入口；登录后直接进入对应首页，不再经过角色选择页。
- 核心技术栈：
  - Next.js App Router
  - TypeScript
  - Tailwind CSS
  - shadcn/ui
  - Lucide 图标

## 设计到代码规则

- UI 必须基于 `design.pen` 实现，不能靠模糊的视觉近似来还原。
- 修改设计 token 时，优先改 `design.pen` 或 `scripts/sync-pencil-tokens.mjs`，不要手改 `app/pencil-tokens.css`。
- 页面样式优先消费 shadcn 语义 token 与 Pencil 业务 token，不要散落硬编码颜色。
- 使用 shadcn/ui 作为基础交互层，再在 `components/app/` 中封装业务组件。
- 不要重新引入 `src/` 目录结构；当前工程统一使用根级 `app/`、`components/`、`lib/`。

## 命令

- 已验证命令：
  - `npm run sync:tokens`
  - `npm run lint`
  - `npm run build`
- 可用开发命令：
  - `npm run dev`
  - `npm run start`

## 校验规则

- 在声称某项能力已实现前，必须先在代码中验证。
- fresh session 若读取了 `./*-handoff.md`，只能把它视为补充上下文，不能替代代码与文档核验。
- UI 变更至少经过：
  - `npm run sync:tokens`
  - `npm run lint`
  - `npm run build`
- 在交付页面前，必须同时对照 `design.pen` 和 `移动端开发计划_v1.md` 进行核验。

## 更新规则

- 除非用户明确要求分叉，否则 `CLAUDE.md` 与 `AGENTS.md` 必须保持镜像。
- 当技术栈、路由方案、工作流或 source-of-truth 文件变化时，同时更新两份根文档。
- 当页面范围、阶段拆分、组件策略、服务边界或校验要求变化时，更新 `移动端开发计划_v1.md`。
- 当业务范围或运营规则变化时，更新 `设计文档_v1.9_开发指导.md` 或新增版本化设计文档。
- 只有当根文档开始变得嘈杂时，才新增 supporting AI docs；优先使用 `docs/AI_REFERENCE.md` 或 `docs/ai/*.md`。

## 外部文档

- 查询库、框架、SDK、API、CLI 或云服务文档时，使用 `ctx7`。
- 遇到 `design.pen` 到代码、token 同步相关问题时，使用 Pencil 官方文档。
- 遇到 `components.json`、CSS variables 配置和组件安装问题时，使用 shadcn/ui 官方文档。

## 禁止

- 不要把计划中的架构写成仿佛已经存在于代码中的事实。
- 不要手工维护与 `design.pen` 脱节的 token 副本。
- 不要让页面直接依赖 mock 数据文件；统一走 `lib/services/`。
- 不要让根文档膨胀成长篇知识库。
- 不要让 `CLAUDE.md` 和 `AGENTS.md` 失去同步。

## 压缩指令

- 当前已存在可构建的 Next.js 移动端骨架。
- v1 范围：仅移动端，一个应用，老师/管理员角色分流。
- 登录已改为单角色直达；`/role-select` 仅保留兼容重定向。
- 路由骨架已落地：登录、老师首页/无课态/点名/只读学生名单/我的、管理首页/课程老师列表/总控学生名单、课程与班级设置、课程学生名单/新增/批量导入/编辑、老师设置、时间设置、未到、我的。
- 页面数据入口：`lib/services/`，mock 数据源：`lib/mocks/`，领域规则：`lib/domain/`。
- 设计 token 来源：`design.pen` -> `scripts/sync-pencil-tokens.mjs` -> `app/pencil-tokens.css`。
- 管理端点名相关当前已支持：班级名单单个状态切换、未到学生列表状态切换、选择式批量修改学生状态。
- 若存在最新 `./*-handoff.md`，先读它恢复上下文；但任何结论仍要回到仓库代码核对。
- 每次 UI 开发后至少跑：`npm run sync:tokens && npm run lint && npm run build`。
