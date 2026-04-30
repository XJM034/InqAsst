# 页面对比报告：`/admin/time-settings/[detail]/picker`

## 1. 先说结论

picker 页的偏差最直观。mock 是滚轮式时间选择器视觉稿，当前页已经变成真实表单输入页。这不只是样式变了，而是控件形态和交互模式都换了。

## 2. mock 页面想表达什么

mock picker 的重点是：

- 轻量
- 集中
- 明显像移动端时间选择器

无论是设置实际上课时间，还是设置点名时间，用户看到的都应该是“选时间”的直觉交互。

## 3. 当前接口版实际做成了什么

当前实现主要在：

- `app/admin/time-settings/[courseSessionId]/picker/page.tsx`
- `components/app/admin-time-setting-picker-client.tsx`
- `lib/services/mobile-app.ts` 中的 `getAdminTimePicker`

当前数据链路是：

- `fetchAdminCourseSessionTimeSettings`
- `mapAdminTimePicker`

当前控件通常变成：

- `<input type="time">`
- 开课前多少分钟
- 开课后多少分钟

## 4. 页面展示差异

### 4.1 控件形态完全变了

mock 是 picker。

当前是表单输入控件。

这会直接改变用户的操作节奏和视觉印象。

### 4.2 点名时间从绝对时间改成偏移配置感

mock 更像“选一个时间段”。

当前点名时间更像“配置开课前后偏移分钟数”。

这从交互上就不再是同一页。

### 4.3 页面气质从移动端弹层变成后台表单

mock 的感觉是快速选值。

当前的感觉是认真填写配置项。

## 5. mock 与实际接口数据差异

### 5.1 mock 数据来源

mock 使用：

- `adminTimePickerData["class-time"]`
- `adminTimePickerData["attendance-window"]`

数据模型天然服务 picker 展示。

### 5.2 当前接口数据来源

当前使用：

- `getAdminTimePicker(courseSessionId, kind)`
- `fetchAdminCourseSessionTimeSettings`
- `mapAdminTimePicker`

字段包括：

- `inputMode`
- `beforeStartMinutes`
- `afterStartMinutes`
- `campusId`

这些都是更真实的配置字段。

### 5.3 关键错位

mock 关心的是“怎么选”。

当前更关心“怎么提交配置值”。

当配置字段占主导后，页面就会不可避免地失去 mock 的 picker 观感。

## 6. 对齐建议

- 把交互壳重新做回 picker 体验，真实字段映射放在内部转换，不要把后端字段形状直接暴露给用户。
- 实际上课时间和点名时间都要尽量保留 mock 的滚轮/选择器感。
- 偏移分钟数如果必须保留，也应隐藏在符合 mock 的交互包装之下。

## 7. 对齐时要重点核对的点

- 页面看起来是不是“选择器”，而不是“表单”。
- 时间确认动作是否简洁。
- 用户是否无需理解 `beforeStartMinutes` 之类的后台概念。
