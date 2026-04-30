# Handoff

## 1. 当前任务目标

当前目标是把 `XJM034/vercel-deploy-skills` 分支从早期 mock prototype 修成可部署、可连真实后端接口的静态导出前端，并继续处理 `/review` 发现的生产风险。

完成标准：

- 当前分支不再使用 `lib/mocks/mobile-data.ts` 冒充后端数据。
- Vercel 静态部署能发布 `out/`，页面路由可访问。
- 登录和页面数据经 `lib/services/*` 调后端接口。
- review 发现的生产风险落地修复、提交、推送、重新部署并 smoke。

## 2. 当前进展

- 已安装 Vercel 部署 skill：`~/.agents/skills/deploy-to-vercel`。
- 已创建并部署 Vercel 项目 `alex-xiangs-projects/adrastea`。
- 已关闭 Vercel SSO Deployment Protection；Git fork protection 仍开启。
- 已从只读来源 `/Users/minxian/conductor/workspaces/inqasst/bordeaux` 迁回真实 API-backed 前端代码到当前 `adrastea` workspace；没有修改 `bordeaux`。
- 已删除旧 prototype 的 mock 数据路径：`lib/mocks/mobile-data.ts`。
- 已恢复真实登录链路：
  - `components/app/login-form.tsx`
  - `lib/services/mobile-client.ts`
  - `lib/services/auth-session.ts`
  - `lib/services/http-client.ts`
  - `lib/services/http-core.ts`
  - `lib/services/mobile-api.ts`
  - `lib/services/mobile-app.ts`
- 已修复静态导出入口：
  - `app/page.tsx`
  - `app/role-select/page.tsx`
  两者使用客户端 `window.location.replace("/login")`，避免 `next/navigation redirect()` 在 static export 下生成 `__next_error__` shell。
- 已推送到 GitHub：
  - `5c6d3f2 fix: restore live backend data flow`
  - `cfb2b92 docs: record live vercel deployment`
- 当前线上已部署版本：
  - Production alias: `https://adrastea-one.vercel.app`
  - Deployment URL: `https://adrastea-5szttjkan-alex-xiangs-projects.vercel.app`
  - Deployment id: `dpl_HtYuSq1yCCrHbZJPju9r3CqjdfpD`
- 当前线上 smoke 当时通过：
  - `/`、`/role-select`、`/login`、`/teacher/home`、`/admin/home`、`/admin/course-settings/_/students` 均 200。
  - `/api/me` 当时返回后端 JSON `40101 Missing or invalid Authorization header`，说明当时的 `/api/*` rewrite 生效。
- `/review` 后发现两个问题，并已有本地未提交修复：
  - `vercel.json` 移除固定 shared dev rewrite。
  - `next.config.ts` 增加 Vercel 构建保护：生产 Vercel build 必须设置 `NEXT_PUBLIC_API_BASE_URL`。
  - `lib/services/http-core.ts` 的 admin debug log 改为非 production 才开启，并移除完整 `payload` 输出，只保留 `payloadSummary`。
  - `tests/service/http-core.test.ts` 增加“不输出完整 admin response payload”的测试。
  - `docs/ARCHITECTURE.md`、`docs/TOOLING.md`、`handoff/260430-vercel-static-deploy-handoff.md` 已同步本地新口径。

当前未提交文件：

- `docs/ARCHITECTURE.md`
- `docs/TOOLING.md`
- `handoff/260430-vercel-static-deploy-handoff.md`
- `lib/services/http-core.ts`
- `next.config.ts`
- `tests/service/http-core.test.ts`
- `vercel.json`
- `handoff/260430-handoff.md`
- 未跟踪本机文件：`helmor.json`，不要提交，除非用户明确要求。

最新本地验证：

- `npm test`：通过，unit / service / contract 共 164 个测试通过，3 个 skipped。
- `npm run lint`：通过，43 warnings，0 errors。
- `npm run build`：通过，生成 41 个静态页面。

## 3. 关键上下文

- 当前 workspace：`/Users/minxian/helmor/workspaces/InqAsst/adrastea`。
- 当前分支：`XJM034/vercel-deploy-skills`。
- 远端：`origin https://github.com/XJM034/InqAsst`。
- 基线分支：`origin/main`。
- 用户明确要求：只能从 `/Users/minxian/conductor/workspaces/inqasst/bordeaux` 拉取代码，不要修改或添加其内容。
- `/Users/minxian/conductor/workspaces/inqasst/bordeaux` 只能只读；不要在该目录运行会写文件的命令。
- 当前 repo 是 Next.js App Router + TypeScript + Tailwind + shadcn/ui。
- 生产交付是 static export，交付物看 `out/`。
- 本地 `next dev` 通过 `next.config.ts` proxy 到 `https://daoleme-dev.jxare.cn`。
- 迁移前 Vercel 部署是 mock prototype，所以用户看到“登录账号”和“展示账号”不一致。
- 当前已提交线上版本 `cfb2b92` 仍包含固定 `/api/* -> https://daoleme-dev.jxare.cn/api/*` rewrite；review 后本地已移除，但尚未提交、推送、重新部署。
- 当前本地 `next.config.ts` 会在 `process.env.VERCEL === "1"` 且缺少 `NEXT_PUBLIC_API_BASE_URL` 时抛错，防止静态生产部署误回退到 same-origin `/api`。
- 用户已明确补充：Vercel 正式部署内容应该依赖 GitHub `origin/main`。当前功能分支部署只可视为 Preview / smoke，不应继续作为最终 Production 来源。

## 4. 关键发现

- 原因确认：账号显示不一致不是“部署时接口没连上”的小配置问题，而是当前分支原本就是静态 mock prototype；`components/app/login-form.tsx` 之前走 `resolveLoginDestination(phone)`，`lib/services/mobile-app.ts` 之前从 `lib/mocks/mobile-data.ts` 返回假数据。
- 真实 API-backed 代码已从 `bordeaux` 迁回当前分支；现在登录走 `sendLoginCode` / `loginWithCode` / `selectCampusAfterLogin`。
- Vercel static export 下，固定 `/api/*` rewrite 可以让 smoke 通过，但会把生产域名固定连到 shared dev，这是 review 的 P1 风险。
- 浏览器端请求逻辑在 `lib/services/http-core.ts`：
  - 有 `NEXT_PUBLIC_API_BASE_URL` 且 mode 非 proxy 时会 direct 请求 `${API_BASE_URL}${path}`。
  - 无 public API base 且 mode 为 proxy 时，浏览器请求会落到 same-origin `/api/*`。
- 后续线上登录发现 `Failed to fetch`：后端对 `https://adrastea-one.vercel.app` 的 CORS 预检返回 `403 Invalid CORS request`。因此当前修复改为 Vercel `/api/*` external rewrite + `NEXT_PUBLIC_API_REQUEST_MODE=proxy`，避免浏览器 direct mode。
- Vercel Git 集成口径已用 Context7 查证：production branch 通常是 `main`；非 production 分支 push 生成 Preview，合并或推送到 production branch 才生成 Production。项目文档已改为 `origin/main` 是正式 Production 来源。
- `lib/services/http-core.ts` 原来会对 `/api/admin/me` 和 `/api/admin/home/summary` 打完整 `payload` 到 console，这是 P2 风险；本地已改为 production 不启用 debug，并移除完整 payload。
- 根路由 `/` 和 `/role-select` 不能用 `next/navigation redirect()`；static export 下会生成 `__next_error__` HTML。当前已用 client-side full page redirect 修复。

## 5. 未完成事项

1. 提交并推送当前本地 review 修复。
2. 在 Vercel production 环境配置 `NEXT_PUBLIC_API_BASE_URL`，指向要验证的真实后端地址；如果只是 shared dev 验收就明确写 `https://daoleme-dev.jxare.cn`，如果是内测/线上就必须换成对应后端。
3. 不再用功能分支 CLI production deploy 作为最终上线；应先将已验证改动合并到 `origin/main`，再由 Vercel Git integration 触发 Production。
4. 部署后重新 smoke：
   - `/`
   - `/role-select`
   - `/login`
   - `/teacher/home`
   - `/admin/home`
   - 登录流程
   - 浏览器网络面板确认 API 请求 direct 到 `NEXT_PUBLIC_API_BASE_URL`，而不是 same-origin `/api`。
5. 用真实账号验证“登录账号”和页面展示账号是否一致。
6. 如果登录后仍错人，记录账号、时间、页面、关键 `/api/*` 响应，转后端协同。

## 6. 建议接手路径

- 优先查看：
  - `git status --short --branch`
  - `git diff -- vercel.json next.config.ts lib/services/http-core.ts tests/service/http-core.test.ts docs/TOOLING.md docs/ARCHITECTURE.md`
  - `handoff/260430-vercel-static-deploy-handoff.md`
  - `vercel.json`
  - `next.config.ts`
  - `lib/services/http-core.ts`
- 先验证：
  - `npm test`
  - `npm run lint`
  - `npm run build`
  - `VERCEL=1 npm run build` 在没有 `NEXT_PUBLIC_API_BASE_URL` 时应该失败。
  - `VERCEL=1 NEXT_PUBLIC_API_BASE_URL=https://daoleme-dev.jxare.cn npm run build` 应该通过。
- 推荐动作：
  - 暂存当前 review 修复，不包含 `helmor.json`。
  - 用 `DAOLME_ALLOW_DOCS=1 git commit -m "fix: require explicit vercel api base"` 提交。
  - 推送 `origin XJM034/vercel-deploy-skills`。
  - 设置 Vercel production env `NEXT_PUBLIC_API_BASE_URL` 后重新 `vercel deploy --prod -y --scope alex-xiangs-projects`。
  - 部署完成后用 Node fetch 或浏览器 smoke，重点确认 HTML 非 `__next_error__`、API 请求目标正确。

## 7. 风险与注意事项

- 不要修改 `/Users/minxian/conductor/workspaces/inqasst/bordeaux`。它是只读来源，而且该目录本身已有大量 `.next` 和文档脏状态，不要参与本分支提交。
- 不要提交 `helmor.json`；它是当前 workspace 的未跟踪本机文件。
- 当前线上 `https://adrastea-one.vercel.app` 仍是 `cfb2b92` 的部署结果，尚未包含本地 review 修复。
- 如果移除 `vercel.json` rewrite 但没有设置 `NEXT_PUBLIC_API_BASE_URL` 就部署，浏览器会请求 same-origin `/api/*`，静态站点没有 API 路由，登录会失败。当前 `next.config.ts` 已加 Vercel build guard 来阻止这个情况。
- `npm run lint` 仍有 43 个 warning，是当前迁移后的既有 warning，不是本地 review 修复新增 error。
- Vercel 环境变量设置和实际生产后端地址是当前最大不确定点。不要把 shared dev smoke 结论写成内测/线上结论。
- `docs/TOOLING.md` 和 `docs/ARCHITECTURE.md` 是本机文档防误推保护范围，提交时需要 `DAOLME_ALLOW_DOCS=1`。

下一位 Agent 的第一步建议：
先运行 `git diff -- vercel.json next.config.ts lib/services/http-core.ts tests/service/http-core.test.ts` 确认本地 review 修复范围，然后用 `VERCEL=1 npm run build` 和 `VERCEL=1 NEXT_PUBLIC_API_BASE_URL=https://daoleme-dev.jxare.cn npm run build` 验证构建 guard，再提交、推送并重新部署。
