# Handoff

## T0 Constraints

以下约束为当前前端最高优先级开发约束，必须压过一切“体验优化式兜底”：

- 页面运行时绝对不允许使用 mock / smoke / demo 假数据作为真实页面回退结果。
- 页面首屏在真实接口返回前，只允许展示加载态、空态或明确错误态，不允许延时后切到假数据。
- 真实接口返回空数据时，必须展示真实空态，不允许为了“页面看起来有内容”而补假列表、假老师、假课程、假统计。
- 不允许出现“请求失败 / 超时 / 未登录 / token 缺失 / SSR 失败 / 构建导出限制 => 自动回退 mock / smoke”的逻辑。
- mock / smoke 数据只能用于设计对照、测试夹具、静态文档，不允许进入生产、测试、联调环境的页面运行链路。
- 发现运行时 mock / smoke 回退时，处理原则不是“保留兜底”，而是删除该分支，并改为真实加载态 / 空态 / 错误态。
- 必须删除仓库中供页面运行链路消费的 smoke 数据；代码里不允许保留 smoke 页面数据、smoke 列表数据、smoke 兜底数据。

## 1. 当前任务目标
当前前端分支工作已完成并已合入 `master`，下一位 Agent 的主要目标不是继续回忆历史对话，而是基于仓库内已落地的代码与文档继续推进联调收尾。当前最重要的产出有两类：

1. 继续和后端协作处理已确认的接口阻塞项。
2. 在后端修复后，重新跑“管理端设置点名时间 -> 老师端点名 -> 管理端同步 -> 导出未到文本”的最终上线前写流。

完成标准：

- 后端协作入口明确，文档口径一致。
- 修复后的后端接口被重新验证。
- 主链写流和相关善后清理能回到可交付状态。

## 2. 当前进展
本轮前端代码已经完成并合入远端 `master`：

- 远端 `origin/master` 当前为 `855fd04 feat: finish pre-release admin and teacher flow updates`
- 合并方式是 `fast-forward`
- 合并与推送是在干净工作副本 `/Users/minxian/conductor/repos/inqasst` 完成的

本轮已完成的主要工作：

- 管理端课程设置接入本地 `sessionStorage` 草稿层：
  - 支持“编辑课程信息”
  - 支持“临时新增课程”
  - 支持“按照其他行课日行课”与补课草稿
- 管理端老师设置补齐确认弹框：
  - 系统老师更换前确认“从谁换到谁”
  - 系统外老师录入后确认“从谁换到谁”
  - 手动录入的系统外老师按校区保留并标注
- 老师端点名改为“前端草稿默认全员已到，确认后再提交”：
  - 提交前提示“确认提交后才会同步到管理端”
  - 提交确认框列出未到学生姓名与行政班
- 老师端真实账号页面改为客户端取数/跳转，避免 `output: "export"` 下回落到 mock：
  - `/teacher/home`
  - `/teacher/attendance`
  - `/teacher/home/roster`
  - `/teacher/me`
- `/admin/emergency` 周视图已切到后端聚合分页接口：
  - 只请求 `GET /api/admin/emergency/weekly`
  - 首屏、切星期、搜索、翻页都不再依赖旧 `teacher-settings/overview`
  - 周视图不再扇出页面级 `/api/admin/course-sessions/*/roll-call-teacher`
- 动态页统一补齐静态导出兼容口径：
  - 新增 `/Users/minxian/conductor/workspaces/inqasst/calgary/lib/admin-route-hrefs.ts`
  - 课程设置、老师设置、总控详情统一改为 `/_ + query`

已完成的关键验证：

- `npm run sync:tokens` 通过
- `npm test` 通过
- `npm run build` 通过
- `npx vitest run tests/service/mobile-app.test.ts tests/contract/mobile-api.test.ts` 通过
- `npx vitest run tests/service/mobile-adapters.test.ts tests/contract/mobile-client.test.ts` 通过
- `E2E_TEACHER_PHONE=13990691184 E2E_ADMIN_PHONE=18980714661 E2E_MULTI_CAMPUS_ADMIN_PHONE=11020220229 E2E_LOGIN_CODE=8888 npm run test:e2e:smoke` 4/4 通过

已完成的关键文档同步：

- `/Users/minxian/conductor/workspaces/inqasst/calgary/docs/inqasst-automation-testing-execution-plan.md`
- `/Users/minxian/conductor/workspaces/inqasst/calgary/docs/上线前测试清单_20260414.md`
- `/Users/minxian/conductor/workspaces/inqasst/calgary/docs/后端协同说明_20260414.md`
- `/Users/minxian/conductor/workspaces/inqasst/calgary/docs/核心跨角色主链验证_20260417.md`

## 3. 关键上下文
- 用户明确要求：
  - 前端这轮工作要同步到文档
  - 后端老师需要知道去读哪些文档
  - 当前代码已合到 `master`
- 当前仓库状态有两个工作副本：
  - `/Users/minxian/conductor/workspaces/inqasst/calgary`
    - 当前分支仍显示为 `codex/local-backend-integration`
    - 但 `HEAD` 已与 `origin/master` 同步到 `855fd04`
    - 工作区是脏的，主要是 `.next` / `out` 构建产物
  - `/Users/minxian/conductor/repos/inqasst`
    - 当前分支是 `master`
    - 已完成快进合并与推送
- 当前已确认的后端阅读入口：
  - `/Users/minxian/conductor/workspaces/inqasst/calgary/docs/后端协同说明_20260414.md`
    - 重点看 `2.9`、`2.10`
  - `/Users/minxian/conductor/workspaces/inqasst/calgary/docs/核心跨角色主链验证_20260417.md`
  - `/Users/minxian/conductor/workspaces/inqasst/calgary/docs/inqasst-automation-testing-execution-plan.md`
- 已做出的关键决定：
  - `/admin/emergency` 后续协作口径以 `/api/admin/emergency/weekly` 为准
  - 不再把“前端老师设置首页依赖 `/api/admin/teacher-settings/overview`”当成事实
  - 老师端点名当前采用“前端草稿默认全员已到，确认后一次性提交”的交互
  - 课程设置新增能力当前都是浏览器内草稿，不写后端
- 重要假设：
  - 后端老师不一定已经主动看到这些文档，不能默认其已知晓

## 4. 关键发现
- 已在“本机前端 `3000` + 已部署后端 `https://daoleme-dev.jxare.cn`”口径下真实跑通关键跨角色主链：
  - 管理员：`17748085601 / 王磊 / 彭州市嘉祥外国语学校`
  - 老师：`19942378459 / 刘松林 / 彭州市嘉祥外国语学校`
  - 课程：`3566 / 棍网球校队`
  - 课节：`4451 / 2026-04-17 17:00-18:30`
  - 最终结果：`9 已到 / 2 未到`
  - 管理端导出文本命中：
    - `小2023级4班：周歆玥，棍网球校队`
    - `小2024级1班：李一墨，棍网球校队`
- 当前最明确的后端阻塞项有 3 个：
  - `PUT /api/admin/course-sessions/{courseSessionId}/roll-call-time`
    - 当前返回 `endTime is required; startTime is required`
  - `DELETE /api/admin/course-sessions/{courseSessionId}/roll-call-time`
    - 当前返回 `session-level roll-call overrides are disabled`
  - `DELETE /api/admin/campuses/{campusId}/roll-call-rule`
    - 当前返回 `Server internal error`
- 因为回滚链路不可用，当前测试残留仍存在：
  - 校区 `146 / 彭州市嘉祥外国语学校` 点名规则被 best-effort 收紧到 `0/0`
  - 课节 `3566 / 4451` 已留下真实点名记录 `attendanceRecordId=35`
- 老师设置首页的历史长卡顿根因主要是前端旧实现的 N+1 请求风暴，不是 overview 单接口本身慢：
  - 旧实现会在拿到 `/api/admin/teacher-settings/overview` 后继续按 375 条课节补拉详情和点名老师
  - 现已切到 `/api/admin/emergency/weekly`
- 全量 `npm run lint` 仍不全绿，但当前阻塞是仓库既有问题，不是本轮新回归：
  - `app/admin/home/page.tsx`
  - `components/app/admin-course-teachers-client.tsx`
  - `components/app/admin-time-setting-picker-client.tsx`

## 5. 未完成事项
1. 把后端老师真正拉到最新协作口径上：
   - 明确告诉他优先看 `/Users/minxian/conductor/workspaces/inqasst/calgary/docs/后端协同说明_20260414.md` 的 `2.9`、`2.10`
   - 再看 `/Users/minxian/conductor/workspaces/inqasst/calgary/docs/核心跨角色主链验证_20260417.md`
2. 等后端修复 `roll-call-time` 与 `roll-call-rule` 删除/回滚问题后，重跑主写流，并确认可恢复到无残留基线。
3. 如果后续还要继续在当前机器开发，先决定是否把当前工作区 `/Users/minxian/conductor/workspaces/inqasst/calgary` 切回 `master` 或直接换到干净工作副本继续，避免在脏的 `.next` 产物基础上做分支操作。

## 6. 建议接手路径
- 优先查看：
  - `/Users/minxian/conductor/workspaces/inqasst/calgary/260417-handoff.md`
  - `/Users/minxian/conductor/workspaces/inqasst/calgary/docs/后端协同说明_20260414.md`
  - `/Users/minxian/conductor/workspaces/inqasst/calgary/docs/核心跨角色主链验证_20260417.md`
  - `/Users/minxian/conductor/workspaces/inqasst/calgary/docs/inqasst-automation-testing-execution-plan.md`
- 先验证：
  - `origin/master` 是否仍为 `855fd04`
  - 后端老师是否已经收到文档入口与阻塞点摘要
  - 当前联调环境是否仍是 `proxy` 模式指向 `https://daoleme-dev.jxare.cn`
- 推荐动作：
  - 如果是继续前后端协作，先把后端需要看的文档入口发出去
  - 如果是继续前端开发，优先在干净工作副本 `/Users/minxian/conductor/repos/inqasst` 上接着干
  - 如果是准备复测，先直接打 3 个阻塞接口确认后端是否已经修复：
    - `PUT /api/admin/course-sessions/{courseSessionId}/roll-call-time`
    - `DELETE /api/admin/course-sessions/{courseSessionId}/roll-call-time`
    - `DELETE /api/admin/campuses/{campusId}/roll-call-rule`

## 7. 风险与注意事项
- 不要默认后端老师已经知道本轮改动；目前只能确认文档已写进仓库，不能确认人已读到。
- 不要在当前脏工作区 `/Users/minxian/conductor/workspaces/inqasst/calgary` 里做新的分支整理动作；它含大量 `.next` / `out` 产物。
- 不要再把 `/admin/emergency` 的旧数据源写成 `/api/admin/teacher-settings/overview`；这是过时口径。
- 不要把“主链已跑通”误写成“已完全达到上线状态”；回滚能力和 session 级点名时间写链仍是阻塞项。
- 已验证过且不建议重复浪费时间的方向：
  - 再去排查老师设置首页是否因为 overview 单接口慢导致卡顿
  - 再去把这次全量 `lint` 失败当成本轮新回归

下一位 Agent 的第一步建议：
先打开 `/Users/minxian/conductor/workspaces/inqasst/calgary/docs/后端协同说明_20260414.md` 的 `2.9` 和 `2.10`，确认准备同步给后端老师的阻塞点与新接口口径是否与当前仓库事实一致，然后再决定是发协作消息还是直接复测接口。
