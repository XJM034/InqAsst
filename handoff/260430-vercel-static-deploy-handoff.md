# Handoff

## 1. 当前任务目标

- 为当前 `XJM034/vercel-deploy-skills` 分支准备 Vercel 静态部署。
- 部署模式已确认：Next.js 静态导出 `out/`，通过当前 GitHub 远端 `https://github.com/XJM034/InqAsst` 推送。
- 已安装 Vercel 部署 skill：`~/.agents/skills/deploy-to-vercel`。

## 2. 已完成

- `next.config.ts` 已开启 `output: "export"`。
- 新增 `vercel.json`：
  - `framework`: `null`
  - `cleanUrls`: `true`
  - `buildCommand`: `npm run build`
  - `outputDirectory`: `out`
- 修复静态导出阻塞：
  - `/` 与 `/role-select` 改为客户端整页跳转到 `/login`。
  - 动态管理端路由补齐 `generateStaticParams()`。
  - 老师端点名 / 名单 query 读取下沉到 client 组件，避免服务端 `searchParams` 阻塞静态导出。
- 文档已同步到当前 GitHub + Vercel 静态部署口径。

## 3. 验证结果

- `npm ci`：通过；有 `eslint-visitor-keys@5.0.1` 对 Node `v23.11.0` 的 EBADENGINE warning，以及 `npm audit` 报 4 个漏洞。
- `npm run lint`：通过。
- `npm run build`：通过，生成 51 个静态页面，产物目录为 `out/`。
- Vercel 生产部署：通过。
  - 稳定生产别名：`https://adrastea-alex-xiangs-projects.vercel.app`
  - 本次部署 URL：`https://adrastea-ia3vq610b-alex-xiangs-projects.vercel.app`
  - Vercel deployment id：`dpl_8DLVyYqssULLxs7xss41h4jchEfT`
- 当前分支没有 `npm test` / e2e 脚本；不要把旧文档中的测试脚本当成本分支已配置门禁。

## 4. 下一步

1. 提交并推送当前分支到 GitHub。
2. 使用 Vercel CLI 或 Vercel 控制台导入 GitHub 仓库。
3. 若使用 CLI：
   - `npx vercel login`
   - `npx vercel link --repo`
   - `npx vercel --prod`
4. 拿到部署 URL 后，至少验证：
   - `/login`
   - `/teacher/home`
   - `/teacher/attendance/demo?day=wed&course=substitute`
   - `/admin/home`
   - `/admin/course-settings/featured-course/students`
5. 打开浏览器网络面板或用部署后 QA 确认没有 `?_rsc=` / `__next.*.txt` 404。

## 6. Vercel 构建记录

- 第一次 Vercel 生产部署 `dpl_CQceFd7ekeK69fjvusnCFk16F7Gs` 失败：Vercel 自动按 Next.js preset 处理，并在 `out/` 中查找 `routes-manifest.json`。
- 已按 Vercel 文档把 `vercel.json` 增加为 `framework: null`，让 Vercel 以 Other 静态站点方式发布 `out/`。
- 第二次部署 `dpl_91jAJ5ChzPrUAU32X9yViHCDoWCf` 构建成功；公开访问子路由曾返回 404，原因是 Next export 生成 `*.html` 文件而 Vercel 静态模式需要 clean URL 映射。已补 `cleanUrls: true`。
- 第三次部署 `dpl_8DLVyYqssULLxs7xss41h4jchEfT` 成功，状态 Ready。
- Vercel SSO Deployment Protection 已关闭：`ssoProtection: null`。Git fork protection 仍开启。
- HTTP smoke 结果：
  - `https://adrastea-alex-xiangs-projects.vercel.app/login` -> 200
  - `https://adrastea-alex-xiangs-projects.vercel.app/teacher/home` -> 200
  - `https://adrastea-alex-xiangs-projects.vercel.app/admin/home` -> 200
  - 本次部署 URL 下 `/`、`/login`、`/teacher/home`、`/teacher/attendance/demo?day=wed&course=substitute`、`/admin/home`、`/admin/course-settings/featured-course/students` 均返回 200。

## 5. 注意事项

- `node_modules/`、`.next/`、`out/` 是本地生成物，不要提交。
- 当前静态部署是 preview/上线验证准备；真实内测或线上业务结论仍需在部署 URL 上单独验收。
- 如果后续恢复后端真实接口与测试工程，需要再更新 `docs/TOOLING.md`、`docs/ARCHITECTURE.md` 和发布门禁。
