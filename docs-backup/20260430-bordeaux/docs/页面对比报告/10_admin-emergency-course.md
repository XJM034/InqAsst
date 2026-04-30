# 页面对比报告：`/admin/emergency/course/[courseId]`

## 1. 先说结论

这页当前不是简单的“课程老师设置详情页”，而是被真实接口牵引成了“某个课节的点名老师设置页”。从课程维度切到课节维度，是它最核心的偏移。

## 2. mock 页面想表达什么

mock 里的详情页重点是：

- 正在设置这门课程的老师
- 页面仍属于课程视角
- 管理员只需要理解“这门课今天谁来上”

所以它更像“课程级的老师设置详情”。

## 3. 当前接口版实际做成了什么

当前实现主要在：

- `app/admin/emergency/course/[courseId]/page.tsx`
- `components/app/teacher-setting-course-client.tsx`
- `lib/services/mobile-app.ts` 中的 `getAdminTeacherSettingCourse`

当前数据链路是：

- `fetchCourseDetail`
- `fetchRollCallTeacher`
- `getAdminTeacherSettingCourse(courseId, courseSessionId)`

这里最关键的是：当前页其实依赖 `courseSessionId` 才能完整工作。

## 4. 页面展示差异

### 4.1 标题语义从“课程老师”变成“点名老师”

mock 更偏“设置课程老师”。

当前更偏“设置点名老师”。

两个说法非常接近，但语义重点不同：

- 前者强调课程视角
- 后者强调执行视角

### 4.2 页面更像针对某一次课节

当真实数据需要 `courseSessionId` 时，页面理解自然就会变成：

- 某次课
- 某个课节
- 某次点名

而不是 mock 里的“这门课今天由谁负责”这种课程级认知。

### 4.3 当前页新增了更真实的动作

比如恢复默认老师、查看当前点名老师等，都更像真实业务页。

这些能力不一定是坏事，但它们进一步把页面从 mock 的课程视角拉走了。

## 5. mock 与实际接口数据差异

### 5.1 mock 数据来源

mock 使用 `adminTeacherSettingCourses[courseId]`。

这是一种课程级 UI 数据模型。

### 5.2 当前接口数据来源

当前使用：

- `getAdminTeacherSettingCourse`
- `fetchCourseDetail`
- `fetchRollCallTeacher`

并且在实际链路里需要 `courseSessionId`。

### 5.3 关键错位

mock 要的是：

- 某课程今天老师配置结果

当前拿到的是：

- 某课节当前点名老师信息

因此页面上即使名称相似，背后的数据对象已经不同。

## 6. 对齐建议

- 页面标题与结构要重新回到“课程级设置”视角。
- `courseSessionId` 可以保留作为真实提交锚点，但不要把整个 UI 做成课节运维页。
- 顶部摘要里要优先强调课程语义，其次才是当前点名执行信息。

## 7. 对齐时要重点核对的点

- 页面是在讲“这门课”，还是在讲“这一节课”。
- 用户是否需要理解 `courseSessionId` 才能看懂页面。
- 恢复默认老师等真实动作，是否破坏了 mock 的课程级信息层级。
