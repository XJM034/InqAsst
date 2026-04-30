# 页面对比报告：`/admin/emergency/course/[courseId]/external-teacher`

## 1. 先说结论

这页同样不是严重视觉偏移页。它的问题在于已经从 mock 的静态录入页，升级成了真实创建链路的一环，需要和上一页的老师选择流程严格对齐。

## 2. mock 页面想表达什么

mock 的“系统外老师”页很简单：

- 填姓名
- 填电话
- 填必要备注
- 确认创建并用于当前课程

页面目标非常单纯，就是补一个系统里没有的人。

## 3. 当前接口版实际做成了什么

当前实现主要在：

- `app/admin/emergency/course/[courseId]/external-teacher/page.tsx`
- `components/app/external-teacher-client.tsx`
- `lib/services/mobile-app.ts` 中的 `getAdminExternalTeacherForm`
- `lib/services/mobile-client.ts` 中的 `createExternalTeacher`

它已经是一个真实录入并提交到后端的表单页。

## 4. 页面展示差异

### 4.1 基本结构仍和 mock 接近

- 表单字段仍然简洁
- 课程上下文仍然存在
- 主按钮仍是确认录入

### 4.2 当前页更偏“真实录入流”

它需要处理：

- 提交中
- 重复手机号
- 创建失败
- 创建后返回上一页继续选中

因此页面状态比 mock 更重。

## 5. mock 与实际接口数据差异

### 5.1 mock 数据来源

mock 使用 `adminExternalTeacherForms[courseId]`。

它是纯展示用数据。

### 5.2 当前接口数据来源

当前使用：

- `getAdminExternalTeacherForm(courseId)`
- `createExternalTeacher`

并且实际上要与 `courseSessionId` 相关链路配合。

### 5.3 核心差异

mock 的目的只是让页面完整。

当前页的目的已经是：

- 真创建一个外部老师
- 真把结果带回当前代课链路

因此这页不应孤立判断，而要看它和上一页、详情页的回流是否一致。

## 6. 对齐建议

- 保持表单轻量感，不要因为真实提交而变成厚重后台页。
- 创建成功后的回流要和 mock 一样顺畅，避免用户迷失在多层页面里。
- 表单文案要持续强调“用于当前课程/当前代课处理”，不要做成通用老师创建页。

## 7. 对齐时要重点核对的点

- 提交成功后是否自动回到正确链路。
- 页面是否一直让人知道自己是在给哪门课补系统外老师。
- 错误态是否简洁，不破坏 mock 的轻量视觉节奏。
