# 页面级对比报告目录

## 1. 说明

本目录以 `docs/最终页面对比报告_XJM034_check-push-rules_20260416.md` 为总纲，把正式页面拆成逐页明细报告，方便后续按页执行对齐。

- 基准分支：`origin/XJM034/check-push-rules`
- 当前对比对象：当前工作区接口版页面
- 排除页面：`/admin/me`、`/teacher/me`
- 文档目标：每个页面都拆成一份独立报告，固定覆盖
  - 页面展示差异
  - mock 与实际接口数据差异
  - 对齐建议

## 2. 文件清单

### 2.1 通用入口

- `01_login.md` 对应 `/login`

### 2.2 管理端页面

- `02_admin-home.md` 对应 `/admin/home`
- `03_admin-course-settings.md` 对应 `/admin/course-settings`
- `04_admin-course-settings-students.md` 对应 `/admin/course-settings/[courseId]/students`
- `05_admin-course-settings-students-new.md` 对应 `/admin/course-settings/[courseId]/students/new`
- `06_admin-course-settings-students-edit.md` 对应 `/admin/course-settings/[courseId]/students/[studentId]/edit`
- `07_admin-course-settings-students-import.md` 对应 `/admin/course-settings/[courseId]/students/import`
- `08_admin-course-teachers.md` 对应 `/admin/course-teachers`
- `09_admin-emergency.md` 对应 `/admin/emergency`
- `10_admin-emergency-course.md` 对应 `/admin/emergency/course/[courseId]`
- `11_admin-emergency-select-teacher.md` 对应 `/admin/emergency/course/[courseId]/select-teacher`
- `12_admin-emergency-external-teacher.md` 对应 `/admin/emergency/course/[courseId]/external-teacher`
- `13_admin-time-settings.md` 对应 `/admin/time-settings`
- `14_admin-time-settings-detail.md` 对应 `/admin/time-settings/[detail]`
- `15_admin-time-settings-picker.md` 对应 `/admin/time-settings/[detail]/picker`
- `16_admin-control.md` 对应 `/admin/control`
- `17_admin-control-class-detail.md` 对应 `/admin/control/[classId]`
- `18_admin-unarrived.md` 对应 `/admin/unarrived`

### 2.3 教师端页面

- `19_teacher-home.md` 对应 `/teacher/home`
- `20_teacher-attendance-entry.md` 对应 `/teacher/attendance`
- `21_teacher-attendance-demo.md` 对应 `/teacher/attendance/demo`
- `22_teacher-home-roster.md` 对应 `/teacher/home/roster`
- `23_teacher-attendance-no-class.md` 对应 `/teacher/attendance/no-class`
- `24_teacher-no-class.md` 对应 `/teacher/no-class`

### 2.4 兼容路由说明

下面 3 个路由不是正式视觉页面，但链路上需要保留，因此单独给说明文件：

- `25_route-root.md` 对应 `/`
- `26_route-role-select.md` 对应 `/role-select`
- `27_route-teacher-attendance-demo-roster.md` 对应 `/teacher/attendance/demo/roster`

## 3. 使用方式

后续执行页面对齐时，建议始终按下面顺序使用这些文档：

1. 先看总报告，明确优先级。
2. 再看对应页面的单页报告，确认展示语义和数据语义。
3. 最后回到 `docs/最终页面对齐执行计划_XJM034_check-push-rules_20260416.md`，按步骤实施。

## 4. 当前重点

本轮最需要优先参考的单页文档是：

- `03_admin-course-settings.md`
- `09_admin-emergency.md`
- `13_admin-time-settings.md`
- `18_admin-unarrived.md`
- `19_teacher-home.md`

这 5 页不是单纯“接口接上后字段少了”，而是页面业务语义已经偏离 mock。
