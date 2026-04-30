# 静态导出导航与 RSC 404 修复记录

更新日期：2026-04-17

## 背景

- 当前前端使用 Next.js App Router，并开启了 `output: "export"`。
- 线上部署方式是直接发布 `out/` 静态产物。
- 已观察到已部署站点进入管理端后出现一批 `?_rsc=...` 请求 404，典型请求形态包括：
  - `/admin/me/__next.admin.me.txt?_rsc=...`
  - `/admin/control/__next.admin.control.__PAGE__.txt?_rsc=...`
  - `/admin/time-settings/__next.admin.time-settings.txt?_rsc=...`

## 根因结论

- 本地 `next dev` 会动态处理 App Router 的客户端导航与 `router.refresh()` 相关请求，因此本地不容易复现。
- 静态导出部署后，服务器只能按 `out/` 中的实际文件路径返回静态文件，无法像 Next server 一样兜底处理 `_rsc` 导航请求。
- 现网 404 的主要来源不是首屏 HTML，而是以下两类运行时行为：
  - `next/link` 触发的客户端导航与自动预取
  - `router.push` / `router.replace` / `router.refresh` 触发的 App Router 导航刷新

## 本次改造

- 新增 `components/app/static-link.tsx`
  - 统一用普通 `<a>` 渲染站内跳转，避免 `next/link` 的预取与客户端导航。
- 新增 `lib/static-navigation.ts`
  - 提供 `navigateTo()` 与 `reloadPage()`，在静态导出站点里使用整页跳转或整页刷新。
- 已把高频导航入口切到静态导出安全模式，包括：
  - 管理端底部 tab、子页返回头部
  - 管理端首页、总控、课程设置、时间设置、老师设置、学生表单等页面中的站内链接
  - 登录失效、退出登录、切校区、表单保存后返回列表、静态导出占位路由跳转
- 已去除项目中的 `next/link`、`router.push`、`router.replace`、`router.refresh` 残留调用。

## 本地验证

- `npm run build`：通过
- `npm test`：通过
- `npm run lint`：未全绿，但当前失败仍是仓库已有问题，主要包括：
  - `app/admin/home/page.tsx`
  - `components/app/admin-course-teachers-client.tsx`
  - `components/app/admin-time-setting-picker-client.tsx`

## 2026-04-22 复核补充

- 本轮重新核对 `next.config.ts` 与 `npm run build`，确认仓库当前仍然在静态导出模式下产出 `out/`，因此“前端没有静态导出”这个判断不成立。
- 但确实发现新增页面里仍可能回流出不兼容写法：
  - `/admin/course-settings/new-course`
  - `/admin/course-settings/alternate-day`
- 这两页本轮已把残留的 `router.push(...)` 改回静态导出兼容跳转，避免再次把 `next dev` 下可用、静态部署下可能触发问题的导航模式带回主路径。
- 后续结论应区分：
  - 仓库现实：已经开启静态导出并可生成静态产物
  - 持续约束：新增页面不能重新引入依赖 App Router 运行时导航的写法

## 仍需验证

- 本次只完成了源码层改造和本地构建验证。
- 还需要在实际静态部署环境复测以下页面，确认 `_rsc` 404 不再出现：
  - `/admin/home`
  - `/admin/control`
  - `/admin/time-settings`
  - `/admin/course-settings`
  - `/admin/me`
  - `/admin/emergency`

## 备注

- 本次改造的目标是让静态导出站点避免走 App Router 运行时导航，而不是修改后端接口。
- 若后续继续坚持静态导出部署方式，应优先使用：
  - 普通链接 `<a>`
  - `window.location.assign/replace`
  - 必要时整页 `reload`
- 不应再把 `next dev` 的行为当作静态导出上线行为的等价验证。
