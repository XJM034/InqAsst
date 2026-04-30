# 页面对比报告：`/teacher/attendance/demo`

## 1. 先说结论

这页已经不再是 mock 里的稳定 demo 页，而是包了一层真实点名 session 能力的实际点名页壳。页面框架还像，但“稳定演示态”已经消失了。

## 2. mock 页面想表达什么

mock 的这页重点是：

- 打开就能看到一套完整点名画面
- 课程、学生、状态、按钮都稳定可演示
- 不依赖实时 session 参数

它本质上是一个稳定点名场景。

## 3. 当前接口版实际做成了什么

当前实现主要在：

- `app/teacher/attendance/demo/page.tsx`
- `components/app/attendance-session-client.tsx`
- `lib/services/mobile-app.ts` 中的 `getAttendanceSession`
- `lib/services/mobile-adapters.ts` 中的 `mapAttendanceSession`

当前数据链路是：

- `fetchCourseDetail`
- `fetchCourseStudents`
- `fetchCourseLatestAttendance`
- `fetchTeacherHome`
- `mapAttendanceSession`

页面已经变成真实 session 驱动。

## 4. 页面展示差异

### 4.1 稳定 demo 属性减弱

mock 可以随时打开，始终稳定。

当前页如果没有正确的课程参数或当天 session，对表现就会产生影响。

### 4.2 页面状态变重

当前页新增了更多真实状态：

- 提交禁用
- 轮询刷新
- 窗口是否开启
- 最新提交记录

这些都比 mock 更真实，也更复杂。

### 4.3 页面不再只是演示壳

当前页已经是“真实点名页面”。

因此它的目标从“展示”切到了“执行”。

## 5. mock 与实际接口数据差异

### 5.1 mock 数据来源

mock 使用 `attendanceSession`。

它的优势是稳定、完整、演示友好。

### 5.2 当前接口数据来源

当前使用：

- `getAttendanceSession(courseId, courseSessionId)`
- `fetchCourseDetail`
- `fetchCourseStudents`
- `fetchCourseLatestAttendance`
- `fetchTeacherHome`

### 5.3 关键差异

当前模型新增大量真实字段，例如：

- `attendanceWindowActive`
- `submitDisabledReason`
- `latestAttendanceRecordId`

这些使页面更贴近生产，但也不再等于 mock 演示页。

## 6. 对齐建议

- 维持真实点名能力的同时，尽量保留 mock 页面的信息层级和操作节奏。
- 真实状态不要把页面做得过度工具化。
- 如果仍需要稳定演示入口，应单独保留可控的演示数据模式。

## 7. 对齐时要重点核对的点

- 页面首屏结构是否仍与 mock 一致。
- 提交禁用、轮询、错误反馈是否挤占了主操作区域。
- 当真实 session 不可用时，是否仍有与 mock 一致的可预期兜底。
