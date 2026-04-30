# Handoff

## 1. 当前任务目标
- 当前任务是完成 InqAsst 前端的自动化测试模块、上线前门禁和相关修复，并把可交接信息整理给下一位 Agent。
- 当前分支是 `codex/automation-testing-phase0`，基线提交与 `origin/master` 一致，都是 `681a529ca301e2b9b20b644310e6e00b25170fd6`。
- 完成标准：
  - 自动化测试基础设施、测试分层、文档、CI、env 模板已落地
  - `npm test`、`npm run lint`、`npm run build` 通过
  - shared-dev live smoke 用真实账号通过
  - 用户反馈的“管理端主点名页 / 未到学生页加载过长”已定位并修复
  - 未做的共享 dev 写流自动化明确保留为人工验收清单

## 2. 当前进展
- 已新增自动化测试基础设施：
  - `vitest.config.ts`
  - `playwright.config.ts`
  - `tests/unit`
  - `tests/service`
  - `tests/contract`
  - `tests/e2e`
- 已修改 `package.json` / `package-lock.json`，加入：
  - `vitest`
  - `jsdom`
  - `@playwright/test`
  - scripts: `test:unit` / `test:service` / `test:contract` / `test:phase0` / `test:e2e:smoke` / `test`
- 已修复 server-side 相对 URL 在 `next dev` 下报错的问题：
  - [lib/services/http-server.ts](/Users/minxian/conductor/workspaces/inqasst/calgary/lib/services/http-server.ts:1)
  - [lib/services/http-core.ts](/Users/minxian/conductor/workspaces/inqasst/calgary/lib/services/http-core.ts:1)
- 已补学生新增 / 编辑链路：
  - 前端提交前校验：`name` / `externalStudentId` / `homeroomClassId` 必填
  - 文件：
    - [components/app/student-form-client.tsx](/Users/minxian/conductor/workspaces/inqasst/calgary/components/app/student-form-client.tsx:1)
    - [lib/services/student-upsert.ts](/Users/minxian/conductor/workspaces/inqasst/calgary/lib/services/student-upsert.ts:1)
    - [lib/services/mobile-schema.ts](/Users/minxian/conductor/workspaces/inqasst/calgary/lib/services/mobile-schema.ts:259)
- 已补学生新增 / 编辑相关自动化覆盖：
  - [tests/service/student-upsert.test.ts](/Users/minxian/conductor/workspaces/inqasst/calgary/tests/service/student-upsert.test.ts:1)
  - [tests/service/mobile-app.test.ts](/Users/minxian/conductor/workspaces/inqasst/calgary/tests/service/mobile-app.test.ts:1)
  - [tests/service/mobile-client.test.ts](/Users/minxian/conductor/workspaces/inqasst/calgary/tests/service/mobile-client.test.ts:1)
  - [tests/contract/mobile-client.test.ts](/Users/minxian/conductor/workspaces/inqasst/calgary/tests/contract/mobile-client.test.ts:1)
  - [tests/contract/mobile-api.test.ts](/Users/minxian/conductor/workspaces/inqasst/calgary/tests/contract/mobile-api.test.ts:1)
- 已补 shared-dev smoke：
  - 登录
  - 教师登录 / token 校验 / 教师首页真实分支
  - 管理员登录 / 选校区 / 管理首页 / 总控 / 未到学生 / 时间设置
  - 学生新增页只读加载
  - 学生编辑页只读加载
  - 文件：[tests/e2e/smoke.spec.ts](/Users/minxian/conductor/workspaces/inqasst/calgary/tests/e2e/smoke.spec.ts:1)
- 已补门禁和文档：
  - env 模板：[.env.e2e.example](/Users/minxian/conductor/workspaces/inqasst/calgary/.env.e2e.example:1)
  - CI：[.github/workflows/quality-gates.yml](/Users/minxian/conductor/workspaces/inqasst/calgary/.github/workflows/quality-gates.yml:1)
  - 执行稿：[docs/inqasst-automation-testing-execution-plan.md](/Users/minxian/conductor/workspaces/inqasst/calgary/docs/inqasst-automation-testing-execution-plan.md:1)
  - 上线前清单：[docs/上线前测试清单_20260414.md](/Users/minxian/conductor/workspaces/inqasst/calgary/docs/上线前测试清单_20260414.md:1)
  - 后端协同说明：[docs/后端协同说明_20260414.md](/Users/minxian/conductor/workspaces/inqasst/calgary/docs/后端协同说明_20260414.md:1)
- 已修复 lint 会扫到 Playwright 产物目录的问题：
  - [eslint.config.mjs](/Users/minxian/conductor/workspaces/inqasst/calgary/eslint.config.mjs:1)
- 已处理性能问题：
  - [lib/services/mobile-app.ts](/Users/minxian/conductor/workspaces/inqasst/calgary/lib/services/mobile-app.ts:308) 现在不再在点名总控首屏为每个班级额外补拉课程详情和 roll-call teacher
  - [lib/services/mobile-app.ts](/Users/minxian/conductor/workspaces/inqasst/calgary/lib/services/mobile-app.ts:378) 现在不再在未到学生页首屏预拉每个课节的完整 roster/latest
  - [components/app/admin-unarrived-client.tsx](/Users/minxian/conductor/workspaces/inqasst/calgary/components/app/admin-unarrived-client.tsx:76) 改成真正提交前才懒加载该 group 的 roster
  - [lib/services/mobile-client.ts](/Users/minxian/conductor/workspaces/inqasst/calgary/lib/services/mobile-client.ts:235) 新增 `fetchAdminAttendanceRoster`
- 已重新跑过并通过：
  - `npm test`
  - `npm run lint`
  - `npm run build`
  - `E2E_TEACHER_PHONE=18181459960 E2E_ADMIN_PHONE=18512840290 E2E_ADMIN_CAMPUS_NAME='成都高新云芯学校' E2E_MULTI_CAMPUS_ADMIN_PHONE=13888888888 E2E_MULTI_CAMPUS_ADMIN_CAMPUS_NAME='成都高新云芯学校' E2E_LOGIN_CODE=8888 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npm run test:e2e:smoke`
- 最新一次 live smoke 结果：`4 passed`

## 3. 关键上下文
- 用户明确要求：
  - 自动化测试继续做到“上线前可用”
  - backend repo `daoleme` 可只读查看，不可修改
  - 如需后端配合，写入文档让用户转给后端老师
- 当前工作区有大量**未提交**修改，尚未 `git add` / `git commit` / `git push`。
- 当前本地应用默认端口是 `http://127.0.0.1:3000`。
- shared-dev smoke 账号与环境变量口径：
  - `E2E_TEACHER_PHONE=18181459960`
  - `E2E_ADMIN_PHONE=18512840290`
  - `E2E_ADMIN_CAMPUS_NAME=成都高新云芯学校`
  - `E2E_MULTI_CAMPUS_ADMIN_PHONE=13888888888`
  - `E2E_MULTI_CAMPUS_ADMIN_CAMPUS_NAME=成都高新云芯学校`
  - `E2E_LOGIN_CODE=8888`
  - `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000`
- 已做出的关键决定：
  - 共享 dev 不做默认写流自动化
  - 学生新增 / 编辑纳入上线范围，但只做只读 smoke + `Phase 0` 自动化，真实提交留人工验收
  - 学生导入、课程设置首页汇总继续不在本轮上线范围
- backend `daoleme` 的只读核查结论：
  - 学生详情 / 新增 / 编辑接口实际已在后端 controller 中存在
  - `swagger-local.json` 与 controller 有不同步问题
  - 当前协同说明已写进 [docs/后端协同说明_20260414.md](/Users/minxian/conductor/workspaces/inqasst/calgary/docs/后端协同说明_20260414.md:1)
- backend 只读参考路径（本会话中使用）：
  - `/tmp/daoleme-readonly-plain`
- 重要假设：
  - 用户后续还会手动跑一轮真实页面体验和人工写流验收
  - 下一位 Agent 不需要再重新设计测试体系，重点应放在收尾、提交、用户反馈后的微调

## 4. 关键发现
- 管理端“主点名页慢”和“未到学生页慢”的根因不是单一接口慢，而是前端首屏 N+1 / 过量预取：
  - 总控页首屏为了显示老师名，额外 fan-out 课程详情和 roll-call teacher
  - 未到学生页首屏为了后续修改，先把每个课节的完整名单和最近点名结果都拉了一遍
- 这些补拉对首屏不是必需的，后移后不影响当前核心展示。
- 学生新增 / 编辑表单之前有真实联调坑：
  - 前端允许空 `externalStudentId`
  - 前端允许空 `homeroomClassId`
  - 但 backend `CourseStudentUpsertRequest` 要求两者都必填
- teacher smoke 不是稳定的“有课”账号，shared-dev 当天数据会波动到“无课”：
  - 已把 smoke 放宽为接受教师首页无课分支
- `next dev + shared-dev + Playwright APIRequestContext` 在 30 秒下偶尔会触发 `Request context disposed`，不是业务错误，主要是环境和超时上限问题：
  - 已把 Playwright 测试超时从 30 秒调到 60 秒
  - 文件：[playwright.config.ts](/Users/minxian/conductor/workspaces/inqasst/calgary/playwright.config.ts:1)
- local `master` 分支是旧的，不要误用：
  - 本地 `master` 仍停在 `a3a5335`
  - 真正最新基线在 `origin/master` / `codex/automation-testing-phase0`
- 如果后续需要参考“后端还没完全接入前”的前端样式：
  - 更接近的参考点是 `origin/XJM034/check-push-rules`（`cca03c1`）
  - 本地 `XJM034/review-changes` 是“已开始接后端后又做过一轮样式整理”的版本

## 5. 未完成事项
1. 用户还没有亲自验证“管理端总控页 / 未到学生页”现在的体感是否足够快，需等用户实际 dogfood 反馈。
2. 共享 dev 的人工写流验收还没执行，详见 [docs/上线前测试清单_20260414.md](/Users/minxian/conductor/workspaces/inqasst/calgary/docs/上线前测试清单_20260414.md:1)。
3. 这批改动还没有提交、推送到 Codeup。
4. 如果用户要求更进一步定位性能，还没做“页面级网络时间统计 / 精准测速”；目前是代码级根因修复，不是系统级 benchmark。

## 6. 建议接手路径
- 优先查看：
  - [lib/services/mobile-app.ts](/Users/minxian/conductor/workspaces/inqasst/calgary/lib/services/mobile-app.ts:308)
  - [components/app/admin-unarrived-client.tsx](/Users/minxian/conductor/workspaces/inqasst/calgary/components/app/admin-unarrived-client.tsx:76)
  - [tests/e2e/smoke.spec.ts](/Users/minxian/conductor/workspaces/inqasst/calgary/tests/e2e/smoke.spec.ts:1)
  - [docs/上线前测试清单_20260414.md](/Users/minxian/conductor/workspaces/inqasst/calgary/docs/上线前测试清单_20260414.md:1)
  - [docs/后端协同说明_20260414.md](/Users/minxian/conductor/workspaces/inqasst/calgary/docs/后端协同说明_20260414.md:1)
- 先验证：
  - `git status --short`
  - `npm test`
  - `npm run lint`
  - `npm run build`
  - 如果需要复核 live smoke，使用上面列出的真实账号环境变量再跑一遍
- 推荐动作：
  - 如果用户只是要继续交付，下一步直接让用户在 `http://127.0.0.1:3000` 亲测管理端速度和关键页面
  - 如果用户确认没问题，就整理 commit 并推到 Codeup
  - 如果用户仍觉得慢，再做有证据的测速，而不是继续拍脑袋改

## 7. 风险与注意事项
- 当前工作区是未提交状态，切分支、reset、pull 都有风险，尤其不要误切到本地旧 `master`。
- shared-dev 数据是动态的，teacher 账号今天可能有课，也可能显示“今天暂无排课”，不要把这个当成前端 bug 误判。
- shared-dev live smoke 目前是可靠的门禁补充，但不是写流回归环境；不要把学生新增/编辑提交、点名写回自动塞进默认 smoke。
- backend `daoleme` 不要直接改，本轮所有后端协同项已经写文档；继续改前先看 [docs/后端协同说明_20260414.md](/Users/minxian/conductor/workspaces/inqasst/calgary/docs/后端协同说明_20260414.md:1)。
- 已验证过且不建议重复的方向：
  - 不要再把管理端慢问题当成“纯 UI 渲染慢”去优化动画或布局
  - 不要再把学生新增 / 编辑认定为“后端还没实现”
  - 不要再让 ESLint 扫 `playwright-report` / `test-results`

下一位 Agent 的第一步建议：
先在项目根目录运行 `git status --short` 和 `npm test`，确认工作区与门禁状态一致，然后让用户在 `http://127.0.0.1:3000` 亲自复测管理端总控页和未到学生页的加载体感；只有在用户确认仍慢时，再做页面级测速。
