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
| 单元 / service / contract 测试 | `npm test` | 等价于 `npm run test:phase0` |
| unit 测试 | `npm run test:unit` | Vitest，覆盖 `tests/unit` |
| service 测试 | `npm run test:service` | Vitest，覆盖 `tests/service` |
| contract 测试 | `npm run test:contract` | Vitest，覆盖 `tests/contract` |
| mobile smoke | `npm run test:e2e:smoke` | Playwright mobile smoke，排除 `@write-live` |
| 真实写链专项 | `npm run test:e2e:write-live` | Playwright `@write-live`，执行前确认真实写入影响 |
| 静态导出 build | `npm run build` | 会先执行 `prebuild` 同步 token；交付物以 `out/` 为准 |

## 已有反馈环

- Vitest：`tests/unit`、`tests/service`、`tests/contract`，`npm test` 作为基础门禁。
- Playwright：`tests/e2e`，默认 smoke 排除真实写入；`@write-live` 专项需要确认环境和写入影响。
- ESLint：`eslint.config.mjs` 使用 Next core-web-vitals 和 TypeScript 规则。

## 运行时与环境

- 本地默认：`next dev` 同源 proxy 到 `https://daoleme-dev.jxare.cn`。
- API 配置入口：`API_BASE_URL`、`NEXT_PUBLIC_API_BASE_URL`、`API_REQUEST_MODE`、`NEXT_PUBLIC_API_REQUEST_MODE`。
- dev proxy：`next.config.ts`；开发态不设置 `output: "export"`，避免 Next.js 静态导出与 rewrites/proxy 互斥警告。
- Vercel 静态部署：`vercel.json` 发布 `out/` 静态产物，并用 `/api/:path*` external rewrite 代理到 `https://daoleme-dev.jxare.cn/api/:path*`，避免浏览器 direct mode 被后端 CORS 拦截。
- Vercel Production 环境当前必须配置 `NEXT_PUBLIC_API_BASE_URL=https://daoleme-dev.jxare.cn` 与 `NEXT_PUBLIC_API_REQUEST_MODE=proxy`。
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

## Vercel 部署源

- Vercel 正式 Production 部署必须依赖 GitHub `origin/main`，不要把本地 worktree 或功能分支 CLI production deploy 当成最终上线来源。
- 功能分支如 `XJM034/vercel-deploy-skills` 只用于 Preview / 验证 / PR；通过验证后合并到 `origin/main`，由 GitHub integration 触发 Production。
- Vercel Git 集成口径：production branch 通常是 `main`；非 production 分支 push 生成 Preview Deployment，合并或推送到 production branch 才生成 Production Deployment。
- 手动 CLI production deploy 只能作为临时排障或 smoke，不得替代 `origin/main` 作为正式部署内容来源；若临时使用，必须在 handoff 里标明“非最终上线来源”。
- Production 环境变量必须在 Vercel 项目 Production scope 配置，当前关键项是 `NEXT_PUBLIC_API_BASE_URL` 和 `NEXT_PUBLIC_API_REQUEST_MODE=proxy`。
- 当前 shared dev 后端未允许 Vercel 域名 CORS，浏览器 direct 请求会报 `Failed to fetch`；在后端开 CORS 前，Production 必须走 Vercel `/api/*` external rewrite。
- 修改部署配置、环境变量、production branch、GitHub integration 或静态导出模式时，同步更新本文件、`docs/ARCHITECTURE.md`、`docs/static-export-delivery-constraint_20260418.md` 和最新 handoff。

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
- Vercel 静态部署配置在 `vercel.json`：`framework` 为 `null`，`cleanUrls` 为 `true`，`buildCommand` 为 `npm run build`，`outputDirectory` 为 `out`，`rewrites` 将 `/api/:path*` 代理到 shared dev 后端；部署环境必须设置 `NEXT_PUBLIC_API_BASE_URL`，否则 Vercel 构建会失败。
- 导航、登录跳转、保存后回流、动态详情页变更必须对照：
  - `docs/static-export-navigation-rsc-fix_20260417.md`
  - `docs/static-export-delivery-constraint_20260418.md`

## 守卫与缺口

### 已有守卫

- token 同步：`predev` / `prebuild`
- 基础测试：`npm test`
- lint：`npm run lint`
- 静态导出 build：`npm run build`
- 本机 GitHub 文档防误推：`.codex/git-guards/hooks`

### 仍是约定或缺口

- “不要新增 mock 数据冒充后端接通”主要依赖文档和 review，尚无专门 lint / structure test。
- “静态部署主路径不要使用 `next/link` / `router.push` / `router.refresh`”主要依赖 review 和历史文档，尚无自动扫描脚本。
- 当前没有 docs link checker；文档重构后用 `rg` / 人工检查关键路径。
- 当前没有生产观测、日志、指标或 tracing 文档；内测问题需要手动记录环境、账号、路径、接口表现。
- 本机文档防误推 hook 不等于云端备份；它只保证本机备份和提交 / 推送拦截，不防电脑磁盘损坏。

## 常用任务路由

- 产品范围或角色变化：更新 `docs/PRODUCT.md`
- 架构、路由、数据流或验证流变化：更新 `docs/ARCHITECTURE.md`
- 工具、命令、CI、测试、反馈环变化：更新本文件
- 内测反馈、回归结论、阻塞项：更新 `docs/quality/` 或新增 dated 文档
- 后端接口、字段、权限、错误码、稳定性问题：更新 `docs/backend-collab/`
- 发布门禁或人工验收项变化：更新 `docs/quality/regression-checklist.md`
