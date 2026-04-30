# 页面对比报告：`/admin/control`

## 1. 先说结论

这页当前的视觉结构还算接近，但信息重心从“点名完成度”偏成了“考勤结果统计总览”。因此它不是完全错页，但确实不再是 mock 那种“总控推进面板”。

## 2. mock 页面想表达什么

mock 的点名总控页重点是推进：

- 哪些班已经完成
- 哪些班还没完成
- 还差谁处理

因此它的摘要和卡片文案都更偏“完成态”。

## 3. 当前接口版实际做成了什么

当前实现主要在：

- `app/admin/control/page.tsx`
- `components/app/admin-control-client.tsx`
- `lib/services/mobile-app.ts` 中的 `getAdminControlData`

当前数据链路是：

- `fetchAdminRollCallOverview`
- `fetchAdminTeacherSettingsOverview`
- `mapAdminControlData`

页面已经变成更真实的汇总页，重点放在：

- 应到
- 已到
- 请假
- 未到

## 4. 页面展示差异

### 4.1 顶部摘要重心变了

mock 顶部最关心：

- 已完成多少
- 未完成多少

当前顶部最关心：

- 应到多少
- 已到多少
- 请假多少
- 未到多少

这会把页面从“推进任务”变成“结果盘点”。

### 4.2 卡片文案也跟着变了

mock 卡片更像：

- 等待老师点名
- 已确认 12/30

当前卡片更统一成：

- `x/y 已到`

信息价值不一样。

### 4.3 总控感减弱

mock 让管理员一眼知道还有哪些班没处理完。

当前页虽然也能看状态，但“未完成”的推进感没有以前那么强。

## 5. mock 与实际接口数据差异

### 5.1 mock 数据来源

mock 使用：

- `adminControlData`
- `adminControlDataByCampus`

其核心字段就是 `finishedCount`、`unfinishedCount` 一类。

### 5.2 当前接口数据来源

当前使用：

- `getAdminControlData`
- `fetchAdminRollCallOverview`
- `fetchAdminTeacherSettingsOverview`
- `mapAdminControlData`

其核心字段变成：

- `shouldAttend`
- `present`
- `leave`
- `absent`

### 5.3 关键错位

mock 需要的是“流程推进状态”。

当前接口更像“考勤结果统计”。

两者都和点名有关，但不是同一层信息。

## 6. 对齐建议

- 顶部摘要要把“已完成/未完成”重新抬回第一优先级。
- 结果统计可以保留，但只能作为辅助信息。
- 班级卡片文案也要恢复流程推进感，而不是只给结果数字。

## 7. 对齐时要重点核对的点

- 首页摘要第一眼是不是仍然在回答“还有哪些班没点完”。
- 进入班级详情前，管理员能否快速判断优先处理顺序。
- 结果统计是否反客为主，抢掉了总控页面原本的任务属性。
