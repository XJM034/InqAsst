# 到了么后端协同入口

更新日期：2026-04-29

## 用途

本目录管理前后端接口、字段、权限、错误码、shared dev 稳定性和后端待办。

- 当前仍需后端处理的问题：读 `current-issues.md`。
- 历史本机 daoleme、dev RDS、CORS、性能 benchmark、旧联调证据：读 `history/`。
- 前端质量状态和回归门禁：读 `../quality/`。

## 协作原则

- shared dev 结论用于开发复现和诊断，不能直接写成内测 / 线上结论。
- 后端字段差异优先在 `lib/services/` 适配；不要用 mock 冒充接口接通。
- 接口缺口、权限口径、错误码和稳定性问题要写进 `current-issues.md`，不要只留在 handoff 或聊天里。
- 已解决的周期性联调记录移入 `history/`，入口只保留当前判断和阅读地图。

## 目录地图

- `current-issues.md`：当前后端协同问题和需要 KT 处理的事项。
- `history/README.md`：历史协同材料索引。
- `history/2026-04-29-backend-collab-source.md`：原后端协同大文档全量迁移快照。

## 当前关注点

- 教师端点名补录临时学生接口仍需 shared dev 后端复核。
- 合班 / 互换需要后端最终态校验和原子提交能力。
- 系统内代课老师写链仍存在冲突判断异常风险。
- shared dev 慢响应、间歇性超时和接口稳定性问题仍需独立记录。

## 更新规则

- 新增或变化的后端问题：更新 `current-issues.md`。
- 某轮联调形成大量证据：新增 `history/YYYY-MM-DD-topic.md`。
- 质量状态或回归口径变化：同步 `../quality/README.md` 或 `../quality/regression-checklist.md`。
- 文档分层或读取顺序变化：同步 `../README.md`、`../../AGENTS.md`、`../../CLAUDE.md`。
