# 页面对比报告：`/admin/course-settings/[courseId]/students/new`

## 1. 先说结论

这页的问题不是功能太弱，反而是功能更真实了，但页面语义变“通用录入表单”了，弱化了 mock 里“给当前课程新增学生”的现场感。

## 2. mock 页面想表达什么

mock 里的新增学生页重点是：

- 当前正在给哪门课加人
- 这是课程链路里的一个局部动作
- 表单结构要轻量、直接

因此它强调的是：

- 课程上下文
- 明确的新增动作
- 简单直接的字段输入

## 3. 当前接口版实际做成了什么

当前实现主要在：

- `app/admin/course-settings/[courseId]/students/new/page.tsx`
- `components/app/student-form-client.tsx`
- `lib/services/mobile-app.ts` 中的 `getAdminCourseStudentForm`

当前数据链路是：

- `fetchCourseDetail`
- `fetchAdminCampusClasses`

它已经是一个真实表单页，会拉行政班列表、校区信息和真实可提交字段。

## 4. 页面展示差异

### 4.1 当前页更像通用学生录入页

mock 看起来像“在当前课程里补一个学生”。

当前页更像“正式录入一个学生到系统/课程关系中”。

### 4.2 课程上下文感变弱

虽然当前页仍知道 `courseId`，但页面视觉重点容易落到表单本身，而不是“我在给哪门课加人”。

### 4.3 字段结构变重

mock 多是自由输入。

当前页新增了更真实的字段结构，例如：

- `homeroomClassId`
- `homeroomClasses[]`

这当然更真实，但也让页面风格离 mock 的轻量态远了一步。

## 5. mock 与实际接口数据差异

### 5.1 mock 数据来源

mock 使用 `adminCourseStudentForms["courseId:new"]`。

它服务的是页面展示语义，不强调真实实体关系。

### 5.2 当前接口数据来源

当前使用：

- `getAdminCourseStudentForm`
- `fetchCourseDetail`
- `fetchAdminCampusClasses`

它服务的是可落地提交的真实表单。

### 5.3 关键差异

mock 的字段更像：

- 文本驱动
- 页面演示驱动

当前字段更像：

- ID 驱动
- 实体关系驱动
- 表单校验驱动

所以这页不是“信息不够”，而是“重心转移了”。

## 6. 对齐建议

- 保留真实表单能力，但视觉上要把课程上下文抬上来。
- 让页面标题、副标题、顶部摘要更明确表达“向当前课程新增学生”。
- 不要让下拉、校验、实体字段把页面做成完全通用的后台录入表单。
- 页面完成后的返回路径要自然回到当前课程名单链路。

## 7. 对齐时要重点核对的点

- 顶部是否清楚标明当前课程。
- 新增动作是否仍然像课程子任务，而不是系统级录入。
- 表单的字段顺序、文案、主按钮语义是否保持 mock 的轻量直觉。
