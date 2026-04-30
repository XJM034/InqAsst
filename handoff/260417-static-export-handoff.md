# Handoff

## 当前任务

- 已完成一轮“静态导出兼容导航”改造，目标是修复部署后管理端出现的大量 `_rsc` / `__next.*.txt` 404。

## 已完成

- 新增：
  - `components/app/static-link.tsx`
  - `lib/static-navigation.ts`
- 已把项目里的 `next/link`、`router.push`、`router.replace`、`router.refresh` 清理为静态导出可用方案。
- 重点改造范围：
  - 管理端底部 tab 与子页返回
  - 管理端首页、总控、时间设置、课程设置、老师设置、学生编辑/新增等入口
  - 登录失效、退出登录、切校区、静态占位路由重定向
- 已补专项记录：
  - `docs/static-export-navigation-rsc-fix_20260417.md`

## 本地验证

- `cmd /c npm run build`：通过
- `cmd /c npm test`：通过
- `cmd /c npm run lint`：未通过，但仍是仓库已有 lint 问题，未新增新的 lint 类阻塞结论

## 仍需做

1. 把当前改造推到用于静态部署验证的分支/环境。
2. 实测复核这些页面不再出现 `_rsc` 404：
   - `/admin/home`
   - `/admin/control`
   - `/admin/time-settings`
   - `/admin/course-settings`
   - `/admin/me`
   - `/admin/emergency`
3. 若线上仍有 404，优先检查是否还有浏览器缓存旧 bundle 或旧 HTML。

## 风险与注意事项

- 当前工作区仍然很脏，包含大量 `.next/` 与 `out/` 产物，不要误把这些本地产物当成本次源码改造本身。
- 不要再把 `next dev` 的客户端导航行为当作静态导出部署的等价验证。
- `out/` 现在不能再被忽略；发布时必须完整带上。
