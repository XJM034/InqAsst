# 到了么代理指南

## 目的

- 维护“到了么”v1：移动优先 H5/PWA，老师端与管理端分流。
- 项目已上线进入内测期；工作重心是真实反馈复现、回归验证、缺陷修复和小步迭代。
- 根文档只保留稳定规则和读取地图；细节进 `docs/`，会话上下文进最新 `./handoff/*-handoff.md`。
- 任何“已实现”“已上线”“已推送”“与后端一致”的结论，都必须回到代码、接口、部署环境和文档证据核验。

## 首先阅读

1. 最新 `./handoff/*-handoff.md`
2. `docs/README.md`
3. `docs/TOOLING.md`
4. `docs/PRODUCT.md`
5. `docs/ARCHITECTURE.md`
6. 涉及内测反馈、测试或发布门禁时读 `docs/quality/` / `docs/quality/regression-checklist.md`
7. 涉及接口、权限、字段或稳定性时读 `docs/backend-collab/`
8. 相关 dated 文档或 archive 材料

## 命令

- 启动：`npm run dev`
- token：`npm run sync:tokens`
- 基线：`npm test`
- lint：`npm run lint`
- 静态导出：`npm run build`
- shared dev smoke：`npm run test:e2e:smoke`
- 写链专项：`npm run test:e2e:write-live`，执行前确认真实写入影响

## Load Map

- 产品边界：`docs/PRODUCT.md`
- 架构与数据流：`docs/ARCHITECTURE.md`
- agent-readable tooling / guardrails / gaps：`docs/TOOLING.md`
- 内测质量状态与回归结论：`docs/quality/`
- 发布门禁与人工验收清单：`docs/quality/regression-checklist.md`
- 后端协同：`docs/backend-collab/`
- 静态导出约束：`docs/static-export-navigation-rsc-fix_20260417.md`、`docs/static-export-delivery-constraint_20260418.md`
- 低频历史材料：`docs/archive/`、`docs/页面对比报告/`、`docs/接口与mock冲突报告/`、`docs/静态数据转真实/`

## Agent-Readable Tooling

- package scripts、CI、Playwright 报告、配置入口和已知守卫统一看 `docs/TOOLING.md`。
- 已有硬守卫：`npm test`、`npm run lint`、`npm run build`、GitHub Actions quality gates。
- 已有 QA 面：Playwright mobile smoke，失败产物在 `test-results/playwright/`。
- 已知缺口：无 docs link checker；无生产观测文档；mock 禁止与静态导航禁令主要靠 review / 文档约束。

## Stable Constraints

- 当前仓库是 Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui 前端仓库。
- 构建态 `next.config.ts` 开启 `output: "export"`；本地 `next dev` 为启用同源 proxy 不设置静态导出 output。交付物以 `out/` 为准，不把 `next dev` 当上线等价验证。
- 路由主干：`/login`、`/teacher/*`、`/admin/*`；`/role-select` 仅兼容跳转。
- session 通过 `inqasst_*` cookies 持久化；多校区管理员先选校区再进 `/admin/*`。
- 页面数据走 `lib/services/`；领域规则在 `lib/domain/`；默认已接后端数据。
- 本地复现默认 `next dev` proxy 到 `https://daoleme-dev.jxare.cn`；内测 / 线上结论必须和 shared dev 诊断分开。
- 当前 workspace 默认代码同步通道是 GitHub：`origin` -> `https://github.com/XJM034/InqAsst`，默认分支约定是 `main`。
- GitHub 推送、PR、本机文档防误推和备份规则见 `docs/TOOLING.md`；推送前核对当前分支、upstream 与目标远端。

## Work Rules

- fresh session 先读最新 `./handoff/*-handoff.md`；handoff 只补上下文，不替代 repo 核验。
- 内测反馈要记录真实环境、账号角色、页面路径、操作时间、接口表现。
- 接口缺口、字段错配、权限或稳定性问题先补 service 适配或后端协作文档，不用 mock 冒充接通。
- 静态部署主路径不要重新引入 `next/link`、`router.push`、`router.replace`、`router.refresh`；优先复用静态导出兼容方案。
- 前端和后端分开提交、分开推送；不要把后端改动混进前端仓库。
- 本机前端 / AI 协作文档默认不推远端；后端协同文档 `docs/backend-collab/**` 与 `docs/后端协同说明_20260414.md` 默认允许推送。

## Update Rules

- 产品边界变了：更新 `docs/PRODUCT.md`
- 架构、路由、数据流变了：更新 `docs/ARCHITECTURE.md`
- 命令、CI、测试、guardrail 变了：更新 `docs/TOOLING.md`
- GitHub 同步规则、本机文档防误推或备份规则变了：更新 `docs/TOOLING.md`
- 质量状态、回归结论、验证口径、阶段判断变了：更新 `docs/quality/` 或新增 dated 文档
- 发布门禁、回归清单、人工验收项变了：更新 `docs/quality/regression-checklist.md`
- 后端接口、字段、权限、稳定性问题变了：更新 `docs/backend-collab/`
- 文档分层或读取顺序变了：更新 `docs/README.md`，并同步 `AGENTS.md` / `CLAUDE.md`
- 结束一天工作或准备换会话：写新的 handoff 到 `./handoff/`

## Bootstrap Refresh

重新运行 `$claude-agents-bootstrap` 的触发条件：

- 项目阶段、角色、权限、auth/session、路由、部署或验证流程变化
- 数据源、schema、后端契约、安全边界或静态导出约束变化
- 文档结构、工具链、命令、CI、guardrail 或反馈环变化
- 大分支收尾、准备 handoff、准备 merge / MR，且根文档可能不再准确

## 禁止

- 不要把计划目标或历史上线前结论写成当前内测事实。
- 不要手改 `app/pencil-tokens.css`。
- 不要新增 `lib/mocks/`，也不要塞本地假数据伪造后端接通。
- 不要把本机 shared dev 结论直接写成内测 / 线上结论。
- 不要直接在原始 `daoleme` 仓库上做联调修改。
- 不要让 `CLAUDE.md` 和 `AGENTS.md` 失去同步。

## 压缩指令

项目已上线进入内测；先读最新 `./handoff/*-handoff.md`，再读 `docs/README.md`、`docs/TOOLING.md`、产品、架构；涉及反馈 / 回归 / 门禁再读 `docs/quality/` 和 `docs/quality/regression-checklist.md`，涉及接口再读 `docs/backend-collab/`。当前是静态导出前端，交付看 `out/`。默认已接后端数据，不新增 mock。内测反馈区分真实环境、shared dev、静态产物和代码判断。改代码后同步相关 docs，并至少跑 `npm test`、`npm run lint`、`npm run build`。
