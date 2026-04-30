# 最终页面对齐执行计划：`XJM034/check-push-rules`

## 1. 执行前步骤清单

说明：

- 个人页不纳入本次执行。
- 纯重定向页不作为正式页面步骤，但会做兼容校验。
- 下面按“一个页面一个步骤”列出。

步骤清单：

1. `/login`
2. `/admin/home`
3. `/admin/course-settings`
4. `/admin/course-settings/[courseId]/students`
5. `/admin/course-settings/[courseId]/students/new`
6. `/admin/course-settings/[courseId]/students/[studentId]/edit`
7. `/admin/course-settings/[courseId]/students/import`
8. `/admin/course-teachers`
9. `/admin/emergency`
10. `/admin/emergency/course/[courseId]`
11. `/admin/emergency/course/[courseId]/select-teacher`
12. `/admin/emergency/course/[courseId]/external-teacher`
13. `/admin/time-settings`
14. `/admin/time-settings/[detail]`
15. `/admin/time-settings/[detail]/picker`
16. `/admin/control`
17. `/admin/control/[classId]`
18. `/admin/unarrived`
19. `/teacher/home`
20. `/teacher/attendance`
21. `/teacher/attendance/demo`
22. `/teacher/home/roster`
23. `/teacher/attendance/no-class`
24. `/teacher/no-class`

兼容路由校验，不单列步骤：

- `/`
- `/role-select`
- `/teacher/attendance/demo/roster`

## 2. 执行总原则

### 2.1 基准原则

- 所有页面展示、文案、卡片层级、按钮语义，以 `origin/XJM034/check-push-rules` 为唯一视觉和交互基准。
- 不能因为当前接口字段不够，就改变页面语义去迁就接口。

### 2.2 数据原则

- 优先改适配层。
- 适配层无法表达 mock 页面语义时，再补聚合接口。
- 不允许继续把“老师设置数据”伪装成“课程设置数据”，也不允许把“课节时间设置数据”伪装成“规则时间设置数据”。

### 2.3 验收原则

每个步骤完成后，都必须同时通过三类验收：

- 视觉验收：页面结构、文案、按钮、卡片、跳转与 mock 一致。
- 数据验收：页面字段来源与 mock 页面语义一致，不再借错接口。
- 链路验收：从该页出发的下游页面仍能跑通。

## 3. 逐页执行步骤

### 步骤 1：`/login`

- 目标
  - 保持当前真实登录能力，同时保证初始页面视觉与 mock 一致。
- 要对齐的展示层
  - 标题、输入框布局、验证码按钮、登录按钮、协议区保持 mock 视觉。
  - 校区选择弹窗只能作为登录成功后的附加流程，不能破坏首屏样式。
- 要对齐的数据层
  - 保留 `loginWithCode` / `selectCampusAfterLogin`。
  - 不再让登录页承担页面语义漂移问题，这页只做回归验证。
- 完成标志
  - 首屏视觉与 mock 一致，登录后多校区弹窗正常。

### 步骤 2：`/admin/home`

- 目标
  - 恢复 mock 首页“管理设置”语义，并修正入口角标表达。
- 要对齐的展示层
  - 今日生效规则卡、老师设置卡、常用入口卡保持 mock 排布。
  - “课程设置”入口角标必须表达“今日生效课程数”，不能再表达别的统计。
- 要对齐的数据层
  - 检查 `mapAdminHomeData`。
  - `entryCards` 的 `课程设置.badge` 改为真实的“今日生效课程数”。
  - 如果当前 `fetchAdminHomeSummary` 不提供该数值，则补聚合字段。
- 完成标志
  - 首页视觉不变形，课程设置角标语义恢复正确。

### 步骤 3：`/admin/course-settings`

- 目标
  - 把页面彻底拉回 mock 的“当天生效课程配置页”。
- 要对齐的展示层
  - 恢复“当天规则”区。
  - 恢复“今日生效课程”列表标题。
  - 恢复“临时新增课程”按钮语义。
  - 恢复课程卡片右上角标签：`今日行课 / 临时新增`。
  - 恢复次按钮：`移出今日行课 / 保留到今日行课`。
  - 恢复底部“保存课程设置”总提交语义。
- 要对齐的数据层
  - 停止使用 `fetchAdminTeacherSettingsOverview -> mapAdminCourseSettingsData` 作为页面主模型。
  - 新增或重构页面数据模型，至少能表达：
    - 当天规则
    - 今日最终生效课程集合
    - 每门课的来源状态
    - 临时新增集合
    - 移出/保留动作
  - 如后端无现成接口，优先补聚合接口。
- 完成标志
  - 页面结构、文案、交互与 mock 一致。
  - 不再出现“教师设置”替代“今日行课调整”的问题。

### 步骤 4：`/admin/course-settings/[courseId]/students`

- 目标
  - 恢复 mock 名单页的信息密度与上下文。
- 要对齐的展示层
  - 课程上下文卡恢复时间、地点、老师、人数。
  - 搜索提示恢复到“姓名 / 学生ID / 行政班”。
  - 保留新增学生和批量导入两个入口。
- 要对齐的数据层
  - `mapAdminCourseRosterData` 不能只返回“地点 + 教师数量”。
  - 补齐：
    - 课节时间
    - 当前课程老师
    - 学生人数
    - 如有临时学生/重点学生，保留高亮语义
- 完成标志
  - 名单页看起来就是 mock 的“课程名单页”，而不是通用学生表。

### 步骤 5：`/admin/course-settings/[courseId]/students/new`

- 目标
  - 保留真实创建能力，同时恢复 mock 页面上下文与文案风格。
- 要对齐的展示层
  - 保留新增页 badge、课程上下文、返回名单按钮位置。
  - 文案贴近 mock：新增学生、保存并加入名单。
- 要对齐的数据层
  - 保留真实 `homeroomClassId` 下拉。
  - 页面展示层要兼容 mock 的简洁表达，不让真实字段暴露得过于技术化。
- 完成标志
  - 新增页既能提交真实数据，又能看起来像 mock 页。

### 步骤 6：`/admin/course-settings/[courseId]/students/[studentId]/edit`

- 目标
  - 恢复编辑页的课程-学生关系提示。
- 要对齐的展示层
  - 增加 mock 中的 `courseContext` 样式和文案。
  - 保留编辑页 badge、课程标题、保存按钮层级。
- 要对齐的数据层
  - `getAdminCourseStudentForm` 继续返回真实学生数据。
  - 补回 `courseContext` 展示字段。
- 完成标志
  - 编辑页既是真实表单，又能明确告诉用户“当前属于哪门课的哪位学生”。

### 步骤 7：`/admin/course-settings/[courseId]/students/import`

- 目标
  - 视觉保持 mock，同时明确接通策略。
- 要对齐的展示层
  - 支持字段、下载模板、上传名单版式与 mock 保持一致。
- 要对齐的数据层
  - 明确这页当前仍是 mock-only。
  - 如果本轮要完全闭环，则补真实模板下载/上传接口。
  - 如果本轮只做视觉对齐，至少在计划收尾时单独标注“此页仍未真正接后端”。
- 完成标志
  - 页面视觉与 mock 一致，且对真实接入状态有明确结论。

### 步骤 8：`/admin/course-teachers`

- 目标
  - 恢复“课程老师”而不是“老师通讯录”。
- 要对齐的展示层
  - 恢复周几筛选维度。
  - 老师卡片恢复“课程名 + 地点 + 时间 + 默认/代课状态”。
- 要对齐的数据层
  - 不能再只用 `fetchAdminTeachers` 老师实体列表。
  - 需要改成能按星期拿到“老师 - 课程 - 时间 - 地点 - 状态”的聚合数据。
  - `mapAdminCourseTeachersData` 需要重写。
- 完成标志
  - 进入该页时能看出“哪位老师负责哪门课”，而不是只看到姓名手机号。

### 步骤 9：`/admin/emergency`

- 目标
  - 让页面回到 mock 的“今日代课课程入口页”。
- 要对齐的展示层
  - featured 区块标题、课程卡、全部课程列表继续对齐 mock。
  - 搜索语义要围绕课程与默认负责老师。
- 要对齐的数据层
  - 不能简单用“周老师设置总览”替代“今日代课课程聚合”。
  - 如果需要周维度，也应保证 selected day 过滤后仍符合 mock 语义。
- 完成标志
  - 页面打开后，featured 和列表都表达“代课设置”，不是“本周老师配置总表”。

### 步骤 10：`/admin/emergency/course/[courseId]`

- 目标
  - 恢复 mock 的课程老师设置语义，同时兼容真实课节维度。
- 要对齐的展示层
  - 标题、当前点名老师卡、恢复默认老师按钮、切换按钮位置与 mock 一致。
  - 页面主语应优先是“这门课”，而不是“这节课的接口参数”。
- 要对齐的数据层
  - 保留 `courseSessionId` 真实能力。
  - 但页面展示层要把课节维度包装成 mock 的课程视角。
- 完成标志
  - 用户看的是课程老师设置页，内部仍能正确定位到真实课节。

### 步骤 11：`/admin/emergency/course/[courseId]/select-teacher`

- 目标
  - 保留真实选择能力，恢复 mock 的列表语义。
- 要对齐的展示层
  - 默认老师卡、老师列表、选中态、外部老师入口与 mock 一致。
  - 搜索框文案与 mock 一致。
- 要对齐的数据层
  - 保留 `fetchRollCallTeacherOptions`。
  - 缺失备注、老师来源状态时，需要适配层补足 mock 需要的 note。
- 完成标志
  - 页面视觉与 mock 一致，点击老师后真实提交正确。

### 步骤 12：`/admin/emergency/course/[courseId]/external-teacher`

- 目标
  - 维持 mock 外观，保证真实录入闭环。
- 要对齐的展示层
  - 表单字段、标题、保存按钮风格对齐 mock。
  - 增强课程上下文展示，避免成为裸表单。
- 要对齐的数据层
  - 保留 `createExternalTeacher`。
  - 录入成功后返回上一页并正确刷新当前老师。
- 完成标志
  - 页面既像 mock，又能真实录入系统外老师。

### 步骤 13：`/admin/time-settings`

- 目标
  - 把页面从“课节列表页”拉回 mock 的“规则设置首页”。
- 要对齐的展示层
  - 恢复周几 chips。
  - 恢复搜索框。
  - 恢复两张大卡：`设置实际上课时间`、`设置点名时间`。
- 要对齐的数据层
  - 当前 `mapAdminTimeSettingsData` 返回 `sessions[]`，不能满足 mock。
  - 需要新的首页模型，至少包含：
    - 当前规则日
    - 实际上课时间总规则
    - 点名时间总规则
    - 两个详情入口
- 完成标志
  - 页面再次成为 mock 的时间设置首页，而不是课节清单页。

### 步骤 14：`/admin/time-settings/[detail]`

- 目标
  - 恢复成 mock 的规则详情页，而不是课节详情页。
- 要对齐的展示层
  - 标题应是“设置实际上课时间”或“设置点名时间”。
  - 页面结构恢复为：
    - 规则上下文卡
    - 当前范围卡
    - 默认逻辑说明
    - 保存 / 恢复默认按钮
- 要对齐的数据层
  - 当前 `mapAdminTimeSettingDetail` 的 `sections[]` 设计不再适合 mock 页面。
  - 需要回到规则详情模型。
  - 如果真实后端仍然按课节返回，适配层要先聚合成规则页模型。
- 完成标志
  - 用户看到的是 mock 的规则详情页，不是某门课的时间详情页。

### 步骤 15：`/admin/time-settings/[detail]/picker`

- 目标
  - 恢复 mock 的视觉选择器表达，同时保留真实写入能力。
- 要对齐的展示层
  - 实际上课时间和点名时间的选择器外观尽量贴近 mock。
  - 如果继续使用真实表单控件，也要在视觉层做成 mock 样式，而不是原生表单页。
- 要对齐的数据层
  - 保留 `updateAdminCourseSessionTimeSetting` / `updateAdminCampusRollCallRule`。
  - 但页面入参、标题、上下文都要回归 mock 的规则型表达。
- 完成标志
  - 页面视觉与 mock 贴合，保存逻辑仍真实可用。

### 步骤 16：`/admin/control`

- 目标
  - 恢复 mock 的“点名总控”信息重心。
- 要对齐的展示层
  - 顶部摘要优先恢复 `已完成 / 未完成` 语义。
  - 卡片进度文案、颜色和状态表现对齐 mock。
- 要对齐的数据层
  - 保留当前 `fetchAdminRollCallOverview`。
  - 但页面主适配层要重新强调 `finishedCount / unfinishedCount`，不能让顶部完全变成考勤统计页。
- 完成标志
  - 这页看起来首先是“总控进度页”，其次才是结果统计页。

### 步骤 17：`/admin/control/[classId]`

- 目标
  - 保留真实操作能力，同时把视觉与状态表达拉回 mock。
- 要对齐的展示层
  - 摘要 chips、学生卡片、批量选择弹层与 mock 一致。
  - 如果保留 `未点名` 状态，需明确它在视觉上如何不破坏 mock 主风格。
- 要对齐的数据层
  - 保留真实 `submitAdminAttendance`。
  - 但如果 mock 目标不需要默认展示 `未点名`，则需要适配层把它合理隐藏或映射。
- 完成标志
  - 页面既能真实提交，又仍然像 mock 的班级名单页。

### 步骤 18：`/admin/unarrived`

- 目标
  - 把页面从“按课程课节分组”拉回“按行政班分组”。
- 要对齐的展示层
  - 恢复 mock 的行政班分组标题。
  - 学生卡片里主展示课程名，不再让课程名升到区块标题。
  - 顶部统计恢复 mock 语义。
- 要对齐的数据层
  - `mapAdminUnarrivedData` 必须重写。
  - 把当前 `fetchAdminAbsentStudents` 返回的课程课节数据重新 regroup 为行政班维度。
  - 若后端无法直接支撑，补聚合接口。
- 完成标志
  - 页面打开后先看到“哪个班缺谁”，而不是“哪门课缺谁”。

### 步骤 19：`/teacher/home`

- 目标
  - 恢复 mock 的“主课 + 代课”老师首页语义。
- 要对齐的展示层
  - 主卡、代课卡、周排课、明日行程与 mock 视觉一致。
  - 次卡 badge 恢复 `代课`，不是 `第2节`。
  - 次卡右上角文案恢复 `应到 xx` 一类的 mock 语义。
- 要对齐的数据层
  - `mapTeacherHomeData` 不能再把“同日第二节课”直接当作 `substituteCourse`。
  - 必须区分：
    - 正常主课
    - 真实代课
    - 同日多节正常课
  - 若当前接口缺“代课标识”，必须补字段或补接口。
- 完成标志
  - 老师首页重新表达 mock 的“今日主课 + 今日代课”。

### 步骤 20：`/teacher/attendance`

- 目标
  - 明确它是“点名入口中转页”，并与 mock 体验兼容。
- 要对齐的展示层
  - 此页不做视觉壳，只承担入口解析。
  - 底部 tab 从老师首页进入时，体验要与 mock 分支“直接进入点名页”一致。
- 要对齐的数据层
  - 保留 `getTeacherHomeData` 入口解析。
  - 当没有可点名任务时，必须稳定落到 `/teacher/attendance/no-class`。
- 完成标志
  - 老师点名入口体验不突兀、不多跳、不误跳。

### 步骤 21：`/teacher/attendance/demo`

- 目标
  - 让真实点名页视觉与 mock demo 页完全对齐。
- 要对齐的展示层
  - 顶部课程信息卡、地点卡、截止提示、学生卡、提交按钮全部对齐 mock。
  - 直接访问逻辑也要稳定，避免因为缺参数导致 demo 页体验消失。
- 要对齐的数据层
  - 保留真实 `getAttendanceSession`。
  - 需要保证在真实参数存在时页面仍保留 mock 视觉。
  - 对于缺少参数的情况，至少保证入口链路完整，不要让页面看起来“打不开”。
- 完成标志
  - 真实点名页与 mock demo 页在视觉上无明显偏移。

### 步骤 22：`/teacher/home/roster`

- 目标
  - 恢复 mock 名单页语义，并保持真实课节支持。
- 要对齐的展示层
  - 保持 mock 的“当前不在点名时间，可先查看学生名单”提示样式。
  - 返回按钮、名单卡、标签风格与 mock 一致。
- 要对齐的数据层
  - 保留 `courseId/courseSessionId` 真实解析。
  - 但页面展示层要继续兼容 mock 的主课/代课名单体验。
- 完成标志
  - 老师名单页看起来仍然是 mock 的名单页，只是底层换成真实数据。

### 步骤 23：`/teacher/attendance/no-class`

- 目标
  - 让这个新增页面与老师端整体视觉语言统一，并明确它的职责。
- 要对齐的展示层
  - 作为新增页，它不需要照搬 mock，但必须与 mock 老师端风格一致。
  - 文案要明确这是“点名入口无任务”，不是“老师今天没课”。
- 要对齐的数据层
  - 保持纯空态即可，不额外绑定接口。
  - 与 `/teacher/attendance` 中转逻辑联动验证。
- 完成标志
  - 点名入口空态明确、样式统一，不抢老师首页无课页的职责。

### 步骤 24：`/teacher/no-class`

- 目标
  - 保持 mock 的老师首页无课页不走样。
- 要对齐的展示层
  - 标题、说明、两个按钮、空态图标全部保持 mock。
  - 底部 tab 入口改到 `/teacher/attendance` 后，视觉仍与 mock 保持一致。
- 要对齐的数据层
  - 该页仍可保持静态。
  - 重点是与当前真实点名入口链路职责不冲突。
- 完成标志
  - 仍然是 mock 那个“老师今日无课”的标准空态页。

## 4. 建议执行顺序

虽然上面是“一页一步”，但真正落地时建议按依赖顺序推进：

1. 先改最容易把后续页面带偏的核心页：
   - `/admin/course-settings`
   - `/admin/time-settings`
   - `/admin/unarrived`
   - `/teacher/home`
2. 再改这些核心页的子链路：
   - 课程设置子链路
   - 时间设置子链路
   - 老师点名链路
3. 最后做入口页和回归页：
   - `/login`
   - `/admin/home`
   - `/teacher/no-class`
   - `/teacher/attendance/no-class`

## 5. 每一步完成后的固定回归清单

每完成一个页面步骤，固定做下面 5 项：

1. 对照 `origin/XJM034/check-push-rules` 页面截图或代码结构，看视觉是否回正。
2. 对照当前页面使用的数据函数，看是否仍在借错接口。
3. 点页面主按钮，看跳转是否仍符合 mock 链路。
4. 回看上游页面是否出现文案、角标、数量被反向带偏。
5. 回看下游页面是否还能打开，参数是否仍正确传递。

## 6. 计划结论

这份计划不是“先修几个最明显页面”，而是按页面逐个把 mock 分支的最终页面语义重新立起来。真正的完成标准不是“接口接通了”，也不是“样式更像了”，而是：

- 页面看起来与 `XJM034/check-push-rules` 一致
- 页面背后的数据语义也与 `XJM034/check-push-rules` 一致
- 上下游链路不会再因为接了真实接口就整体跑偏
