# 到了么 Agent Tooling Map

更新日期：2026-04-30

## 目的

本文件给 future agents 一个可执行地图：哪些命令、配置、测试、产物和文档可以直接检查。不要把这里当长说明书；遇到具体业务事实仍要回到代码、接口和对应文档核验。

## 命令地图

| 场景 | 命令 | 说明 |
|---|---|---|
| 启动本地开发 | `npm run dev` | 会先执行 `predev` 同步 Pencil tokens，再启动 Next dev |
| 同步设计 token | `npm run sync:tokens` | 从 `../design.pen` 生成 `../app/pencil-tokens.css`；不要手改生成文件 |
| lint | `npm run lint` | ESLint flat config |
| 静态导出 build | `npm run build` | 会先执行 `prebuild` 同步 token；交付物以 `out/` 为准 |

## 已有反馈环

- 当前分支未配置 `npm test` / Vitest / Playwright 脚本；上线前自动化门禁以 `npm run lint` 与 `npm run build` 为准。
- ESLint：`eslint.config.mjs` 使用 Next core-web-vitals 和 TypeScript 规则。

## 运行时与环境

- 本地默认：`next dev` 同源 proxy 到 `https://daoleme-dev.jxare.cn`。
- API 配置入口：`API_BASE_URL`、`NEXT_PUBLIC_API_BASE_URL`、`API_REQUEST_MODE`、`NEXT_PUBLIC_API_REQUEST_MODE`。
- dev proxy：`next.config.ts`；开发态不设置 `output: "export"`，避免 Next.js 静态导出与 rewrites/proxy 互斥警告。
- API base 归一化：`lib/services/api-base-url.ts`。
- HTTP 基础能力：`lib/services/http-core.ts`、`http-client.ts`、`http-server.ts`。

## GitHub 与本机推送守卫

- 当前 workspace 默认代码同步通道：GitHub。
- Git remote：`origin` -> `https://github.com/XJM034/InqAsst`。
- 默认目标分支：`main`；功能分支先确认当前分支与 upstream，例如 `git branch --show-current`、`git status --short --branch`。
- 日常提交 / 推送用 Git：`git add`、`git commit`、`git push origin <branch>`。需要 PR 时走 GitHub PR 流程，推送前核对当前分支、upstream 与目标远端。
- 本机已配置 worktree-local hook：`.codex/git-guards/hooks`。`pre-commit` / `pre-push` 会先备份本机文档，再阻止前端 / AI 协作文档误入远端。
- 外部备份目录：`/Users/minxian/Documents/alex_project/daoleme-local-docs-backup/bordeaux/`。
- 默认受保护且不推送：`AGENTS.md`、`CLAUDE.md`、`README.md`、`.impeccable.md`、`.codex/`、`handoff/`、`docs/quality/` 和其它非后端协同 `docs/*` 文档。
- 默认允许推送后端协同：`docs/backend-collab/**`、`docs/后端协同说明_20260414.md`。
- 确认要发布受保护文档时才临时放行：`DAOLME_ALLOW_DOCS=1 git commit ...`、`DAOLME_ALLOW_DOCS=1 git push ...`。

## 代码地图

- 路由：`app/`，主干为 `/login`、`/teacher/*`、`/admin/*`，`/role-select` 仅兼容跳转。
- 业务组件：`components/app/`。
- UI 基础组件：`components/ui/`。
- 领域规则：`lib/domain/`。
- 服务、schema、adapter、session：`lib/services/`。
- 静态导出导航：`components/app/static-link.tsx`、`lib/static-navigation.ts`。
- 测试：`tests/unit`、`tests/service`、`tests/contract`、`tests/e2e`。

## 静态导出检查

- 构建态 `next.config.ts` 开启 `output: "export"`。
- `out/` 是静态交付产物，不要只看 `next dev` 行为。
- Vercel 静态部署配置在 `vercel.json`：`framework` 为 `null`，`cleanUrls` 为 `true`，`buildCommand` 为 `npm run build`，`outputDirectory` 为 `out`。
- 导航、登录跳转、保存后回流、动态详情页变更必须对照：
  - `docs/static-export-navigation-rsc-fix_20260417.md`
  - `docs/static-export-delivery-constraint_20260418.md`

## 守卫与缺口

### 已有守卫

- token 同步：`predev` / `prebuild`
- lint：`npm run lint`
- 静态导出 build：`npm run build`
- 本机 GitHub 文档防误推：`.codex/git-guards/hooks`

### 仍是约定或缺口

- “不要新增 mock 数据冒充后端接通”主要依赖文档和 review，尚无专门 lint / structure test。
- “静态部署主路径不要使用 `next/link` / `router.push` / `router.refresh`”主要依赖 review 和历史文档，尚无自动扫描脚本。
- 当前没有 docs link checker；文档重构后用 `rg` / 人工检查关键路径。
- 当前没有自动化 test / e2e 脚本；恢复测试工程前，不要把旧文档里的 `npm test` 当成当前门禁。
- 当前没有生产观测、日志、指标或 tracing 文档；内测问题需要手动记录环境、账号、路径、接口表现。
- 本机文档防误推 hook 不等于云端备份；它只保证本机备份和提交 / 推送拦截，不防电脑磁盘损坏。

## 常用任务路由

- 产品范围或角色变化：更新 `docs/PRODUCT.md`
- 架构、路由、数据流或验证流变化：更新 `docs/ARCHITECTURE.md`
- 工具、命令、CI、测试、反馈环变化：更新本文件
- 内测反馈、回归结论、阻塞项：更新 `docs/quality/` 或新增 dated 文档
- 后端接口、字段、权限、错误码、稳定性问题：更新 `docs/backend-collab/`
- 发布门禁或人工验收项变化：更新 `docs/quality/regression-checklist.md`
