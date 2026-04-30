# 接口与 Mock 冲突：`/admin/emergency/course/[courseId]`

## 1. 冲突等级

`中高`

这页的核心冲突在于：mock 是课程级老师设置详情，当前接口版已经切成课节级点名老师详情。

## 2. mock 依赖的对象

mock 需要的是“课程级老师设置对象”。

它应该回答：

- 这门课默认老师是谁
- 今天当前老师是谁
- 是否处于临时代课状态
- 接下来去哪里换老师

## 3. 当前接口实际使用的对象

当前链路是：

- `getAdminTeacherSettingCourse(courseId, courseSessionId)`
- `fetchCourseDetail`
- `fetchRollCallTeacher`

当前对象其实依赖：

- `courseSessionId`

也就是“课节级点名老师对象”。

## 4. 具体冲突点

### 4.1 粒度冲突

mock 是课程级。

当前是课节级。

### 4.2 路由冲突

mock 路由语义里 `[courseId]` 已足够表达页面目标。

当前真实链路必须额外依赖 `courseSessionId`，说明页面实际锚点已经不是课程，而是课节。

### 4.3 字段冲突

当前对象更擅长提供：

- 当前课节点名老师
- 是否恢复默认

但 mock 页面更关心：

- 今天这门课当前老师配置整体状态

## 5. 处理建议

- 可以继续用真实课节对象做提交锚点。
- 但页面视图模型必须包装成课程级，不要把 `courseSessionId` 裸暴露成页面主语义。
