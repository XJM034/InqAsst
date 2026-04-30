# Handoff

## 1. 当前任务目标
继续推进“合班”前端功能。合班定义为：同校区、同一天、同时间段的 2+ 个课节合成一个点名任务，由一名系统内点名老师一次完成整组点名。

当前完成标准：
- 管理端入口并入单课“更换点名老师”流程，不新增独立合班入口。
- 当目标老师同时间段已有课节时，管理员必须先选择“合班点名”或“互换点名老师”；两者是或关系，不能在一次确认里同时提交。
- 选择“合班点名”后，从同时间段课节中多选 1+ 节，调用合班创建接口。
- 选择“互换点名老师”后，只选择一节目标老师的课节，继续调用现有 batch 互换接口。
- 老师端能进入 `/teacher/attendance/group?groupId=...` 完成合班点名，提交 payload 需要带 `courseSessionId + studentId + status`。
- 老师首页将同一 `rollCallGroupId` 的课节折叠成一个合班任务；管理端 `/admin/control` 将同一 `rollCallGroupId` 聚合成一个合班任务卡。
- 不新增 mock；接口缺口或 shared dev 不稳定要记录到文档，不伪造联调完成。
- 保持静态导出约束，跳转继续用 `StaticLink` / `navigateTo`，不要引入 `next/link` 或 App Router runtime 导航。

## 2. 当前进展
- 已实现合班相关数据契约：
  - `lib/services/mobile-schema.ts`
    - `TeacherTodaySessionDto` 增加 `rollCallGroupId`、`rollCallGroupName`、`rollCallGroupSize`、`rollCallGroupCanSubmit`。
    - 新增 `TeacherAttendanceGroupDto`、`TeacherAttendanceGroupSessionDto`、`TeacherAttendanceGroupSubmitRequestDto`。
    - `RollCallOverviewRowDto` 增加 `rollCallGroupId`、`rollCallGroupName`、`rollCallGroupSize`、`rollCallGroupCourseNames`。
    - `RollCallTeacherMergeGroupRequestDto` 当前为 `{ sessionDate, sourceCourseSessionId, targetTeacherId, mergeCourseSessionIds }`，不再包含 `swapCourseSessionId`。
  - `lib/domain/types.ts`
    - `TeacherHomeCourseCard.kind` 支持 `"merge"`。
    - 新增 `AttendanceGroup`、`AttendanceGroupClass`、`AttendanceGroupStudent`。

- 已接入合班 API：
  - `lib/services/mobile-api.ts`
    - `fetchTeacherAttendanceGroup(groupId)` -> `GET /api/teacher/attendance/groups/{groupId}`。
    - `submitTeacherAttendanceGroup(groupId, body)` -> `POST /api/teacher/attendance/groups/{groupId}`。
    - `updateRollCallTeacherMergeGroup(body)` -> `PUT /api/admin/roll-call-teacher/merge-group`。
  - `lib/services/mobile-client.ts`
    - `submitTeacherAttendanceGroup({ groupId, students })` 使用 `buildAttendanceGroupSubmitRequest`。
    - `setRollCallTeacherMergeGroup(body)` 使用 `PUT /api/admin/roll-call-teacher/merge-group`，复用结构化 conflict 错误归一。

- 已实现老师端合班页：
  - 新路由：`app/teacher/attendance/group/page.tsx`。
  - 新组件：`components/app/attendance-group-client.tsx`。
  - 页面读取 `groupId` search param；缺参、加载失败、空数据都有 `PageStatus`。
  - 合班页按班级分组展示学生，顶部展示应到/已到/未到/班级/请假/未点名统计。
  - 提交时一次 POST 整组合班点名；学生项 payload 由 `buildAttendanceGroupSubmitRequest` 转为 `{ courseSessionId, studentId, status }`。
  - `canSubmit === false` 或 `attendanceWindowActive === false` 时禁用提交，并展示“当前老师只能查看该合班点名情况，不能提交点名。”等原因。

- 已实现老师首页折叠：
  - `lib/services/mobile-adapters.ts`
    - `getRollCallGroupMeta()` 解析 `TeacherTodaySessionDto.rollCallGroup*`。
    - `buildTodayOverrideSessions()` 将同一 `rollCallGroupId` 的当天课节折叠为一个任务。
    - `buildCourseHref()` 遇到合班任务时跳 `/teacher/attendance/group?groupId=...`。
    - 首页卡片 badge 为“合班”，label 为“开始合班点名”或“查看合班情况”，expectedLabel 为 `N 个班级`。

- 已实现管理端总控聚合：
  - `lib/services/mobile-adapters.ts`
    - `mapAdminControlData()` 按 `rollCallGroupId` 聚合 overview 行。
    - 聚合卡 `id` 为 `group:{groupId}`，`kind` 为 `"merge"`，badge 为“合班”。
    - 统计整组合计 `shouldAttend/present/leave/absent`，进度按应到人数加权。
  - `components/app/admin-control-client.tsx`
    - 合班卡展示 badge、老师、整体进度、请假/未到统计。
    - 合班卡说明默认“这是合班点名任务，由一名老师统一提交。”。

- 已实现管理端“更换点名老师”里的合班入口：
  - `components/app/teacher-selection-client.tsx`
    - 同时间段候选老师卡显示“可互换 / 可合班”等能力。
    - 当目标老师同时间段已有课节时打开弹窗。
    - 2026-04-27 根据用户反馈已改为“合班 / 互换二选一”的中间态：
      - 初始标题为“选择处理方式”。
      - 初始只展示两张方式卡：“合班点名”“互换点名老师”。
      - 未选择方式时确认按钮禁用，文案“先选择方式”。
      - 选择合班后只展示“选择加入合班的课节”，按钮为“创建合班”。
      - 选择互换后只展示“选择互换的课节”，按钮为“确认互换”。
      - 合班路径只调用 `setRollCallTeacherMergeGroup`；互换路径只调用 `setRollCallTeacherBatch`。
      - 合班请求不再发送 `swapCourseSessionId`。

- 已同步测试：
  - `tests/service/mobile-adapters.test.ts`
    - 覆盖合班提交 payload、老师端合班详情映射、viewer-only 禁用提交、老师首页合班折叠、管理端总控合班聚合。
  - `tests/service/mobile-app.test.ts`
    - 覆盖老师首页/批量候选相关数据流中的合班字段。
  - `tests/contract/mobile-client.test.ts`
    - 覆盖 `setRollCallTeacherMergeGroup` 调用 `PUT /api/admin/roll-call-teacher/merge-group`，body 不含 `swapCourseSessionId`。
  - `tests/contract/mobile-api.test.ts`
    - 覆盖 server API 的 merge-group 契约。

- 已同步文档：
  - `docs/inqasst-automation-testing-execution-plan.md`
    - 增加合班入口、接口、测试矩阵；明确“合班 / 互换二选一”。
    - `TC-06Q` 为合班创建路径；`TC-06R` 为互换路径。
  - `docs/上线前测试清单_20260414.md`
    - 增加“更换点名老师：合班 / 互换二选一”验收项。
  - `docs/后端协同说明_20260414.md`
    - 记录前端当前 merge-group 契约、老师端合班详情/提交接口、老师首页和管理端总控所需聚合字段。
    - 明确：选择合班不调用 batch 互换接口；选择互换不调用合班创建接口。

- 已做浏览器验证：
  - 当前本机页面：`http://127.0.0.1:3000/admin/emergency/course/_/select-teacher?courseId=3358&courseSessionId=5142`。
  - 使用候选老师 `任勇 · 13547757554` 触发同时间段弹窗。
  - 已确认初始中间态、合班态、互换态都正常：
    - 初始显示“选择处理方式”，按钮“先选择方式”禁用。
    - 点“合班点名”后只出现合班课节列表；选中 `攀岩4-6（周一）` 后按钮变“创建合班”。
    - 点“互换点名老师”后只出现互换课节列表；选中 `攀岩4-6（周一）` 后按钮变“确认互换”。
  - 没有点击最终“创建合班”或“确认互换”，避免修改 shared dev 数据。

- 已执行验证：
  - `npm run sync:tokens`：通过。
  - `npm test`：通过，157 passed，3 skipped。
  - `npm run lint`：通过，0 error，仍有既有 41 warning。
  - `npm run build`：通过，Next.js 16.2.2 / Turbopack，生成 41 个静态页面。
  - `git diff --check app components lib tests docs`：通过。
  - 注意：`npm run build` 在沙盒内先失败，错误为 Turbopack 创建进程/绑定端口 `Operation not permitted (os error 1)`；沙盒外重跑后成功，判断为沙盒限制，不是代码问题。

## 3. 关键上下文
- 当前工作区：`/Users/minxian/conductor/workspaces/inqasst/bordeaux`。
- 当前分支：`XJM034/resume-0427`。
- 当前 HEAD：`ed89ba4a`。
- 用户明确要求：
  - 使用 `/impeccable shape`、`/impeccable craft` 推进前端体验。
  - 后续又用 `/polish` 指出页面太乱，并明确“互换和合班是或关系”。
  - 已确认“已有多个同时段课节时允许多个课节加入”。
  - 已确认“被合班的班级点名老师只能查看点名情况不得进行点名”。
  - 可用管理员账号：`18111243351`。
- 项目约束：
  - 当前仓库是静态导出项目，`next.config.ts` 已启用 `output: "export"`；交付物以 `out/` 为准。
  - 当前默认验证口径是本机前端 + 已部署 shared dev 后端。
  - 不要新增或回退到 mock 数据。
  - 不要直接改后端仓库；shared dev 或契约问题先记录到 `docs/后端协同说明_20260414.md`。
  - 站内跳转不要引入 `next/link`、`router.push`、`router.replace`、`router.refresh`。
- 当前 source-only 变更范围：
  - `app/teacher/attendance/group/page.tsx`
  - `components/app/attendance-group-client.tsx`
  - `components/app/admin-control-client.tsx`
  - `components/app/teacher-home-client.tsx`
  - `components/app/teacher-selection-client.tsx`
  - `lib/domain/types.ts`
  - `lib/services/mobile-adapters.ts`
  - `lib/services/mobile-api.ts`
  - `lib/services/mobile-app.ts`
  - `lib/services/mobile-client.ts`
  - `lib/services/mobile-schema.ts`
  - `tests/contract/mobile-api.test.ts`
  - `tests/contract/mobile-client.test.ts`
  - `tests/service/mobile-adapters.test.ts`
  - `tests/service/mobile-app.test.ts`
  - `docs/inqasst-automation-testing-execution-plan.md`
  - `docs/上线前测试清单_20260414.md`
  - `docs/后端协同说明_20260414.md`
- 当前 `git status` 有大量 `.next/`、`out/`、`output/` 生成产物噪音，来自构建验证；接手时先做 source-only diff，不要把构建产物当成人工源码改动。
- 之前 `260427-handoff.md` 内容是“系统外老师手机号提示”旧任务；本次已按 handoff skill 要求用合班功能重写。

## 4. 关键发现
- 合班和互换不能做成“先互换再合班”的组合动作；用户已经明确改成或关系。前端当前也已按两个独立分支提交。
- 同时间段冲突弹窗的核心问题不是字段不够，而是信息架构混乱；必须先让管理员选择处理方式，再展示对应控件。
- 合班提交不能只按学生 ID 传状态；同一学生可能出现在多个课节中，payload 必须带 `courseSessionId + studentId`。
- 老师首页折叠依赖后端给 `rollCallGroupId`；没有该字段时前端无法可靠判断哪些课节属于同一个合班任务。
- 管理端总控可以把相同 `rollCallGroupId` 的多行 overview 聚合成一张卡；如果后端未来直接返回聚合行，也要保证整组统计字段是合计值。
- viewer-only 的关键字段是 `canSubmit === false` 或 `submitDisabledReason`；前端已用这些字段禁用提交并显示原因。
- 当前浏览器只验证了选择弹窗的 UI 状态，没有真正调用创建合班或互换接口；这是有意避免污染 shared dev 数据。

## 5. 未完成事项
1. shared dev 后端需要实现或确认 `PUT /api/admin/roll-call-teacher/merge-group`，并返回前端契约中需要的 `groupId/sourceCourseSessionId/targetTeacherId/mergeCourseSessionIds`；当前前端已有契约和错误处理，但未做真实创建。
2. 需要用真实 shared dev 数据做完整链路验证：创建合班 -> 老师首页出现一个合班任务 -> `/teacher/attendance/group?groupId=...` 提交整组 -> `/admin/control` 与未到统计同步。
3. 需要验证 viewer-only 权限：被合班课节的原点名老师只能查看合班情况，不能提交点名。
4. 需要补浏览器验证 `/teacher/attendance/group`、`/teacher/home`、`/admin/control` 的主态、空态、错误态、移动视口表现；目前只实测了 `/admin/emergency/.../select-teacher` 的中间态。
5. 提交或推送前先复核 source-only diff，处理 `.next/` / `out/` / `output/` 噪音；不要把生成产物混进功能提交结论。

## 6. 建议接手路径
- 优先查看：
  - `components/app/teacher-selection-client.tsx`
  - `components/app/attendance-group-client.tsx`
  - `app/teacher/attendance/group/page.tsx`
  - `lib/services/mobile-schema.ts`
  - `lib/services/mobile-adapters.ts`
  - `lib/services/mobile-client.ts`
  - `docs/后端协同说明_20260414.md` 中 2026-04-27 合班段落
- 先验证：
  - `git diff --name-status -- app components lib tests docs 260427-handoff.md`
  - `git diff --check app components lib tests docs 260427-handoff.md`
  - 若要看真实工作树噪音，再单独看 `git status --short`，但不要直接基于 `.next/` / `out/` 下结论。
- 推荐动作：
  - 若继续开发，先找 shared dev 是否已支持 `PUT /api/admin/roll-call-teacher/merge-group`；没有就继续以文档协同，不要 mock。
  - 若继续 QA，优先从当前浏览器页 `/admin/emergency/course/_/select-teacher?courseId=3358&courseSessionId=5142` 进入同时间段弹窗，确认二选一 UI，然后在得到用户确认后再提交真实创建。
  - 若做代码收尾，先跑 source-only diff review，重点看 `teacher-selection-client.tsx` 的 `pendingSameSlotMode`、`canCreateMergeGroup`、`canSwapSelection` 和 `handleConfirmSelection`，确认不会同时调用 merge 与 batch。

## 7. 风险与注意事项
- 不要恢复旧的“互换后继续合班”或“互换并创建合班”文案；用户已明确这两者是或关系。
- 不要把 `swapCourseSessionId` 重新塞回 `RollCallTeacherMergeGroupRequestDto`；当前合班创建契约不再包含互换目标。
- 不要点击最终“创建合班 / 确认互换”做 shared dev 写入，除非用户明确允许；这会修改真实 shared dev 数据。
- 不要把 `.next/`、`out/`、`output/` 的构建产物当作需要人工保留的源码变更。
- `npm run lint` 当前仍有 41 个既有 warning，非本轮合班改动新引入的 error。
- `app/teacher/attendance/group/page.tsx` 是 client page 并使用 `useSearchParams` + `SearchParamsSuspense`，符合当前静态导出兼容路径；不要改成 App Router runtime 导航方案。
- 若老师首页合班卡 `rosterHref` 行为看起来与普通名单页不同，先检查 `buildCourseHref()`：合班任务会统一跳 `/teacher/attendance/group?groupId=...`。

下一位 Agent 的第一步建议：
先运行 `git diff --name-status -- app components lib tests docs 260427-handoff.md`，确认 source-only 范围；然后打开 `components/app/teacher-selection-client.tsx`，从 `pendingSameSlotMode` 和 `handleConfirmSelection` 开始复核“合班 / 互换二选一”是否仍是当前事实。
