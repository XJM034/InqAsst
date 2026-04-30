# 到了么技术架构

更新日期：2026-04-30

## 技术栈

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui + Lucide 图标
- ESLint + Vitest + Playwright
- 静态导出：构建态 `next.config.ts` 开启 `output: "export"`，交付物以 `out/` 为准
- Vercel 静态部署：`vercel.json` 指向 `npm run build` 和 `out`，并将 `/api/*` rewrite 到 shared dev 后端
- 设计 token：`../design.pen` -> `../scripts/sync-pencil-tokens.mjs` -> `../app/pencil-tokens.css`

## 顶层目录

- `app/`：App Router 页面，分为 `/login`、`/teacher/*`、`/admin/*`。
- `components/app/`：业务组件和页面客户端交互组件。
- `components/ui/`：shadcn/ui 基础组件。
- `lib/domain/`：领域类型与规则。
- `lib/services/`：API client、schema、adapter、session、auth、HTTP 基础能力。
- `lib/static-navigation.ts`：静态导出兼容跳转。
- `docs/`：项目文档、内测质量、后端协同、静态导出约束与历史归档。

## 路由边界

- `/login`：登录入口。
- `/role-select`：兼容跳转保留，不作为主入口。
- `/teacher/*`：老师端首页、点名、合班点名、无课状态、个人页。
- `/admin/*`：管理端首页、总控、未到学生、课程设置、老师设置、时间设置、个人页。

新增路由时必须确认：

- 是否属于老师端或管理端。
- 是否依赖 session / campus 上下文。
- 静态导出下是否能通过普通链接或整页跳转工作。
- 保存后回流是否使用静态导出兼容方案。

## 数据流

```text
页面 app/*
  -> 业务组件 components/app/*
  -> service / adapter lib/services/*
  -> 后端 API
  -> domain 规则 lib/domain/*
  -> 页面状态与展示
```

- 页面数据统一经 `lib/services/` 获取和适配。
- 后端字段差异优先在 service / adapter 层处理，不在页面里堆临时转换。
- 不新增 `lib/mocks/`，不在页面、service 或 adapter 里塞本地假数据冒充后端数据。

## API 与环境

- 本地开发默认：`next dev` 同源 proxy 到 `https://daoleme-dev.jxare.cn`。
- `next.config.ts` 根据 `API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL` 和 `API_REQUEST_MODE` / `NEXT_PUBLIC_API_REQUEST_MODE` 决定 dev proxy；开发态不设置静态导出 output，构建态仍输出 `out/`。
- Vercel 静态部署由 `vercel.json` 负责 `/api/:path*` -> `https://daoleme-dev.jxare.cn/api/:path*`，部署后的浏览器端数据请求仍使用真实后端接口。
- 浏览器端和服务端 HTTP 逻辑集中在 `lib/services/http-*`。
- shared dev 结论用于开发复现和诊断，不等同于真实内测 / 线上环境结论。

## Auth 与 Session

- 登录后通过 `inqasst_*` cookies 持久化身份信息。
- 多校区管理员必须先完成校区选择，再进入 `/admin/*`。
- 任何身份、角色、校区、权限口径变化，都要同步根文档、回归清单和后端协同目录。

## 静态导出约束

- 交付物以 `npm run build` 生成的 `out/` 为准。
- 不把 `next dev` 客户端导航行为当成上线等价验证。
- 主路径不要重新引入 `next/link`、`router.push`、`router.replace`、`router.refresh` 等依赖 App Router 运行时导航的写法。
- 站内跳转优先使用 `components/app/static-link.tsx` 与 `lib/static-navigation.ts`。
- 相关背景见 `docs/static-export-navigation-rsc-fix_20260417.md` 和 `docs/static-export-delivery-constraint_20260418.md`。

## 测试分层

- `npm run lint`：代码规范。
- `npm test`：Vitest unit / service / contract 基础门禁。
- `npm run test:e2e:smoke`：Playwright mobile smoke，排除真实写入。
- `npm run test:e2e:write-live`：真实写链专项，执行前确认环境和写入影响。
- `npm run build`：静态导出产物验证。
- 涉及真实内测反馈时，还必须记录真实环境复现结果；若只完成本机复现，必须写清边界。

## 文档同步边界

- 产品范围、角色、内测反馈口径变化：更新 `docs/PRODUCT.md`。
- 架构、目录、路由、数据流、静态导出、测试门禁变化：更新 `docs/ARCHITECTURE.md`。
- 命令、CI、测试、反馈环或 guardrail 变化：更新 `docs/TOOLING.md`。
- 文档分层、读取顺序、根规则变化：同步 `docs/README.md`、`AGENTS.md`、`CLAUDE.md`。
