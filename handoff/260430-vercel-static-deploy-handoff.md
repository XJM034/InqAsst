# Handoff

## 1. 当前任务目标

- 为当前 `XJM034/vercel-deploy-skills` 分支准备 Vercel 静态部署。
- 部署模式已确认：Next.js 静态导出 `out/`，通过当前 GitHub 远端 `https://github.com/XJM034/InqAsst` 推送。
- 已安装 Vercel 部署 skill：`~/.agents/skills/deploy-to-vercel`。
- 2026-04-30 追加修复：当前分支已从只读来源 `/Users/minxian/conductor/workspaces/inqasst/bordeaux` 迁回真实后端接口版本；不要再把本分支当 mock prototype。

## 2. 已完成

- `next.config.ts` 已开启 `output: "export"`。
- 新增 `vercel.json`：
  - `framework`: `null`
  - `cleanUrls`: `true`
  - `buildCommand`: `npm run build`
  - `outputDirectory`: `out`
  - `rewrites`: `/api/:path*` -> `https://daoleme-dev.jxare.cn/api/:path*`
- 已恢复真实 service / adapter / auth session / API client 代码路径：
  - 登录走 `sendLoginCode` / `loginWithCode` / `selectCampusAfterLogin`。
  - 页面数据走 `lib/services/mobile-app.ts` -> `mobile-api.ts` -> 后端接口。
  - 已删除旧 prototype 的 `lib/mocks/mobile-data.ts` 路径。
- 修复静态导出阻塞：
  - `/` 与 `/role-select` 改为客户端整页跳转到 `/login`。
  - 动态管理端路由补齐 `generateStaticParams()`。
  - 老师端点名 / 名单 query 读取下沉到 client 组件，避免服务端 `searchParams` 阻塞静态导出。
- 文档已同步到当前 GitHub + Vercel 静态部署口径。

## 3. 验证结果

- `npm ci`：通过；有 `eslint-visitor-keys@5.0.1` 对 Node `v23.11.0` 的 EBADENGINE warning，以及 `npm audit` 报 4 个漏洞。
- `npm test`：通过，unit / service / contract 共 163 个测试通过，3 个 skipped。
- `npm run lint`：通过；当前有 43 个 warning，0 error。
- `npm run build`：通过，生成 41 个静态页面，产物目录为 `out/`。
- Vercel 生产部署：通过。
  - 稳定生产别名：`https://adrastea-alex-xiangs-projects.vercel.app`
  - Vercel alias：`https://adrastea-one.vercel.app`
  - 本次部署 URL：`https://adrastea-5szttjkan-alex-xiangs-projects.vercel.app`
  - Vercel deployment id：`dpl_HtYuSq1yCCrHbZJPju9r3CqjdfpD`
- 部署后 HTTP smoke：`/`、`/role-select`、`/login`、`/teacher/home`、`/admin/home`、`/admin/course-settings/_/students` 均 200，且 HTML 不含 `__next_error__`。
- 部署后 API smoke：`/api/me` 返回后端 JSON `40101 Missing or invalid Authorization header`，说明 Vercel `/api/*` rewrite 已生效，不是静态 404。

## 4. 下一步

1. 用真实账号重新登录验证“登录账号”和页面展示账号一致。
2. 如果登录后仍显示错人，记录账号、时间、页面、接口响应，再交给后端协同。
3. 打开浏览器网络面板或用部署后 QA 继续确认没有 `?_rsc=` / `__next.*.txt` 404。

## 6. Vercel 构建记录

- 第一次 Vercel 生产部署 `dpl_CQceFd7ekeK69fjvusnCFk16F7Gs` 失败：Vercel 自动按 Next.js preset 处理，并在 `out/` 中查找 `routes-manifest.json`。
- 已按 Vercel 文档把 `vercel.json` 增加为 `framework: null`，让 Vercel 以 Other 静态站点方式发布 `out/`。
- 第二次部署 `dpl_91jAJ5ChzPrUAU32X9yViHCDoWCf` 构建成功；公开访问子路由曾返回 404，原因是 Next export 生成 `*.html` 文件而 Vercel 静态模式需要 clean URL 映射。已补 `cleanUrls: true`。
- 第三次部署 `dpl_8DLVyYqssULLxs7xss41h4jchEfT` 成功，状态 Ready。
- 发现问题：该部署仍是早期 mock prototype，页面展示账号来自 `lib/mocks/mobile-data.ts`，没有连真实后端。
- 已从 `bordeaux` 只读复制真实 API-backed 前端源码到当前 `adrastea`；未修改 `/Users/minxian/conductor/workspaces/inqasst/bordeaux`。
- 第四次部署 `dpl_2kf89iVbR6BJVq7s2qTyos1d71jJ` 成功，恢复真实接口链路和 `/api/*` rewrite；发现 `/` 静态 HTML 仍是 Next error shell。
- 第五次部署 `dpl_HtYuSq1yCCrHbZJPju9r3CqjdfpD` 成功，修复 `/` 与 `/role-select` 静态导出入口，最终 smoke 通过。
- Vercel SSO Deployment Protection 已关闭：`ssoProtection: null`。Git fork protection 仍开启。
- HTTP smoke 结果：
  - `https://adrastea-alex-xiangs-projects.vercel.app/login` -> 200
  - `https://adrastea-alex-xiangs-projects.vercel.app/teacher/home` -> 200
  - `https://adrastea-alex-xiangs-projects.vercel.app/admin/home` -> 200
  - 本次部署 URL 下 `/`、`/login`、`/teacher/home`、`/teacher/attendance/demo?day=wed&course=substitute`、`/admin/home`、`/admin/course-settings/featured-course/students` 均返回 200。

## 5. 注意事项

- `node_modules/`、`.next/`、`out/` 是本地生成物，不要提交。
- 当前静态部署是 preview/上线验证准备；真实内测或线上业务结论仍需在部署 URL 上单独验收。
- `bordeaux` 是只读代码来源；不要在 `/Users/minxian/conductor/workspaces/inqasst/bordeaux` 修改或新增内容。
