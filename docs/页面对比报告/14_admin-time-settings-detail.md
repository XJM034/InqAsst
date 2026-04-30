# 页面对比报告：`/admin/time-settings/[detail]`

## 1. 先说结论

当前这页已经不再是 mock 里的“某类时间规则详情页”，而是“某个课节时间详情页”。首页一旦偏成课节列表，这页就会跟着整体换义。

## 2. mock 页面想表达什么

mock 的详情页应该只有两种：

- 设置实际上课时间
- 设置点名时间

也就是说，路由里的 `[detail]` 表达的是规则类型，而不是课节主键。

页面关心的是：

- 这类规则当前怎么定义
- 默认逻辑是什么
- 去哪里调 picker

## 3. 当前接口版实际做成了什么

当前实现主要在：

- `app/admin/time-settings/[courseSessionId]/page.tsx`
- `lib/services/mobile-app.ts` 中的 `getAdminTimeSettingDetail`
- `lib/services/mobile-adapters.ts` 中的 `mapAdminTimeSettingDetail`

当前数据链路是：

- `fetchAdminCourseSessionTimeSettings(courseSessionId)`
- `mapAdminTimeSettingDetail`

可见当前 `[detail]` 的真实含义其实是 `courseSessionId`。

## 4. 页面展示差异

### 4.1 标题重心变了

mock 标题应当是：

- 设置实际上课时间
- 设置点名时间

当前标题更自然会显示课程名或课节摘要。

### 4.2 页面同时承载两类时间设置

mock 是“一页只讲一种规则”。

当前详情页里通常会同时展示：

- 实际上课时间 section
- 点名时间 section

于是它不再是规则详情，而是课节综合详情。

### 4.3 页面参数也变了

mock 用语义化 detail key 即可。

当前页必须通过 `courseSessionId` 才能找到目标数据。

## 5. mock 与实际接口数据差异

### 5.1 mock 数据来源

mock 使用：

- `adminTimeSettingDetails["class-time"]`
- `adminTimeSettingDetails["attendance-window"]`

它们直接围绕规则类型组织。

### 5.2 当前接口数据来源

当前使用：

- `getAdminTimeSettingDetail(courseSessionId)`
- `fetchAdminCourseSessionTimeSettings`

其字段围绕课节，例如：

- `scheduledRange`
- `sections[]`
- `courseSessionId`

### 5.3 关键错位

mock 要的是“某类规则的配置详情”。

当前给的是“某节课的时间配置详情”。

所以即便页面名字看起来接近，用户读到的对象已经不同。

## 6. 对齐建议

- 路由层重新回到规则类型维度，而不是课节 ID 维度。
- 详情页要拆回“一页一种规则”。
- 课节级数据如有需要，应当在规则页内部作为样本或影响范围说明，而不是直接占据页面主体。

## 7. 对齐时要重点核对的点

- 页面标题是不是规则标题，而不是课程标题。
- 页面是否一次只讨论一种规则。
- 进入 picker 的跳转是否仍然保持 mock 的规则链路。
