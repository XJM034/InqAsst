# 到了么内测质量跟踪

更新日期：2026-04-29

## 当前阶段说明

- 项目已上线并进入内测期（用户于 2026-04-28 确认）。
- 本文是内测期质量 / 回归状态入口，由原上线前自动化测试执行稿续名而来，继续保留上线前阶段的历史证据。
- 早期段落中的“不能宣称达到可上线状态”等判断，只代表当时上线前状态；当前不能据此否定“已上线进入内测”的项目阶段。
- 但未在真实环境或 shared dev 复测通过的写链、接口缺口、后端阻塞项，仍不能写成“已闭环”。
- 内测问题处理时，必须区分真实内测环境、本机 shared dev 复现、静态导出产物验证和代码静态判断。

## 当前结论

- 自动化测试模块已按当前前端联调代码落地，基线为本地已同步的 `origin/master`
- 当前不能把自动化绿灯等同于“全部内测反馈已关闭”或“所有写链已闭环”
- 2026-04-24 按用户要求，已撤回本轮前端管理端日期切换功能：
  - `/admin/home`、`/admin/control`、`/admin/unarrived` 继续按默认今日口径验证
  - `date=YYYY-MM-DD` 不纳入当前发布验收范围
- 2026-04-22 已按“本机前端 `3000` + shared dev `proxy` 后端”完成一轮业务闭环 live e2e，结果见：
  - `docs/业务闭环E2E验证_20260422.md`
- 当前默认已接入 shared dev / 后端数据；若接口字段缺失、联调不通或 shared dev 不稳定，优先补 service 适配与 `docs/后端协同说明_20260414.md`，不要为了推进页面新增 mock 数据。
- 当前这轮闭环验证的结论是：
  - 标准点名主链已通过：管理端设点名时间 -> 老师端提交 -> 管理端总控 / 未到学生 / 复制文本同步
  - 系统外老师录入 / 设为当前点名老师 / 再次进入候选页复用 / 恢复默认老师 已通过
  - 系统内代课老师写链当前在 shared dev 被后端固定冲突校验拦截，不能宣称代课闭环可用
  - 校区点名规则若基线为空，shared dev 当前仍无法删除恢复为“无规则”
- 2026-04-22 已补一轮 `TC-06` 边界探测，新增确认：
  - 在已复测的样本B / 样本C，以及当天首批 10 个课节、同校区候选子集里，前端未找到稳定可复现的“系统内老师保存成功”正例
  - 同校区且当天无课的系统内老师 `何彤雯 · 18113308350` 在样本B保存时，返回：
    - `teacher schedule conflict: 魏雅婷 2026-04-22 16:45-17:45`
  - 跨校区且当天无课的系统内老师 `丁群 · 13990691184` 在样本B、样本C保存时，也返回固定 `魏雅婷` 冲突
  - 同校区且真实重叠的老师 `何伟 · 15928073530` 保存时，会返回他自己的冲突：
    - `teacher schedule conflict: 何伟 2026-04-22 16:45-17:45`
  - 因此当前更准确的判断不是“所有候选都同一条固定冲突”，而是：
    - 一部分真实重叠老师会返回自己的冲突
    - 另一部分当天无课老师会被错误命中为 `魏雅婷` 冲突
  - 此外，`GET /api/admin/course-sessions/{courseSessionId}/roll-call-teacher/options` 当前返回的系统内候选覆盖多个 `campusId`；若业务不允许跨校区代课，这也是独立业务风险
- 2026-04-22 已补一轮前端侧阻塞优化：
  - 更换点名老师页会把 `teacher schedule conflict` 翻译成中文冲突提示
  - 搜索候选老师后，默认老师信息不再丢失
  - 系统内老师保存失败时，确认弹窗内会直接给出“改录系统外老师”兜底入口
  - 这轮优化只改善前端可操作性，不改变 shared dev 当前系统内代课写链仍被后端阻塞的判断
- 2026-04-22 已补一轮前端侧“同日系统内老师批量互换”接入：
  - 当前前端不再额外增加首页批量模式，而是继续沿用单课“更换点名老师”流程
  - 当管理员在单课选择页选中“同时间段已有课”的系统内老师时，前端会提示是否直接互换点名课程
  - 用户确认互换后，前端会在后台调用：
    - `POST /api/admin/roll-call-teacher/batch/options`
    - `PUT /api/admin/roll-call-teacher/batch`
  - 批量面板已支持：
    - 在单课确认弹窗里按“互换课程”处理同时间段老师互换
    - 若目标老师同时间段有多节课，可在弹窗中选择要互换的那一节
    - 保存失败时展示结构化冲突
  - 2026-04-22 晚间已补一处前端时段口径修复：
    - 互换识别现在按“当天有效课表”判断，而不是只看原始 `course.sessions`
    - 这样在调课 / 临时生效场景下，单课更换页仍能正确把同时间段老师识别为“可互换”
  - 2026-04-22 再补一轮前端识别来源修复：
    - 互换识别与老师副标题改为按整周 `teacher-settings overview` 老师-课节关系生成，不再只靠 `emergency weekly` 聚合结果去猜
    - 选择页老师副标题现在会展示该老师本周课程摘要，例如 `中国舞（周二） · 古典舞（周三）`
    - 互换确认弹窗也同步展示目标课程的 `周几 + 时间`
    - 老师设置首页搜索已回退为只搜索当前选中的星期，避免跨整周查询带来的明显变慢
    - 这轮修复已通过 `npm test`、`npm run lint`、`npm run build`
  - 2026-04-22 最新 live 页面反馈仍显示：
    - 更换点名老师页系统内老师副标题还是通用文案 `系统老师`
    - 同日有课老师在真实页面里仍未完成互换闭环
  - 因此当前更准确结论是：
    - 老师副标题这条前端方案已经落代码，但 live 页面尚未验证通过；需要继续排查 `teacher-settings overview` 读链路是否完整/稳定
    - 同日系统内老师互换写链仍需要 shared dev 后端补齐 batch 最终态校验与原子提交，当前不能宣称已可用
  - 但 shared dev 后端当前尚未提供可验收的 batch 最终态校验能力，因此这轮仍只能算“前端契约与入口已接上”，不能宣称批量互换闭环已通过
- 2026-04-27 合班功能 shape 阶段新增一个重点测试坑点：
  - 合班计划并入单课“更换点名老师”流程，不另起管理入口。
  - 当目标系统内老师同时间段已有课节时，管理员必须先选择“合班”或“互换”，两者按或关系处理。
  - 选择“合班”时，当前课节与所选 1+ 节同时间段课节合成一个点名任务。
  - 选择“互换”时，只把当前课节与目标老师的一节课交换点名老师，不创建合班。
  - 后续实现和测试必须重点覆盖“先选择处理方式”“合班和互换不同时提交”“两种路径分别有清晰错误态”。
- 2026-04-27 合班功能前端 craft 阶段已接入第一版真实契约与页面骨架：
  - 单课“更换点名老师”确认弹窗内新增“合班 / 互换”中间态选择，不新增单独管理入口。
  - 当前前端选择合班时调用 `PUT /api/admin/roll-call-teacher/merge-group`；选择互换时仍调用 batch 互换接口；两条路径互斥。
  - 老师首页可按 `rollCallGroupId` 折叠为一个合班任务，并跳转 `/teacher/attendance/group?groupId=...`。
  - 老师端合班点名页按班级分组展示学生，提交 payload 按 `courseSessionId + studentId` 逐项提交。
  - 管理端总控可按 `rollCallGroupId` 把多行聚合成一个合班任务卡。
  - 当前仍不能宣称 live 闭环已通过；shared dev 需要先补齐合班创建、老师端 group 详情/提交、总控 group 字段。
- 2026-04-17 已在“本机前端 `3000` + 已部署后端 `https://daoleme-dev.jxare.cn`”口径下，完成一条最关键的跨角色 live 写链验证：
  - 管理端设置点名时间
  - 老师端在窗口内提交点名
  - 管理端总控 / 未到学生同步
  - 管理端复制未到学生文本命中目标学生与行政班
- 2026-04-20 起，`next dev` 未显式设置 `API_REQUEST_MODE / NEXT_PUBLIC_API_REQUEST_MODE` 时，默认走 `proxy`，本机 `3000` 会把 `/api/*` 代理到 `https://daoleme-dev.jxare.cn`，避免登录页回退到本地 `/api/*` 404。
- 2026-04-22 已完成 shared dev 口径下的本地运行优化：
  - 当前本机开发仍必须走 `next dev` 同源 `proxy`；浏览器 `direct` 直打 `https://daoleme-dev.jxare.cn/api/*` 的本机预检复核结果仍是 `HTTP 403 Invalid CORS request`
  - `lib/services/http-core.ts` 已补 `15s` 超时和 `GET/HEAD` 单次重试，减少 shared dev 间歇性慢响应时的“长期卡住”
  - `lib/services/mobile-client.ts` 与登录页已补共享开发环境慢响应 / 不可用提示，避免把 shared dev 抖动误判为本机未起后端
  - 当前新的前端开发、样式调整、页面联调，统一继续使用“本机前端 `3000` + 已部署 shared dev 后端”，不要起本机 `daoleme`
- 2026-04-20 已完成“课程学生新增”前端方案切换：
  - 新增页不再首屏预拉 `/api/admin/students?page=&size=`
  - 管理端展示的“学生ID”统一切到数据库 `studentId`
  - 新增页写流拆成：
    - 校区实时搜索已有学生并直接加入课程名单
    - 未命中时按临时学生创建，由后端返回数据库 `studentId`
- 2026-04-21 起，“临时新增课程 > 添加空白课程”前端页已切到新表单口径：
  - 不再手填开始时间 / 结束时间
  - 直接展示当天“时间设置”里的实际上课时间与点名时间
  - 空白课程至少添加 1 名学生
  - 老师与学生都拆成“系统内 / 系统外”两种来源
- 但当前仍不能宣称这条新写链已经联调通过，原因是：
  - 后端新接口与新契约还未在 shared dev 完成验证
- 本轮专项证据见：
  - `docs/核心跨角色主链验证_20260417.md`
  - `docs/课程学生新增方案切换_20260420.md`
- 这条主链虽然已经跑通，但仍不能直接把“上线主写流已完全收尾”画勾，原因是：
  - `PUT /api/admin/course-sessions/{courseSessionId}/roll-call-time` 当前不可用
  - `DELETE /api/admin/campuses/{campusId}/roll-call-rule` 当前无法把校区规则恢复到“无规则”
  - `package.json` 虽然保留了 `test:e2e:write-live`，但仓库当前没有 `tests/e2e/write-live.spec.ts`
- 本轮不处理联调中引入的样式回归，只记录为后续视觉债
- 当前上线前测试分为两层：
  - 本地可重复的 `Phase 0`
  - 面向共享 dev 后端的 live smoke
- 历史本机 `daoleme` / dev RDS 联调记录保留在后文 dated sections 与归档文档中，但不再构成当前默认工作流
- 当前自动化绿灯只能证明“读链路与基础门禁通过”，不能替代上线主写流验收
- 当前上线范围：
  - 登录 / 多校区选校区
  - 教师首页 / 点名主链
  - 管理端首页 / 总控 / 未到学生 / 时间设置
  - 管理端老师设置 `/admin/emergency` 聚合分页周视图
  - 管理端单课“更换点名老师”里的互换确认（前端契约已接入，待 shared dev 后端补齐 batch 能力后再做 live 验收）
  - 课程学生新增
  - 课程学生编辑
  - 更换点名老师 / 恢复默认老师 / 系统外老师录入
- 2026-04-17 起，管理端老师设置周视图已切到后端聚合分页接口：
  - `GET /api/admin/emergency/weekly`
  - 当前前端会按“当前星期 + 当前搜索条件”把分页结果拉全，再在前端拆成：
    - 顶部“今日代课老师”
    - 底部“全部课程（去重后非代课课程）”
  - 顶部“今日代课老师”不再依赖后端单个 `featuredCourse`
  - 顶部卡片当前前端展示当前代课老师姓名、手机号，并同卡展示原上课老师与课程信息
  - 底部翻页改为前端本地分页，不再额外触发接口翻页请求
  - 周视图不再消费 `/api/admin/teacher-settings/overview`
  - 周视图不再触发页面级 `/api/admin/course-sessions/*/roll-call-teacher` 扇出
  - 已补 service / contract / live smoke 回归，真实账号口径 `4/4 PASS`
- 2026-04-20 起，更换点名老师页默认使用：
  - `GET /api/admin/course-sessions/{courseSessionId}/roll-call-teacher/options?teacherType=ALL`
  - 页面会把系统外老师候选置顶混排展示
  - 已存在的系统外老师候选复用时，前端直接走 `PUT /roll-call-teacher`
  - 只有新录入系统外老师时，才走 `POST /roll-call-teacher/external`
- 当前仍排除：
  - 学生导入
  - 课程设置首页汇总

## 已安装技能

- `api-contract-testing`
  - 安装位置：`~/.agents/skills/api-contract-testing`
  - 当前用途：校验 `mobile-client.ts`、`mobile-api.ts` 的请求契约与字段假设
- `api-testing-patterns`
  - 安装位置：`~/.agents/skills/api-testing-patterns`
  - 当前用途：整理登录、角色权限、点名链路、学生表单链路的测试模式

## 已实施范围

### 1. 测试工具

- `vitest`
- `jsdom`
- `@playwright/test`
- `vitest.config.ts`
- `playwright.config.ts`

### 2. 测试目录

```text
tests/
├─ unit/
├─ service/
├─ contract/
└─ e2e/
```

### 3. 当前测试命令

```bash
npm run test:unit
npm run test:service
npm run test:contract
npm run test:phase0
npm run test:e2e:smoke
npm test
```

默认约定：

- `npm test` 只跑 `Phase 0`
- `npm run test:e2e:smoke` 只跑低风险读路径 smoke
- 所有 live 写操作都不纳入默认自动化命令
- 当前关键主写流仍以人工联调证据为准，不能把 `test:e2e:write-live` 当成已落地事实
- 2026-04-20 补充：
  - 学生新增写流已经切到“已有学生搜索入课 / 临时学生创建”双路径
  - 在后端新接口未部署前，live smoke 仍只验证新增页 / 编辑页取数和页面渲染，不提交学生写操作
- 2026-04-28 补充：
  - 教师端点名页新增“补录临时学生”能力，用于现场发现名单里没有但实际来上课的学生。
  - 前端按管理端临时学生口径提交 `name + homeroomClassId`，由后端生成数据库 `studentId`。
  - 单课点名页成功补录后会把学生追加到本次点名名单，默认状态为“已到”，随后随点名提交一并上报。
  - 合班点名页按班级分别补录，提交时仍按 `courseSessionId + studentId + status` 上报。
  - 当前新增教师端写接口契约为 `POST /api/courses/{courseId}/students?courseSessionId={courseSessionId}`；shared dev 未验证前，不能宣称教师端临时学生完整写链已通过。

## Phase 0 当前覆盖

### Unit

- `lib/domain/attendance.ts`
  - 状态切换顺序
  - 汇总统计
  - window tone 映射

### Service

- `lib/services/auth-session.ts`
  - cookie 读写清理
  - 校区列表解析
  - 角色首页跳转
- `lib/services/mobile-client.ts`
  - 登录
  - 校区选择
  - 切校区
  - 登出
  - 学生新增 / 编辑提交行为
  - 校区学生实时搜索
  - 已有学生加入课程名单
- `lib/services/mobile-app.ts`
  - 学生新增页 form loader
  - 学生编辑页 detail loader
  - 管理端老师设置聚合分页 loader
- `lib/services/mobile-adapters.ts`
  - 点名提交 payload
  - 老师首页映射
  - 未到学生映射
  - 时间设置映射
- `lib/services/student-upsert.ts`
  - 学生表单提交前校验
  - `name / homeroomClassId` 必填约束
  - `externalStudentId` 选填时的请求体裁剪

### Contract

- `lib/services/mobile-client.ts`
  - `/api/auth/*`
  - `/api/courses/*/attendance`
  - `/api/admin/*`
  - `/api/admin/campuses/{campusId}/students/search`
  - `/api/admin/courses/{courseId}/students`
  - `/api/admin/courses/{courseId}/students/existing`
  - `/api/admin/courses/{courseId}/students/{studentId}`
- `lib/services/mobile-api.ts`
  - query string 拼装
  - `serverRequestJson` 调用方式
  - `unwrapEnvelope` 行为
  - `/api/admin/emergency/weekly` 查询参数序列化
  - 学生 detail / create / existing / update 的 server request 形态

## Live smoke 当前覆盖

当前 live smoke 默认只走共享 dev 后端，且只做低风险读路径验证。

若需要追溯历史本机 `daoleme` / dev RDS 联调、`proxy/direct` 基线或旧 benchmark，请看：

- `docs/archive/本机-daoleme-联调工作流归档_20260422.md`

其中 `/admin/emergency` 当前 smoke 额外校验：

- 首次进入会按当前筛选条件把 `/api/admin/emergency/weekly` 全部分页拉完
- 切星期会重新拉取新筛选条件下的 `/api/admin/emergency/weekly` 全部分页
- 搜索会重新拉取新筛选条件下的 `/api/admin/emergency/weekly` 全部分页
- 前端本地翻页不再新增 `/api/admin/emergency/weekly` 请求
- 周视图阶段不触发页面级 `/api/admin/course-sessions/*/roll-call-teacher`

2026-04-20 补充：

- `/admin/course-teachers` 同样依赖 `GET /api/admin/emergency/weekly`
- 当前共享 dev 口径下，这条接口首字节约 `1.6s` 到 `2.6s`
- 课程老师页首屏已改为页面框架 + 列表骨架，不再使用整页 `PageLoading`
- 若再次出现代理超时或接口异常，证据统一记到 `docs/后端协同说明_20260414.md`
- 2026-04-20 补充：
  - 学生新增页当前不再首屏请求 `/api/admin/students?page=&size=`
  - 学生新增新写流依赖：
    - `GET /api/admin/campuses/{campusId}/students/search`
    - `POST /api/admin/courses/{courseId}/students/existing`
  - 后端接口未就绪前，这条链路只能算“前端方案已切换，联调待补”

### 覆盖页面

- `/login`
- `/teacher/home`
- `/teacher/attendance/demo` 或 `/teacher/home/roster`
- `/admin/home`
- `/admin/control`
- `/admin/unarrived`
- `/admin/time-settings`
- `/admin/emergency`
- `/admin/course-teachers`
- `/admin/emergency/course/[courseId]`
- `/admin/emergency/course/[courseId]/select-teacher`
- `/admin/emergency/course/[courseId]/external-teacher`
- `/admin/course-settings/[courseId]/students/new`（只验证页面加载）
- `/admin/course-settings/[courseId]/students/[studentId]/edit`（只验证页面加载）

## 系统内代课老师边界补测矩阵

执行前提：

- 本组用例用于补齐 `TC-06`“系统内代课老师完整闭环”的业务边界。
- 2026-04-22 当前 shared dev 仍被固定 `teacher schedule conflict` 阻塞；在后端解除该阻塞前，本组用例默认记为“待执行 / 可能阻塞”，不能误记为失败。
- 本组重点不是“页面能不能打开”，而是验证“管理端指定系统内代课老师后，老师端与管理端的业务归属是否正确”。

### 重点业务判断

- 老师“当天有课”不应自动等于“不能被指定为另一门课的代课老师”。
- 只有在课节时间真实冲突时，系统才应该拒绝指定。
- 若候选列表中展示某位系统内老师为可选，保存阶段不应再无差别拦截；若确实拦截，必须给出与当前被选老师一致的准确冲突对象与时间段。
- 批量互换场景必须按“整组提交后的最终老师分布”校验，不能按单门课当前占用逐条提前拦截。
- 指定成功后，老师端首页、点名入口、点名页、管理端结果页必须基于“当前课节的实际点名老师”保持一致。
- 指定成功后，原默认老师不应继续持有同一课节的点名权限。

### 待补测用例

| 用例 | 场景 | 预期 | 特别关注的错判 |
| --- | --- | --- | --- |
| `TC-06A` | 系统内老师当天无课，被指定为另一门课的代课老师 | 管理端保存成功；代课老师登录后能看到该课；可进入点名并提交；管理端同步正确 | 保存成功但老师端无课；管理端显示已切换但老师端不同步 |
| `TC-06B` | 系统内老师当天有自己的课，但与被代课节次不冲突 | 应允许保存；老师首页能同时表达“自己的课 + 代课课”；代课课可正常完成点名 | 把“当天有课”误判成“时间冲突”；老师端只剩自己的课，看不到代课课 |
| `TC-06C` | 系统内老师当天有自己的课，且与被代课节次真实冲突 | 应拒绝保存；错误提示必须指向当前被选老师和正确冲突时间段 | 返回固定老师 / 固定时间；与实际被选老师不一致 |
| `TC-06D` | 候选列表里出现某位系统内老师，点击保存 | 列表与保存规则一致；若能展示为可选，通常应能保存，除非保存瞬间状态发生变化 | 候选列表把不可用老师当可选老师；页面“可选”与后端“必拦截”长期不一致 |
| `TC-06E` | 指定成功后，原默认老师再次登录老师端 | 原默认老师不应再进入该课节点名链；若仍看得到，也不应保留点名提交权限 | 两位老师同时都能处理同一课节；数据归属混乱 |
| `TC-06F` | 指定成功后，代课老师登录老师端进入点名 | 首页、底部点名 tab、点名页三处入口要指向正确课节 | 老师有自己的课时，底部“点名”tab 被错误带去自己的课，而不是代课课 |
| `TC-06G` | 代课老师提交点名后，管理端回看结果 | 管理端总控、课程详情、未到学生、当前点名老师四处结果一致 | 提交成功但记到错课节；未到名单和当前点名老师不一致 |
| `TC-06H` | 恢复默认老师后重新登录两端 | 管理端当前点名老师恢复；代课老师侧课节消失；原默认老师重新获得该课节点名权限 | 管理端恢复了，但老师端残留代课课；`temporaryTeacherAssigned` 未回滚 |
| `TC-06I` | 课程已提交点名后，再尝试更换系统内代课老师 | 业务规则必须明确：要么禁止更换并提示原因，要么允许更换但只读查看，不可产生“双老师重复提交” | 已提交后仍允许替换并再次提交，导致同一课节多次归属不清 |
| `TC-06J` | 在点名前 / 点名中 / 下课后分别更换系统内代课老师 | 三种时间态行为必须稳定且一致，不能同一链路在不同时间态下逻辑漂移 | 点名前可换、点名中异常、下课后还能写入且影响老师端入口 |
| `TC-06K` | 同一位系统内老师当天被指定两门不重叠的代课课 | 若两门课确实不冲突，应允许同时承担；老师端需能正确区分并进入对应课节 | 系统把“已有1门代课”误判成“当天不能再代第2门” |
| `TC-06L` | 跨校区 / 非当前业务范围老师出现在候选列表 | 候选范围应符合业务规则；若不允许跨校区，不应进入可选列表 | 候选过滤错误，把本不应可选的老师暴露出来，保存时再失败 |
| `TC-06M` | 同一时间段 `3` 门课做环状批量互换 | 整组提交成功；三门课当前点名老师按最终分配同时落地 | 因老师当前占用未先整体释放而被逐条误判冲突 |
| `TC-06N` | 同一位系统内老师在同一天被批量分配两门不重叠课 | 整组提交成功；老师端可区分两门课并进入正确课节 | 系统把“同日已有1门代课”误判成整组失败 |
| `TC-06O` | 批量互换里出现真实重叠 / 组外真实冲突 | 整组提交失败；返回结构化冲突到具体课节/老师/时间段，且所有课节保持原状态 | 部分课节先成功、部分失败；或只返回模糊字符串，无法定位哪一节冲突 |
| `TC-06P` | 批量互换中某一节课改回默认老师 | 提交成功后该课恢复默认老师，`temporaryTeacherAssigned=false`，其余课节按批量结果一并生效 | 恢复默认后仍残留临时代课标记；或需要单课额外回滚才能生效 |
| `TC-06Q` | 目标老师同时间段有 `B/C/D` 多节课，管理员选择“合班”，把当前课节 `A` 与 `B/C/D` 中 1+ 节合班 | 合班创建成功；所选课节成为同一个合班点名任务；目标老师只看到一个合班任务并可提交整组点名 | 老师端出现重复点名入口；未选课节也被合班；合班老师权限错误 |
| `TC-06R` | 目标老师同时间段有课，管理员选择“互换”，再选择其中一节 `B` | 仅 `A` 与 `B` 交换点名老师，不创建合班；老师端仍按单课任务展示 | 系统同时创建合班；未选择课节被影响；互换结果与页面选择不一致 |
| `TC-06S` | 被合班课节的原点名老师登录老师端查看 | 原点名老师只能查看合班点名情况，不显示提交主按钮；合班主点名老师才有提交权限 | 多个老师都能提交同一合班任务；只读老师误提交覆盖主老师结果 |

### 建议执行顺序

1. 先跑 `TC-06C` 与 `TC-06D`
2. 再跑 `TC-06A` 与 `TC-06B`
3. 保存一旦成功，立刻继续 `TC-06E`、`TC-06F`、`TC-06G`
4. 最后做 `TC-06H` 回滚校验
5. `TC-06I` 到 `TC-06L` 作为高风险边界补测
6. shared dev 后端补齐 batch 接口后，再追加 `TC-06M` 到 `TC-06P`
7. 合班创建接口就绪后，再追加 `TC-06Q` 到 `TC-06S`

### 本组通过标准

- 至少证明“当天有课但不冲突”不会被一刀切拦截。
- 真实冲突时，错误提示对象必须准确，不允许出现固定老师 / 固定时间串号。
- 指定成功后，只允许一位当前课节点名老师持有实际处理权限。
- 合班和互换必须按页面所选方式互斥提交，不能在一次确认里同时落两个动作。
- 老师端底部“点名”入口不能把代课老师稳定带去错误课节。
- 恢复默认老师后，管理端与老师端都必须完全回滚。

### 环境变量

```bash
E2E_TEACHER_PHONE
E2E_TEACHER_EXPECTED_NAME
E2E_TEACHER_EXPECTED_CAMPUS
E2E_ADMIN_PHONE
E2E_ADMIN_CAMPUS_NAME
E2E_ADMIN_EXPECTED_NAME
E2E_ADMIN_EXPECTED_CAMPUS
E2E_MULTI_CAMPUS_ADMIN_PHONE
E2E_MULTI_CAMPUS_ADMIN_CAMPUS_NAME
E2E_MULTI_CAMPUS_ADMIN_EXPECTED_NAME
E2E_MULTI_CAMPUS_ADMIN_EXPECTED_CAMPUS
E2E_LOGIN_CODE
PLAYWRIGHT_BASE_URL
```

默认值：

- `E2E_ADMIN_CAMPUS_NAME=成都高新云芯学校`
- `E2E_MULTI_CAMPUS_ADMIN_CAMPUS_NAME=成都高新云芯学校`
- `E2E_LOGIN_CODE=8888`
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000`

行为约定：

- 若未提供教师或管理员手机号，authenticated live smoke 自动跳过
- 登录成功后，先用 `/api/test/token` 校验 token 生效
- 学生新增 / 编辑只验证取数和页面渲染，不提交写操作
- 若提供 `E2E_*_EXPECTED_NAME` / `E2E_*_EXPECTED_CAMPUS`，smoke 会追加：
  - cookie：`inqasst_role / inqasst_name / inqasst_campus`
  - API：`/api/me` 或 `/api/admin/me`
  - 页面：`/teacher/me` 或 `/admin/me`
  的一致性断言

### 历史本机联调归档入口

- 当前默认工作流不再要求本机 `daoleme`、`127.0.0.1:8080` 或 Swagger 启动检查。
- 若需要追溯旧版本机 `proxy/direct` 联调、dev RDS、预检 `500`、性能修复与 benchmark，请看：
  - `docs/archive/本机-daoleme-联调工作流归档_20260422.md`

## 历史专项记录（按日期归档，非当前默认工作流）

### 2026-04-15 已验证结果

- 在本机前端 + 本机 `daoleme` + dev RDS 环境下，`npm run test:e2e:smoke` 已通过，结果为 `4 passed`
- 已验证账号：
  - 教师：`18181459960`
  - 单校区管理员：`18512840290`
  - 多校区管理员：`13888888888`
  - 校区：`成都高新云芯学校`
- 同轮已补跑并通过：
  - `npm test`
  - `npm run lint`
  - `npm run build`
- 同时确认了一项新的发布阻塞结论：
  - 当前本机 `direct` 联调不能作为写流验收基线
  - 原因不是业务接口不存在，而是浏览器预检请求被后端错误打成 `500`
  - 因此更换点名老师这类主写流必须回到发布阻塞清单，不能再被现有 smoke 绿灯掩盖

### 2026-04-15 smoke 断言口径更新

本轮已把“身份快照断言”正式并入 live smoke，但保持为可选：

- 新增环境变量见：
  - `.env.e2e.example`
- 当前代码实现见：
  - `tests/e2e/smoke.spec.ts`

这轮实际用来复跑的身份断言账号：

- 教师：`11211111111 / 白测试 / 成都高新云芯学校`
- 管理员：`18512840290 / 岑曦 / 成都高新云芯学校`
- 多校区管理员：`13888888888 / 邱邱 / 成都高新云芯学校`

补充说明：

- 当前 smoke 对“老师 / 管理员 / 多校区管理员”三类身份都能附加校验：
  - token 身份
  - cookie 身份
  - profile 页面身份
- 本轮为支持中文姓名 / 校区断言，已修正 cookie 比对逻辑：
  - 浏览器 cookie 中的中文值按 URL 编码存储
  - smoke 断言现在会先 `decodeURIComponent(...)` 再比较

### 2026-04-15 账号 / 角色 / 校区一致性矩阵验证

本轮补充了一类此前没有被明确写进执行稿的验证：

- 以后端 DB 驱动的 `/api/auth/login` 与 `/api/me` / `/api/admin/me` 为基准
- 对照前端登录后的：
  - `inqasst_role`
  - `inqasst_name`
  - `inqasst_campus`
- 再对照 `/teacher/me` 或 `/admin/me` 页面展示

验证结果：

- 本轮共核对后端老师提供的 `7` 个账号
- `7/7` 全部通过
- 单校区管理员、单校区老师、多校区管理员三类账号都已覆盖
- 详细记录见：
  - `docs/账号角色校区一致性验证_20260415.md`

当前结论：

- “账号 / 角色 / 校区一致性”需要被视为发布前测试的一部分，而不只是临时联调动作
- 现有 smoke 已经能够覆盖登录和读链路，但默认还没有把这类“身份快照断言”作为必填项
- 这类验证只证明“谁登录成了谁”，不自动证明“当天课程数据是否符合后端返回”
- 例如 2026-04-15 对老师 `11211111111 / 白测试` 的补充核对显示：
  - `/api/teacher/home?weekStart=2026-04-13` 返回 `weekCourses=[]`
  - `/api/teacher/courses/today` 返回 `[]`
  - 前端 `/teacher/home` 显示“今天暂无排课 / 无课”
  - 这条“无课”是和后端当前数据一致，不是前端误判
- 后续做法是：
  - 默认 smoke 继续保持低耦合
  - 当提供 `E2E_*_EXPECTED_NAME` / `E2E_*_EXPECTED_CAMPUS` 时，自动追加 cookie、profile 页面和 `/api/me` / `/api/admin/me` 的一致性断言
  - 当需要验证“有课 / 无课”这类业务显示是否正确时，再额外对照：
    - `/api/teacher/home?weekStart=...`
    - `/api/teacher/courses/today`
    - 或管理员对应的 summary / overview 接口

### 2026-04-15 预检阻塞修复与回归结果

本轮已经在本地 `daoleme` 联调工作副本里完成预检阻塞修复：

- 修复位置：
  - `src/main/java/com/daoleme/api/auth/web/AuthTokenInterceptor.java`
- 修复策略：
  - `OPTIONS /api/**` 预检不再走正常鉴权分支
  - 对 `OPTIONS` 直接放行，避免被 `Authorization` 校验打成 `500`
- 回归验证：
  - 新增后端测试 `src/test/java/com/daoleme/api/config/ApiCorsPreflightTest.java`
  - 已通过 `mvn -q -Dtest=ApiCorsPreflightTest test`
- 真实联调复核：
  - `OPTIONS /api/admin/course-sessions/1/roll-call-teacher`：`500 -> 200`
  - `OPTIONS /api/courses/1/attendance`：`500 -> 200`
  - `OPTIONS /api/admin/courses/1/students`：`500 -> 200`

基于修复后的后端，本轮按发布验收推荐口径再次复核：

- 前端使用 `proxy` 口径重启：
  - `API_BASE_URL=http://127.0.0.1:8080`
  - `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080`
  - `NEXT_PUBLIC_API_REQUEST_MODE=proxy`
- 同轮已补跑并通过：
  - `npm test`
  - `npm run lint`
  - `npm run build`
  - `npm run test:e2e:smoke`，结果仍为 `4 passed`
- 已额外完成一条发布阻塞人工写流验证：
  - 管理员 `18512840290`
  - 进入 `/admin/emergency/course/988?courseSessionId=988`
  - 在“更换点名老师”页选择系统内已有老师 `alexxiang · 18140044661`
  - 提交成功后返回课程页
  - 紧接着执行“恢复默认老师”，恢复成功
  - 本轮未再出现浏览器层 `failed to fetch`

### 2026-04-15 性能调查与第一轮修复

调查方式：

- 基于本机前端 `3000` + 本机 `daoleme` `8080` + dev RDS 做真实账号测量
- 先测直接接口耗时，再测浏览器跳转时长
- 原则是先确认根因，再只改命中的位置

调查结论：

- 慢的主因不是前端 bundle，而是页面首屏依赖的 live API 和重复取数
- 证据包括：
  - 修复前，多校区管理员 `/api/auth/login` 约 `39s`
  - 修复前，`/api/admin/teacher-settings/overview` 约 `17.5s`
  - 修复前，`/api/me` / `/api/admin/me` 分别约 `5.2s` / `8.3s`
- 前端热页里存在两类额外负担：
  - 老师首页、点名页、管理首页、总控、未到学生页首屏都会额外补拉 `me`
  - 管理端总控页还会额外补拉 `teacher-settings overview`，但页面只需要老师显示名，不需要完整周课表

已完成修复：

- 前端：
  - `lib/services/mobile-app.ts`
  - 老师首页、点名页、管理首页、总控、未到学生页改为优先使用 session cookie 中的姓名 / 校区快照，不再把 `me` 作为这些热页首屏必需请求
  - 管理端总控页不再请求 `fetchAdminTeacherSettingsOverview(getWeekStart())`
  - 总控页老师名直接复用 `roll-call overview` 已返回的老师字段
  - `components/app/teacher-home-client.tsx`
  - 老师首页底部“点名” tab 改为直接复用当前首页已算好的目标 href
  - 当天无课时，直接落到 `/teacher/attendance/no-class`，不再额外兜一圈 `/teacher/attendance`
- 后端：
  - `daoleme` 本地联调分支中的 `UserService`
  - 多校区登录构建 `campusOptions` 时改为一次性批量查询校区名，不再逐校区 `findById`
  - `ProfileService` 同步改为批量解析管理员可切换校区名，避免 profile/campus options 的懒加载逐条查库

修复后复测结果：

- 直接接口：
  - 多校区管理员 `/api/auth/login`：`39.0s -> 3.6s`
  - 单校区管理员 `/api/admin/home/summary`：约 `6.2s`
  - 管理端 `/api/admin/roll-call/overview`：约 `5.7s`
  - 管理端 `/api/admin/teacher-settings/overview`：仍约 `14.7s`
  - 管理端 `/api/admin/absent-students`：仍约 `13.7s`
- 浏览器跳转：
  - 登录页：约 `0.6s`
  - 教师登录到首页：`15.1s -> 12.4s`
  - 教师首页进点名：`23.3s -> 9.4s`
  - 管理员登录到首页：`17.3s -> 14.0s`
  - 管理首页进总控：`15.3s -> 6.7s`
  - 多校区管理员登录到首页：`122.1s -> 16.3s`

当前仍需继续关注的慢点：

- `teacherHome` 接口本身仍约 `8.3s`
- `admin/teacher-settings/overview` 仍约 `14-18s`
- `admin/absent-students` 仍约 `10-14s`
- 教师登录到首页、管理员登录到首页虽然已经下降，但仍在 `12-16s` 区间，体感上依然偏慢
- 这些接口的后端实现仍有明显的课程 / 课节 / 老师 / 考勤结果逐条查库特征，后续若继续优化，优先看 `CourseReadService` 和 `AdminReadService`
- 本机 `daoleme` 编译在 macOS CLI 下需要显式设置：
  - `JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home`
  - 否则会出现 Java 运行时不可见，导致本地编译和重启失败

### 2026-04-15 数据库索引试验

本轮已在后端联调分支 `codex/db-performance-indexes` 中新增数据库性能索引，并实际加到本机联调用的 dev RDS `jx_daoleme_dev`。

本轮 DB 变更特点：

- 只新增索引，不改字段、不改表结构语义
- 同步新增增量脚本：
  - `db/migration_v8_performance_indexes.sql`
- 同步更新全量 schema：
  - `db/schema.sql`
  - `db/init_online_schema.sql`
- 同时把后端查询层从“全量读后再按 `ENROLLED` 过滤”收口到带条件的 repository 方法

新增索引范围：

- `teacher(phone, deleted_at, campus_id, id)`
- `admin_user(phone, deleted_at, campus_id, id)`
- `course_student(course_id, status, student_id)`
- `attendance_record(course_id, submitted_at)`
- `attendance_record(course_session_id, submitted_at)`

变更前后 `EXPLAIN` 结论：

- 管理员登录手机号查询：
  - `ALL + Using filesort` -> `ref + Using index`
- 教师登录手机号查询：
  - `ALL + Using filesort` -> `ref + Using index`
- 最近一次点名记录查询：
  - 旧计划存在 `Using filesort`
  - 新计划命中 `idx_ar_session_submitted_at`，`filesort` 消失

本轮索引后的抽样复测：

- 教师 `/api/auth/login`：约 `3.5s`
- `/api/teacher/home`：约 `9.5s`
- 管理员 `/api/auth/login`（需选校区）：约 `5.2s`
- `/api/admin/home/summary`：约 `9.1s`
- `/api/admin/roll-call/overview`：约 `6.7s`
- `/api/admin/absent-students`：约 `11.9s`
- `/api/admin/teacher-settings/overview`：约 `17.3s`
- 多校区管理员 `/api/auth/login`：约 `4.1s`

这一轮的真实结论：

- 索引把几条错误查询计划修正了
- 但页面体感最差的慢点**没有因为索引就显著消失**
- 说明剩余瓶颈主要还在 `AdminReadService` / `CourseReadService` 的逐条查库和聚合逻辑，而不只是索引缺失

更详细的数据库变更说明、SQL 和回滚方案见：

- `/Users/minxian/conductor/workspaces/daoleme-local-integration/docs/DB_PERFORMANCE_INDEXES_20260415.md`

### 2026-04-15 benchmark 复核

本轮在数据库索引试验后，已使用 benchmark 流程对“当前本机联调状态”再次复核，并与当天更早的基线报告做对比。

基线报告：

- `[历史 calgary 工作区]/.gstack/benchmark-reports/2026-04-15-benchmark.md`
- `[历史 calgary 工作区]/.gstack/benchmark-reports/2026-04-15-benchmark.json`

复核报告：

- `[历史 calgary 工作区]/.gstack/benchmark-reports/2026-04-15-post-db-benchmark.md`
- `[历史 calgary 工作区]/.gstack/benchmark-reports/2026-04-15-post-db-benchmark.json`

本轮 benchmark 结论：

- 优化是有效的，而且关键慢链路不是小幅改善
- 最明显改善包括：
  - 多校区管理员登录到首页：`122142ms -> 9412ms`
  - 管理端首页到总控：`15316ms -> 8505ms`
  - 教师登录到首页：`15133ms -> 3709ms`
  - 管理员登录到首页：`17327ms -> 8572ms`
  - 教师首页进入点名 / 名单：`23304ms -> 19690ms`
- 当前没有继续改善的点：
  - 时间设置页：`4208ms -> 4604ms`
  - 这说明时间设置页不是这轮数据库索引与查询收口的主要收益面

当前判断：

- 可以确认“这一轮优化总体有效”
- 但还不能说“页面切换已经足够快”
- 仍需继续优化的热点依然是：
  - `AdminReadService.teacherSettingOverview(...)`
  - `AdminReadService.absentStudents(...)`
  - `CourseReadService.teacherHome(...)`

换句话说：

- 多校区登录、管理员首页链路、总控链路已经明显改善
- 未到学生和教师点名主链虽然也变快了，但体感上仍然偏慢，后续仍需继续做服务端聚合优化

### 2026-04-15 第二轮后端性能调查与批量查询修复

这轮是针对“本机登录后切页还是很痛苦”的再次调查，不再只看 benchmark，而是直接对真实接口做改前 / 改后对比。

执行边界：

- 后端不在已有脏工作副本上继续改，而是从 `daoleme origin/master` 新开联调分支：
  - `codex/release-perf-investigate`
- 工作副本：
  - `/Users/minxian/conductor/workspaces/daoleme-release-investigate`
- 本轮没有数据库 schema 变更，也没有新增 migration

根因结论：

- 这轮不是单条 SQL 爆炸，而是典型的嵌套式 N+1
- 命中的位置主要是：
  - `AdminReadService.homeSummary(...)`
  - `AdminReadService.rollCallOverview(...)`
  - `AdminReadService.teacherSettingOverview(...)`
  - `AdminReadService.absentStudents(...)`
  - `CourseReadService.teacherHome(...)`
  - `CourseReadService.listTodayForTeacher(...)`
  - `RollCallTeacherResolver`
- 具体模式是：
  - 先按校区查课程
  - 再按课程逐个查课节
  - 再按课节逐个查最近点名记录
  - 再按课节逐个解析默认老师 / 临时代课老师
  - 未到学生页还会按 student / homeroom 逐条回库

已完成修复：

- repository 补齐批量查询能力：
  - `CourseSessionRepository.findByCourseIdInAndStartAtGreaterThanEqualAndStartAtBeforeOrderByCourseIdAscStartAtAsc(...)`
  - `CourseTeacherRepository.findByCourseIdIn(...)`
  - `CourseStudentRepository.findByCourseIdAndStatus(...)`
  - `CourseStudentRepository.findByCourseIdInAndStatus(...)`
  - `AttendanceRecordRepository.findByCourseSessionIdInAndSubmittedAtGreaterThanEqualAndSubmittedAtBeforeOrderByCourseSessionIdAscSubmittedAtDesc(...)`
  - `AttendanceRecordItemRepository.findByAttendanceRecordIdIn(...)`
- `RollCallTeacherResolver`
  - 改为先批量装载课程默认老师、课节临时老师和 teacher map，再在内存里 resolve
- `AdminReadService`
  - 首页摘要、总控、老师设置、未到学生改为批量装载课程老师、在读学生、课节、最近点名记录、点名明细
  - 未到学生页改为一次性装载 student / homeroom 映射，不再逐条 `findById`
- `CourseReadService`
  - 教师可见课节改为批量装载默认课节 + 临时代课课节，再统一解析生效老师
  - 周课表 / 今日课节的“是否已点名”改为一次性批量查最近记录
  - 课程学生名单页改为先批量装载 student / homeroom，再组装行数据
- `UserService` / `ProfileService`
  - 继续保留管理员校区名的批量查询优化

同条件接口复测：

- 测量口径：
  - 本机前端 `3000`
  - 本机后端 `8080`
  - `daoleme` 连接 dev RDS
  - 教师 `18181459960`
  - 管理员 `18512840290`，选择 `成都高新云芯学校`
  - 验证码 `8888`
- 改前：
  - `admin home summary`：`5.625s`
  - `admin roll-call overview`：`7.068s`
  - `admin teacher-settings overview`：`11.063s`
  - `admin absent-students`：`6.520s`
  - `teacher home`：`12.824s`
  - `teacher today`：`3.771s`
- 改后首轮：
  - `admin home summary`：`6.580s`
  - `admin roll-call overview`：`5.173s`
  - `admin teacher-settings overview`：`5.350s`
  - `admin absent-students`：`6.935s`
  - `teacher home`：`6.287s`
  - `teacher today`：`5.344s`
- 改后第二轮热态：
  - `admin home summary`：`6.528s`
  - `admin roll-call overview`：`5.186s`
  - `admin teacher-settings overview`：`4.892s`
  - `admin absent-students`：`8.046s`
  - `teacher home`：`5.173s`
  - `teacher today`：`4.777s`

当前结论：

- 这轮修复是有效的，但不是“全部热页都解决了”
- 明显改善：
  - `teacher home` 从约 `12.8s` 降到约 `5.2s-6.3s`
  - `admin teacher-settings overview` 从约 `11.1s` 降到约 `4.9s-5.4s`
  - `admin roll-call overview` 从约 `7.1s` 降到约 `5.2s`
- 仍然偏慢，且这轮没有稳定改善：
  - `admin home summary`
  - `admin absent-students`
  - `teacher today`
- 说明已经清掉了一批应用层 N+1，但剩余瓶颈更像：
  - `CourseRepository.findForCampusWithSessionsBetween(...)` 这类底层查询本身慢
  - dev RDS / 连接池波动
  - 首页 / 未到学生仍有未命中的聚合查询热点

本轮回归：

- 后端：
  - `mvn -q -DskipTests compile` 通过
- 前端本机联调：
  - `npm run test:e2e:smoke` 通过，结果仍为 `4 passed`

后续若继续优化，下一轮优先看：

- `AdminReadService.homeSummary(...)`
- `AdminReadService.absentStudents(...)`
- `CourseRepository.findForCampusWithSessionsBetween(...)`
- 是否需要在“本机联调 / dev RDS”口径上增加短 TTL 只读缓存，专门缓解重复切页

### 2026-04-15 proxy 发布口径 benchmark 复核

这轮不再用 `direct` 结果判断是否“可上线”，而是按当前更接近正式发布的本机联调口径复核：

- 前端：
  - `http://127.0.0.1:3000`
- 后端：
  - `http://127.0.0.1:8080`
- 运行模式：
  - `NEXT_PUBLIC_API_REQUEST_MODE=proxy`
- 后端工作分支：
  - `codex/release-perf-investigate`
- benchmark 报告：
  - `[历史 calgary 工作区]/.gstack/benchmark-reports/2026-04-15-proxy-benchmark.md`
  - `[历史 calgary 工作区]/.gstack/benchmark-reports/2026-04-15-proxy-benchmark.json`

说明：

- 这轮报告里的 baseline 仍引用当天更早的 `2026-04-15-post-db-benchmark.*`
- 但那一份是 `direct` 口径，所以 delta 只能作为方向参考
- 真正用于发布判断的，是当前 `proxy` 口径下的**绝对时长**

本轮 release-like benchmark 结果：

- 登录页：
  - `190ms`
- 教师登录到首页：
  - `8775ms`
- 教师首页进入点名主链：
  - `8096ms`
- 管理员登录到首页：
  - `17969ms`
- 管理端总控：
  - `8570ms`
- 管理端未到学生：
  - `8052ms`
- 管理端时间设置：
  - `5417ms`
- 多校区管理员登录到首页：
  - `17444ms`
- 课程学生名单：
  - `9802ms`
- 学生新增页：
  - `9032ms`
- 学生编辑页：
  - `15901ms`

同轮接口热点：

- `admin_home_summary`：
  - `4728ms`
- `admin_roll_call_overview`：
  - `3690ms`
- `admin_teacher_settings_overview`：
  - `5991ms`
- `admin_absent_students`：
  - `5019ms`
- `teacher_home`：
  - `6884ms`
- `teacher_today`：
  - `3265ms`

当前判断：

- 这轮 benchmark 结论是：
  - `needs_more_optimization`
- 也就是说：
  - 不能把“性能已 ok”作为当前发布结论
  - 当前自动化绿灯只能证明功能主链可跑，不代表页面切换体验已经达标

用于这轮复核的目标线：

- 单校区老师 / 管理员登录到首页：
  - 目标 `<= 5s`
- 老师点名主链、总控、未到学生、课程学生相关页面：
  - 目标 `<= 5-6s`
- 多校区管理员登录到首页：
  - 目标 `<= 7s`
- `admin_home_summary`、`admin_roll_call_overview`、`teacher_home` 这类热接口：
  - 目标 `<= 3s`
- `admin_teacher_settings_overview`、`admin_absent_students`：
  - 目标 `<= 4s`

当前距离目标最远的发布阻塞项：

- `admin_login_to_home`
- `multi_admin_login_to_home`
- `admin_course_students`
- `admin_student_edit`
- `teacher_login_to_home`
- `teacher_attendance_entry`
- `teacher_home`
- `admin_teacher_settings_overview`
- `admin_absent_students`

因此，下一轮如果继续做性能优化，优先顺序改为：

- `AdminReadService.homeSummary(...)`
- `AdminReadService.absentStudents(...)`
- `CourseReadService.teacherHome(...)`
- `CourseRepository.findForCampusWithSessionsBetween(...)`

在这些点没有继续下降之前，发布验收不应把“性能问题已收尾”画勾。

### 2026-04-15 proxy 发布口径 benchmark 第二轮复核

这轮继续沿用：

- 前端：
  - `http://127.0.0.1:3000`
- 后端：
  - `http://127.0.0.1:8080`
- 运行模式：
  - `NEXT_PUBLIC_API_REQUEST_MODE=proxy`
- 后端独立工作副本：
  - `/Users/minxian/conductor/workspaces/daoleme-release-investigate`
- 后端分支：
  - `codex/release-perf-investigate`

说明：

- 本轮仍未修改数据库 schema、未执行 migration、未改业务数据
- 所有后端性能改动都只发生在 `daoleme-release-investigate` 这份本地独立工作副本，未直接改原始 `daoleme` 仓库
- benchmark 报告：
  - `[历史 calgary 工作区]/.gstack/benchmark-reports/2026-04-15-proxy-benchmark-round2.md`
  - `[历史 calgary 工作区]/.gstack/benchmark-reports/2026-04-15-proxy-benchmark-round2.json`

本轮已落地的优化：

- 后端：
  - `AdminReadService.homeSummary(...)` 改为按 `courseSessionId` 批量取已提交点名集合，不再为首页摘要加载完整考勤记录对象
  - `AdminReadService.rollCallOverview(...)`、`teacherSettingOverview(...)`、`absentStudents(...)` 继续复用 `OperationalCourseContext` 批量装载结果，减少课程 / 课节 / 老师逐条查库
  - `CourseReadService.teacherHome(...)` 与课程详情相关读取继续沿用“先批量课节、再批量课程 / 老师”的模式
  - `HomeroomClassRepository` / `AdminSettingsService.listHomeroomsByCampus(...)` 已切到非分页列表读取
- 前端：
  - `lib/services/mobile-app.ts` 新增短 TTL 只读缓存：
    - `course detail`：`30s`
    - `campus classes`：`60s`
  - 目的不是掩盖后端慢点，而是减少同一校区 / 同一课程下重复切页时的重复等待，尤其是：
    - 课程学生名单 -> 新增学生
    - 课程学生名单 -> 编辑学生
    - 应急调课 / 更换点名老师相关二级页

这轮最明显的改善：

- `teacher_attendance_entry`
  - `8096ms -> 6075ms`
- `admin_login_to_home`
  - `17969ms -> 13479ms`
- `admin_control`
  - `8570ms -> 6344ms`
- `multi_admin_login_to_home`
  - `17444ms -> 15250ms`
- `admin_course_students`
  - `9802ms -> 7941ms`
- `admin_student_edit`
  - `15901ms -> 9956ms`

这轮没有改善、甚至仍然偏慢的点：

- `teacher_login_to_home`
  - `9527ms`
- `admin_unarrived`
  - `9264ms`
- `admin_time_settings`
  - `7251ms`
- `admin_student_new`
  - `10883ms`

同轮接口热点：

- `admin_home_summary`
  - `5998ms`
- `admin_roll_call_overview`
  - `4667ms`
- `admin_teacher_settings_overview`
  - `6702ms`
- `admin_absent_students`
  - `4309ms`
- `teacher_home`
  - `5421ms`
- `admin_campus_classes`
  - `4494ms`

当前判断：

- 这轮 benchmark 的 verdict 仍然是：
  - `needs_more_optimization`
- 说明：
  - 第二轮优化是有效的
  - 但还不足以把“页面切换性能已达上线要求”画勾

若继续往下做，下一轮优先顺序更新为：

- `AdminReadService.homeSummary(...)`
- `AdminReadService.absentStudents(...)`
- `CourseReadService.teacherHome(...)`
- `AdminSettingsService.listHomeroomsByCampus(...)` / `admin_campus_classes`
- 多校区管理员 `selectCampus / switchCampus` 相关登录恢复链路

### 2026-04-15 direct 口径 round3 体感复核

这轮不是新的发布基线，而是为了验证“前端短 TTL 只读缓存”对本机切页体感有没有直接帮助：

- 本机环境文件：
  - `.env.local`
- 当前模式：
  - `NEXT_PUBLIC_API_REQUEST_MODE=direct`
- 报告：
  - `[历史 calgary 工作区]/.gstack/benchmark-reports/2026-04-15-proxy-benchmark-round3.md`
  - `[历史 calgary 工作区]/.gstack/benchmark-reports/2026-04-15-proxy-benchmark-round3.json`

这轮结论要点：

- `admin_student_new`
  - `10883ms -> 2884ms`
- `admin_student_edit`
  - `9956ms -> 4216ms`
- `admin_course_students`
  - `7941ms -> 7301ms`
- `admin_unarrived`
  - `9264ms -> 6734ms`
- `admin_time_settings`
  - `7251ms -> 4567ms`

这说明前端新增的 `course detail / campus classes` 缓存在“课程学生名单 -> 新增/编辑学生”这条切页链路上是有效的。

但这一轮**不能**拿来覆盖 proxy 发布结论，原因有两点：

- 这轮模式是 `direct`，不是我们定义的发布验收优先口径 `proxy`
- `teacher_attendance_entry` 这次进入的是 `/teacher/attendance` 真实点名页，而不是上一轮的 `/teacher/attendance/no-class`，因此：
  - `6075ms -> 14977ms`
  - 这代表真实点名页仍然很慢，但不适合和上一轮无课分支做直接优劣比较

另外，这轮 JSON 里出现了：

- `teacher_home = 4ms`

这显然属于 warm/cache 干扰值，不能当成“老师首页接口已经优化完成”的证据。当前老师链路是否达标，仍应以真实页面切换和其他热点接口共同判断。

因此，当前更准确的结论是：

- 前端缓存已经明显改善了学生新增 / 编辑切页体验
- 但发布级性能结论仍保持不变：
  - `needs_more_optimization`

## 发布门禁

- 硬门禁：
  - `npm test`
  - `npm run lint`
  - `npm run build`
- 人工触发：
  - `npm run test:e2e:smoke`
  - 使用真实共享 dev 口径账号连续通过 2 次
- 发布阻塞人工写流：
  - 更换点名老师：选择已有老师并保存
  - 更换点名老师：恢复默认老师
  - 更换点名老师：录入系统外老师并保存
  - 教师点名提交
  - 管理端单个状态修改
  - 管理端批量状态修改
  - 未到学生状态修正
  - 时间设置修改并恢复
  - 学生新增提交（已有学生搜索并入课）
  - 学生新增提交（临时学生创建）
  - 学生编辑提交
- 人工写流验收：
  - 见 [REGRESSION_CHECKLIST.md](/Users/minxian/conductor/workspaces/inqasst/bordeaux/docs/REGRESSION_CHECKLIST.md)

## 后端协同

- 当前给后端工程师的同步说明见：
  - [后端协同说明_20260414.md](/Users/minxian/conductor/workspaces/inqasst/bordeaux/docs/后端协同说明_20260414.md)
- 2026-04-10 的旧缺口文档保留为历史记录，但学生新增 / 编辑“缺接口”的判断已过时
- 2026-04-20 补充：
  - 学生新增链路的当前正式口径见 `docs/课程学生新增方案切换_20260420.md`
  - 当前仍不能把“空白课程等新写链已联调通过”写成事实，除非 shared dev 已完成验证

## 当前优化抓手

- 共享 dev 上的 `/api/admin/emergency/weekly` 仍有慢响应，且代理链路存在间歇性超时；当前优先继续留证据并推动后端排查
- “添加空白课程”等新写链仍缺 shared dev 口径的联调确认，不能被现有读链路 smoke 绿灯替代
- 历史本机 `daoleme` 性能试验、CORS/预检与 dev RDS 稳定性记录已移到：
  - `docs/archive/本机-daoleme-联调工作流归档_20260422.md`

## 当前视觉债记录

本轮不修复，但已确认需要后续单独评估的候选文件：

- `components/app/login-form.tsx`
- `components/app/teacher-home-client.tsx`
- `components/app/admin-unarrived-client.tsx`
