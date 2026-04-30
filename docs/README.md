# 到了么文档导航（内测期）

更新日期：2026-04-30

## 当前阶段

- 项目已上线并进入内测期（用户于 2026-04-28 确认）。
- 早期“上线前”材料已改用稳定续名；历史判断只作为证据背景，不表示项目仍处于上线前。
- 内测期工作优先关注真实反馈复现、回归验证、缺陷修复、后端协同和小步迭代。
- handoff 是会话接力上下文，不能替代代码、接口和部署环境核验。

## 推荐读取顺序

1. 最新 `../handoff/*-handoff.md`
2. `AGENTS.md` / `CLAUDE.md`
3. `docs/TOOLING.md`
4. `docs/PRODUCT.md`
5. `docs/ARCHITECTURE.md`
6. 涉及内测反馈、测试或发布门禁时读 `docs/quality/` / `docs/quality/regression-checklist.md`
7. 涉及接口、权限、字段或稳定性时读 `docs/backend-collab/`
8. 与当前问题同日或同主题的 dated 文档
9. 设计稿、页面对比、接口冲突、归档材料

## 文档分层

### 根规则层

- `AGENTS.md`
- `CLAUDE.md`

稳定、高频、必须执行的协作规则。两份文档默认保持镜像；如果项目阶段、验证口径、文档结构、路由 / 权限 / session 模型等发生变化，重新运行 `$claude-agents-bootstrap` 同步。

### 会话交接层

- `../handoff/*-handoff.md`

记录最近一次工作的目标、进展、风险和下一步。fresh session 先读最新 handoff，但所有关键事实仍需回到代码、接口和当前文档核验。

### 产品与架构层

- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`

稳定说明产品定位、角色、当前范围、技术架构、路由边界、数据流、静态导出和测试分层。产品边界或架构边界变化时优先更新这两份文件，再同步根文档。

### Tooling 与反馈环层

- `docs/TOOLING.md`

面向 agent 的可执行地图：package scripts、CI、Playwright、lint、静态导出、GitHub 同步、Vercel 部署源、本机文档防误推、配置入口、已有守卫和缺口。命令、测试、CI、反馈环、GitHub / Vercel 推送部署规则或 guardrail 变化时更新这里。

### 内测质量状态层

- `docs/quality/`

当前内测质量 / 回归状态入口，由原上线前自动化测试执行稿续名而来。适合记录测试策略、shared dev 诊断口径、已知结论、阻塞项、回归范围和阶段判断；不作为每个 fresh session 的必读全文。

### 发布门禁与人工验收层

- `docs/quality/regression-checklist.md`

内测期回归基线、发布前门禁和人工写流验收清单。该文件只保留最新指导，历史实测流水放入 `docs/quality/history/`。

### 后端协同层

- `docs/backend-collab/`

面向后端同学的协同材料。接口缺口、shared dev 或内测环境后端问题、字段口径、错误码、权限校验、稳定性问题写入当前问题清单；历史联调证据放入 `docs/backend-collab/history/`。

### 静态导出与交付约束层

- `docs/static-export-navigation-rsc-fix_20260417.md`
- `docs/static-export-delivery-constraint_20260418.md`

解释 `output: "export"`、`out/` 静态产物、Vercel Production 依赖 GitHub `origin/main` 的部署源、站内导航约束、`_rsc` / `__next.*.txt` 404 背景和部署注意事项。涉及导航、登录跳转、保存后回流、动态详情页或部署配置时必须对照。

### 专项证据层

- `docs/*_YYYYMMDD.md`

按日期记录专项验证、业务闭环、账号矩阵、特定问题复查等证据。内测期遇到明确专项问题，优先新增 dated 文档，而不是把大量细节塞回根文档。

### 设计与对齐参考层

- `docs/页面对比报告/`
- `docs/接口与mock冲突报告/`
- `docs/静态数据转真实/`
- `docs/superpowers/`
- `../设计文档_v1.9_开发指导.md`
- `../移动端开发计划_v1.md`
- `../design.pen`

低频参考材料。用于理解产品意图、页面差异、历史 mock 到真实数据迁移、设计对齐，不作为当前事实的唯一来源。

### 归档层

- `docs/archive/`

旧根文档、旧设计稿、旧联调缺口、本机 `daoleme` 联调历史等。只有追溯历史决策或排查旧问题时读取，不作为当前默认工作流。

## 更新规则

- 内测反馈状态、回归结论、阶段判断变了：更新 `docs/quality/` 或新增 dated 文档。
- 产品范围、角色、内测反馈口径变了：更新 `docs/PRODUCT.md`。
- 架构、路由、数据流、静态导出、测试分层变了：更新 `docs/ARCHITECTURE.md`。
- 命令、CI、测试、反馈环或 guardrail 变了：更新 `docs/TOOLING.md`。
- GitHub 远端、PR 流程、Vercel 部署源、本机文档防误推或备份规则变了：更新 `docs/TOOLING.md`。
- 门禁、回归清单、人工验收项变了：更新 `docs/quality/regression-checklist.md`。
- 需要后端配合、接口口径、稳定性问题变了：更新 `docs/backend-collab/`。
- 静态导出、部署、导航约束变了：更新静态导出相关文档。
- 文档分层、读取顺序、文件职责变了：更新本文件，并同步 `AGENTS.md` / `CLAUDE.md`。
- 结束一天工作或准备换会话：写新的 handoff 到根目录 `handoff/`。

## 证据口径

- 内测 / 线上环境结论：来自真实内测或线上环境。
- 本机 shared dev 结论：来自 `next dev` + proxy 到 `https://daoleme-dev.jxare.cn`，用于开发复现和诊断。
- 静态导出结论：来自 `npm run build` 生成的 `out/` 或等价静态部署环境。
- Vercel Production 结论：来自 GitHub `origin/main` 触发的 Production Deployment；功能分支或本机 CLI production deploy 只能记为 Preview / smoke 证据。当前线上 API 通过 Vercel `/api/*` external rewrite 代理到 shared dev 后端，避免后端 CORS 导致登录 `Failed to fetch`。
- 代码静态判断：只能说明实现形态，不能替代真实环境验证。

以上四类证据不能混写。
