# 实际接口与 Mock 冲突报告目录

## 1. 文档目标

本目录专门回答一个问题：

- 不是“页面哪里长得不像”
- 而是“当前真实接口为什么会把 mock 页面带偏”

因此这里的每份文档只聚焦三件事：

1. mock 页面依赖的到底是什么数据对象。
2. 当前接口版实际拿到的是什么对象。
3. 两者具体冲突在哪一层，以及应该由前端聚合还是后端补接口。

## 2. 使用原则

阅读顺序建议如下：

1. 先看本目录里的单页冲突文档，确认冲突根因。
2. 再看 `docs/页面对比报告/`，确认这些冲突在页面上具体表现成什么样。
3. 最后回到 `docs/最终页面对齐执行计划_XJM034_check-push-rules_20260416.md` 开始排实施顺序。

本目录还有一个必须执行的硬原则：

- 处理方案只能基于真实接口返回数据。
- mock 只用于对比，不允许作为页面运行时数据源。
- 不允许新增“mock 兜底逻辑”“mock 回退逻辑”“mock 临时兼容逻辑”。
- 如果当前接口不够，解决方向只能是：
  - 前端基于真实接口做聚合与重组
  - 或后端补字段、补接口、补查询能力

## 3. 冲突分类

本轮梳理里，真实接口与 mock 的冲突主要有 7 类：

- `对象冲突`
  - mock 需要 A 业务对象，当前却拿了 B 业务对象。
- `粒度冲突`
  - mock 是规则级/课程级，当前却只有课节级或实体级。
- `字段冲突`
  - 字段名相似，但语义不同，不能直接替换。
- `状态冲突`
  - mock 的状态表达是“完成/未完成”“代课/主课”，当前接口却给了另一套状态。
- `动作冲突`
  - mock 页面需要的是集合保存、规则切换，当前接口只支持单项即时提交。
- `路由冲突`
  - mock 页面用语义参数，当前接口版用实体 ID 或 session ID。
- `链路冲突`
  - 单页本身能画出来，但放进真实链路后，上下游含义已经不一致。

## 4. 文件清单

### 4.1 通用入口

- `00_页面对齐工作流.md`
- `01_login.md`

### 4.2 管理端

- `02_admin-home.md`
- `03_admin-course-settings.md`
- `04_admin-course-settings-students.md`
- `05_admin-course-settings-students-new.md`
- `06_admin-course-settings-students-edit.md`
- `07_admin-course-settings-students-import.md`
- `08_admin-course-teachers.md`
- `09_admin-emergency.md`
- `10_admin-emergency-course.md`
- `11_admin-emergency-select-teacher.md`
- `12_admin-emergency-external-teacher.md`
- `13_admin-time-settings.md`
- `14_admin-time-settings-detail.md`
- `15_admin-time-settings-picker.md`
- `16_admin-control.md`
- `17_admin-control-class-detail.md`
- `18_admin-unarrived.md`

### 4.3 教师端

- `19_teacher-home.md`
- `20_teacher-attendance-entry.md`
- `21_teacher-attendance-demo.md`
- `22_teacher-home-roster.md`
- `23_teacher-attendance-no-class.md`
- `24_teacher-no-class.md`

### 4.4 兼容路由

- `25_route-root.md`
- `26_route-role-select.md`
- `27_route-teacher-attendance-demo-roster.md`

## 5. 当前最严重的冲突页

下面 5 页优先级最高：

- `03_admin-course-settings.md`
- `13_admin-time-settings.md`
- `18_admin-unarrived.md`
- `19_teacher-home.md`
- `08_admin-course-teachers.md`

原因不是“字段少”，而是接口对象本身与 mock 页面语义不同，继续在 adapter 里硬拼只会越接越偏。
