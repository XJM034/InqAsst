# 页面对比报告：`/admin/time-settings`

## 1. 先说结论

这一页和课程设置页一样，属于“页面类型已经换了”的重灾区。mock 是规则级时间设置首页，当前接口版却变成了课节列表页。

这意味着后面详情页和 picker 页一起都偏了，不是局部修文案能解决的问题。

## 2. mock 页面到底在表达什么

mock 的 `/admin/time-settings` 是一个非常明确的规则页：

- 顶部按周几切换
- 中间搜索
- 下面只有两张核心规则卡
  - 实际上课时间
  - 点名时间

这页是在回答：

- 今天这套规则长什么样
- 我要改哪一类时间规则

它不是在展示今天有多少个课节。

## 3. 当前接口版实际做成了什么

当前实现主要在：

- `app/admin/time-settings/page.tsx`
- `lib/services/mobile-app.ts` 中的 `getAdminTimeSettingsData`
- `lib/services/mobile-adapters.ts` 中的 `mapAdminTimeSettingsData`

当前数据链路是：

- `fetchAdminTimeSettingsSessions`
- `mapAdminTimeSettingsData`

这套数据直接把页面做成了：

- 某天的课程课节列表
- 每个课节一张卡
- 卡里展示这节课的实际上课时间和点名时间

## 4. 页面展示差异

### 4.1 页面类型从“规则页”变成了“列表页”

mock 是 2 张规则卡。

当前是 N 张课节卡。

这不是内容多少的问题，而是页面类型完全改变了。

### 4.2 用户心智被带偏

mock 打开这页时，用户会想：

- 我要改规则

当前打开这页时，用户会想：

- 我要在课节列表里找某一节课

这两个操作心智完全不同。

### 4.3 搜索对象也变了

mock 搜索更像在找规则项或按周几过滤。

当前搜索更自然会落到：

- 课程名
- 某个课节

于是页面不再是规则配置入口，而是课节定位入口。

## 5. mock 与实际接口数据差异

### 5.1 mock 数据来源

mock 使用 `adminTimeSettingsData`。

其核心字段是：

- `days`
- `actualClassTime`
- `attendanceWindow`

也就是规则对象。

### 5.2 当前接口数据来源

当前使用：

- `getAdminTimeSettingsData`
- `fetchAdminTimeSettingsSessions`
- `mapAdminTimeSettingsData`

其核心字段更像：

- `dateLabel`
- `sessions[]`

也就是课节列表对象。

### 5.3 这页为什么一定会跑偏

因为上游对象从“规则”换成了“课节”。

只要还在消费 `sessions[]` 作为页面中心，就不可能还原 mock 那个两卡规则首页。

## 6. 对齐建议

- 先把首页重新定义成规则页，不要再直接渲染课节列表。
- 课节数据可以作为规则明细的来源，但不能成为首页主体。
- 顶层必须重新抽象出“实际上课时间规则”和“点名时间规则”两张卡。
- 周几切换和规则摘要要恢复为第一层信息。

## 7. 对齐时要重点核对的点

- 首页是不是只有规则入口，而不是课节清单。
- 用户是否打开页面就知道自己在改“规则”，而不是在找“某节课”。
- 从首页跳详情页时，跳的是规则详情，不是课节详情。
