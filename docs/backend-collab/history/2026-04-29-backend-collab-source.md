# 后端协同说明（内测期）

适用对象：`daoleme` 后端工程师

2026-04-28 文档口径更新：

- 项目已上线并进入内测期（用户于 2026-04-28 确认）。
- 本文件继续作为内测期前后端协同入口：接口缺口、字段口径、权限校验、错误码、shared dev 或内测环境后端问题都记录在这里。
- 早期“上线前 / 发布阻塞”表述保留为历史证据；新增问题应标明真实内测环境、本机 shared dev 复现或代码静态判断，不能混写。

2026-04-22 文档口径更新：

- 当前前端默认工作流是“本机前端 + 已部署 shared dev 后端”。
- 下文带 `[历史]` 的本机 `daoleme` / dev RDS 记录只作为后端排障背景，不再构成当前前端测试前置。
- 2026-04-27 补充：合班功能计划并入“更换点名老师”流程，前端按“合班 / 互换”二选一处理，不单独新增一个页面入口。

## 1. 已核对结论

前端已只读核对 `daoleme` 当前 `master` 代码，确认以下接口已经在后端代码中存在：

- `GET /api/admin/courses/{courseId}/students/{studentId}`
- `POST /api/admin/courses/{courseId}/students`
- `PUT /api/admin/courses/{courseId}/students/{studentId}`

当前前端已据此接入并纳入当前回归测试范围：

- 学生新增页
- 学生编辑页

补充已核对事实：

- 2026-04-15 已按后端老师提供的 dev RDS 账号清单完成一轮“账号 / 角色 / 校区一致性矩阵”验证，结果 `7/7 PASS`
- 这说明当前以下链路没有发现前后端错配：
  - `/api/auth/login`
  - `/api/me`
  - `/api/admin/me`
  - 前端 cookie 持久化
  - `/teacher/me` / `/admin/me` 页面展示
- 详细记录见：
  - `docs/账号角色校区一致性验证_20260415.md`
- 因此当前后端**不需要**再把“身份口径不一致”当成优先排查项

再补一条已确认结论：

- 老师 `11211111111 / 白测试 / 成都高新云芯学校`
- 当前前端 `/teacher/home` 显示“今天暂无排课 / 无课”
- 已直接核对后端返回：
  - `GET /api/teacher/home?weekStart=2026-04-13` -> `weekCourses=[]`
  - `GET /api/teacher/courses/today` -> `[]`
- 结论：
  - 这条“无课”是与后端当天数据一致
  - 当前不应把它当成前端显示 bug

## 2. 需要后端协同修正的内容

### 2.1 Swagger / 离线文档与 controller 不一致

当前问题：

- 后端 controller 已有学生 detail / create / update
- 并新增“校区学生搜索”和“已有学生加入课程名单”链路
- 但 `swagger-local.json` 仍未完整反映这些接口

需要修正：

- 补齐 `GET /api/admin/courses/{courseId}/students/{studentId}`
- 补齐 `POST /api/admin/courses/{courseId}/students`
- 补齐 `PUT /api/admin/courses/{courseId}/students/{studentId}`
- 补齐 `GET /api/admin/campuses/{campusId}/students/search`
- 补齐 `POST /api/admin/courses/{courseId}/students/existing`
- 保证请求体、返回体、必填字段、错误码与 controller / service 实现一致

### 2.2 学生新增 / 编辑字段约束需要明确写入文档

当前后端代码口径需要明确为：

- `name` 必填
- `homeroomClassId` 必填
- `externalStudentId` 选填
- 管理端页面展示的“学生ID”应统一指向数据库 `studentId`

需要后端在正式文档中明确：

- 字段中文语义
- 是否允许空字符串 / `null`
- 冲突或非法输入时的返回 message / code
- `POST /api/admin/courses/{courseId}/students` 在未传 `externalStudentId` 时按临时学生创建
- `PUT /api/admin/courses/{courseId}/students/{studentId}` 在未传 `externalStudentId` 时保留原值
- 以下场景的错误口径：
  - `externalStudentId` 重复
  - 行政班不属于当前校区
  - 学生不在当前课程名单却访问编辑页

### 2.2.1 教师端点名需支持临时学生补录

2026-04-28 前端新增教师端点名页“补录临时学生”入口，业务目标是：现场发现学生不在当前课程名单里，但实际来上课时，老师可以先把该学生补进名单，再完成本次点名提交。

前端当前按以下教师侧契约实现：

- `POST /api/courses/{courseId}/students?courseSessionId={courseSessionId}`
- query：
  - `courseSessionId` 必填，当前点名课节 ID，用于代课 / 合班场景下绑定本次点名上下文
- body：
  - `name` 必填，学生姓名
  - `homeroomClassId` 必填，行政班 ID
- 期望返回：
  - `studentId` 必填，数据库生成的学生 ID
  - `studentName`
  - `homeroomClassId`
  - `homeroomClassName`
  - `externalStudentId` 可选
  - `enrolledInCourse` 可选

前端行为：

- 单课点名页创建成功后，把返回学生追加进当前点名名单，默认状态为“已到”。
- 合班点名页在对应班级下创建，最终提交仍按 `courseSessionId + studentId + status` 上报。
- 如果接口返回 403 / 404 / 500，前端会提示老师联系管理员或后端同学确认接口，不会伪造添加成功。

当前确认：

- 2026-04-28 用户确认 shared dev 当前仍返回 `Server internal error`，根因是后端教师侧补录学生接口未写好 / 未正确实现；前端已按当前契约补齐 `courseSessionId`，不应继续按前端漏参处理。

需要后端处理：

- 教师账号是否允许在自己负责的当前课节课程下调用该接口，并按 `courseSessionId` 校验代课 / 合班点名权限。
- 若同名同班学生已存在但未在当前课程名单内，后端是复用已有 `studentId` 还是新建临时学生。
- 行政班列表是否可通过当前已有 `GET /api/admin/campuses/{campusId}/classes` 对教师账号开放，或提供教师侧等价接口。

### 2.2.2 课程设置临时新增课程需补“空白课程”创建口径

2026-04-21 前端已把 `/admin/course-settings/new-course` 调整为双入口：

- 从已有课程添加
- 添加空白课程

其中“从已有课程添加”仍沿用当前已存在能力：

- `GET /api/admin/course-settings/temporary-course-options`
- `POST /api/admin/course-settings/temporary-courses`
  - body：`{ date?, sessionId }`

新增需要后端补齐的，是“空白课程”创建请求也能走同一个写接口：

- `POST /api/admin/course-settings/temporary-courses`
  - body：
    - `date` 可选，格式 `YYYY-MM-DD`
    - `courseName` 必填
    - `sessionStartAt` 必填，ISO datetime
    - `sessionEndAt` 必填，ISO datetime
    - `location` 选填
    - `teacher` 选填
      - 系统内老师：`{ "source": "INTERNAL", "teacherId": number }`
      - 系统外老师：`{ "source": "EXTERNAL", "name": string, "phone"?: string }`
    - `students` 必填，至少 1 条
      - 系统内学生：`{ "source": "INTERNAL", "studentId": number }`
      - 系统外学生：`{ "source": "EXTERNAL", "name": string, "homeroomClassId": number }`

前端当前默认业务语义：

- 管理员可在当天临时创建一条“空白课程”记录，不必先绑定已有课节
- 页面不再手填开始时间 / 结束时间，而是直接读取当天“时间设置”里的实际上课时间
- 点名时间只读展示：
  - 已配置：直接显示实际区间
  - 未配置：显示“未配置”
- 若未填写地点，页面按“地点待定”展示
- 若未填写老师，页面按“待分配老师”展示
- 新建成功后，这门课应立刻进入“今日生效课程”列表
- 学生名单不再允许默认留空，页面要求至少补 1 名学生后才能提交

需要后端明确的校验 / 错误口径：

- `courseName` 为空
- `sessionStartAt` / `sessionEndAt` 缺失
- 结束时间早于开始时间
- `students` 为空
- 系统外学生 `name` 缺失
- 系统外学生 `homeroomClassId` 缺失
- 系统内老师 `teacherId` 非法
- 系统外老师 `name` 缺失
- 是否允许与当天已有课节时间重叠
- 点名时间未配置时，后端是否允许创建，还是要求先补时间设置
- 创建成功后返回的 overview / course row 是否与现有“临时新增”卡片完全同构

如果后端不希望复用 `temporary-courses`，也请尽快给出新的专用接口路径与请求体，避免前端重复改动。

本次页面实测复现与当前前端请求体，见：

- `docs/课程设置空白课程创建协同_20260421.md`

补充：当前新表单里“系统内老师 / 系统内学生”还额外依赖以下读链路，如果这些链路没打通，页面即使完成前端改造也无法完整走通：

- 系统内老师：
  - `GET /api/admin/teachers`
  - 需要保证返回当前管理员所在校区可选老师，且包含 `id / name / phone`
- 系统内学生：
  - `GET /api/admin/me`
  - 需要保证返回当前管理员的 `campusId`
  - `GET /api/admin/campuses/{campusId}/students/search`
  - 需要保证能按当前校区实时搜索已有学生，且返回 `studentId / name / homeroomClassId / homeroomClassName`

如果出现下面任一情况，都应归入后端协同问题，而不是前端静态页面问题：

- 老师列表为空，但当前校区实际存在老师
- 搜到的学生不属于当前校区
- `campusId / teacherId / studentId` 等关键字段缺失
- 接口超时、报错，或返回结构与现有字段假设不一致

### 2.3 共享 dev 稳定性建议排查

前端在共享 dev smoke 过程中观察到过偶发问题：

- `socket hang up`
- `ECONNRESET`
- 登录后导航偶发抖动

当前这些问题不是稳定复现，也没有阻塞主链 smoke 通过，但建议后端排查：

- 代理转发稳定性
- 上游服务连接复用或超时配置

### 2.4 shared dev 当前系统内代课老师写链被固定冲突拦截

2026-04-22 在“本机前端 `3000` + shared dev `proxy` 后端”口径下，已完成一轮业务闭环 live e2e：

- 标准老师点名主链通过
- 系统外老师录入 / 选择 / 恢复默认通过
- 当前真正阻塞在“系统内代课老师保存”

复现事实：

- 样本B：`courseSessionId=3911`，课程 `信奥校队`
- 在“更换点名老师”页选择系统内老师 `何伟 · 15928073530`
- UI 确认弹窗正常展示“将当前点名老师更换为该老师”
- 提交后页面未回跳，仍停留在选择页
- 页面直接出现错误文本：
  - `teacher schedule conflict: 何伟 2026-04-22 16:45-17:45`
- 读回 `GET /api/admin/course-sessions/3911/roll-call-teacher`
  - `currentTeacherName` 仍为默认老师 `何亚东`
  - `temporaryTeacherAssigned=false`

进一步为排除“个别老师确有冲突”的误判，前端又做了两轮只读外的最小探测：

- 对样本B `courseSessionId=3911`
  - 连续尝试 20 名系统内老师
- 对样本C `courseSessionId=5211`
  - 再尝试 3 名系统内老师

所有写请求都返回同一类结果：

- HTTP `200`
- body:
  - `code=1`
  - `message="teacher schedule conflict: 魏雅婷 2026-04-22 16:45-17:45"`

这说明当前 shared dev 更像存在下面某一种后端问题：

- 冲突校验命中了固定老师，而不是当前候选老师
- 当前课节的冲突对象解析错绑
- `PUT /api/admin/course-sessions/{courseSessionId}/roll-call-teacher` 在 shared dev 始终被同一条错误冲突短路

2026-04-22 同轮又补了三组更细的边界验证，进一步排除“只是业务上确实不能代”的可能：

- 同校区且当天无课：
  - 样本B `courseSessionId=3911`
  - 选择 `何彤雯 · 18113308350`
  - 该老师通过老师端登录后读取 `GET /api/teacher/courses/today`，结果为 `[]`
  - 但保存仍返回：
    - `message="teacher schedule conflict: 魏雅婷 2026-04-22 16:45-17:45"`
- 同校区且真实重叠：
  - 样本B 选择 `何伟 · 15928073530`
  - 该老师当天确有 `16:45-17:45` 课程 `探秘科学`
  - 但保存时返回的仍不是“何伟冲突”，而是同一条固定 `魏雅婷` 冲突
- 跨校区且当天无课：
  - 样本B / 样本C 候选中都可见 `丁群 · 13990691184`
  - 其 `campusId=147`
  - 当前两条样本课程 `campusId=146`
  - 该老师当天 `GET /api/teacher/courses/today` 结果同样为 `[]`
  - 对样本B、样本C保存时，均返回同一条固定 `魏雅婷` 冲突

这进一步说明：

- 当前保存失败不只是“老师当天有课就不能代”的正常业务判断
- 当前保存失败也不总是“当前被选老师真实冲突”被准确命中
- 当前更像混合了两类现象：
  - 真实重叠老师会返回自己的冲突
  - 部分当天无课老师会被错误命中为 `魏雅婷 2026-04-22 16:45-17:45` 冲突
- 在 2026-04-22 当天首批 10 个课节、同校区候选子集里，前端未找到稳定可复现的系统内代课老师保存成功正例

同时还有一条待后端确认的业务风险：

- `GET /api/admin/course-sessions/{courseSessionId}/roll-call-teacher/options` 当前返回的系统内候选覆盖多个校区
- 以样本B `courseSessionId=3911` 为例，系统内候选包含：
  - `campusId=144`
  - `campusId=145`
  - `campusId=146`
  - `campusId=147`
  - `campusId=148`
  - `campusId=149`
  - `campusId=150`
  - `campusId=151`
  - `campusId=152`
  - `campusId=155`
  - `campusId=157`
  - `campusId=165`
  - `campusId=168`
  - `campusId=169`
  - `campusId=170`
- 若业务不允许跨校区代课，候选范围本身也需要后端收口

对应最新前端证据：

- `docs/业务闭环E2E验证_20260422.md`
- `.codex/e2e-live-20260422/tc06d-agentbrowser-conflict.png`
- `.codex/e2e-live-20260422/tc06d-agentbrowser-same-campus-conflict.png`

影响范围：

- 管理端系统内代课老师选择无法完成
- 代课老师登录进入 / 完成点名 无法继续验收
- 当前不能宣称系统内代课闭环可用

对应前端证据：

- `docs/业务闭环E2E验证_20260422.md`
- `.codex/e2e-live-20260422/tc06c-debug.json`

2026-04-22 前端已继续按新方案把“同日系统内老师批量互换”入口和契约接上，但 shared dev 后端还缺下面这组能力，因此当前仍不能做 live 验收：

- 需要新增批量候选接口：
  - `POST /api/admin/roll-call-teacher/batch/options`
  - 请求体：
    - `sessionDate`
    - `courseSessionIds`
    - `q`
    - `page`
    - `size`
  - 前端期望返回：按 `courseSessionId` 分组的系统内老师候选，且要允许“当前属于组内其他课节的老师”继续出现在候选里
- 需要新增批量保存接口：
  - `PUT /api/admin/roll-call-teacher/batch`
  - 请求体：
    - `sessionDate`
    - `assignments[{ courseSessionId, teacherId }]`
  - 前端已按“目标老师等于默认老师 => 恢复默认老师”的规则提交
- 批量保存必须按整组最终态校验，而不是按单课当前占用逐条拦截：
  - 先整体释放所选课节当前占用
  - 再整体套入本次提交目标老师
  - 同一老师同日多门不重叠课要允许
  - 组内环状互换要允许
  - 只有最终状态真实重叠，或与组外未选课节真实冲突时才拒绝
- 失败时需要返回结构化冲突，而不是只返回一条字符串：
  - `courseSessionId`
  - `teacherId`
  - `teacherName`
  - `conflictDate`
  - `conflictTimeRange`
  - `conflictSource`（组内 / 组外）
- 批量提交必须是事务性的：
  - 整组要么全部成功
  - 要么全部失败
  - 不允许部分课节已切换、部分未切换

当前前端已完成的对接范围：

- 前端已把入口收回单课“更换点名老师”流程
- 当管理员在选择页点到“同时间段已有课”的系统内老师时：
  - 会先提示是否直接互换点名课程
  - 若该老师同时间段有多节课，前端会要求先选定要互换的那一节
- 用户确认后，前端再调用 batch 保存接口完成互换
- 若后端返回结构化冲突，前端会在确认弹窗里直接展示

因此当前更准确的状态是：

- 单课系统内代课保存：shared dev 后端仍阻塞
- 单课流程内的互换点名课程：前端入口与契约已接好，shared dev 后端待实现 / 待联调

2026-04-22 再补充一条给后端同学的边界说明：

- 当前必须后端协同的核心是“同日系统内老师互换点名课程”这条写链
- 前端已经负责的、不需要后端新增写接口的项包括：
  - 老师设置首页搜索保持为当前选中星期范围
  - 互换确认弹窗的中文提示与选课交互
- 但更换点名老师页还有一条 shared dev 读链路需要后端协助核对：
  - 前端当前已经按整周 `GET /api/admin/teacher-settings/overview?weekStart=...` 的老师-课节关系生成老师副标题
  - 目标展示是类似 `中国舞（周二） · 古典舞（周三）`
  - 用户最新 live 页面里，系统内老师副标题仍只显示通用兜底文案 `系统老师`
  - 这说明 shared dev 当前至少存在下面一种情况：
    - `teacher-settings overview` 返回的数据不完整，覆盖不到这些老师的本周课节关系
    - `teacher-settings overview` 在当前链路下失败，前端退回了兜底文案
- 因此如果后端这轮排期有限，请优先只看下面两件事：
  - 当管理员在单课“更换点名老师”页选择一个当天已有其它课节的系统内老师时，系统应允许按“整组最终态”完成互换，而不是继续被单课冲突校验短路
  - 请顺手核对 `teacher-settings overview` 在 shared dev 是否稳定返回完整的当前周老师-课节关系

给后端的最小实现口径可以直接理解为：

- 输入：
  - 当前课节 `A`，目标老师 `T`
  - 若 `T` 在同时间段已有课节 `B`
- 期望行为：
  - 后端按最终结果一次性校验并提交：
    - `A` 的当前点名老师改成 `T`
    - `B` 的当前点名老师改成 `A` 原当前点名老师
  - 如果最终状态不冲突，则整组一起成功
  - 如果最终状态有真实冲突，则整组一起失败并返回结构化冲突
- 当前 shared dev 不符合预期的表现：
  - 前端即使已识别出“这是可互换老师”，真正提交时仍会被现有单课冲突校验拦回
  - 所以管理员实际无法完成同日互换

2026-04-27 继续补充“合班 / 互换”的重点坑点，供后端实现和联调时优先关注：

- 合班入口计划放在单课“更换点名老师”确认流程中。
- 当管理员选择的目标系统内老师在同校区、同日期、同时间段已有多节课时，前端会允许：
  - 选择“合班点名”：从同时间段课节中多选 `1+` 节，与当前课节一起创建合班。
  - 选择“互换点名老师”：选择 `1` 节目标老师已有课节与当前课节互换。
- 互换和合班是业务互斥项；一次确认只能提交其中一种动作。
- 关键约束是：
  - 未选择处理方式前，前端不允许提交。
  - 选择合班时不传互换目标，也不调用 batch 互换接口。
  - 选择互换时不传合班课节，也不调用合班创建接口。
  - 创建合班后，合班主点名老师是管理员刚选择的目标老师。
  - 被合班课节的原点名老师只能查看点名情况，不应继续拥有提交点名权限。
- 当前前端已按下面合班创建契约接入：
  - `PUT /api/admin/roll-call-teacher/merge-group`
  - 输入至少包含：
    - `sessionDate`
    - 当前课节 `sourceCourseSessionId`
    - 目标点名老师 `targetTeacherId`
    - 合班课节 `mergeCourseSessionIds`
  - 后端按最终态一次性校验：
    - 所有合班课节必须同校区、同日期、同时间段。
    - 目标老师对合班组有唯一提交权限。
    - 原课节老师只保留查看权限。
- 互换仍走现有 batch 互换接口；它与合班创建接口不会在同一次确认中同时调用。
- 失败时建议返回结构化错误，至少能定位：
  - 哪个 `courseSessionId` 失败
  - 失败原因：已在其它合班、时间不一致、校区不一致、目标老师权限不满足、真实组外冲突等
- 老师端合班点名页当前前端按真实接口预留：
  - `GET /api/teacher/attendance/groups/{groupId}` 读取合班详情
  - `POST /api/teacher/attendance/groups/{groupId}` 一次提交整组合班点名
  - 提交 payload 为 `items: [{ courseSessionId, studentId, status }]`，避免同一个学生在不同课节中被错误合并
  - 返回详情建议包含 `groupId`、`groupName`、`campusName`、`sessionDate`、`sessionStartAt`、`sessionEndAt`、`rollCallStartAt`、`rollCallDeadlineAt`、`attendanceWindowActive`、`canSubmit`、`submitDisabledReason`、`sessions[]`
  - `sessions[]` 至少包含 `courseId`、`courseName`、`courseSessionId`、`location`、`sessionStartAt`、`sessionEndAt`、`rollCallCompleted`、`students[]`、可选 `latest`
- 老师首页 `GET /api/teacher/courses/today` 建议为合班课节补字段：
  - `rollCallGroupId`
  - `rollCallGroupName`
  - `rollCallGroupSize`
  - `rollCallGroupCanSubmit`
  - 前端会按 `rollCallGroupId` 折叠为一个 `/teacher/attendance/group?groupId=...` 任务卡。
- 管理端总控 `GET /api/admin/roll-call/overview` 建议为合班聚合补字段：
  - `rollCallGroupId`
  - `rollCallGroupName`
  - `rollCallGroupSize`
  - `rollCallGroupCourseNames`
  - `rollCallTeacherName`
  - `rollCallTeacherPhone`
  - 当前前端已能把相同 `rollCallGroupId` 的多行聚合成一个合班任务卡；如果后端直接返回聚合行，也请保持统计字段为整组合计。

### 2.5 [历史] 本机联调已确认新的发布阻塞问题：鉴权写请求预检返回 500

2026-04-15 在“本机前端 + 本机 `daoleme` + dev RDS”联调中，前端为绕开 Next 本地代理 30 秒超时，曾使用浏览器直连本机后端：

- `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080`
- `NEXT_PUBLIC_API_REQUEST_MODE=direct`

当前已明确查到的根因不是业务接口缺失，而是浏览器预检请求在后端被错误打成了 `500`。

复现特征：

- 浏览器页面表现为 `failed to fetch`
- 直接用 curl 模拟预检可复现：
  - `OPTIONS /api/admin/course-sessions/{id}/roll-call-teacher`
  - `OPTIONS /api/courses/{id}/attendance`
  - `OPTIONS /api/admin/courses/{id}/students`
- 这些请求当前都会返回：
  - HTTP `500`
  - 而不是预期的 `200/204`

影响范围：

- 更换点名老师
- 教师点名提交
- 时间设置写操作
- 学生新增 / 编辑提交
- 其他带 `Authorization + JSON body` 的浏览器写请求

后端需要修正到的目标：

- `OPTIONS /api/**` 预检返回 `200/204`
- 不要求预检携带 `Authorization`
- 不被 `AuthTokenInterceptor` 当成正常鉴权业务请求拦截

建议落点：

- `AuthTokenInterceptor.preHandle(...)` 对 `OPTIONS` 直接放行
- 或在拦截链顺序上显式让 `/api/**` 的预检先于鉴权通过

同时仍需允许以下来源访问 `/api/**`：

- `http://localhost:*`
- `http://127.0.0.1:*`

当前这个放行已经在本地联调工作副本里通过 `WebMvcConfig` 验证有效；本轮真正的阻塞点是预检与鉴权拦截顺序。

说明：

- 这项修改只涉及网关 / CORS / 鉴权拦截层，不涉及数据库
- 不需要新增测试专用接口
- 修复后建议至少补一条后端回归测试，证明带 `Origin + Access-Control-Request-*` 的预检不再返回 `500`

当前进展补充：

- 本地联调工作副本已经按上述方案完成修复：
  - `src/main/java/com/daoleme/api/auth/web/AuthTokenInterceptor.java`
- 本地联调工作副本已新增后端回归测试：
  - `src/test/java/com/daoleme/api/config/ApiCorsPreflightTest.java`
- 当前实测结果：
  - `OPTIONS /api/admin/course-sessions/1/roll-call-teacher`：`200`
  - `OPTIONS /api/courses/1/attendance`：`200`
  - `OPTIONS /api/admin/courses/1/students`：`200`
- 如果正式后端分支还没有吸收这两处修改，请优先合入；否则前端 `proxy/direct` 下的浏览器写流都会继续有不稳定风险

### 2.6 [历史] 本机 `daoleme` + dev RDS 稳定性建议排查

在本机联调过程中，后端日志观察到过以下问题：

- `Communications link failure`
- `EOFException`
- Hikari connection marked as broken
- `JpaSystemException: Unable to rollback against JDBC Connection`

当前影响：

- 直接打本机 `8080` 的多校区登录通常可成功，但耗时约 35 秒
- 若继续走 Next 本地代理链路，30 秒左右就会被前端代理打成 `500`

建议后端继续排查：

- dev RDS 连接稳定性
- Hikari 连接池参数与连接存活时间
- 多校区登录时的查询链路和慢点

### 2.7 [历史] 2026-04-15 已在本地联调分支验证的性能修复

本轮前后端联调已经在本地 `daoleme` 工作分支验证过一轮性能修复，供后端后续决定是否吸收：

- `UserService`
  - 多校区登录构建 `campusOptions` 时，改为一次性批量查询 `campusName`
  - 修复前多校区管理员 `13888888888` 的 `/api/auth/login` 约 `39s`
  - 修复后同接口约 `3.6s`
- `ProfileService`
  - 构建管理员 `campusOptions` 时，改为批量查询校区名
  - 避免 `admin.getCampus()` 懒加载导致的逐条查库

补充说明：

- 这些修改没有改接口路径，没有改数据库结构
- 只是把“逐条查校区名”改成了“按校区 ID 集合一次查”
- 如果后端工程师认为需要保留，请直接参考本地联调分支对应改法

### 2.7 管理端与老师端剩余慢点的后端定位建议

当前前端已去掉一部分不必要的首屏请求，但以下接口本身仍偏慢：

- `/api/teacher/home`
- `/api/admin/teacher-settings/overview`
- `/api/admin/absent-students`

从当前后端实现看，优先建议排查：

- `CourseReadService`
  - 教师首页、今日课节、点名入口相关读取
- `AdminReadService`
  - 点名总控、老师设置周课表、未到学生列表
- `RollCallTeacherResolver`
  - 默认老师 / 临时代课老师解析

原因：

- 这些服务里仍存在按课程、课节、老师、考勤记录逐条回库的写法
- 在 dev RDS 延迟偏高时，这类 N+1 查询会直接放大成明显的页面卡顿

### 2.8 当前更值得后端继续协同的方向

结合今天的实际测试结果，当前更值得后端继续协同处理的是：

- 业务数据一致性核对，而不是身份一致性
  - 老师侧：是否真的有课 / 无课
  - 管理侧：首页 summary、总控 overview、未到学生行数是否与页面一致
- 剩余慢点定位
  - `AdminReadService.homeSummary(...)`
  - `AdminReadService.absentStudents(...)`
  - `CourseReadService.teacherHome(...)`

换句话说：

- 当前“登录成了谁”这件事已经基本对齐
- 当前更需要后端一起看的，是“当天业务数据到底该显示什么”和“为什么这些读取还慢”

### 2.7.1 [历史] 2026-04-15 已在独立后端分支验证的第二轮性能修复

为避免和已有联调改动混在一起，这轮性能修复没有直接改旧工作副本，而是新开了独立分支：

- 分支：`codex/release-perf-investigate`
- 工作副本：`/Users/minxian/conductor/workspaces/daoleme-release-investigate`

本轮已验证有效的改动点：

- `RollCallTeacherResolver`
  - 增加批量快照解析，避免按课节逐条查默认老师 / 临时代课老师
- `AdminReadService`
  - `homeSummary(...)`
  - `rollCallOverview(...)`
  - `teacherSettingOverview(...)`
  - `absentStudents(...)`
  - 这几条都改成批量装载课程老师、在读学生、课节、最近点名记录、点名明细
- `CourseReadService`
  - `teacherHome(...)`
  - `listTodayForTeacher(...)`
  - 教师可见课节、周课表、今日课节的点名状态改为批量读取
- repository 新增批量方法：
  - `CourseSessionRepository.findByCourseIdInAndStartAtGreaterThanEqualAndStartAtBeforeOrderByCourseIdAscStartAtAsc(...)`
  - `CourseTeacherRepository.findByCourseIdIn(...)`
  - `CourseStudentRepository.findByCourseIdAndStatus(...)`
  - `CourseStudentRepository.findByCourseIdInAndStatus(...)`
  - `AttendanceRecordRepository.findByCourseSessionIdInAndSubmittedAtGreaterThanEqualAndSubmittedAtBeforeOrderByCourseSessionIdAscSubmittedAtDesc(...)`
  - `AttendanceRecordItemRepository.findByAttendanceRecordIdIn(...)`

同条件接口复测结果：

- 口径：
  - 本机前端 `3000`
  - 本机后端 `8080`
  - `daoleme` 连接 dev RDS
  - 教师 `18181459960`
  - 管理员 `18512840290`，选择 `成都高新云芯学校`
- 改前：
  - `admin home summary`：`5.625s`
  - `admin roll-call overview`：`7.068s`
  - `admin teacher-settings overview`：`11.063s`
  - `admin absent-students`：`6.520s`
  - `teacher home`：`12.824s`
  - `teacher today`：`3.771s`
- 改后热态：
  - `admin home summary`：`6.528s`
  - `admin roll-call overview`：`5.186s`
  - `admin teacher-settings overview`：`4.892s`
  - `admin absent-students`：`8.046s`
  - `teacher home`：`5.173s`
  - `teacher today`：`4.777s`

结论：

- 这轮已经明显改善：
  - `teacher home`
  - `admin teacher-settings overview`
  - `admin roll-call overview`
- 但还没有彻底解决：
  - `admin home summary`
  - `admin absent-students`
  - `teacher today`

这意味着：

- 一批应用层 N+1 已经清掉
- 剩余慢点更像：
  - `CourseRepository.findForCampusWithSessionsBetween(...)` 本身慢
  - dev RDS / Hikari 连接波动
  - 首页 / 未到学生仍有未命中的聚合查询热点

如果后端老师继续接着做，建议直接从这组文件开始：

- `src/main/java/com/daoleme/api/admin/AdminReadService.java`
- `src/main/java/com/daoleme/api/course/CourseReadService.java`
- `src/main/java/com/daoleme/api/admin/RollCallTeacherResolver.java`

### 2.7.2 [历史] 2026-04-15 proxy 发布口径 benchmark 结论

这轮又按当前更接近正式发布的本机联调口径做了一次完整 benchmark：

- 前端：
  - `http://127.0.0.1:3000`
- 后端：
  - `http://127.0.0.1:8080`
- 模式：
  - `NEXT_PUBLIC_API_REQUEST_MODE=proxy`
- 报告：
  - `[历史 calgary 工作区]/.gstack/benchmark-reports/2026-04-15-proxy-benchmark.md`
  - `[历史 calgary 工作区]/.gstack/benchmark-reports/2026-04-15-proxy-benchmark.json`

关键结论：

- 当前不能把“性能已 ok”作为上线结论
- 这轮 benchmark 的 verdict 是：
  - `needs_more_optimization`

最关键的页面时长：

- 教师登录到首页：
  - `8775ms`
- 教师进入点名主链：
  - `8096ms`
- 管理员登录到首页：
  - `17969ms`
- 管理端总控：
  - `8570ms`
- 管理端未到学生：
  - `8052ms`
- 课程学生名单：
  - `9802ms`
- 学生新增页：
  - `9032ms`
- 学生编辑页：
  - `15901ms`
- 多校区管理员登录到首页：
  - `17444ms`

最关键的接口时长：

- `teacher_home`：
  - `6884ms`
- `admin_home_summary`：
  - `4728ms`
- `admin_roll_call_overview`：
  - `3690ms`
- `admin_teacher_settings_overview`：
  - `5991ms`
- `admin_absent_students`：
  - `5019ms`

这轮结果说明：

- 前两轮优化不是没效果
- 但发布阻塞的性能慢点还没有收尾
- 剩余瓶颈仍然主要在后端聚合读取，而不是前端 bundle

当前最值得继续往下打的后端位置：

- `AdminReadService.homeSummary(...)`
- `AdminReadService.absentStudents(...)`
- `CourseReadService.teacherHome(...)`
- `CourseRepository.findForCampusWithSessionsBetween(...)`

建议后端老师审阅 `codex/release-perf-investigate` 这条分支时，不要只看“已有优化是否有效”，还要把这几条剩余热点当成下一轮重点。

### 2.7.3 [历史] 2026-04-15 proxy benchmark 第二轮与当前建议

这轮继续只在后端本地独立工作副本里做性能优化：

- 工作副本：
  - `/Users/minxian/conductor/workspaces/daoleme-release-investigate`
- 分支：
  - `codex/release-perf-investigate`

说明：

- 本轮仍未改数据库 schema、未执行 migration、未动业务数据
- 改动仍以 Java 代码层为主，方便后端老师逐条审阅后决定是否合并进正式 `daoleme`

本轮后端主要改动集中在：

- `src/main/java/com/daoleme/api/admin/AdminReadService.java`
- `src/main/java/com/daoleme/api/course/CourseReadService.java`
- `src/main/java/com/daoleme/api/admin/AdminSettingsService.java`
- `src/main/java/com/daoleme/api/user/service/UserService.java`
- `src/main/java/com/daoleme/api/school/repository/CourseSessionRepository.java`
- `src/main/java/com/daoleme/api/school/repository/CourseStudentRepository.java`
- `src/main/java/com/daoleme/api/school/repository/HomeroomClassRepository.java`
- `src/main/java/com/daoleme/api/school/repository/AttendanceRecordRepository.java`

配套前端为缓解重复切页，还增加了一层短 TTL 只读缓存：

- `lib/services/mobile-app.ts`
  - `course detail`：`30s`
  - `campus classes`：`60s`

第二轮 benchmark 报告：

- `[历史 calgary 工作区]/.gstack/benchmark-reports/2026-04-15-proxy-benchmark-round2.md`
- `[历史 calgary 工作区]/.gstack/benchmark-reports/2026-04-15-proxy-benchmark-round2.json`

最明显改善：

- `teacher_attendance_entry`
  - `8096ms -> 6075ms`
- `admin_login_to_home`
  - `17969ms -> 13479ms`
- `admin_control`
  - `8570ms -> 6344ms`
- `admin_course_students`
  - `9802ms -> 7941ms`
- `admin_student_edit`
  - `15901ms -> 9956ms`

仍然偏慢的热点：

- `teacher_home`
  - `5421ms`
- `admin_home_summary`
  - `5998ms`
- `admin_teacher_settings_overview`
  - `6702ms`
- `admin_absent_students`
  - `4309ms`
- `admin_campus_classes`
  - `4494ms`

当前建议后端老师继续优先看：

- `AdminReadService.homeSummary(...)`
- `AdminReadService.absentStudents(...)`
- `CourseReadService.teacherHome(...)`
- `AdminSettingsService.listHomeroomsByCampus(...)`
- 多校区管理员 `selectCampus / switchCampus` 相关恢复链路

结论：

- 第二轮优化已经有效，但发布结论仍然不是“性能已 ok”
- 当前更准确的说法仍然是：
  - `needs_more_optimization`

### 2.7.4 [历史] 2026-04-15 direct 口径 round3 体感验证

这轮不是新的发布 benchmark，而是验证前端新增的只读缓存是否能改善本机切页体感：

- 模式：
  - `NEXT_PUBLIC_API_REQUEST_MODE=direct`
- 报告：
  - `[历史 calgary 工作区]/.gstack/benchmark-reports/2026-04-15-proxy-benchmark-round3.md`
  - `[历史 calgary 工作区]/.gstack/benchmark-reports/2026-04-15-proxy-benchmark-round3.json`

这轮最有价值的结果：

- `admin_student_new`
  - `10883ms -> 2884ms`
- `admin_student_edit`
  - `9956ms -> 4216ms`
- `admin_course_students`
  - `7941ms -> 7301ms`

这说明两件事：

- 前端 `mobile-app.ts` 里新增的 `course detail / campus classes` 短 TTL 缓存对“学生名单 -> 新增/编辑学生”是有效的
- 后端 `admin_campus_classes` 从 `4494ms` 降到 `2872ms` 后，前端切页收益会立刻体现出来

同时要提醒后端老师：

- 这轮老师点名主链走到了真实 `/teacher/attendance` 页面，时长 `14977ms`
- 它不能和上一轮 `/teacher/attendance/no-class` 直接做优劣比较，但恰恰说明“真实点名页”仍是后续必须继续打的热点
- JSON 里出现的 `teacher_home = 4ms` 属于 warm/cache 干扰值，不能据此判断老师首页已经收尾

因此，这轮 round3 的价值主要是：

- 证明前端缓存策略有效
- 继续把后端下一轮重点压回：
  - `AdminReadService.homeSummary(...)`
  - `AdminReadService.absentStudents(...)`
  - `CourseReadService.teacherHome(...)`
  - 真实老师点名页相关读取链路

### 2.8 [历史] macOS 本机编译说明

在当前 macOS 本机联调环境下，`daoleme` 要正常 `mvn compile` / `spring-boot:run`，需要显式设置：

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=\"$JAVA_HOME/bin:$PATH\"
```

否则会出现：

- `Unable to locate a Java Runtime`

这属于本机环境问题，不是数据库或业务代码问题。

补充说明：

- 本轮没有做任何数据库 schema 或 migration 变更
- 如果后续确认需要改数据库层，请先单独形成 dated 文档，再由后端决定是否执行

### 2.9 2026-04-17 已部署后端口径：核心跨角色主链验证与当前阻塞

这轮已在“本机前端 `3000` + 已部署后端 `https://daoleme-dev.jxare.cn`”口径上，真实跑通一条核心跨角色主链：

- 管理员：
  - `17748085601 / 王磊 / 彭州市嘉祥外国语学校`
- 老师：
  - `19942378459 / 刘松林 / 彭州市嘉祥外国语学校`
- 课程：
  - `3566 / 棍网球校队`
- 课节：
  - `4451 / 2026-04-17 17:00-18:30`

已确认通过：

- `PUT /api/admin/campuses/146/roll-call-rule`
  - 写入后老师端确实进入可点名窗口
- `POST /api/courses/3566/attendance`
  - 老师提交成功
- `GET /api/admin/roll-call/overview`
  - 同步后目标课节为：
    - `rollCallCompleted=true`
    - `presentCount=9`
    - `absentCount=2`
- `GET /api/admin/absent-students?courseId=3566&courseSessionId=4451`
  - 正确返回 2 名未到学生
- 管理端复制未到学生文本
  - 文本命中：
    - `小2023级4班：周歆玥，棍网球校队`
    - `小2024级1班：李一墨，棍网球校队`

详细证据见：

- `docs/核心跨角色主链验证_20260417.md`

本轮新增后端阻塞项：

#### 2.9.1 单课节点名时间覆盖接口当前不可用

实测：

- `PUT /api/admin/course-sessions/4451/roll-call-time`
- 请求体：
  - `startOffsetMinutes=0`
  - `endOffsetMinutes=90`

返回：

- `code=1`
- `message=\"endTime is required; startTime is required\"`

这与当前前端契约和 contract test 使用的 offset 口径不一致。

同时：

- `DELETE /api/admin/course-sessions/4451/roll-call-time`

返回：

- `code=1`
- `message=\"session-level roll-call overrides are disabled; use the campus roll-call rule instead\"`

需要后端明确二选一：

- 要么恢复这条 session-level 写链，并和前端 offset 口径对齐
- 要么明确宣布废弃这条接口，并同步前端与文档删掉这条能力

#### 2.9.2 校区点名规则缺少可用删除/回滚能力

实测：

- 基线：
  - `GET /api/courses/3566/roll-call-windows` 为 `[]`
- 写入：
  - `PUT /api/admin/campuses/146/roll-call-rule`
  - `beforeStartMinutes=30`
  - `afterStartMinutes=90`
  - 返回成功
- 删除：
  - `DELETE /api/admin/campuses/146/roll-call-rule`

返回：

- HTTP `200`
- envelope：
  - `code=1`
  - `message=\"Server internal error\"`

影响：

- 无法把校区从“已配置规则”恢复到“无规则”
- 本轮只能 best-effort 把规则收紧到 `0/0`
- 测试后当前遗留：
  - 校区 `146` 的点名规则仍然不是空

后端需要修正到的目标：

- `DELETE /api/admin/campuses/{campusId}/roll-call-rule`
  - 能正确返回成功
  - 能把 `roll-call-windows` 恢复到空数组

#### 2.9.3 本轮测试残留，建议后端修复接口后顺手清理

由于当前没有可用回滚链路，本轮留下一条真实测试残留：

- 校区：
  - `146 / 彭州市嘉祥外国语学校`
- 目标课节：
  - `3566 / 棍网球校队 / 4451`
- 点名记录：
  - `attendanceRecordId=35`
  - `9 已到 / 2 未到`

如果后端补齐删除 / 回滚接口，建议把这条测试数据和校区规则一起清理到验证前基线。

### 2.10 2026-04-17 管理端老师设置周视图已切到聚合分页接口

当前前端 `/admin/emergency` 已不再使用：

- `GET /api/admin/teacher-settings/overview`

当前周视图统一改为消费：

- `GET /api/admin/emergency/weekly`

前端当前实际请求参数口径：

- `weekStart`
  - 当前周周一，格式 `YYYY-MM-DD`
- `dayKey`
  - `mon | tue | wed | thu | fri | sat | sun`
  - 首次进入不传，后续切星期 / 搜索 / 翻页会带当前选中值
- `q`
  - 搜索关键字
- `page`
  - 从 `0` 开始
- `size`
  - 当前固定 `20`

当前前端已完成并验证：

- 首次进入 `/admin/emergency` 会按当前筛选条件把 `/api/admin/emergency/weekly` 全部分页拉完
- 切星期会重新拉取新筛选条件下的 `/api/admin/emergency/weekly` 全部分页
- 搜索会重新拉取新筛选条件下的 `/api/admin/emergency/weekly` 全部分页
- 前端本地翻页不再新增 `/api/admin/emergency/weekly` 请求
- 周视图本身不再触发页面级 `/api/admin/course-sessions/*/roll-call-teacher`

当前这条新接口的后端协作重点不是“补新字段”，而是维持契约稳定：

- `selectedDayKey` 继续作为前端 tab 真值来源
- 前端当前会基于 `courses.items` 自行拆分顶部“今日代课课程”与底部“全部课程”
- `featuredCourse` 不再作为前端顶部单卡真值来源；若后端保留它，只能视为兼容字段
- `courses.items` / `totalElements` / `totalPages` / `page` / `size` 保持分页语义稳定
- 若后端后续要改字段名、分页基数或 `dayKey` 取值，需先同步前端，否则会直接打断老师设置 smoke 与页面交互

老师候选列表当前新增一条前端依赖，请后端知晓：

- 前端更换点名老师页默认使用：
  - `GET /api/admin/course-sessions/{courseSessionId}/roll-call-teacher/options?teacherType=ALL`
- 页面会把当前已选老师、历史系统外老师、系统内老师放在同一个候选列表里
- 若 `teacherType=ALL` 不能稳定返回可复用的历史系统外老师，前端不会改后端，只会把该限制继续记录在协同文档与专项验证文档
- 当前前端选择已有候选老师时统一走：
  - `PUT /api/admin/course-sessions/{courseSessionId}/roll-call-teacher`
- 只有新录入系统外老师时才走：
  - `POST /api/admin/course-sessions/{courseSessionId}/roll-call-teacher/external`

补充说明：

- 旧的 `/api/admin/teacher-settings/overview` 目前仍可能被其他页面或后端排障使用
- 但它已经不是 `/admin/emergency` 周视图的数据源，不应再把“前端老师设置首页当前依赖 overview”当成事实

### 2.11 2026-04-20 `/api/admin/emergency/weekly` 在共享 dev 环境仍存在慢响应，代理链路另有间歇性超时风险

本轮前端在继续联调管理端以下页面时，重新验证了同一条接口：

- `/admin/emergency`
- `/admin/course-teachers`

它们当前都依赖：

- `GET /api/admin/emergency/weekly`

已确认现象：

- `GET https://daoleme-dev.jxare.cn/api/admin/emergency/weekly/?weekStart=2026-04-20&page=0&size=20`
  - 未携带鉴权时，直打共享 dev：
    - `HTTP 200`
    - 首字节约 `1.66s`
    - 返回 `{"code":40101,"message":"Missing or invalid Authorization header","data":null}`
- 本机 `next dev` + `proxy` 口径直打同一路径、未携带鉴权时：
  - `HTTP 200`
  - 首字节约 `2.58s`
- 本机 `next dev` + `proxy` 口径、携带有效 `Authorization: Bearer <token>` 时：
  - `HTTP 200`
  - 首字节约 `1.65s`
  - 已返回正常周视图业务数据
- `/admin/course-teachers` 首屏原先使用整页 `PageLoading`
  - 共享 dev 当前 `1.6s+` 的接口耗时会被用户直接感知为“页面卡住”
  - 本轮前端已改成先返回页面框架 + 列表骨架，不再整页空白转圈
- 同一轮排查中，`next dev` 终端还出现过以下代理超时日志：
  - `/api/auth/login/`
  - `/api/admin/home/summary`
  - `/api/admin/me`
  - 错误形式为：`connect ETIMEDOUT 28.0.0.32:443`
  - 本机 DNS 当前把 `daoleme-dev.jxare.cn` 解析到 `28.0.0.32`
- 期间曾出现过一次携带鉴权直打 `weekly` 返回 `{"code":1,"message":"Server internal error","data":null}` 的情况，但后续重复请求未稳定复现；当前不能把这条 `code=1` 当成已稳定复现的唯一结论

当前判断：

- `/admin/course-teachers` 的“加载久”不再是纯前端渲染问题
- 当前能稳定确认的是：
  - `weekly` 在共享 dev / 本机代理链路上首字节约 `1.6s` 到 `2.6s`
  - 这个耗时足以让整页 spinner 体感很差
  - 共享 dev 代理链路对部分接口还存在间歇性连接超时风险
- 目前不能再把“`weekly` 稳定返回 `code=1`”当成已确认事实

建议后端优先排查：

- `daoleme-dev.jxare.cn` 当前解析 / 入口代理是否存在间歇性连接慢或超时
- `/api/auth/login`、`/api/admin/home/summary`、`/api/admin/me` 在共享 dev 的入口链路耗时
- `AdminEmergencyWeekly` 对应 controller / service / query 链路的基线耗时
- `weekStart=2026-04-20` 这周在当前 dev 数据下是否存在偶发性异常数据
- 若后端日志里确实存在 `code=1, message=\"Server internal error\"`，请补真实异常栈后再判断是否属于 `weekly` 的稳定问题

前端本轮已做的止损：

- `/admin/course-teachers` 首屏不再使用整页 spinner
- 改为页面框架 + 列表骨架先出，降低慢接口体感

但发布结论仍保持不变：

- 当前不能把 `/api/admin/emergency/weekly` 的稳定性和性能视为已收尾

## 3. 当前前端不再向后端追加的内容

以下内容本轮不上线，不要求后端立即补：

- 学生导入
- 课程设置首页汇总接口

如果后端希望把这两项并入本轮上线，请先同步前端重新开联调与测试计划。
