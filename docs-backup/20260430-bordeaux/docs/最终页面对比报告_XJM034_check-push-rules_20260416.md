# 最终页面对比报告：`XJM034/check-push-rules` vs 当前接口版

## 1. 对比范围

- 基准分支：`origin/XJM034/check-push-rules`
- 当前对比对象：当前工作区页面实现（真实接口版）
- 明确排除：`/admin/me`、`/teacher/me`
- 不单列为视觉页面，但需要链路校验的兼容/中转路由：
  - `/`
  - `/role-select`
  - `/teacher/attendance/demo/roster`

## 2. 总体结论

当前页面问题不是“接口接上后数据变了”，而是多条页面链路在接入真实接口时，把页面的业务语义一起改掉了。最典型的四处偏移如下：

1. `/admin/course-settings`
   由“当天生效课程配置页”被改成了“课程列表 + 教师设置入口页”。
2. `/admin/time-settings`
   由“规则级时间设置页”被改成了“按课节逐条设置时间页”。
3. `/admin/unarrived`
   由“按行政班查看未到学生”被改成了“按课程课节查看异常学生”。
4. `/teacher/home`
   mock 里的“代课语义”在真实接口适配中被替换成了“同日第二节课语义”。

根因不是单一页面写错，而是下面这些适配层把页面语义带偏了：

- `getAdminCourseSettingsData -> fetchAdminTeacherSettingsOverview -> mapAdminCourseSettingsData`
- `getAdminTimeSettingsData / getAdminTimeSettingDetail / getAdminTimePicker -> mapAdminTime*`
- `getAdminUnarrivedData -> fetchAdminAbsentStudents -> mapAdminUnarrivedData`
- `getTeacherHomeData -> mapTeacherHomeData`

## 3. 页面逐项对比

### 3.1 `/login`

- 页面展示差异
  - 初始视觉布局与 mock 基本一致，仍是手机号、验证码、登录按钮。
  - 当前页新增了登录后“校区选择弹窗”链路，这一层在 mock 分支不存在，但不影响初始页面外观。
- mock 与实际接口数据差异
  - mock 来源：`resolveLoginDestination(phone)`，本质是本地手机号映射角色与首页。
  - 当前来源：`sendLoginCode`、`loginWithCode`、`selectCampusAfterLogin`。
  - 该页属于“功能升级但视觉基本对齐”的页面，不是本次最严重偏移页。

### 3.2 `/admin/home`

- 页面展示差异
  - 主体版式仍接近 mock：规则卡、老师设置卡、常用入口还在。
  - 但“课程设置”入口角标语义已不稳定，当前接口版显示的不是 mock 中“今日生效课程数量”的明确表达。
- mock 与实际接口数据差异
  - mock 来源：`adminHomeData` / `adminHomeDataByCampus`。
  - 当前来源：`getAdminHomeData -> fetchAdminHomeSummary -> mapAdminHomeData`。
  - 当前 `课程设置` 入口 badge 由 `rollCallWindowRuleCount` 推导，表达的是“点名规则条数/窗口配置数”，不是 mock 期望的“今日生效课程数”。

### 3.3 `/admin/course-settings`

- 页面展示差异
  - mock 页面是“当天规则 + 今日生效课程 + 临时新增课程 + 保存课程设置”的完整配置页。
  - 当前页面被改成“点名模式 + 课程列表 + 临时代课设置 + 教师设置入口”；课程卡片右上角显示老师，次按钮变成“教师设置”，顶部按钮跳去 `/admin/emergency`。
  - 整页从“配置今日生效课程”变成了“浏览课程并配置点名老师”。
- mock 与实际接口数据差异
  - mock 来源：`adminCourseSettingsData`。
  - 当前来源：`getAdminCourseSettingsData -> fetchAdminTeacherSettingsOverview(getWeekStart) -> mapAdminCourseSettingsData`。
  - 当前真实数据只覆盖“课程、老师、是否临时代课老师”这套语义，缺少 mock 页面真正需要的：
    - 当天规则
    - 今日最终生效课程集合
    - 课程为何出现在今天的来源状态
    - 临时新增课程集合
    - “移出今日行课 / 保留到今日行课”的动作语义
  - 因此这页是当前偏移最严重的页面之一。

### 3.4 `/admin/course-settings/[courseId]/students`

- 页面展示差异
  - mock 页头上下文里有“课程标题 + 时间 + 地点 + 老师 + 人数”，并且允许通过 `highlighted` 表达临时名单重点项。
  - 当前页面只保留“课程标题 + 地点 + 任课老师数量”，时间、当前点名老师、人数上下文都弱化了。
  - 搜索文案也从“姓名 / 学生ID / 行政班”收窄成了“姓名 / 学号”。
- mock 与实际接口数据差异
  - mock 来源：`adminCourseRosters`。
  - 当前来源：`getAdminCourseRoster -> fetchCourseDetail + fetchAdminCourseStudents -> mapAdminCourseRosterData`。
  - 当前适配只拿到了课程详情和学生列表，没有“今日生效课程”上下文，也没有临时学生高亮语义，因此页面虽然还能看，但已经不是 mock 那个“今日课程名单页”的信息密度。

### 3.5 `/admin/course-settings/[courseId]/students/new`

- 页面展示差异
  - mock 是静态表单页，强调“新增学生”与当前课程上下文，字段都是自由输入。
  - 当前变成真实表单页，新增了真实校区行政班下拉，但页面不再展示 mock 里的轻量静态文案结构。
- mock 与实际接口数据差异
  - mock 来源：`adminCourseStudentForms["courseId:new"]`。
  - 当前来源：`getAdminCourseStudentForm -> fetchCourseDetail + fetchAdminCampusClasses`。
  - 当前数据模型从 `homeroomClassValue` 文本升级为 `homeroomClassId + homeroomClasses[]`，这是功能增强，但与 mock 页面字段结构已不一致。

### 3.6 `/admin/course-settings/[courseId]/students/[studentId]/edit`

- 页面展示差异
  - mock 编辑页会显示 `courseContext`，例如“当前属于 xxx · STU-xxxx”，强调学生与课程关系。
  - 当前编辑页实际可编辑，但上下文信息比 mock 更弱，页面更像通用编辑表单。
- mock 与实际接口数据差异
  - mock 来源：`adminCourseStudentForms["courseId:studentId"]`。
  - 当前来源：`getAdminCourseStudentForm -> fetchCourseDetail + fetchAdminCampusClasses + fetchAdminCourseStudentDetail`。
  - 当前已经切到真实学生详情模型，字段更真实，但 mock 里的“当前属于某门课的某位学生”展示语义没有完整保留。

### 3.7 `/admin/course-settings/[courseId]/students/import`

- 页面展示差异
  - 当前视觉与 mock 基本一致，仍是支持字段 + 下载模板 + 上传学生名单。
  - 这页目前不是主要视觉偏移页。
- mock 与实际接口数据差异
  - mock 来源：`adminCourseStudentImports`。
  - 当前来源：`getAdminCourseStudentImport`，实际上仍直接返回 mock 数据。
  - 也就是说这页“看起来对”，但本质还是 mock，没有真正接通上传/模板能力。

### 3.8 `/admin/course-teachers`

- 页面展示差异
  - mock 页面有星期维度，老师卡片上能看到“课程名 + 地点 + 时间 + 默认/临时代课状态”。
  - 当前页面只剩一个 `全部` 维度，老师卡片基本只显示“姓名 + 手机号”。
  - 结果页面仍叫“课程老师”，但已经看不出“老师对应哪门课”。
- mock 与实际接口数据差异
  - mock 来源：`adminCourseTeachersData`。
  - 当前来源：`getAdminCourseTeachersData -> fetchAdminTeachers -> mapAdminCourseTeachersData`。
  - 当前接口只返回老师实体列表，适配层失去了 weekday、课程、地点、时间、代课状态等维度，所以页面无法还原 mock 设计。

### 3.9 `/admin/emergency`

- 页面展示差异
  - 整体版式仍接近 mock：按周筛选、featured 卡片、全部课程列表仍在。
  - 但当前页标题是“老师设置”，页面语义更偏“点名老师配置”，而不是 mock 中“今日代课课程”。
- mock 与实际接口数据差异
  - mock 来源：`adminEmergencyData`。
  - 当前来源：`getAdminEmergencyWeeklyData -> fetchAdminTeacherSettingsOverview(getWeekStart)`。
  - 当前数据来自“周维度老师设置总览”，不等于 mock 所表达的“今日代课课程聚合”；因此 featured 课程、列表内容和筛选结果都可能混入“本周普通课程”，而不是“今日代课项”。

### 3.10 `/admin/emergency/course/[courseId]`

- 页面展示差异
  - mock 页面名称是“设置课程老师”，当前页面变成“设置点名老师”，整体更偏执行端口，而不是课程老师总配置。
  - 当前页面新增真实“恢复默认老师”动作，功能更强，但语义与 mock 的课程视角不完全一致。
- mock 与实际接口数据差异
  - mock 来源：`adminTeacherSettingCourses[courseId]`。
  - 当前来源：`getAdminTeacherSettingCourse(courseId, courseSessionId) -> fetchCourseDetail + fetchRollCallTeacher`。
  - 当前页必须依赖 `courseSessionId` 才能定位到具体课节，数据语义已经从“课程维度”切成了“课节维度”。

### 3.11 `/admin/emergency/course/[courseId]/select-teacher`

- 页面展示差异
  - mock 和当前在视觉上大体一致：课程信息、默认老师、老师列表、录入系统外老师入口都还在。
  - 当前页增加了实时搜索和真实提交状态，表现更偏真实业务页。
- mock 与实际接口数据差异
  - mock 来源：`adminTeacherSelections[courseId]`。
  - 当前来源：`getAdminTeacherSelection(courseId, courseSessionId) -> fetchCourseDetail + fetchRollCallTeacherOptions`。
  - 当前真实数据已按课节切换老师，且选择结果立即写接口；如果接口不给完整老师候选、备注、当前选中状态，就会直接影响页面完整度。

### 3.12 `/admin/emergency/course/[courseId]/external-teacher`

- 页面展示差异
  - mock 是“系统外老师录入页”的静态表单。
  - 当前页面仍是同类表单，视觉偏移不大，但更偏真实录入流程。
- mock 与实际接口数据差异
  - mock 来源：`adminExternalTeacherForms[courseId]`。
  - 当前来源：页面上下文已转为 `courseId + courseSessionId` 真正提交 `createExternalTeacher`。
  - 当前已不是 mock 的静态壳，而是真实写入链路；这一页问题不在视觉，而在要和上游老师选择页保持 mock 交互一致。

### 3.13 `/admin/time-settings`

- 页面展示差异
  - mock 页面是“周几 + 搜索 + 两张规则卡片（实际上课时间 / 点名时间）”。
  - 当前页面变成“某一天的课节列表”，每个课节一张卡，展示实际上课时间与点名时间。
  - 这是从“规则级页面”彻底变成了“课节级页面”。
- mock 与实际接口数据差异
  - mock 来源：`adminTimeSettingsData`，核心字段是 `days`、`actualClassTime`、`attendanceWindow`、两个详情入口。
  - 当前来源：`getAdminTimeSettingsData -> fetchAdminTimeSettingsSessions -> mapAdminTimeSettingsData`，核心字段变成 `dateLabel + sessions[]`。
  - 这不是简单字段缺失，而是整页数据模型完全换了，所以页面结构不可能对齐。

### 3.14 `/admin/time-settings/[detail]`

- 页面展示差异
  - mock 详情页对应“设置实际上课时间”或“设置点名时间”两种规则详情页。
  - 当前详情页对应的是“某个具体课节”的详情页，标题直接变成课程名，并且一个页面里同时包含“实际上课时间”和“点名时间”两个 section。
- mock 与实际接口数据差异
  - mock 来源：`adminTimeSettingDetails["class-time" | "attendance-window"]`。
  - 当前来源：`getAdminTimeSettingDetail(courseSessionId) -> fetchAdminCourseSessionTimeSettings -> mapAdminTimeSettingDetail`。
  - mock 的 `currentRange / defaultLogicText / pickerHref` 已变成当前的 `scheduledRange / sections[] / courseSessionId`，页面语义完全改变。

### 3.15 `/admin/time-settings/[detail]/picker`

- 页面展示差异
  - mock 是典型的滚轮式时间选择视觉稿。
  - 当前页面变成真实表单：实际上课时间用 `<input type="time">`，点名规则用“开课前/后多少分钟”的偏移输入。
  - 视觉交互与 mock 完全不是同一个控件形态。
- mock 与实际接口数据差异
  - mock 来源：`adminTimePickerData["class-time" | "attendance-window"]`。
  - 当前来源：`getAdminTimePicker(courseSessionId, kind) -> fetchAdminCourseSessionTimeSettings -> mapAdminTimePicker`。
  - 当前数据模型不仅有 `kind`，还有 `inputMode`、`campusId`、`beforeStartMinutes`、`afterStartMinutes`；这说明页面已经从 mock 的纯视觉选择器变成真实配置页。

### 3.16 `/admin/control`

- 页面展示差异
  - mock 顶部摘要只强调“已完成 / 未完成”，卡片上的进度文案更像“等待老师点名 / 已确认 12/30”。
  - 当前顶部改成“应到 / 已到 / 请假 / 未到”，更像实时统计总览；卡片文案统一成 `x/y 已到`。
  - 视觉仍同类，但信息重心已经从“班级点名完成度”偏向“考勤结果统计”。
- mock 与实际接口数据差异
  - mock 来源：`adminControlData / adminControlDataByCampus`。
  - 当前来源：`getAdminControlData -> fetchAdminRollCallOverview + fetchAdminTeacherSettingsOverview -> mapAdminControlData`。
  - 当前真实数据模型新增了 `totals.shouldAttend/present/leave/absent`，而 mock 的主语义是 `finishedCount/unfinishedCount`；这导致顶部区块展示逻辑变了。

### 3.17 `/admin/control/[classId]`

- 页面展示差异
  - mock 班级名单页是本地状态切换 + 批量修改。
  - 当前页面保留了批量修改，但每次修改会直接调用 `submitAdminAttendance`，还新增了 `未点名` 状态和接口错误反馈。
  - 整页更像“实时操作页”，不再是 mock 的静态演示页。
- mock 与实际接口数据差异
  - mock 来源：`adminClassAttendanceData`。
  - 当前来源：`getAdminClassAttendanceData -> fetchCourseDetail + fetchAdminCourseStudents + fetchAdminCourseLatestAttendance -> mapAdminClassAttendanceData`。
  - 当前数据模型新增 `courseId`、`courseSessionId`，状态集合也从 `present/leave/absent` 扩成了包含 `unmarked` 的接口模型。

### 3.18 `/admin/unarrived`

- 页面展示差异
  - mock 页面按“行政班”分组，每个学生卡片里写“缺的是哪门课”。
  - 当前页面按“课程课节”分组，区块头变成“课程名 + 时间 + 老师”，学生卡片里再补“行政班”。
  - 也就是说 mock 是“找班里的未到学生”，当前是“看某门课的异常学生”。
- mock 与实际接口数据差异
  - mock 来源：`adminUnarrivedData / adminUnarrivedDataByCampus`。
  - 当前来源：`getAdminUnarrivedData -> fetchAdminAbsentStudents -> mapAdminUnarrivedData`。
  - 当前适配器按 `courseId:courseSessionId` 分组，并拼入 roster 与老师状态；它天然不是 mock 所需的“按行政班优先”的数据模型，所以页面一定会跑偏。

### 3.19 `/teacher/home`

- 页面展示差异
  - mock 的次卡片明确是“代课”，并显示 `应到 18` 之类的任务语义。
  - 当前页面虽然保留了次卡片位置，但 badge 被做成了“第2节”，`expectedLabel` 也变成“点名待完成/已完成”，真实“代课语义”消失了。
  - 这会让页面从“老师今日主课 + 代课”变成“老师今天第1节 + 第2节”，含义完全不一样。
- mock 与实际接口数据差异
  - mock 来源：`teacherHomeData`。
  - 当前来源：`getTeacherHomeData -> fetchMeProfile + fetchTeacherHome + fetchTeacherTodaySessions -> mapTeacherHomeData`。
  - `mapTeacherHomeData` 目前只是把同一天的第二条 session 塞进 `substituteCourse`，并不等于“真实代课课程”；这是老师端首页偏移的核心根因。

### 3.20 `/teacher/attendance`

- 页面展示差异
  - mock 分支没有单独做这个入口页，底部 tab 直接指向 `/teacher/attendance/demo`。
  - 当前新增了一个中转页，进入后会自动跳到某门课的点名页，或跳到 `/teacher/attendance/no-class`。
- mock 与实际接口数据差异
  - 当前来源：`getTeacherHomeData`，根据 `daySchedules` 自动解析入口。
  - 这个页面本身不是主要视觉页，但它改变了老师端点名入口链路，因此必须纳入对齐与校验。

### 3.21 `/teacher/attendance/demo`

- 页面展示差异
  - mock 是固定 demo 点名页，任何时候都能直接打开。
  - 当前页已经变成真实点名页包装壳：没有 `courseId` 时会被重定向，不再稳定展示 mock 的演示态。
  - 页面内部还新增了提交禁用、轮询刷新、错误提示等真实状态。
- mock 与实际接口数据差异
  - mock 来源：`attendanceSession`。
  - 当前来源：`getAttendanceSession(courseId, courseSessionId) -> fetchCourseDetail + fetchCourseStudents + fetchCourseLatestAttendance + fetchTeacherHome -> mapAttendanceSession`。
  - 当前数据模型新增 `courseId`、`courseSessionId`、`attendanceWindowActive`、`submitDisabledReason`、`latestAttendanceRecordId` 等真实字段，导致它已不是 mock 的稳定 demo 数据页。

### 3.22 `/teacher/home/roster`

- 页面展示差异
  - mock 名单页主要作为“当前不在点名时间，先查看学生名单”的静态结果页。
  - 当前页仍保留这个形态，但已经完全依赖真实课节参数与真实学生列表。
  - 页面形态接近，链路语义已从 `day/course` 变成 `courseId/courseSessionId`。
- mock 与实际接口数据差异
  - mock 来源：通过 `getAttendanceSession("demo")` + `getTeacherHomeData()` 组合得到。
  - 当前来源：`getAttendanceSession(courseId, courseSessionId)`。
  - 旧 mock 的“哪一天、主课还是代课”语义已经不再主导当前名单页，当前名单页只认真实课节 ID。

### 3.23 `/teacher/attendance/no-class`

- 页面展示差异
  - mock 分支没有这个专门的“点名入口无任务页”。
  - 当前新增了一个“当前没有可执行点名任务”的空态页，视觉合理，但这是新页面，不是 mock 对应页。
- mock 与实际接口数据差异
  - 当前页是纯页面文案与入口链路结果，不依赖 mock 对象。
  - 它需要和 `/teacher/attendance` 中转逻辑一起校验，确保不会替代掉 mock 分支原本的首页无课页语义。

### 3.24 `/teacher/no-class`

- 页面展示差异
  - 当前页面与 mock 基本一致，仍是“老师首页今日无课”的空态示例页。
  - 唯一明显变化是底部点名 tab 已改为指向 `/teacher/attendance`，不再直达 `/teacher/attendance/demo`。
- mock 与实际接口数据差异
  - 这页本身仍是静态空态页面，不依赖真实接口。
  - 它的问题不在视觉，而在与当前真实点名入口链路之间的职责边界需要重新明确。

## 4. 不单列视觉页但必须校验的兼容路由

### `/`

- 页面展示差异
  - 无视觉内容，仍是重定向到 `/login`。
- mock 与实际接口数据差异
  - 无业务数据，仅做入口跳转，不是本次对齐重点。

### `/role-select`

- 页面展示差异
  - 无视觉内容，仍是重定向到 `/login`。
- mock 与实际接口数据差异
  - 无业务数据，仅做兼容跳转。

### `/teacher/attendance/demo/roster`

- 页面展示差异
  - mock 曾是视觉页入口。
  - 当前已退化成兼容重定向，直接跳 `/teacher/home/roster`。
- mock 与实际接口数据差异
  - 旧 query 语义是 `day/course`，当前视觉页语义是 `courseId/courseSessionId`，因此这里只能做兼容，不再适合作为主入口。

## 5. 优先级结论

### P0：必须先拉回 mock 语义的页面

- `/admin/course-settings`
- `/admin/time-settings`
- `/admin/time-settings/[detail]`
- `/admin/time-settings/[detail]/picker`
- `/admin/unarrived`
- `/teacher/home`

### P1：要跟着主链路一起对齐的页面

- `/admin/course-teachers`
- `/admin/control`
- `/admin/control/[classId]`
- `/admin/course-settings/[courseId]/students`
- `/teacher/attendance`
- `/teacher/attendance/demo`
- `/teacher/home/roster`

### P2：视觉接近，但仍需跟着主链路回归验证的页面

- `/login`
- `/admin/home`
- `/admin/emergency`
- `/admin/emergency/course/[courseId]`
- `/admin/emergency/course/[courseId]/select-teacher`
- `/admin/emergency/course/[courseId]/external-teacher`
- `/admin/course-settings/[courseId]/students/new`
- `/admin/course-settings/[courseId]/students/[studentId]/edit`
- `/admin/course-settings/[courseId]/students/import`
- `/teacher/attendance/no-class`
- `/teacher/no-class`

## 6. 报告结论

这次偏移不是“少调几个样式”可以解决的，而是多处页面在接入真实接口时，被错误的数据模型重新定义了页面职责。要把页面“完全对齐”到 `XJM034/check-push-rules` 的最终效果，必须遵守两条原则：

1. 先恢复 mock 分支页面的业务语义，再决定真实接口怎么喂这套页面。
2. 如果现有接口不能表达 mock 页面语义，就补聚合接口或补适配层，不能让页面继续迁就错误的数据模型。
