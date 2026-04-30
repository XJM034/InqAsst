# 页面对比报告：`/admin/course-settings/[courseId]/students/[studentId]/edit`

## 1. 先说结论

编辑学生页当前已经是真实可编辑页，但和新增页一样，越来越像“通用编辑表单”，而不是 mock 里的“当前课程下的这位学生编辑页”。

## 2. mock 页面想表达什么

mock 强调的是课程关系上下文：

- 我正在编辑哪门课里的哪位学生
- 这位学生当前就属于这门课
- 页面不是纯学生档案页，而是课程名册链路的一部分

## 3. 当前接口版实际做成了什么

当前实现主要在：

- `app/admin/course-settings/[courseId]/students/[studentId]/edit/page.tsx`
- `components/app/student-form-client.tsx`
- `lib/services/mobile-app.ts` 中的 `getAdminCourseStudentForm`

当前数据链路是：

- `fetchCourseDetail`
- `fetchAdminCampusClasses`
- `fetchAdminCourseStudentDetail`

它已经拥有真实学生详情，因此“能改”不是问题，问题是页面的链路感变弱了。

## 4. 页面展示差异

### 4.1 mock 更强调“学生属于当前课程”

mock 的页面上下文里，一般会强调：

- 当前课程
- 当前学生
- 当前操作是课程名单维护

### 4.2 当前页更像标准编辑页

当前页会更自然地呈现为：

- 编辑学生资料
- 修改行政班
- 修改联系方式或标识信息

课程从“主语境”退成了“路由参数来源”。

### 4.3 页面情绪发生了变化

mock 给人的感觉是“课程现场修名单”。

当前页给人的感觉更像“维护学生实体信息”。

## 5. mock 与实际接口数据差异

### 5.1 mock 数据来源

mock 使用 `adminCourseStudentForms["courseId:studentId"]`。

它天然包含课程上下文文案，例如 `courseContext` 一类信息。

### 5.2 当前接口数据来源

当前使用真实数据：

- `fetchCourseDetail`
- `fetchAdminCampusClasses`
- `fetchAdminCourseStudentDetail`

字段更真实，也更适合提交。

### 5.3 关键缺口

真实接口版虽然有更多学生字段，但没有自然保留 mock 想强调的页面语义字段：

- 当前属于哪门课
- 当前在课程链路中的编辑任务是什么
- 编辑完成后返回哪条链路最自然

## 6. 对齐建议

- 恢复课程上下文显示，不要让编辑页看起来像独立档案页。
- 在标题、副标题、返回路径上强化“课程名册编辑”语义。
- 保留真实可编辑能力，但不要牺牲 mock 的链路连续性。

## 7. 对齐时要重点核对的点

- 页头是否同时突出课程与学生，而不是只突出学生。
- 编辑完成后是否回到当前课程名单。
- 页面主按钮和返回文案是否还是“课程名单维护”的语气。
