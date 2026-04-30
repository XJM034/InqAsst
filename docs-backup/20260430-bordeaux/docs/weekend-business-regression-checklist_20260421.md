# 周六周日业务回归清单

## 目标

- 验证管理端和教师端已经从“周一到周五业务假设”切换为“周一到周日完整兼容”。
- 验证的重点不是只有页面 tab，而是页面展示、接口返回、数据库落点、跨页面统计一致。

## 已完成的代码改造范围

- 管理端老师设置 `/admin/emergency`
- 管理端课程老师 `/admin/course-teachers`
- 管理端时间设置 `/admin/time-settings`
- 管理端课程设置按其它行课日行课 `/admin/course-settings/alternate-day`
- 后端 `AdminReadService` 周视图聚合改为 7 天
- 前端 `AdminEmergencyDayKey` / `AdminEmergencyDayKeyDto` 改为支持 `sat` / `sun`
- 本地 dev 数据 `campus_roll_call_window` 改为 `1..7`

## 管理端回归

### 1. 老师设置 `/admin/emergency`

- 打开页面时，如果当天是周六或周日，默认高亮必须是当天，不应回退到周一。
- 页面顶部 day tabs 必须显示 7 天。
- 切到周六、周日时：
  - 列表能正常加载
  - 搜索课程关键字后结果正确
  - 分页正常
  - featured 区域在当天有代课时能正常显示
- 关注接口：
  - `GET /api/admin/emergency/weekly?weekStart=...&dayKey=sat`
  - `GET /api/admin/emergency/weekly?weekStart=...&dayKey=sun`

### 2. 课程老师 `/admin/course-teachers`

- 页面顶部 day tabs 必须显示 7 天。
- 如果当天是周六或周日，默认选中必须正确。
- 切到周六、周日时：
  - 老师列表正常
  - 搜索老师姓名 / 手机号正常
  - 分页正常
- 接口结果要与 `/api/admin/emergency/weekly` 的周六周日课程一致。

### 3. 时间设置 `/admin/time-settings`

- 页面顶部 day tabs 必须显示 7 天。
- 如果当天为周六 / 周日，active day 必须正确。
- 周六 / 周日当天存在课节时：
  - “设置实际上课时间”卡片正常显示
  - “设置点名时间”卡片正常显示
- 明细页 `/admin/time-settings/[courseSessionId]`：
  - 周末课节可以打开
  - 当前时间段展示正确
- picker 页 `/admin/time-settings/[courseSessionId]/picker`：
  - 周末课节可以打开
  - 选择时间后能正常返回明细页

### 4. 课程设置 alternate day `/admin/course-settings/alternate-day`

- 页面中必须能选择周六、周日。
- 选中周六、周日并保存后：
  - 返回 `/admin/course-settings`
  - 当天有效课程数量正确
  - 当天有效课程列表正确
  - 被映射进来的课程显示为“今天生效”
- 关注接口：
  - `PUT /api/admin/course-settings/rule`
  - `GET /api/admin/course-settings/overview`

### 5. 管理首页 / 总控 / 未到学生

- `/admin/home`
  - 周六 / 周日当天能正常加载摘要
- `/admin/control`
  - 周六 / 周日当天能正常看到课程总控
- `/admin/unarrived`
  - 周六 / 周日当天能正常看到未到学生
- 这三页要交叉核对：
  - 有效课程数量
  - 未完成点名数量
  - 未到学生名单

## 教师端回归

### 6. 老师首页 `/teacher/home`

- 周历必须始终显示 7 天。
- 周六有课时：
  - `weekCalendar` 中 `sat` 有课
  - 默认 `defaultDayKey` 为 `sat`
  - 主课卡展示正确
- 周日有课时：
  - `weekCalendar` 中 `sun` 有课
  - 默认 `defaultDayKey` 为 `sun`
  - 主课卡展示正确
- 如果 todaySessions 把课程投影到周末当天：
  - 首页必须按周末当天展示，不得仍显示原工作日

### 7. 教师点名 `/teacher/attendance` / `/teacher/attendance/session`

- 周六 / 周日当天有课时，老师首页进入点名页链路正常。
- 如果周末存在点名窗口：
  - 正常允许开始点名
- 如果周末超出点名窗口：
  - 正常显示查看学生名单

## 数据库核对

### 8. 必查表

- `course_session`
  - 周六 / 周日是否有真实课节
- `course_teacher`
  - 周六 / 周日课程是否有默认老师
- `course_student`
  - 周六 / 周日课程是否有有效名单
- `campus_roll_call_window`
  - 是否存在 `weekday=6` / `weekday=7`
- `course_session_time_setting`
  - 周末课节如有覆写，是否可读
- `campus_course_settings`
  - 保存 alternate day 后是否写入 `alternate_weekday=6/7`
- `campus_course_settings_override`
  - 周末临时增删课是否正确记录

## 重点验收结论

- 页面上必须能看到周六、周日。
- 后端接口必须能接受并返回 `sat` / `sun`。
- 周末课程必须能进入老师设置、课程老师、时间设置、教师首页。
- 周末 alternate day 必须能把周六 / 周日课表映射到当天。
- 周末当天的首页、总控、未到学生统计必须一致。
