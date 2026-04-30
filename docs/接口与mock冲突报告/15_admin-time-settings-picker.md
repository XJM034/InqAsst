# 接口与 Mock 冲突：`/admin/time-settings/[detail]/picker`

## 1. 冲突等级

`高`

这页的主要冲突不是数据是否真实，而是后端字段形态直接暴露给了页面控件，导致 mock 的 picker 交互被换成表单配置交互。

## 2. mock 依赖的对象

mock picker 页需要的是“选择器友好对象”。

它应该服务于：

- 时间滚轮
- 快速确认
- 明确当前值

## 3. 当前接口实际使用的对象

当前链路是：

- `getAdminTimePicker(courseSessionId, kind)`
- `fetchAdminCourseSessionTimeSettings`
- `mapAdminTimePicker`

当前对象更偏真实配置字段：

- `inputMode`
- `beforeStartMinutes`
- `afterStartMinutes`

## 4. 具体冲突点

### 4.1 对象冲突

mock 要的是：

- picker 视图对象

当前给的是：

- 表单配置对象

### 4.2 字段冲突

mock 用户理解的是：

- 我在选时间

当前接口字段却是：

- 开课前多少分钟
- 开课后多少分钟

### 4.3 交互冲突

mock 是选择器交互。

当前是输入框交互。

## 5. 处理建议

- 不要把真实配置字段直接映射成 UI 控件形态。
- 前端应把这些字段重新包装回 picker 体验。
- 后端字段可以留在提交层，不应直接决定页面交互长什么样。
