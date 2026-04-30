# Handoff

## 1. 当前任务目标

继续围绕“上线前测试”推进，而不是再偏到纯性能优化。

当前主目标分两层：

1. 验证前端展示、角色分流、可执行操作是否与后端 dev RDS 当前数据一致
2. 在不直接改原始 `daoleme` 仓库的前提下，继续在本地前后端工作副本上完成剩余测试、必要修复和文档同步

完成标准当前不能表述为“可上线”，只能表述为：

- 已把“账号 / 角色 / 校区一致性”补成正式测试项
- 已确认至少一条“前端无课显示”确实与后端当天数据一致
- 自动化门禁仍然全绿
- 剩余未完成的是“当天业务数据一致性”和“发布阻塞人工写流”的继续核对

## 2. 当前进展

- 前端仓库当前分支：`codex/local-backend-integration`
- 前端路径：`/Users/minxian/conductor/workspaces/inqasst/calgary`
- 后端联调工作副本当前分支：`codex/release-perf-investigate`
- 后端路径：`/Users/minxian/conductor/workspaces/daoleme-release-investigate`
- 当前本机联调地址：
  - 前端：`http://127.0.0.1:3000`
  - 后端 Swagger：`http://127.0.0.1:8080/swagger-ui/index.html`
- 当前本机后端启动标准命令已补进文档：
  - `cd /Users/minxian/conductor/workspaces/daoleme-release-investigate`
  - `export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home`
  - `export PATH="$JAVA_HOME/bin:$PATH"`
  - `mvn -DskipTests spring-boot:run -Dspring-boot.run.profiles=rds -Dspring-boot.run.arguments=--sync.external.enabled=false`
- 当前本机后端数据源已核对：
  - `src/main/resources/application-rds.yml`
  - 指向 `mathplanet-public.rwlb.rds.aliyuncs.com:3306/jx_daoleme_dev`

今天完成的关键事项：

- 新增账号矩阵验证文档：
  - `/Users/minxian/conductor/workspaces/inqasst/calgary/docs/账号角色校区一致性验证_20260415.md`
- 更新执行稿：
  - `/Users/minxian/conductor/workspaces/inqasst/calgary/docs/inqasst-automation-testing-execution-plan.md`
- 更新上线前测试清单：
  - `/Users/minxian/conductor/workspaces/inqasst/calgary/docs/上线前测试清单_20260414.md`
- 增强 live smoke，使其在提供预期值时可额外断言：
  - cookie 中的 `inqasst_role / inqasst_name / inqasst_campus`
  - `/api/me` 或 `/api/admin/me`
  - `/teacher/me` 或 `/admin/me`
- 相关代码更新：
  - `/Users/minxian/conductor/workspaces/inqasst/calgary/tests/e2e/smoke.spec.ts`
  - `/Users/minxian/conductor/workspaces/inqasst/calgary/.env.e2e.example`
- 修复了一处测试断言问题：
  - 中文 cookie 值实际是 URL 编码存储，最初 smoke 因此误报失败
  - 已在 `tests/e2e/smoke.spec.ts` 中新增 cookie 解码逻辑

今天核对过的账号矩阵：

- 后端老师提供账号共 7 个，`7/7 PASS`
- 详细见：
  - `/Users/minxian/conductor/workspaces/inqasst/calgary/docs/账号角色校区一致性验证_20260415.md`
- 这 7 个 PASS 仅证明：
  - 登录角色正确
  - 登录后 cookie 正确
  - `/api/me` / `/api/admin/me` 正确
  - `/teacher/me` / `/admin/me` 页面展示正确
- 这 7 个 PASS **不自动证明**：
  - 今天是否有课
  - 今日课程数是否正确
  - 管理端 summary / overview 数量是否正确

今天额外查明的一条关键事实：

- 老师账号 `11211111111 / 白测试 / 成都高新云芯学校`
- 前端 `/teacher/home` 当前显示“今天暂无排课 / 无课”
- 我已直接核对后端：
  - `POST /api/auth/login`：登录正常，角色与姓名正确
  - `GET /api/teacher/home?weekStart=2026-04-13`：返回 `weekCourses=[]`
  - `GET /api/teacher/courses/today`：返回 `[]`
- 结论：
  - 这条“无课”显示与后端当天数据一致
  - 不是前端误判

今天实际跑过并通过：

- `npm test`
- `npm run lint`
- `npm run test:e2e:smoke`

其中 smoke 这一轮使用的是：

- 教师：`11211111111 / 白测试 / 成都高新云芯学校`
- 管理员：`18512840290 / 岑曦 / 成都高新云芯学校`
- 多校区管理员：`13888888888 / 邱邱 / 成都高新云芯学校`
- 结果：`4 passed (2.9m)`

说明：

- 我没有把管理员 smoke 全部切成后端今天新给的管理员账号
- 原因是这些新账号只确认了身份口径，没有逐个确认“今天一定有课程数据可供总控 / 学生页使用”
- 当前保留 `18512840290` 是因为这条管理员链路已经长期用于当天有数据的 smoke

## 3. 关键上下文

- 用户明确要求：
  - 测试的任务是为了上线，不要偏离主线
  - 可以改后端代码，但不要直接改原始 `daoleme` 仓库，要在本地拉分支 / 工作副本修改
  - 如果涉及数据库变更要形成文档记录；今天这轮没有新的数据库 schema 变更
  - 文档要及时同步，尤其是 `docs/inqasst-automation-testing-execution-plan.md`
- 当前前端本地有未提交修改，`git status --short` 显示涉及：
  - `.env.e2e.example`
  - `AGENTS.md`
  - `CLAUDE.md`
  - `components/app/teacher-home-client.tsx`
  - `docs/inqasst-automation-testing-execution-plan.md`
  - `docs/上线前测试清单_20260414.md`
  - `docs/后端协同说明_20260414.md`
  - `lib/services/mobile-app.ts`
  - `lib/services/mobile-client.ts`
  - `tests/e2e/smoke.spec.ts`
  - `tests/service/mobile-app.test.ts`
  - `tests/service/mobile-client.test.ts`
  - 新文件 `docs/账号角色校区一致性验证_20260415.md`
- 当前后端联调工作副本也有大量未提交修改，且 `target/classes`、`target/test-classes` 等编译产物也处于脏状态
- 后端工作副本路径：
  - `/Users/minxian/conductor/workspaces/daoleme-release-investigate`
- **不要**把这堆 `target/` 改动误当成业务代码差异
- 默认本机联调口径仍建议优先 `proxy` 用于发布验收，`direct` 只用于性能调查
- 明天继续前，先确认 Swagger 能打开，再判断前端联调结果：
  - `http://127.0.0.1:8080/swagger-ui/index.html`
  - `http://127.0.0.1:8080/v3/api-docs`
- `260414-handoff.md` 已存在，但今天的新状态没有写进去；接下来以 `260415-handoff.md` 为准

## 4. 关键发现

- “账号 / 角色 / 校区一致性”与“当天课程 / 业务数据一致性”是两类不同测试，不能混为一谈
- 今天后端老师给的 7 个账号，身份口径已经验证 `7/7 PASS`
- `11211111111 / 白测试` 前端显示无课是正确的，因为后端接口当天也返回空课表
- 增强后的 smoke 在加入身份断言后一开始失败，不是业务错，而是 cookie 中文值 URL 编码；已修复测试逻辑
- 当前 smoke 仍偏“登录 + 只读读链路”，还没有把“当天课程数 / summary 数量 / overview 行数一致性”自动化下来
- 当前管理员 smoke 仍使用 `18512840290 / 岑曦`，不是今天新给账号清单里的单校区管理员；这是为了保住“当天确实有课程数据”的稳定性
- 后端原始仓库没有直接改；所有后端修改都在本地联调工作副本 `codex/release-perf-investigate`

## 5. 未完成事项

1. 补“当天业务数据一致性”验证，而不止身份一致性
   - 老师侧：至少核对一位“有课老师”和一位“无课老师”
   - 管理侧：至少核对首页 summary、总控 overview、未到学生列表与后端接口返回是否一致
2. 决定是否把这类“业务数据快照断言”进一步并入 smoke
   - 当前已支持身份快照断言
   - 还未支持“课程数 / 行数 / 是否无课”的自动断言
3. 继续完成发布阻塞人工写流
   - 更换点名老师已验证“已有老师 / 恢复默认”
   - 还没完整收尾的包括：系统外老师录入、教师点名提交、单个/批量改状态、未到学生修正、时间设置修改恢复、学生新增/编辑提交
4. 清理后端工作副本里的编译产物噪音，再决定哪些后端改动值得整理给后端老师审阅

## 6. 建议接手路径

- 优先查看：
  - `/Users/minxian/conductor/workspaces/inqasst/calgary/docs/账号角色校区一致性验证_20260415.md`
  - `/Users/minxian/conductor/workspaces/inqasst/calgary/docs/inqasst-automation-testing-execution-plan.md`
  - `/Users/minxian/conductor/workspaces/inqasst/calgary/docs/上线前测试清单_20260414.md`
  - `/Users/minxian/conductor/workspaces/inqasst/calgary/tests/e2e/smoke.spec.ts`
- 先验证：
  - 本机前端 `3000` 和后端 `8080` 仍在运行
  - `11211111111` 的无课结论仍与 `/api/teacher/home?weekStart=...` 和 `/api/teacher/courses/today` 一致
  - `18512840290` 仍然有当天 summary / overview 数据可供 smoke 使用
- 推荐动作：
  - 先用一位“今天明确有课”的老师账号补做“课程数据一致性”核对
  - 再用一位今天新给的管理员账号补做“summary / overview / 页面数据一致性”核对
  - 如果结果稳定，再考虑是否把“业务数据快照断言”并入 smoke

## 7. 风险与注意事项

- 不要把“身份一致”误说成“业务数据一致”
- 不要直接在原始 `daoleme` 仓库上改；继续只在 `/Users/minxian/conductor/workspaces/daoleme-release-investigate` 这种本地工作副本上操作
- 后端工作副本里 `target/` 目录改动很多，容易误判；先区分源码和编译产物
- 当前前端仓库也有较多未提交修改，不要无意覆盖前面已经做过的性能/测试/文档工作
- `10000001112` 今天仍按后端老师建议跳过，不建议优先用它做联调
- 今天没有新增数据库 schema 变更；如果后面真要动数据库，必须继续按用户要求先形成 dated 文档记录
- 已验证过且不建议重复的方向：
  - 不要再把“白老师无课”先当成前端 bug 去修，当前证据显示它与后端一致
  - 不要再把 smoke 失败的中文 cookie 断言当成身份错配，那个问题已经修成 decode 逻辑

下一位 Agent 的第一步建议：
先用一个“今天明确有课”的老师账号，按和白老师同样的方法同时核对 `/api/teacher/home?weekStart=...`、`/api/teacher/courses/today`、前端 `/teacher/home` 页面，补出第一条“有课态业务数据一致性”记录。
