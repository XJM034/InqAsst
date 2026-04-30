# 接口与 Mock 冲突：`/teacher/home`

## 1. 冲突等级

`极高`

这页的核心冲突是状态语义错位。mock 需要“主课 + 代课对象”，当前接口适配却把“第二条 session”误当成“代课对象”。

## 2. mock 依赖的对象

mock 教师首页需要的是“今日教师任务对象”。

它至少应明确区分：

- `primaryCourse`
  - 今日主课
- `substituteCourse`
  - 今日代课

这里的 `substituteCourse` 不是“第二门课”，而是“代上的课”。

## 3. 当前接口实际使用的对象

当前链路是：

- `fetchMeProfile`
- `fetchTeacherHome`
- `fetchTeacherTodaySessions`
- `mapTeacherHomeData`

问题出在 `mapTeacherHomeData` 的适配策略：当前会把同一天的第二条 `session` 塞进 `substituteCourse`。

## 4. 具体冲突点

### 4.1 状态冲突

mock 的关键状态是：

- 主课
- 代课

当前适配出来的状态却是：

- 第一条 session
- 第二条 session

### 4.2 对象冲突

mock 需要的是“教师任务对象”。

当前真实接口组合后，前端生成的是“教师当日 session 列表对象”。

这两者不能直接等价。

### 4.3 字段语义冲突

`substituteCourse` 在 mock 里的含义非常明确。

当前适配中却把它当成“顺序上的第二门课”，这是字段语义误用，不是单纯字段缺失。

### 4.4 链路冲突

教师首页是教师端所有后续入口的上游。

只要这里把代课识别错了，后面的：

- 点名入口
- 名册入口
- 无课判断

都会跟着错。

## 5. 处理建议

- 必须重新定义 `substituteCourse` 的生成规则。
- 只能基于真实接口中能够证明“这是代课”的字段或关系来生成，不能再按 session 顺序猜。
- 如果当前接口没有代课标识，就应明确把页面做成“主课 + 其他课程”，而不是继续伪造“代课”。
- 这是需要后端补语义字段或前端严格基于真实关系重聚合的典型页面。
