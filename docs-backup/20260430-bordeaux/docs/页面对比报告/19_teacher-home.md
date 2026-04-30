# 页面对比报告：`/teacher/home`

## 1. 先说结论

这一页是教师端偏移最严重的页面。表面上主卡、次卡位置都还在，但 mock 里的“主课 + 代课”语义，已经在当前适配中被替换成了“第一节课 + 第二节课”。

这会直接误导老师对当天任务的理解。

## 2. mock 页面到底在表达什么

mock 教师首页的核心非常清楚：

- 今天主课是什么
- 今天有没有代课
- 每门课的应到人数、时间、地点是什么
- 老师下一步是去点名还是先看名单

其中次卡片最关键，它不是“今天第二门课”，而是“今天代课任务”。

## 3. 当前接口版实际做成了什么

当前实现主要在：

- `app/teacher/home/page.tsx`
- `components/app/teacher-home-client.tsx`
- `lib/services/mobile-app.ts` 中的 `getTeacherHomeData`
- `lib/services/mobile-adapters.ts` 中的 `mapTeacherHomeData`

当前数据链路是：

- `fetchMeProfile`
- `fetchTeacherHome`
- `fetchTeacherTodaySessions`
- `mapTeacherHomeData`

问题核心在 adapter：当前 `mapTeacherHomeData` 会把同一天的第二条 session 塞进 `substituteCourse`。

## 4. 页面展示差异

### 4.1 次卡片标签错义

mock 次卡片应该明确表达“代课”。

当前次卡片更像：

- 第 2 节
- 今日第二门课

这会让老师误以为系统在按节次排序展示，而不是在突出代课任务。

### 4.2 任务文案也跟着错了

mock 中次卡片通常会突出：

- 代课
- 应到多少
- 当前要处理什么

当前页里的 `expectedLabel` 等文案更偏“点名待完成/已完成”，进一步弱化了代课含义。

### 4.3 页面优先级提示失真

mock 想表达的是：

- 先看主课
- 如果有代课，也要立刻注意到

当前页面表达的却更像：

- 这是你今天的第 1 节课和第 2 节课

这会直接影响老师判断今日任务。

## 5. mock 与实际接口数据差异

### 5.1 mock 数据来源

mock 使用 `teacherHomeData`。

它明确区分：

- `primaryCourse`
- `substituteCourse`

这里的 `substituteCourse` 有真实业务语义，就是代课。

### 5.2 当前接口数据来源

当前使用：

- `getTeacherHomeData`
- `fetchTeacherHome`
- `fetchTeacherTodaySessions`
- `mapTeacherHomeData`

### 5.3 关键错位

当前适配里，`substituteCourse` 并不是从“代课接口字段”里得到的，而是从“当天第二条 session”推出来的。

所以出现了本质性错误：

- 第二节课不等于代课
- 第二条 session 不等于 substitute course

### 5.4 这页为什么一定要优先修

因为教师首页是教师端所有行为的总入口。

只要这里把“代课”理解错了，后面的：

- 点名入口
- 名册入口
- 无课页跳转

都会跟着产生错误预期。

## 6. 对齐建议

- 重新定义 `substituteCourse` 的来源，必须基于真实代课语义，而不是第二条 session。
- 如果当前接口拿不到代课字段，就要明确区分“今日其他课程”和“代课课程”，不能共用一个 UI 槽位。
- 主卡和次卡的 badge、标题、摘要文案都要回到 mock 的主课/代课语义。

## 7. 对齐时要重点核对的点

- 次卡片是否只在真实代课存在时出现。
- 次卡标题、badge、摘要是否明确表达“代课”。
- 老师打开首页后，是否还能像 mock 一样一眼看懂今天的主课与代课安排。
