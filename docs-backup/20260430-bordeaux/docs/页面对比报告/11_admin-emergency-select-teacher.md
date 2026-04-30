# 页面对比报告：`/admin/emergency/course/[courseId]/select-teacher`

## 1. 先说结论

这页是管理员代课链路里对齐度相对较好的一页。视觉结构还在，主要问题不在 UI，而在于它已经彻底切到真实课节数据和即时提交语义。

## 2. mock 页面想表达什么

mock 的重点是：

- 看当前课程信息
- 看默认老师是谁
- 从候选老师中选一个替代人选
- 如果没有，进入“系统外老师”录入页

它是一个很明确的“替老师”的选择页。

## 3. 当前接口版实际做成了什么

当前实现主要在：

- `app/admin/emergency/course/[courseId]/select-teacher/page.tsx`
- `components/app/teacher-selection-client.tsx`
- `lib/services/mobile-app.ts` 中的 `getAdminTeacherSelection`

当前数据链路是：

- `fetchCourseDetail`
- `fetchRollCallTeacherOptions`
- `getAdminTeacherSelection(courseId, courseSessionId)`

它已经是真实候选老师选择页。

## 4. 页面展示差异

### 4.1 基础结构与 mock 大体一致

- 课程信息区仍在
- 默认老师信息仍在
- 候选老师列表仍在
- “录入系统外老师”入口仍在

### 4.2 页面更强调实时状态

当前页会更自然地加入：

- 搜索
- 提交中状态
- 提交成功或失败反馈

这使它比 mock 更像真实操作页。

### 4.3 候选列表的完整度更依赖接口

mock 中候选老师可以按设计稿稳定展示。

当前页候选列表是否丰满，完全取决于 `fetchRollCallTeacherOptions` 给得够不够全。

## 5. mock 与实际接口数据差异

### 5.1 mock 数据来源

mock 使用 `adminTeacherSelections[courseId]`。

它关心的是页面展示所需的候选结构。

### 5.2 当前接口数据来源

当前使用：

- `getAdminTeacherSelection`
- `fetchCourseDetail`
- `fetchRollCallTeacherOptions`

实际操作围绕课节级老师选项展开。

### 5.3 当前页的主要风险

这页不是语义严重跑偏，而是容易受接口字段完整性影响：

- 候选老师是否全
- 当前选中态是否准
- 默认老师信息是否完整

一旦这些字段缺失，页面虽然框架还像 mock，但完成度会明显下降。

## 6. 对齐建议

- 保持当前页面结构，不需要大改视觉框架。
- 强化 mock 中的课程摘要和默认老师说明，不要被实时操作态挤压。
- 系统外老师入口的位置和优先级要保持 mock 习惯。

## 7. 对齐时要重点核对的点

- 候选老师列表是否完整。
- 当前默认老师与当前选中老师的区分是否清楚。
- 选择后回流链路是否仍符合 mock 的代课处理体验。
