# 到了么回归与发布门禁指导

更新日期：2026-04-29

## 用途

本文件只保留当前最新回归和发布前验收指导，不再堆积历史实测流水。

历史账号样例、课程样例、旧验证记录和 benchmark 见 `history/`。

## 推荐联调环境

- 本机前端：`http://127.0.0.1:3000`
- 已部署后端：`https://daoleme-dev.jxare.cn`
- 请求模式：`proxy`

当前本机回归 / 发布验收口径：

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000
E2E_LOGIN_CODE=8888
```

说明：

- 默认不要启动本机 `daoleme` 作为测试前置。
- `proxy` 是当前开发复现优先口径；`direct` 只保留为历史诊断背景。
- 若 shared dev 暴露后端问题，更新 `../backend-collab/current-issues.md`。

## 自动化门禁

发布和内测回归前，至少执行：

```bash
npm test
npm run lint
npm run build
```

涉及站内导航、登录跳转、表单保存后回流、动态详情页或部署配置时，还要确认：

- `npm run build` 后 `out/` 已更新。
- 不把 `next dev` 客户端导航结果当成静态部署等价验证。
- 在实际静态部署环境或等价静态产物环境复测，不出现 `?_rsc=` 或 `__next.*.txt` 404。

## Live Smoke

人工触发 shared dev 读链路 smoke：

```bash
cp .env.e2e.example .env.e2e.local
# 填入真实手机号后执行
npm run test:e2e:smoke
```

可选身份断言环境变量：

```bash
E2E_TEACHER_EXPECTED_NAME
E2E_TEACHER_EXPECTED_CAMPUS
E2E_ADMIN_EXPECTED_NAME
E2E_ADMIN_EXPECTED_CAMPUS
E2E_MULTI_CAMPUS_ADMIN_EXPECTED_NAME
E2E_MULTI_CAMPUS_ADMIN_EXPECTED_CAMPUS
```

要求：

- 同一套环境变量连续通过 2 次。
- 至少覆盖教师账号、单校区管理员账号、多校区管理员账号。
- 若要确认“无课 / 有课 / 今日课程数”是否正确，必须额外对照当天业务接口。

## 发布前人工写流

以下写流不应被自动化绿灯替代。执行前确认真实账号、环境和数据影响。

### 教师端

- 点名提交：进入今天有课的课程，完成一次点名提交，刷新后状态保持一致。
- 补录临时学生：在点名页新增学生，确认名单追加、默认已到、可切换未到，并随本次点名提交上报。
- 合班点名：按班级补录和提交，payload 保持 `courseSessionId + studentId + status`。

### 管理端课程与老师

- 课程设置编辑：修改地点并保存，返回后可见更新结果。
- 课程老师列表：首屏展示骨架和紧凑卡片，不长时间整页转圈。
- 添加空白课程：使用当天时间设置，不手填开始 / 结束时间；老师和学生均支持系统内 / 系统外来源。
- 更换点名老师：覆盖选择已有老师、恢复默认老师、录入系统外老师。
- 合班 / 互换：两者二选一，不同时提交；分别验证成功态和失败态。

### 管理端点名处置

- 单个学生状态修改。
- 批量状态修改。
- 未到学生页状态修正。
- 时间设置修改与恢复。
- 核心跨角色主链：管理端设置点名时间 -> 老师端提交 -> 管理端总控 / 未到学生同步 -> 复制文本命中目标学生。

### 学生与校区

- 学生新增：覆盖已有学生搜索入课、临时学生创建。
- 学生编辑：确认详情加载、保存、返回后数据一致。
- 多校区切换：确认管理员切校区后 cookie、页面和 `/api/admin/me` 一致。

## 当前明确不覆盖

- 学生导入。
- 课程设置首页汇总。
- 任何未确认账号、环境和数据影响的 live 写操作。

## 历史证据

- 原回归清单全量快照：`history/2026-04-29-regression-source.md`
- 原质量跟踪全量快照：`history/2026-04-29-quality-source.md`
