# 到了么质量文档入口

更新日期：2026-04-29

## 用途

本目录管理内测期质量状态、回归验证、发布门禁和历史测试证据。

- 当前质量状态和阻塞：读本文。
- 最新回归 / 发布前执行口径：读 `regression-checklist.md`。
- 历史实测记录、benchmark、账号矩阵、旧执行稿：读 `history/`。
- 后端接口、字段、权限、稳定性问题：转到 `../backend-collab/`。

不要把历史绿灯写成当前内测事实。任何“已闭环”“已上线”“与后端一致”的判断，都必须回到当前代码、接口、部署环境和可复现证据核验。

## 当前质量状态

- 项目已上线并进入内测期。
- 默认本地复现口径：`next dev` 同源 proxy 到 `https://daoleme-dev.jxare.cn`。
- 静态交付口径：`npm run build` 生成的 `out/`，不能把 `next dev` 行为当作上线等价验证。
- 当前默认已接入后端数据；接口字段缺失、联调不通或 shared dev 不稳定时，优先更新 service 适配和后端协同，不新增 mock 数据冒充接通。
- 自动化绿灯只能证明当前覆盖的读链路和基线门禁通过，不能替代真实内测反馈闭环或人工写流验收。

## 证据口径

- 内测 / 线上环境结论：来自真实内测或线上环境。
- 本机 shared dev 结论：来自本机前端 + shared dev 后端，用于开发复现和诊断。
- 静态导出结论：来自 `out/` 或等价静态部署环境。
- 代码静态判断：只能说明实现形态，不能替代运行环境验证。

以上四类证据不能混写。

## 当前重点风险

- 教师端“补录临时学生”前端入口已接入，shared dev 后端写接口仍需复核；不能宣称完整写链已通过。
- 系统内代课老师、合班 / 互换仍依赖 shared dev 后端最终态校验和原子提交能力。
- shared dev 慢响应、间歇性超时、部分接口稳定性问题需要和 `../backend-collab/current-issues.md` 联动。
- 静态导出相关改动必须额外验证 `out/`，避免重新引入 `_rsc` / `__next.*.txt` 404 风险。

## 当前命令

```bash
npm test
npm run lint
npm run build
npm run test:e2e:smoke
```

说明：

- `npm test` 是 Phase 0 基线。
- `npm run test:e2e:smoke` 是 shared dev 低风险读链路 smoke。
- `npm run test:e2e:write-live` 涉及真实写入，执行前必须确认账号、环境和数据影响。

## 目录地图

- `regression-checklist.md`：最新回归和发布前门禁指导，只保留当前可执行口径。
- `history/README.md`：历史质量材料索引。
- `history/2026-04-29-quality-source.md`：原质量跟踪大文档全量迁移快照。
- `history/2026-04-29-regression-source.md`：原回归清单大文档全量迁移快照。

## 更新规则

- 当前质量结论、阻塞项、验证口径变化：更新本文。
- 回归清单、发布门禁、人工验收项变化：更新 `regression-checklist.md`。
- 某次内测反馈或专项验证形成大量证据：新增 `history/YYYY-MM-DD-topic.md`，并在 `history/README.md` 登记。
- 后端接口、权限、字段、错误码或稳定性问题变化：更新 `../backend-collab/current-issues.md`。
