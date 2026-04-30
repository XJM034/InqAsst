# Handoff

## 1. 当前任务目标
- 实现管理端 `/admin/course-settings/_/students/new/?courseId=...&courseSessionId=...` 的“新增学生”新方案：
  - 不再进入页面后全量拉取学生目录
  - 输入至少 2 个字后，按当前校区实时搜索已有学生
  - 选择已有学生时，直接把该学生加入当前课程名单
  - 未命中时按临时学生创建，不再由前端生成 `TEMP-*` 学生 ID
  - 管理端展示的“学生ID”统一改为数据库 `studentId`
- 预期产出：
  - 前端 `wellington` 完成页面、service、type、adapter、测试、文档更新
  - 本地后端联调仓库 `daoleme-local-integration` 完成新接口与契约改动
  - 至少前端门禁通过；若后端无法通过，必须明确记录阻塞原因
- 完成标准：
  - 前端代码和测试全部切到新契约
  - 前端 `npm test`、`npm run sync:tokens`、`npm run lint`、`npm run build` 通过
  - handoff 明确说明后端当前是否可编译、是否已可联调

## 2. 当前进展
- 已完成前端实现，核心文件：
  - `/Users/minxian/conductor/workspaces/inqasst/wellington/components/app/student-form-client.tsx`
  - `/Users/minxian/conductor/workspaces/inqasst/wellington/lib/services/mobile-client.ts`
  - `/Users/minxian/conductor/workspaces/inqasst/wellington/lib/services/mobile-api.ts`
  - `/Users/minxian/conductor/workspaces/inqasst/wellington/lib/services/mobile-app.ts`
  - `/Users/minxian/conductor/workspaces/inqasst/wellington/lib/services/mobile-adapters.ts`
  - `/Users/minxian/conductor/workspaces/inqasst/wellington/lib/services/mobile-schema.ts`
  - `/Users/minxian/conductor/workspaces/inqasst/wellington/lib/services/student-upsert.ts`
  - `/Users/minxian/conductor/workspaces/inqasst/wellington/lib/domain/types.ts`
  - `/Users/minxian/conductor/workspaces/inqasst/wellington/app/admin/course-settings/[courseId]/students/new/client.tsx`
  - `/Users/minxian/conductor/workspaces/inqasst/wellington/app/admin/course-settings/[courseId]/students/[studentId]/edit/client.tsx`
- 前端已删除旧方案残留：
  - 删除 `/Users/minxian/conductor/workspaces/inqasst/wellington/lib/services/student-selection.ts`
  - 删除 `/Users/minxian/conductor/workspaces/inqasst/wellington/tests/service/student-selection.test.ts`
- 前端交互现状：
  - 页面初始不再请求 `/api/admin/students?page=&size=`
  - 新增页姓名输入框只有在输入至少 2 个字且搜索面板打开时，才会请求 `GET /api/admin/campuses/{campusId}/students/search?q=&limit=10`
  - 选择已有学生后，保存走 `POST /api/admin/courses/{courseId}/students/existing`
  - 未选择已有学生时，保存前会 `window.confirm(...)`，然后走 `POST /api/admin/courses/{courseId}/students`，只提交 `name + homeroomClassId`
  - 编辑页的“学生ID”改为只读显示数据库 `studentId`，不再编辑 `externalStudentId`
  - 学生名单页显示的 `studentCode` 已改成 `String(student.studentId)`
- 已完成前端测试/文档更新：
  - `/Users/minxian/conductor/workspaces/inqasst/wellington/tests/service/mobile-client.test.ts`
  - `/Users/minxian/conductor/workspaces/inqasst/wellington/tests/contract/mobile-client.test.ts`
  - `/Users/minxian/conductor/workspaces/inqasst/wellington/tests/contract/mobile-api.test.ts`
  - `/Users/minxian/conductor/workspaces/inqasst/wellington/tests/service/mobile-app.test.ts`
  - `/Users/minxian/conductor/workspaces/inqasst/wellington/tests/service/mobile-adapters.test.ts`
  - `/Users/minxian/conductor/workspaces/inqasst/wellington/tests/service/student-upsert.test.ts`
  - `/Users/minxian/conductor/workspaces/inqasst/wellington/docs/上线前测试清单_20260414.md`
  - `/Users/minxian/conductor/workspaces/inqasst/wellington/docs/测试链路通俗说明_20260416.md`
  - `/Users/minxian/conductor/workspaces/inqasst/wellington/docs/后端协同说明_20260414.md`
- 已完成后端本地联调仓库改动，核心文件：
  - `/Users/minxian/conductor/workspaces/daoleme-local-integration/src/main/java/com/daoleme/api/admin/controller/AdminController.java`
  - `/Users/minxian/conductor/workspaces/daoleme-local-integration/src/main/java/com/daoleme/api/admin/AdminSettingsService.java`
  - `/Users/minxian/conductor/workspaces/daoleme-local-integration/src/main/java/com/daoleme/api/admin/dto/CourseStudentUpsertRequest.java`
  - `/Users/minxian/conductor/workspaces/daoleme-local-integration/src/main/java/com/daoleme/api/admin/dto/CourseStudentDetailResponse.java`
  - `/Users/minxian/conductor/workspaces/daoleme-local-integration/src/main/java/com/daoleme/api/admin/dto/CampusStudentSearchItemResponse.java`
  - `/Users/minxian/conductor/workspaces/daoleme-local-integration/src/main/java/com/daoleme/api/admin/dto/CourseExistingStudentEnrollRequest.java`
  - `/Users/minxian/conductor/workspaces/daoleme-local-integration/src/main/java/com/daoleme/api/school/repository/StudentRepository.java`
  - `/Users/minxian/conductor/workspaces/daoleme-local-integration/src/main/java/com/daoleme/api/course/dto/CourseStudentRowResponse.java`
  - `/Users/minxian/conductor/workspaces/daoleme-local-integration/src/test/java/com/daoleme/api/admin/AdminSettingsServiceTest.java`
- 后端已实现的契约改动（代码层面已写入，但未成功编译验证）：
  - 新增 `GET /api/admin/campuses/{campusId}/students/search`
  - 新增 `POST /api/admin/courses/{courseId}/students/existing`
  - `POST /api/admin/courses/{courseId}/students` 允许不传 `externalStudentId`
  - `PUT /api/admin/courses/{courseId}/students/{studentId}` 未传 `externalStudentId` 时保留原值
- 已完成验证：
  - 前端 `npm test` 通过
  - 前端 `npm run sync:tokens` 通过
  - 前端 `npm run lint` 通过，39 条 warning，0 error
  - 前端 `npm run build` 通过
  - 当前本地页面 `http://localhost:3000/admin/course-settings/_/students/new/?courseId=4855&courseSessionId=3446` 返回 `200`
- 未完成验证：
  - 后端 `mvn -Dtest=AdminSettingsServiceTest test` 未能进入本次改动测试，先被仓库已有编译错误阻塞

## 3. 关键上下文
- 用户的明确要求：
  - “一直没加载出来，能不能考虑换一个更节省资源的方案，另外学生 ID也不对，学生 ID 来源于数据库而不是你自己生成”
  - 后续已明确批准的方案是：
    - 新增后端校区学生搜索接口
    - 新增后端已有学生入课接口
    - 页面展示的“学生ID”统一用数据库 `studentId`
    - 临时学生不再展示前端生成的 ID，保存成功后由后端返回数据库 `studentId`
- 已做出的关键决定：
  - 不做前端“全量拉取再本地过滤”的降级方案
  - 不再保留旧的 `TEMP-*` 客户端学生 ID
  - 前端如果没有匹配到已有学生，只提交 `name + homeroomClassId`
  - 已有学生入课不复用创建接口，而是单独走 `/students/existing`
- 已知约束：
  - 前端仓库必须用 `apply_patch` 手工改文件
  - 不要回滚用户未要求的 `.next/`、`out/` 产物变化
  - `wellington` 前端当前工作区很脏，`build` 会继续污染 `.next/` 和 `out/`
  - `daoleme-local-integration` 不是干净稳定基线，`git` 元数据有异常，本轮未做提交/推送
- 重要假设：
  - 当前用户 IAB 指向的是前端本地 `localhost:3000`
  - 当前连接的真实后端环境尚未部署本次新增接口
  - 因此前端页面虽然已实现新流转，但若后端环境未同步，会在“搜索已有学生”阶段报错或走不到完整联调闭环

## 4. 关键发现
- 根因确认：
  - 用户之前看到“一直加载”的问题，来自旧方案在新增页首屏预拉全量学生目录；不是页面路由本身没起来
  - 旧实现还人为生成了 `TEMP-*` 学生 ID，这与用户要求“学生ID来源于数据库”冲突
- 新方案已在前端完全替换旧方案：
  - 不再依赖 `/api/admin/students?page=&size=`
  - 新增页已变成 debounce 300ms 的按需搜索
  - 名单页已把“学生ID”显示口径切成数据库 `studentId`
- 后端阻塞不是本次改动引入的：
  - `mvn -Dtest=AdminSettingsServiceTest test` 失败点在 `/Users/minxian/conductor/workspaces/daoleme-local-integration/src/main/java/com/daoleme/api/admin/AdminReadService.java` 和 `/Users/minxian/conductor/workspaces/daoleme-local-integration/src/main/java/com/daoleme/api/admin/RollCallTeacherResolver.java`
  - 报错是大量现存 `cannot find symbol`，涉及 `getId()`、`builder()`、`getStartAt()` 等基础访问器/构建器缺失
  - 结论：后端联调仓库当前不是可编译基线，本次新增学生改动无法在这里完成真实联调验证
- 当前前端是可发布到“等后端上线新接口”的状态：
  - 代码、测试、类型、文档都已经按新契约统一
  - 但线上/共享 dev 真正可用，仍取决于后端把新增接口和契约改动部署出去

## 5. 未完成事项
1. 让后端在可编译基线上落地并部署以下接口与契约：
   - `GET /api/admin/campuses/{campusId}/students/search`
   - `POST /api/admin/courses/{courseId}/students/existing`
   - `POST /api/admin/courses/{courseId}/students` 允许不传 `externalStudentId`
   - `PUT /api/admin/courses/{courseId}/students/{studentId}` 未传 `externalStudentId` 时保留原值
2. 在真实后端环境可用后，重新联调并手动验收：
   - 选择已有学生时，搜索下拉是否正常返回，保存后是否直接加入当前课程名单
   - 临时学生保存后，成功提示与名单页是否都显示数据库 `studentId`

## 6. 建议接手路径
- 优先查看：
  - 前端页面与交互：`/Users/minxian/conductor/workspaces/inqasst/wellington/components/app/student-form-client.tsx`
  - 前端数据装配：`/Users/minxian/conductor/workspaces/inqasst/wellington/lib/services/mobile-app.ts`
  - 前端 API：`/Users/minxian/conductor/workspaces/inqasst/wellington/lib/services/mobile-client.ts`、`/Users/minxian/conductor/workspaces/inqasst/wellington/lib/services/mobile-api.ts`
  - 名单页 studentId 口径：`/Users/minxian/conductor/workspaces/inqasst/wellington/lib/services/mobile-adapters.ts`
  - 后端入口：`/Users/minxian/conductor/workspaces/daoleme-local-integration/src/main/java/com/daoleme/api/admin/controller/AdminController.java`
  - 后端服务：`/Users/minxian/conductor/workspaces/daoleme-local-integration/src/main/java/com/daoleme/api/admin/AdminSettingsService.java`
  - 后端单测：`/Users/minxian/conductor/workspaces/daoleme-local-integration/src/test/java/com/daoleme/api/admin/AdminSettingsServiceTest.java`
- 先验证：
  - 当前准备联调的后端仓库是不是一个可编译基线
  - 若仍使用 `daoleme-local-integration`，先解决它现有编译问题，再谈本次功能联调
  - 若改用别的后端工作副本，先把本次后端改动迁过去
- 推荐动作：
  - 优先在可编译的后端仓库/分支重新套用本次后端改动
  - 后端接口可用后，用浏览器手测 `http://localhost:3000/admin/course-settings/_/students/new/?courseId=4855&courseSessionId=3446`
  - 验收顺序建议：已有学生搜索 -> 已有学生入课 -> 临时学生创建 -> 名单页 studentId 显示

## 7. 风险与注意事项
- 不要误以为当前“前端 build 通过”就代表功能可联调；这次真正的外部阻塞在后端接口未落地/未部署
- 不要回到旧的“全量拉取学生目录 + 前端本地过滤 + TEMP ID”方案；用户已经明确否定
- 不要把 `externalStudentId` 再当成管理端展示的“学生ID”；当前用户明确要求数据库 `studentId`
- 不要把 `.next/` 和 `out/` 的大量变更当作业务源码改动；它们主要来自 `build`
- `wellington` 前端 repo 里还有一个无关未跟踪文件：`/Users/minxian/conductor/workspaces/inqasst/wellington/.codex/environments/environment.toml`
- 已验证过且不建议继续的方向：
  - 继续在前端生成临时学生 ID
  - 继续使用 `/api/admin/students?page=&size=` 做新增页首屏目录预加载
  - 继续在当前 `daoleme-local-integration` 的坏基线上纠结“为什么本次单测没跑起来”，因为失败点并不在本次新增学生改动

下一位 Agent 的第一步建议：
先在一个可编译的后端工作副本里执行 `mvn -Dtest=AdminSettingsServiceTest test`，确认后端基线可用；如果当前还是 `daoleme-local-integration`，先处理它现有的 `AdminReadService` / `RollCallTeacherResolver` 编译错误，再迁移本次新增学生接口改动。
