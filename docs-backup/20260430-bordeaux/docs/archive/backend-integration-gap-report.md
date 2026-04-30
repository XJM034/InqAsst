# 后端对接冲突与覆盖缺口报告

> 2026-04-14 更新：本报告中的“学生新增 / 编辑缺接口”判断已过时。前端已只读核对 `daoleme` 当前 `master`，相关接口已在后端代码中实现。最新协同口径请以 [后端协同说明_20260414.md](/Users/minxian/conductor/workspaces/inqasst/calgary/docs/后端协同说明_20260414.md) 为准。

更新日期：2026-04-10

## 1. 本轮已按新联调文档对齐的主链

### 1.1 登录与多校区

- `/login`
  - `POST /api/auth/send-code`
  - `POST /api/auth/login`
  - `POST /api/auth/select-campus`
  - `POST /api/auth/switch-campus`
  - `POST /api/auth/logout`
- 已支持：
  - 单账号老师直登
  - 单账号管理员直登
  - 多管理员手机号先选校区再登录
  - 管理员登录后切校区并替换本地旧 token
- 前端当前实现口径：
  - query `campus` 仅保留展示态兼容
  - 真实权限切换以新 token 为准
  - 多校区候选列表默认持久化在本地 cookie，用于“我的”页切校区入口渲染

### 1.2 老师端点名主链

- `/teacher/home`
  - `GET /api/me`
  - `GET /api/teacher/home`
  - `GET /api/teacher/courses/today`
- `/teacher/attendance/demo`
- `/teacher/home/roster`
  - `GET /api/me`
  - `GET /api/courses/{courseId}`
  - `GET /api/courses/{courseId}/students?courseSessionId=...`
  - `GET /api/courses/{courseId}/attendance/latest?courseSessionId=...`
  - `GET /api/courses/{courseId}/roll-call-windows`
  - `POST /api/courses/{courseId}/attendance`
- 已对齐：
  - 点名状态按 `0 / 1 / 2 / null` 读取
  - UI 语义映射为：
    - `0 = 未到`
    - `1 = 请假`
    - `2 = 已到`
    - `null = 未点名`
  - 提交时统一回写数字状态
  - 名单、最近点名、提交点名统一优先带 `courseSessionId`

### 1.3 管理端点名主链

- `/admin/home`
  - `GET /api/admin/me`
  - `GET /api/admin/home/summary`
- `/admin/control`
  - `GET /api/admin/me`
  - `GET /api/admin/roll-call/overview`
  - `GET /api/courses/{courseId}`（仅补老师名、地点）
- `/admin/control/[classId]`
  - `GET /api/courses/{courseId}`
  - `GET /api/admin/courses/{courseId}/students?courseSessionId=...`
  - `GET /api/admin/courses/{courseId}/attendance/latest?courseSessionId=...`
  - `POST /api/admin/courses/{courseId}/attendance`
- `/admin/unarrived`
  - `GET /api/admin/me`
  - `GET /api/admin/absent-students`
  - `GET /api/courses/{courseId}`
  - `GET /api/admin/courses/{courseId}/students?courseSessionId=...`
  - `GET /api/admin/courses/{courseId}/attendance/latest?courseSessionId=...`
  - `POST /api/admin/courses/{courseId}/attendance`
- 已对齐：
  - 总控页统计卡改为消费后端人数口径：
    - `shouldAttendCount`
    - `presentCount`
    - `leaveCount`
    - `absentCount`
  - 总控页进度条改为直接消费 `progressPercent`
  - 未到学生页改为直接消费新 enriched row：
    - `courseSessionId`
    - `sessionStartAt / sessionEndAt`
    - `homeroomClassId / homeroomClassName`
    - `teacherNames`
    - `status`
  - 未到学生页前端分组口径改为按 `courseSessionId`

### 1.4 时间设置主链

- `/admin/time-settings`
  - `GET /api/admin/time-settings/sessions`
- `/admin/time-settings/[courseSessionId]`
  - `GET /api/admin/course-sessions/{courseSessionId}/time-settings`
- `/admin/time-settings/[courseSessionId]/picker?kind=actual|roll-call`
  - `GET /api/admin/course-sessions/{courseSessionId}/time-settings`
  - `PUT /api/admin/course-sessions/{courseSessionId}/actual-time`
  - `DELETE /api/admin/course-sessions/{courseSessionId}/actual-time`
  - `PUT /api/admin/course-sessions/{courseSessionId}/roll-call-time`
  - `DELETE /api/admin/course-sessions/{courseSessionId}/roll-call-time`
- 已对齐：
  - 时间设置主页面不再把校区 `roll-call-windows` 当作最终生效值
  - 列表、详情、picker 全部切到课节级语义
  - 详情页展示默认值与最终生效值，并区分：
    - `actualCustomized`
    - `rollCallCustomized`

## 2. 已解决的旧冲突

以下旧冲突本轮已不再阻塞：

### 2.1 点名状态 DTO 冲突

旧问题：

- 读接口是字符串状态
- 提交接口 swagger 又缺 `status`

当前处理：

- 已按新文档统一成数字状态 `0 / 1 / 2`
- 提交 DTO 也已改为：
  - `courseSessionId`
  - `items[].studentId`
  - `items[].status`

### 2.2 未到学生接口字段不足

旧问题：

- `GET /api/admin/absent-students` 不含状态、行政班、课节信息
- 前端需要 fan-out 才能补齐

当前处理：

- 已直接消费新返回结构
- fan-out 仅保留给“回写整课节点名”时生成完整 roster 使用
- 页面展示不再依赖补拉状态和班级字段

### 2.3 总控页统计口径不足

旧问题：

- 后端只给 `absentCount`
- 前端只能推一个粗糙的完成 / 未完成状态

当前处理：

- 已直接消费后端完整统计字段与 `progressPercent`
- 前端不再自行推导另一套百分比

### 2.4 时间设置主链错位

旧问题：

- 页面主数据源依赖校区 `roll-call-windows`
- 无法表达单课节覆盖、恢复默认、实际上课时间

当前处理：

- 已改成课节级主链
- 校区 `roll-call-windows` 仅保留为“默认模板规则”认知

## 3. 当前仍未覆盖或刻意不做 live 的部分

### 3.1 学生新增

页面：

- `/admin/course-settings/[courseId]/students/new`

当前状态：

- 本轮不做猜接口式联调
- 继续保留未完成状态

缺口原因：

- 后端还未明确“创建学生 + 加入课程名单”责任边界与返回值

### 3.2 学生编辑

页面：

- `/admin/course-settings/[courseId]/students/[studentId]/edit`

当前状态：

- 本轮不做 live 联调
- 继续保留未完成状态

缺口原因：

- 后端还未明确：
  - 单学生详情读取接口
  - 单学生更新接口
  - 课程名单关联更新是否与学生信息更新拆分

### 3.3 学生导入

页面：

- `/admin/course-settings/[courseId]/students/import`

当前状态：

- 本轮按计划排除实现

缺口原因：

- 产品方案未定
- 后端接口形态也未定（文件上传 / 文本粘贴尚未确认）

### 3.4 课程设置主页面

页面：

- `/admin/course-settings`

当前状态：

- 继续保留 mock

缺口原因：

- 仍缺管理端课程设置汇总接口
- 页面级保存动作也未落定

## 4. 当前建议后端继续补充的最小能力

### 4.1 学生新增 / 编辑契约

建议直接参考：

- [backend-change-request-20260410.md](/Users/minxian/conductor/workspaces/inqasst/calgary/docs/backend-change-request-20260410.md)

这是当前剩余联调阻塞的主项。

### 4.2 可切换校区列表查询接口（可选）

当前前端默认方案：

- 复用登录阶段返回的 `campusOptions`
- 本地持久化后用于“我的”页切校区

若后端不希望前端依赖本地持久化，则建议新增：

- 一个“获取当前账号可切换校区列表”的接口

## 5. 结论

本轮之后，登录、多校区切换、老师点名、管理端总控、未到学生、时间设置主链都已切到 2026-04-10 新文档口径。

当前真正还阻塞 live 联调的，主要只剩：

1. 学生新增
2. 学生编辑
3. 学生导入方案与接口
4. 课程设置主页面汇总接口
