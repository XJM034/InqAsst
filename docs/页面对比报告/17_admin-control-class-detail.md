# 页面对比报告：`/admin/control/[classId]`

## 1. 先说结论

这页当前已经从 mock 的本地演示态，切成了真实提交态。它的问题不是不能用，而是页面气质从“批量管理页”变成了“实时操作页”。

## 2. mock 页面想表达什么

mock 的班级点名详情页重点是：

- 快速看名单
- 快速批量改状态
- 在一页里完成确认

它更像一个轻量、顺手的操作台。

## 3. 当前接口版实际做成了什么

当前实现主要在：

- `app/admin/control/[classId]/page.tsx`
- `components/app/admin-class-attendance-client.tsx`
- `lib/services/mobile-app.ts` 中的 `getAdminClassAttendanceData`

当前数据链路是：

- `fetchCourseDetail`
- `fetchAdminCourseStudents`
- `fetchAdminCourseLatestAttendance`
- `mapAdminClassAttendanceData`

并且页面会直接调用 `submitAdminAttendance`。

## 4. 页面展示差异

### 4.1 批量页还在，但实时提交更重

当前页仍保留批量修改能力。

但每次修改都更接近真实提交，因此页面更像“边改边存”的业务页。

### 4.2 新增了真实状态维度

当前页新增了：

- `unmarked`
- 错误反馈
- 提交中状态

这些都让页面比 mock 更重。

### 4.3 页面从演示页变成执行页

mock 的重点是演示交互。

当前页的重点已经是：

- 真改状态
- 真提交
- 真处理失败

## 5. mock 与实际接口数据差异

### 5.1 mock 数据来源

mock 使用 `adminClassAttendanceData`。

数据模型偏轻，足够驱动名单状态切换。

### 5.2 当前接口数据来源

当前使用：

- `getAdminClassAttendanceData`
- `fetchCourseDetail`
- `fetchAdminCourseStudents`
- `fetchAdminCourseLatestAttendance`

页面还要把修改提交给 `submitAdminAttendance`。

### 5.3 关键差异

当前模型新增了更多真实字段：

- `courseId`
- `courseSessionId`
- 最新考勤记录
- `unmarked`

这让页面更接近真实业务，但也不再是 mock 那种轻量操作壳。

## 6. 对齐建议

- 保留真实提交能力，但视觉与交互上要尽量维持 mock 的批量操作感。
- 错误提示和提交状态要轻量，不要让页面过度后台化。
- 批量修改流程要比单人逐条操作更显著。

## 7. 对齐时要重点核对的点

- 页面是不是还能“一眼看名单、快速批量改”。
- 实时提交态是否干扰了主操作节奏。
- 新增的 `unmarked` 是否对整体视觉和文案造成偏离。
