# 接口与 Mock 冲突：`/admin/emergency/course/[courseId]/external-teacher`

## 1. 冲突等级

`中低`

这页冲突不在字段不足，而在于 mock 是表单壳，当前已经变成真实创建对象。

## 2. mock 依赖的对象

mock 依赖的是“系统外老师录入表单对象”。

重点是：

- 当前课程上下文
- 姓名、电话等轻量字段

## 3. 当前接口实际使用的对象

当前页依赖：

- `getAdminExternalTeacherForm(courseId)`
- `createExternalTeacher`

本质上已经接入了真实创建动作。

## 4. 具体冲突点

### 4.1 动作冲突

mock 是演示型录入。

当前是真实创建对象并回流链路。

### 4.2 链路冲突

如果创建成功后回流路径没处理好，这页就会与 mock 的轻量流程脱节。

## 5. 处理建议

- 不需要回退功能。
- 需要把真实创建流程继续包装在 mock 的轻量链路语义里，尤其要保证创建后正确回到老师选择页。
