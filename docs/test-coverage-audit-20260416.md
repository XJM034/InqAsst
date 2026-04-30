# InqAsst 页面与测试链路审计

日期：2026-04-16

## 目标

这份文档不是测试用例清单，而是面向后续大规模补测/改测/重写的审计文档。

输出重点：

- 按功能模块整理当前页面能力与业务链路
- 说明每个模块当前已有的 tests 覆盖到哪里
- 标记哪些链路需要补充
- 标记哪些链路需要修改
- 标记哪些链路需要重写
- 单独梳理教师端与管理端互相影响的跨角色链路

## 审计范围

页面范围来自 [app](/d:/proj/backproj/InqAsst/app:1)：

- 登录与兼容跳转
  - `/`
  - `/login`
  - `/role-select`
- 教师端
  - `/teacher/home`
  - `/teacher/attendance`
  - `/teacher/attendance/demo`
  - `/teacher/home/roster`
  - `/teacher/attendance/no-class`
  - `/teacher/no-class`
  - `/teacher/me`
- 管理端
  - `/admin/home`
  - `/admin/control`
  - `/admin/control/[classId]`
  - `/admin/unarrived`
  - `/admin/course-settings`
  - `/admin/course-settings/[courseId]/students`
  - `/admin/course-settings/[courseId]/students/new`
  - `/admin/course-settings/[courseId]/students/[studentId]/edit`
  - `/admin/course-settings/[courseId]/students/import`
  - `/admin/course-teachers`
  - `/admin/emergency`
  - `/admin/emergency/course/[courseId]`
  - `/admin/emergency/course/[courseId]/select-teacher`
  - `/admin/emergency/course/[courseId]/external-teacher`
  - `/admin/time-settings`
  - `/admin/time-settings/[courseSessionId]`
  - `/admin/time-settings/[courseSessionId]/picker`
  - `/admin/me`

接口与装配范围来自：

- 页面装配：[mobile-app.ts](/d:/proj/backproj/InqAsst/lib/services/mobile-app.ts:256)
- 服务端 API 封装：[mobile-api.ts](/d:/proj/backproj/InqAsst/lib/services/mobile-api.ts:67)
- 浏览器写接口：[mobile-client.ts](/d:/proj/backproj/InqAsst/lib/services/mobile-client.ts:160)

测试范围来自 [tests](/d:/proj/backproj/InqAsst/tests:1)：

- `unit`
- `service`
- `contract`
- `e2e`

## 现有测试层概览

### `unit`

- [attendance.test.ts](/d:/proj/backproj/InqAsst/tests/unit/attendance.test.ts:8)
  - 覆盖点名状态循环
  - 覆盖点名汇总统计
  - 覆盖时间窗口 banner tone 映射

结论：

- 只覆盖纯领域规则
- 不覆盖页面链路

### `service`

- [auth-session.test.ts](/d:/proj/backproj/InqAsst/tests/service/auth-session.test.ts:16)
  - cookie 读写
  - 校区选项解析
  - 角色首页跳转
- [mobile-adapters.test.ts](/d:/proj/backproj/InqAsst/tests/service/mobile-adapters.test.ts:16)
  - 教师首页数据映射
  - 点名提交 payload 映射
  - 未到学生分组映射
  - 时间设置列表映射
- [mobile-app.test.ts](/d:/proj/backproj/InqAsst/tests/service/mobile-app.test.ts:90)
  - 学生新增/编辑表单装配
  - 管理端总控装配
  - 未到学生装配
- [mobile-client.test.ts](/d:/proj/backproj/InqAsst/tests/service/mobile-client.test.ts:38)
  - 登录态行为
  - 校区选择/切换
  - 学生创建/编辑错误归一化
  - 管理端点名名单装配
- [student-upsert.test.ts](/d:/proj/backproj/InqAsst/tests/service/student-upsert.test.ts:3)
  - 学生表单校验

结论：

- `service` 层对学生管理和部分管理端装配覆盖较好
- 对教师管理装配、时间设置明细/编辑、教师端点名页实时同步等覆盖不足

### `contract`

- [mobile-api.test.ts](/d:/proj/backproj/InqAsst/tests/contract/mobile-api.test.ts:30)
  - 教师首页请求
  - 课程学生列表 query string
  - 管理端未到学生 query string
  - 时间设置接口 query string
  - 学生详情/新增/编辑接口
- [mobile-client.test.ts](/d:/proj/backproj/InqAsst/tests/contract/mobile-client.test.ts:32)
  - 登录接口
  - 教师/管理端点名提交接口
  - 时间设置写接口
  - 教师分配接口
  - 学生写接口
  - 管理端点名名单接口

结论：

- 主要覆盖“请求地址和 payload 是否正确”
- 不覆盖页面跳转和 UI 状态

### `e2e`

- [smoke.spec.ts](/d:/proj/backproj/InqAsst/tests/e2e/smoke.spec.ts:249)
  - 登录页渲染
  - 教师登录与点名入口
  - 管理员登录与只读页面链路
  - 多校区管理员选校区
- [write-live.spec.ts](/d:/proj/backproj/InqAsst/tests/e2e/write-live.spec.ts:63)
  - 学生新增/编辑闭环
  - 实际上课时间修改/恢复
  - 点名老师切换/恢复默认
  - 教师点名 -> 管理端后续操作闭环

结论：

- 核心写链路已有基础
- 但覆盖面仍集中在“学生管理、时间设置、教师管理、点名主链”
- 管理端批量点名、未到学生页写入、外请老师写入、导入链路等仍缺失

## 模块审计

## 1. 登录与会话链路

相关页面：

- [login/page.tsx](/d:/proj/backproj/InqAsst/app/login/page.tsx:1)
- [page.tsx](/d:/proj/backproj/InqAsst/app/page.tsx:1)
- [role-select/page.tsx](/d:/proj/backproj/InqAsst/app/role-select/page.tsx:1)
- [login-form.tsx](/d:/proj/backproj/InqAsst/components/app/login-form.tsx:1)

页面功能：

- 手机号 + 验证码登录
- 发送验证码
- 多校区管理员进入校区选择弹窗
- 登录成功后根据角色跳转
- `/` 与 `/role-select` 当前都只做兼容性重定向到 `/login`

接口链路：

- `POST /api/auth/send-code`
- `POST /api/auth/login`
- `POST /api/auth/select-campus`
- `POST /api/auth/switch-campus`

已有测试链路：

- `service`
  - 登录 session 写 cookie
  - 校区选择与切换
  - 角色首页解析
- `contract`
  - 登录相关接口 request shape
- `e2e`
  - 登录页渲染
  - 教师/管理员登录
  - 多校区管理员选校区

需要补充：

- 登录失败后的页面反馈细分场景
  - 验证码错误
  - 选校区失败
  - 发送验证码失败后直接输入验证码继续登录
- `/` 与 `/role-select` 的重定向 smoke

需要修改：

- 无

需要重写：

- 无

## 2. 教师首页与点名入口链路

相关页面：

- [teacher/home/page.tsx](/d:/proj/backproj/InqAsst/app/teacher/home/page.tsx:1)
- [teacher/attendance/page.tsx](/d:/proj/backproj/InqAsst/app/teacher/attendance/page.tsx:1)
- [teacher/no-class/page.tsx](/d:/proj/backproj/InqAsst/app/teacher/no-class/page.tsx:1)
- [teacher/attendance/no-class/page.tsx](/d:/proj/backproj/InqAsst/app/teacher/attendance/no-class/page.tsx:1)
- [teacher-home-client.tsx](/d:/proj/backproj/InqAsst/components/app/teacher-home-client.tsx:1)

页面功能：

- 教师首页展示本周课表与当日主课/代课
- 主按钮根据是否在点名窗口决定走“开始点名”还是“查看名单”
- `/teacher/attendance` 不是展示页，而是入口路由，会自动重定向到：
  - 点名页
  - 名单页
  - 无课页
- 教师无课页和点名无课页是两种不同的静态兜底页面

接口链路：

- `GET /api/me`
- `GET /api/teacher/home`
- `GET /api/teacher/courses/today`

已有测试链路：

- `service`
  - 教师首页数据映射
- `contract`
  - 教师首页 no-store 请求
- `e2e`
  - 教师登录后进入首页
  - 通过首页主按钮进入点名页或名单页

需要补充：

- 首页中“代课卡片”链路
- `attendanceWindowState` 为非 active 时，弹窗确认后跳只读名单页
- `/teacher/attendance` 自动重定向的单独断言
- 教师无课页和点名无课页的专门 smoke

需要修改：

- 当前教师 smoke 只校验“能进入某个入口”，粒度偏粗，建议拆成：
  - 首页渲染与周历
  - 点名入口重定向
  - 无课兜底

需要重写：

- 无

## 3. 教师点名页与只读名单页

相关页面：

- [teacher/attendance/demo/page.tsx](/d:/proj/backproj/InqAsst/app/teacher/attendance/demo/page.tsx:1)
- [teacher/home/roster/page.tsx](/d:/proj/backproj/InqAsst/app/teacher/home/roster/page.tsx:1)
- [attendance-session-client.tsx](/d:/proj/backproj/InqAsst/components/app/attendance-session-client.tsx:1)

页面功能：

- 同一个组件承担两种模式：
  - `attendance` 点名模式
  - `roster` 只读名单模式
- 点名模式支持：
  - 单个学生状态切换
  - 提交前异常学生确认
  - 全勤确认
  - 提交后返回教师首页
  - 在点名窗口内周期性轮询最新点名状态，远端变化且本地无改动时自动刷新
- 只读名单模式支持：
  - 展示名单
  - 展示“当前不在点名时间”提示

接口链路：

- `GET /api/me`
- `GET /api/teacher/home`
- `GET /api/courses/{courseId}`
- `GET /api/courses/{courseId}/students`
- `GET /api/courses/{courseId}/attendance/latest`
- `GET /api/courses/{courseId}/attendance/status`
- `POST /api/courses/{courseId}/attendance`

已有测试链路：

- `service`
  - 点名提交 payload 映射
- `contract`
  - 教师点名提交接口 payload
- `e2e`
  - 教师点名 -> 管理端获取点名 -> 管理端修正状态闭环

需要补充：

- 教师端“只读名单模式”独立断言
- 教师点名页在 `submitDisabled` 下的错误提示
- 轮询刷新逻辑
  - 本地无改动时遇到远端更新会 refresh
  - 本地有改动时不会被远端刷新覆盖
- 请假状态在教师端是否可编辑/展示的页面级校验

需要修改：

- 当前 write-live 主要覆盖“点 absent 并提交”，建议加一条纯 present/全勤提交链路

需要重写：

- 无

## 4. 教师个人页

相关页面：

- [teacher/me/page.tsx](/d:/proj/backproj/InqAsst/app/teacher/me/page.tsx:1)

页面功能：

- 展示姓名、手机号脱敏、角色信息

接口链路：

- `GET /api/me`

已有测试链路：

- 间接包含在教师登录 smoke 的 session 校验

需要补充：

- 教师个人页只读 smoke
- 手机号脱敏显示

需要修改：

- 无

需要重写：

- 无

## 5. 管理端首页与入口聚合

相关页面：

- [admin/home/page.tsx](/d:/proj/backproj/InqAsst/app/admin/home/page.tsx:1)
- [admin/me/page.tsx](/d:/proj/backproj/InqAsst/app/admin/me/page.tsx:1)
- [admin/course-teachers/page.tsx](/d:/proj/backproj/InqAsst/app/admin/course-teachers/page.tsx:1)

页面功能：

- 首页展示：
  - 今日生效规则
  - 教师设置 hero 卡
  - 常用入口
- 个人页展示：
  - 管理员信息
  - 当前校区
  - 可切换校区
- 课程教师页展示教师列表与搜索

接口链路：

- `GET /api/admin/me`
- `GET /api/admin/home/summary`
- `GET /api/admin/teachers`

已有测试链路：

- `service`
  - 管理员 profile cookie/校区基础能力
- `e2e`
  - 管理员登录后进入首页
  - `/admin/course-teachers` 只读 smoke

需要补充：

- 管理员个人页 smoke
- 校区切换后的页面跳转与内容变化
- 首页 hero 卡是否正确指向教师设置和课程教师列表
- 课程教师页的搜索与按天过滤

需要修改：

- 当前 admin smoke 覆盖了页面存在，但未校验首页入口跳转正确性

需要重写：

- 无

## 6. 管理端点名总控与班级点名页

相关页面：

- [admin/control/page.tsx](/d:/proj/backproj/InqAsst/app/admin/control/page.tsx:1)
- [admin/control/[classId]/client.tsx](/d:/proj/backproj/InqAsst/app/admin/control/[classId]/client.tsx:1)
- [admin-control-client.tsx](/d:/proj/backproj/InqAsst/components/app/admin-control-client.tsx:1)
- [admin-class-attendance-client.tsx](/d:/proj/backproj/InqAsst/components/app/admin-class-attendance-client.tsx:1)

页面功能：

- 总控页：
  - 展示全校区/当前校区班级点名进度
  - 搜索班级或老师
  - 复制未完成班级、复制异常信息
- 班级点名页：
  - 单个学生状态改写
  - 批量选择学生
  - 批量改为已到/请假/未到
  - 写回后显示“点名状态已同步”
  - 后端拒绝时回滚并展示错误

接口链路：

- `GET /api/admin/roll-call/overview`
- `GET /api/admin/teacher-settings/overview`
- `GET /api/courses/{courseId}`
- `GET /api/admin/courses/{courseId}/students`
- `GET /api/admin/courses/{courseId}/attendance/latest`
- `POST /api/admin/courses/{courseId}/attendance`

已有测试链路：

- `service`
  - 总控数据装配
- `contract`
  - 管理端点名提交 payload
  - 名单接口路径
- `e2e`
  - 管理员只读进入总控页
  - 教师点名后管理员进入班级页修正单个学生状态

需要补充：

- 班级点名页的批量改状态闭环
- 总控页卡片跳转到具体班级页
- 搜索过滤
- 复制按钮功能
- 管理端直接完成一节课点名的完整链路
  - 不依赖教师先提交
  - 班级页多学生修改 -> 提交 -> 最新点名/总控统计更新

需要修改：

- 当前跨角色 write-live 只验证单个下拉更新，未覆盖批量模式

需要重写：

- 无

## 7. 管理端未到学生页

相关页面：

- [admin/unarrived/page.tsx](/d:/proj/backproj/InqAsst/app/admin/unarrived/page.tsx:1)
- [admin-unarrived-client.tsx](/d:/proj/backproj/InqAsst/components/app/admin-unarrived-client.tsx:1)

页面功能：

- 将异常/未到学生按课程分组
- 搜索学生/班级/课程
- 复制异常名单
- 懒加载课节完整 roster
- 在异常页直接修改学生状态
- 写回使用完整 roster，而不是只传异常学生

接口链路：

- `GET /api/admin/absent-students`
- `GET /api/admin/courses/{courseId}/students`
- `GET /api/admin/courses/{courseId}/attendance/latest`
- `POST /api/admin/courses/{courseId}/attendance`

已有测试链路：

- `service`
  - 未到学生装配
- `contract`
  - 未到学生 query string
  - 名单懒加载接口
- `e2e`
  - 只读 smoke
  - 跨角色 write-live 中，教师点 absent 后会验证该页数据出现/消失

需要补充：

- 在未到学生页直接把学生改为已到/请假/未点名的写入闭环
- 懒加载完整 roster 后提交成功与失败的回滚逻辑
- 搜索过滤
- 复制异常名单按钮

需要修改：

- 当前 write-live 对该页只做“结果存在/结果消失”校验，不覆盖页面自身写操作

需要重写：

- 无

## 8. 管理端课程设置与学生管理链路

相关页面：

- [admin/course-settings/page.tsx](/d:/proj/backproj/InqAsst/app/admin/course-settings/page.tsx:1)
- [admin-course-settings-client.tsx](/d:/proj/backproj/InqAsst/components/app/admin-course-settings-client.tsx:1)
- [students/client.tsx](/d:/proj/backproj/InqAsst/app/admin/course-settings/[courseId]/students/client.tsx:1)
- [admin-course-roster-client.tsx](/d:/proj/backproj/InqAsst/components/app/admin-course-roster-client.tsx:1)
- [students/new/client.tsx](/d:/proj/backproj/InqAsst/app/admin/course-settings/[courseId]/students/new/client.tsx:1)
- [students/[studentId]/edit/client.tsx](/d:/proj/backproj/InqAsst/app/admin/course-settings/[courseId]/students/[studentId]/edit/client.tsx:1)
- [student-form-client.tsx](/d:/proj/backproj/InqAsst/components/app/student-form-client.tsx:1)
- [students/import/client.tsx](/d:/proj/backproj/InqAsst/app/admin/course-settings/[courseId]/students/import/client.tsx:1)

页面功能：

- 课程设置首页：
  - 搜索课程
  - 进入学生名单
  - 从课程设置入口跳转到教师设置
  - 底部 save 按钮当前没有绑定写逻辑
- 学生名单页：
  - 搜索学生
  - 进入新增学生
  - 进入批量导入
  - 进入编辑
- 学生新增/编辑页：
  - 表单校验
  - 提交后返回名单
- 批量导入页：
  - 当前仅展示字段、下载/上传按钮
  - 没有真实导入写链路

接口链路：

- `GET /api/admin/teacher-settings/overview`
- `GET /api/courses/{courseId}`
- `GET /api/admin/courses/{courseId}/students`
- `GET /api/admin/campuses/{campusId}/classes`
- `GET /api/admin/courses/{courseId}/students/{studentId}`
- `POST /api/admin/courses/{courseId}/students`
- `PUT /api/admin/courses/{courseId}/students/{studentId}`

已有测试链路：

- `service`
  - 学生新增表单装配
  - 学生编辑表单装配
  - 学生表单错误分支
  - 学生表单校验
  - 学生写接口错误归一化
- `contract`
  - 学生详情/新增/编辑接口
- `e2e`
  - 课程设置只读链路
  - 学生新增 -> 名单 -> 编辑 -> API 校验 -> SQL 清理闭环

需要补充：

- 课程设置首页到学生名单/教师设置跳转关系
- 学生名单页搜索过滤
- 学生新增失败场景页面提示
  - 重复 studentId
  - 行政班跨校区
  - 不在课程名册
- 编辑页不存在学生时的空态/404 路径
- 批量导入页当前的只读 smoke

需要修改：

- 课程设置页底部 save 按钮当前无写逻辑，测试文档里应标记为“视觉控件，不应误当真实业务闭环”

需要重写：

- 学生导入链路
  - 当前页面只有 mock/fallback 能力，[getAdminCourseStudentImport](/d:/proj/backproj/InqAsst/lib/services/mobile-app.ts:663) 没有 live 写接口
  - 这块不是补一个测试能解决，而是需要等真实导入接口确定后重写链路设计

## 9. 管理端教师设置与教师管理链路

相关页面：

- [admin/emergency/page.tsx](/d:/proj/backproj/InqAsst/app/admin/emergency/page.tsx:1)
- [admin/emergency/course/[courseId]/client.tsx](/d:/proj/backproj/InqAsst/app/admin/emergency/course/[courseId]/client.tsx:1)
- [teacher-setting-course-client.tsx](/d:/proj/backproj/InqAsst/components/app/teacher-setting-course-client.tsx:1)
- [select-teacher/client.tsx](/d:/proj/backproj/InqAsst/app/admin/emergency/course/[courseId]/select-teacher/client.tsx:1)
- [teacher-selection-client.tsx](/d:/proj/backproj/InqAsst/components/app/teacher-selection-client.tsx:1)
- [external-teacher/client.tsx](/d:/proj/backproj/InqAsst/app/admin/emergency/course/[courseId]/external-teacher/client.tsx:1)
- [external-teacher-client.tsx](/d:/proj/backproj/InqAsst/components/app/external-teacher-client.tsx:1)
- [course-teachers/page.tsx](/d:/proj/backproj/InqAsst/app/admin/course-teachers/page.tsx:1)

页面功能：

- 教师设置总页展示按周课程与教师设置入口
- 课程教师设置页展示：
  - 当前点名老师
  - 默认老师
  - 若当前为临时代课，可恢复默认老师
  - 可进入选老师页
- 选老师页支持：
  - 搜索老师
  - 选择系统内老师并立即写回
  - 跳转到外请老师页
- 外请老师页支持：
  - 创建系统外老师并立即绑定为点名老师
- 课程教师页支持：
  - 只读查看教师列表
  - 搜索与按天筛选

接口链路：

- `GET /api/admin/teacher-settings/overview`
- `GET /api/admin/course-sessions/{id}/roll-call-teacher`
- `GET /api/admin/course-sessions/{id}/roll-call-teacher/options`
- `PUT /api/admin/course-sessions/{id}/roll-call-teacher`
- `DELETE /api/admin/course-sessions/{id}/roll-call-teacher`
- `POST /api/admin/course-sessions/{id}/roll-call-teacher/external`
- `GET /api/admin/teachers`

已有测试链路：

- `contract`
  - 教师分配接口
- `e2e`
  - 教师设置总页只读 smoke
  - 课程教师页只读 smoke
  - 课程教师设置页只读 smoke
  - 选老师页只读 smoke
  - 外请老师页只读 smoke
  - 系统内老师切换/恢复默认 write-live

需要补充：

- 教师设置总页与首页 hero 的跳转链路
- 课程教师页按天筛选和搜索
- 外请老师创建 write-live
- 课程页在“当前就是默认老师”与“当前是临时代课老师”两种 UI 分支

需要修改：

- 当前教师管理 write-live 只覆盖系统内老师切换，不覆盖外请老师

需要重写：

- 外请老师写链路的测试设计
  - 目前没有明确清理策略，直接写 live 会污染共享测试环境
  - 需要先补后台清理方案或约定可回收测试数据格式，再重写为可持续运行的 live 用例

## 10. 管理端时间设置链路

相关页面：

- [admin/time-settings/page.tsx](/d:/proj/backproj/InqAsst/app/admin/time-settings/page.tsx:1)
- [admin/time-settings/[courseSessionId]/client.tsx](/d:/proj/backproj/InqAsst/app/admin/time-settings/[courseSessionId]/client.tsx:1)
- [admin/time-settings/[courseSessionId]/picker/client.tsx](/d:/proj/backproj/InqAsst/app/admin/time-settings/[courseSessionId]/picker/client.tsx:1)
- [admin-time-setting-picker-client.tsx](/d:/proj/backproj/InqAsst/components/app/admin-time-setting-picker-client.tsx:1)

页面功能：

- 列表页展示每日课节的：
  - 实际上课时间
  - 点名时间
  - 是否自定义
- 详情页展示：
  - 原始课节时间
  - 实际时间当前值/默认值
  - 点名时间当前值/默认值
  - 进入编辑页
- 编辑页支持两种模式：
  - `actual` 实际时间：按课节写入
  - `roll-call` 点名规则：按校区统一写入
- 编辑页支持：
  - 保存
  - 重置
  - 输入校验

接口链路：

- `GET /api/admin/time-settings/sessions`
- `GET /api/admin/course-sessions/{id}/time-settings`
- `PUT /api/admin/course-sessions/{id}/actual-time`
- `DELETE /api/admin/course-sessions/{id}/actual-time`
- `PUT /api/admin/campuses/{campusId}/roll-call-rule`

已有测试链路：

- `service`
  - 时间设置列表映射
- `contract`
  - 时间设置 query string
  - 时间设置写接口 payload
- `e2e`
  - 管理端只读进入时间设置页
  - 实际时间修改/恢复 write-live

需要补充：

- 时间设置详情页只读链路
- 点名规则编辑页 write-live
- 点名规则输入非法值校验
- 实际时间输入非法值校验
- 实际时间详情页/编辑页跳转链路

需要修改：

- 当前只覆盖 `actual-time` 写链路，`roll-call-rule` 仍缺 live 页面级覆盖

需要重写：

- 无

## 11. 管理员个人页

相关页面：

- [admin/me/page.tsx](/d:/proj/backproj/InqAsst/app/admin/me/page.tsx:1)

页面功能：

- 展示姓名、手机号、角色、校区选项

接口链路：

- `GET /api/admin/me`

已有测试链路：

- 登录/校区切换 service 测试覆盖了底层 session 行为

需要补充：

- 管理员个人页 smoke
- 校区切换后 active campus 与 tab link 参数变化

需要修改：

- 无

需要重写：

- 无

## 12. 兼容与静态页

相关页面：

- [page.tsx](/d:/proj/backproj/InqAsst/app/page.tsx:1)
- [role-select/page.tsx](/d:/proj/backproj/InqAsst/app/role-select/page.tsx:1)
- [teacher/no-class/page.tsx](/d:/proj/backproj/InqAsst/app/teacher/no-class/page.tsx:1)
- [teacher/attendance/no-class/page.tsx](/d:/proj/backproj/InqAsst/app/teacher/attendance/no-class/page.tsx:1)

已有测试链路：

- 目前主要依赖主链路间接覆盖

需要补充：

- 这几页的轻量 smoke

需要修改：

- 无

需要重写：

- 无

## 跨角色链路审计

## A. 教师点名 -> 管理端汇总/名单/修正

链路：

1. 教师首页进入点名页
2. 教师提交点名
3. 管理端总控进度变化
4. 管理端最新点名状态变化
5. 管理端未到学生页出现异常学生
6. 管理端班级页可修正状态
7. 修正后未到学生页同步消失

现有覆盖：

- 已由 [write-live.spec.ts](/d:/proj/backproj/InqAsst/tests/e2e/write-live.spec.ts:398) 覆盖主闭环

仍需补充：

- 教师全勤提交 -> 管理端汇总变化
- 管理端在未到学生页直接修正 -> 班级页与最新状态同步
- 教师提交后，教师端再次打开页面看到的最新状态

## B. 管理端教师设置 -> 教师端执行点名

链路：

1. 管理端更换点名老师
2. 课程课节的点名老师状态更新
3. 新老师在教师端“今日课程”或点名入口是否可见/可执行

现状：

- 当前只覆盖了管理端内部的切换和恢复默认
- 没有覆盖“切换后教师端是否感知到新点名执行人”

结论：

- 这是高优先级缺口
- 需要补一条跨角色 live 用例

## C. 管理端时间设置/点名规则 -> 教师端点名窗口

链路：

1. 管理端修改课节实际时间或校区点名规则
2. 教师端点名入口的可执行时间窗口变化
3. 教师点名页中的 deadline hint 与 submitDisabled 变化

现有覆盖：

- 已覆盖“为跨角色写用例临时修正数据库时间窗口”的辅助能力
- 已覆盖管理端 `actual-time` 页面写链路

缺口：

- 未覆盖“页面级修改规则后教师端 UI 感知变化”
- 未覆盖 `roll-call-rule` 页面写链路

结论：

- 这是核心联动链路，优先级高

## 需要补充 / 修改 / 重写 总表

### 需要补充

- 登录失败与兼容重定向 smoke
- 教师首页代课/无课/入口重定向细分链路
- 教师只读名单模式
- 教师个人页
- 管理员首页入口跳转与个人页
- 管理端总控页卡片跳转、搜索、复制按钮
- 管理端班级点名页批量改状态
- 管理端未到学生页写入闭环
- 课程设置页入口跳转与学生名单搜索
- 教师设置总页与课程教师页筛选/搜索
- 时间设置详情页与点名规则编辑页
- 静态兜底页 smoke

### 需要修改

- 教师 smoke：拆粗粒度入口校验
- 管理员 smoke：增加首页入口行为校验
- 跨角色 write-live：补全全勤提交、未到学生页写入、规则修改后教师端感知
- 文档与用例中明确“课程设置页 save 按钮当前不是真写逻辑”

### 需要重写

- 学生导入链路
  - 目前只有静态/Mock 页，没有真实导入接口闭环
- 外请老师写链路
  - 当前缺少稳定的测试数据回收方案

## 优先级建议

### P0

- 教师点名 -> 管理端总控/未到学生/班级修正的补强
- 管理端教师设置 -> 教师端点名执行人联动
- 管理端点名规则 -> 教师端点名窗口联动

### P1

- 管理端班级点名批量改状态
- 管理端未到学生页直接写入
- 教师首页多状态分支
- 时间设置详情与规则编辑页

### P2

- 课程教师页筛选/搜索
- 个人页
- 兼容重定向与静态兜底页

## 建议后续拆分方式

建议后续不要按“测试类型”拆任务，而要按业务模块拆：

1. 登录与会话
2. 教师首页与点名
3. 管理端点名
4. 学生管理
5. 教师管理
6. 时间设置
7. 跨角色联动

每个模块内部再同步补：

- `service`
- `contract`
- `e2e`

这样可以避免页面改了、底层契约和端到端链路没跟上的情况。

## 当前结论

当前仓库已经有“能跑的核心链路”，但还没有形成“全页面、全模块、全联动”的测试覆盖网。

当前最值得注意的事实有三点：

- 学生管理是现阶段覆盖最完整的模块之一
- 教师管理与时间设置已经有基础写链路，但跨角色联动覆盖还不够
- 管理端点名页和未到学生页虽然是核心业务页，但页面级写入覆盖明显不足

这意味着下一阶段不应只继续补零散 case，而应按这份文档做模块化补测和跨角色联动补测。
