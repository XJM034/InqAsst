# Handoff

## 1. 当前任务目标
- 当前目标是收口管理端“更换点名老师”链路里两个仍未 live 达成的功能，并把真实边界同步到 handoff / 协作文档：
  - 功能1：系统内老师候选副标题显示该老师本周课程摘要，例如 `中国舞（周二） · 古典舞（周三）`
  - 功能2：当目标系统内老师当天同时间段已有课时，管理员可直接完成“互换点名课程”
- 当前对外结论必须准确：
  - 不能把“代码里接过”写成“live 页面已成功”
  - 必须明确区分“前端已落代码但 live 未验证通过”和“确定需要后端协同”

## 2. 当前进展
- 当前工作目录：`/Users/minxian/conductor/workspaces/inqasst/bordeaux`
- 当前分支：`XJM034/bordeaux`
- 当前验证口径：本机前端 `http://127.0.0.1:3000` + shared dev `proxy` 后端
- 当前最新用户现场反馈：
  - `/admin/emergency/course/_/select-teacher/?courseId=4853&courseSessionId=4164`
  - 页面里系统内老师副标题仍显示通用兜底文案 `系统老师`
  - 同日有排课老师在真实页面里仍未完成互换闭环
- 本轮前端已落的相关代码：
  - `lib/services/mobile-app.ts`
    - `buildTeacherWeeklyCourseSummaryMap(...)`
    - `buildTeacherSwapTargetsById(...)`
    - `getAdminTeacherSelection(...)` 已尝试按整周 `teacher-settings overview` 生成周课摘要与互换目标
    - 首页搜索已回退为“只搜索当前选中星期”
  - `components/app/teacher-selection-client.tsx`
    - 候选老师卡片支持展示 `teacher.note`
    - 互换确认弹窗文案已改成“确认互换当日点名课程”
  - `app/admin/emergency/course/[courseId]/select-teacher/client.tsx`
    - 当前排序已调为：`已选老师 > 系统内老师 > 系统外老师`
  - `components/app/admin-emergency-client.tsx`
  - `app/admin/emergency/page.tsx`
    - 首页搜索已从“跨整周”回退为“当前选中星期”
- 本轮文档已同步：
  - `docs/后端协同说明_20260414.md`
  - `docs/inqasst-automation-testing-execution-plan.md`
  - `260422-handoff.md`
- 本轮已跑门禁：
  - `npm run sync:tokens`
  - `npm test`
  - `npm run lint`
  - `npm run build`
  - 结果均通过；`lint` 仍是仓库原有 `39 warnings`

## 3. 关键上下文
- 用户当前明确要求：
  - 用 `handoff` 技能把交接文件更新到最新真实状态
  - 评估这两个功能是否需要后端协同
  - 若需要，更新相关文档并给一段可以直接发给后端的话术
- 当前仓库规则：
  - 静态导出项目，交付判断仍看 `out/`
  - shared dev 问题先记到 `docs/后端协同说明_20260414.md`
  - 改代码后同步文档，并跑 `npm test`、`npm run lint`、`npm run build`
- 当前仍有效的后端边界：
  - “同日系统内老师互换点名课程”写链在 shared dev 侧没有可验收通过
  - 前端已经接了 batch 契约，但 shared dev 后端仍需提供：
    - `POST /api/admin/roll-call-teacher/batch/options`
    - `PUT /api/admin/roll-call-teacher/batch`
    - 最终态冲突校验
    - 原子提交
- 当前工作树很脏，且不止本轮改动：
  - 不要回退与本任务无关的既有修改
  - 尤其不要误动 `components/app/teacher-home-client.tsx`、`lib/services/mobile-adapters.ts`、`tests/service/mobile-adapters.test.ts` 等已有变更

## 4. 关键发现
- 已确认事实：
  - 功能2“同日互换点名课程”当前需要后端协同，不是前端再改几层弹窗就能闭环
  - shared dev 当前真正阻塞点是后端仍按单课冲突校验拦截，没有按整组最终态做校验与提交
- 已确认事实：
  - 功能1“系统内老师副标题显示本周课程摘要”在代码里已经尝试实现，但 live 页面仍未成功显示
  - 当前 live 页面里，系统内老师候选副标题仍是兜底文案 `系统老师`
- 已确认事实：
  - `getAdminTeacherSelection(...)` 里，老师副标题是这样产生的：
    - 若 `teacher-settings overview` 能提供该老师本周课节关系，则展示周课摘要
    - 若拿不到可用关系，则退回 `mapTeacherSelectionOption(...)` 的兜底文案 `系统老师`
- 合理推断，但尚未完全定位：
  - 功能1当前更像“前端读链路或 shared dev 读数据问题”，还不能直接定性成“必须由后端改代码”
  - 需要继续核对 `GET /api/admin/teacher-settings/overview?weekStart=...` 在 shared dev 下是否：
    - 返回了完整当前周老师-课节关系
    - 在当前链路下稳定可用，而不是失败后被前端静默吞掉
- 已确认不应再误判的点：
  - 不要把“排序改了、弹窗文案改了、service test 过了”误写成“用户现场已看到周课摘要 / 已完成互换”
  - 当前真实状态仍是：两个目标都没有在用户 live 页面上完成验收

## 5. 未完成事项
1. 继续定位功能1为什么 live 页面仍只显示 `系统老师`：
   - 优先核对 `teacher-settings overview` 在当前页面链路里的真实返回
   - 明确到底是前端读链路问题，还是 shared dev 数据/接口不完整
2. 推进功能2的后端协同：
   - 让 shared dev 后端补齐 batch 互换最终态校验与原子提交
   - 确保同日互换不再被单课冲突校验短路
3. 若继续在本机验证：
   - 用管理员账号 `17748085601 / 8888`
   - 复现页：`/admin/emergency/course/_/select-teacher/?courseId=4853&courseSessionId=4164`
   - 重点看系统内老师副标题与互换弹窗/提交链路

## 6. 建议接手路径
- 优先查看：
  - `lib/services/mobile-app.ts`
  - `components/app/teacher-selection-client.tsx`
  - `app/admin/emergency/course/[courseId]/select-teacher/client.tsx`
  - `docs/后端协同说明_20260414.md`
  - `docs/inqasst-automation-testing-execution-plan.md`
- 先验证：
  - `git status --short -- ':(exclude).next' ':(exclude)out'`
  - `lsof -iTCP:3000 -sTCP:LISTEN -n -P`
  - 用管理员账号重新打开更换点名老师页，确认：
    - 系统内老师副标题是否仍是 `系统老师`
    - 选择同日有课老师后是否仍被普通冲突拦截
- 推荐动作：
  - 若要继续前端排查功能1，优先把 `teacher-settings overview` 在当前链路里的真实返回打出来，不要只看 service test
  - 若要尽快推动闭环，直接把功能2的后端协同单发给后端同学

## 7. 风险与注意事项
- 不要把功能1误写成“只差样式”：
  - 当前 live 页面没有出现周课摘要，说明不是纯展示 polish
- 不要把功能2误写成“只差一个弹窗确认”：
  - 当前真正缺的是 shared dev 后端的整组最终态校验与提交能力
- 不要继续把首页搜索问题和这两个未完成功能混在一起：
  - 首页搜索已经按用户要求回退为“只搜索当前选中星期”
- 不要回退与本任务无关的既有脏工作树修改

下一位 Agent 的第一步建议：
先在本机 `3000` 用管理员账号 `17748085601 / 8888` 打开 `/admin/emergency/course/_/select-teacher/?courseId=4853&courseSessionId=4164`，确认系统内老师副标题仍是 `系统老师`，然后直接围绕 `lib/services/mobile-app.ts` 里 `fetchAdminTeacherSettingsOverview(...)` 这条读链做 live 排查。
