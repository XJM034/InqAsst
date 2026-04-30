# 接口与 Mock 冲突：`/teacher/attendance/demo`

## 1. 冲突等级

`中高`

这页的问题是：mock 需要稳定 demo 点名对象，当前接口版已经切成真实点名 session 对象。

## 2. mock 依赖的对象

mock 点名页依赖的是一个“稳定可演示的点名 session 对象”。

它的优点是：

- 始终能打开
- 数据结构稳定
- 不依赖当天真实参数

## 3. 当前接口实际使用的对象

当前链路是：

- `getAttendanceSession(courseId, courseSessionId)`
- `fetchCourseDetail`
- `fetchCourseStudents`
- `fetchCourseLatestAttendance`
- `fetchTeacherHome`

这已经是真实点名 session 对象。

## 4. 具体冲突点

### 4.1 对象冲突

mock 是稳定 demo 对象。

当前是真实 session 对象。

### 4.2 状态冲突

当前对象新增了真实业务状态：

- 点名窗口是否开启
- 是否允许提交
- 最新提交记录

这些状态会改变页面行为。

### 4.3 路由冲突

当前页面如果缺少真实参数或真实 session，上游就必须重定向或报空态。

这与 mock 的“随时可展示”完全不同。

## 5. 处理建议

- 如果该页未来仍要保留真实点名能力，就应明确它是“真实 session 页”，而不是再叫 demo。
- 如果必须保留 demo 路由，仅能做真实 session 的兼容包装，不能再依赖 mock 数据。
- 页面上的所有状态都只能来自真实 session 对象。
