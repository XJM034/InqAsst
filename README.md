# InqAsst

InqAsst 是一个移动优先的课后服务管理应用，当前 v1 聚焦两条主线：

- 老师端点名
- 管理端现场总控与应急设置

当前仓库已完成前端工程初始化，并已将核心移动端页面推进到一轮基于 `design.pen` 的高保真还原。

当前登录流已改为单角色直达：一个手机号只对应一个角色入口，不再走角色选择页。

当前管理端点名交互已具备：

- 班级名单页单个学生状态切换
- 未到学生列表直接修改学生状态
- 班级名单页“先选择学生，再批量修改状态”的批量点名流程

## 当前实现

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide 图标
- `design.pen` -> `scripts/sync-pencil-tokens.mjs` -> `app/pencil-tokens.css` token 同步链路

已存在页面：

- `/login`
- `/role-select`（兼容重定向回 `/login`）
- `/teacher/home`
- `/teacher/no-class`
- `/teacher/attendance/demo`
- `/teacher/attendance/demo/roster`（兼容重定向）
- `/teacher/home/roster`
- `/teacher/me`
- `/admin/home`
- `/admin/course-teachers`
- `/admin/control`
- `/admin/control/[classId]`
- `/admin/course-settings`
- `/admin/course-settings/[courseId]/students`
- `/admin/course-settings/[courseId]/students/new`
- `/admin/course-settings/[courseId]/students/import`
- `/admin/course-settings/[courseId]/students/[studentId]/edit`
- `/admin/unarrived`
- `/admin/emergency`
- `/admin/emergency/course/[courseId]`
- `/admin/emergency/course/[courseId]/select-teacher`
- `/admin/emergency/course/[courseId]/external-teacher`
- `/admin/me`
- `/admin/time-settings`
- `/admin/time-settings/[settingKey]`
- `/admin/time-settings/[settingKey]/picker`

## 开发命令

```bash
npm install
npm run dev
```

本地校验命令：

```bash
npm run sync:tokens
npm run lint
npm run build
```

如果后续继续开发且仓库中存在最新 `./*-handoff.md`，可先将其作为补充上下文阅读，但仍应以代码和本文档为准。

默认本地地址：

- [http://localhost:3000](http://localhost:3000)

## 目录说明

- `app/`: App Router 页面
- `components/ui/`: shadcn/ui 基础组件
- `components/app/`: 业务组件
- `lib/domain/`: 领域类型与规则
- `lib/services/`: service 层
- `lib/mocks/`: mock 数据
- `scripts/sync-pencil-tokens.mjs`: Pencil token 生成脚本

## 设计与规划文档

- [design.pen](/Users/minxian/Documents/alex_project/InqAsst/design.pen)
- [设计文档_v1.9_开发指导.md](/Users/minxian/Documents/alex_project/InqAsst/设计文档_v1.9_开发指导.md)
- [移动端开发计划_v1.md](/Users/minxian/Documents/alex_project/InqAsst/移动端开发计划_v1.md)
- [CLAUDE.md](/Users/minxian/Documents/alex_project/InqAsst/CLAUDE.md)
- [AGENTS.md](/Users/minxian/Documents/alex_project/InqAsst/AGENTS.md)
