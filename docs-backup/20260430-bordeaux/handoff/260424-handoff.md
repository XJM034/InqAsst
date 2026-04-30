# Handoff

## 1. 当前任务目标

- 用户要求先取消前端新增的管理端日期切换功能。
- 本轮收口范围：
  - 管理端首页 `/admin/home`
  - 管理端课程管理 `/admin/control`
  - 管理端未到学生管理 `/admin/unarrived`

## 2. 已完成

- 已撤回管理端日期切换前端能力：
  - 移除日期切换控件
  - 移除 `date=YYYY-MM-DD` 在首页、总控、未到学生之间的传递
  - 恢复管理端首页、总控、未到学生的默认今日口径
- 已删除本轮日期功能专项验证文档。
- 保留一个不依赖日期功能的小文案修正：
  - 未到学生标题为“当前共 N 名学生待确认未到情况”

## 3. 文档更新

- `docs/inqasst-automation-testing-execution-plan.md` 已记录日期切换撤回。
- `docs/上线前测试清单_20260414.md` 已说明当前不包含管理端跨日期切换专项。

## 4. 注意事项

- 当前不应把 `date=YYYY-MM-DD` 作为 `/admin/home`、`/admin/control`、`/admin/unarrived` 的发布验收范围。
- `npm run build` 会刷新 `.next/` 与 `out/`，提交前仍建议按 source-only 范围整理，避免误混生成物。
