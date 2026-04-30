# 前端联调接口变更说明

更新时间：2026-04-10

本文档只覆盖本轮后端已修改或新增、需要前端联调重点关注的接口。  
本文档重点不是“接口列表”，而是“字段中文注释要完整”，因此每个接口都细化到字段级说明。

## 0. 统一响应结构

所有接口统一返回：

```json
{
  "code": 0,
  "message": "OK",
  "data": {}
}
```

通用字段说明：

- `code`
  - `0`：成功
  - `1`：普通业务失败
  - `40101`：token 或 selectionToken 无效/过期
- `message`
  - 成功时通常为 `OK`
  - 失败时为业务错误说明
- `data`
  - 成功时为业务对象、数组或 `null`
  - 失败时通常为 `null`

## 1. 登录相关

### 1.1 `POST /api/auth/login`

接口说明：

- 用于手机号 + 验证码登录
- 单账号场景直接返回正式 token
- 多管理员场景返回“待选校区”数据，不直接返回正式 token

请求体示例：

```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

请求字段说明：

- `phone` `string`
  - 登录手机号
  - 必填
  - 当前要求为中国大陆 11 位手机号
- `code` `string`
  - 短信验证码
  - 必填

#### 场景 A：单账号登录成功

返回示例：

```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "id": 9001,
    "phone": "13800138000",
    "username": "a_13800138000",
    "token": "dm_xxx",
    "role": "ADMIN",
    "campusId": 22,
    "campusName": "南山校区",
    "name": "张老师",
    "teacherId": null,
    "adminUserId": 61,
    "selectionRequired": false,
    "selectionToken": null,
    "campusOptions": null
  }
}
```

返回字段说明：

- `id` `long`
  - 系统用户 ID
  - 对应 `users.id`
  - 不是老师 ID，也不是管理员 ID
- `phone` `string`
  - 当前登录手机号
- `username` `string`
  - 系统用户名
  - 老师通常为 `t_手机号`
  - 管理员通常为 `a_手机号`
- `token` `string`
  - 正式业务 token
  - 后续业务接口都要放在 `Authorization: Bearer <token>`
- `role` `string`
  - 当前登录角色
  - 可能值：`TEACHER` / `ADMIN`
- `campusId` `long|null`
  - 当前 token 绑定的校区 ID
- `campusName` `string|null`
  - 当前 token 绑定的校区名称
- `name` `string|null`
  - 当前登录身份展示姓名
- `teacherId` `long|null`
  - 当前登录身份对应的老师 ID
  - 只有 `role=TEACHER` 时通常有值
- `adminUserId` `long|null`
  - 当前登录身份对应的管理员 ID
  - 只有 `role=ADMIN` 时通常有值
- `selectionRequired` `boolean`
  - 是否还需要继续选择校区
  - 单账号直登时固定为 `false`
- `selectionToken` `string|null`
  - 单账号直登时固定为 `null`
- `campusOptions` `array|null`
  - 单账号直登时固定为 `null`

#### 场景 B：多管理员账号，需要先选校区

返回示例：

```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "id": null,
    "phone": "13800138000",
    "username": null,
    "token": null,
    "role": "ADMIN",
    "campusId": null,
    "campusName": null,
    "name": null,
    "teacherId": null,
    "adminUserId": null,
    "selectionRequired": true,
    "selectionToken": "sel_xxx",
    "campusOptions": [
      {
        "campusId": 1,
        "campusName": "高新校区",
        "adminUserId": 47,
        "adminName": "李老师"
      },
      {
        "campusId": 22,
        "campusName": "南山校区",
        "adminUserId": 61,
        "adminName": "李老师"
      }
    ]
  }
}
```

返回字段说明：

- `id`
  - 此时为 `null`
  - 因为还没有真正完成最终登录身份绑定
- `token`
  - 此时为 `null`
  - 前端不能把 `selectionToken` 当正式 token 使用
- `role`
  - 当前固定为 `ADMIN`
- `selectionRequired` `boolean`
  - 固定为 `true`
  - 前端必须进入选校区流程
- `selectionToken` `string`
  - 选校区阶段临时凭证
  - 仅用于 `/api/auth/select-campus`
- `campusOptions` `array`
  - 可选管理员身份列表

`campusOptions[]` 子项字段说明：

- `campusId` `long`
  - 候选管理员所属校区 ID
- `campusName` `string|null`
  - 候选管理员所属校区名称
- `adminUserId` `long`
  - 候选管理员的 `admin_user.id`
- `adminName` `string`
  - 候选管理员显示姓名

### 1.2 `POST /api/auth/select-campus`

接口说明：

- 用于多管理员手机号登录场景
- 提交 `selectionToken + adminUserId`
- 返回正式 token

请求体示例：

```json
{
  "selectionToken": "sel_xxx",
  "adminUserId": 61
}
```

请求字段说明：

- `selectionToken` `string`
  - 来自 `/api/auth/login`
  - 必填
- `adminUserId` `long`
  - 来自 `campusOptions[].adminUserId`
  - 必填

成功返回：

- 返回结构与“单账号登录成功”一致
- `selectionRequired=false`
- `token` 为正式业务 token

### 1.3 `POST /api/auth/switch-campus`

接口说明：

- 管理员登录后切换校区接口
- 只能在当前手机号可选的管理员身份里切换
- 返回新的正式 token
- 后端会作废当前请求里的旧 token

请求头：

- `Authorization: Bearer <old_token>`

请求体示例：

```json
{
  "adminUserId": 61
}
```

请求字段说明：

- `adminUserId` `long`
  - 目标管理员身份 ID
  - 必填

成功返回：

- 返回结构与“单账号登录成功”一致
- `token` 是新的正式 token

前端处理建议：

- 收到成功响应后，必须替换本地旧 token

## 2. 点名状态统一口径

本轮后端对外统一使用数字状态：

- `0`：未到
- `1`：请假
- `2`：已到

重要说明：

- 前端提交点名时，请传数字
- 前端展示时，请自行转中文
- 后端内部兼容历史值 `ABSENT / LEAVE / PRESENT`

## 3. 课程学生名单接口

### 3.1 `GET /api/courses/{courseId}/students`

接口说明：

- 获取课程学生名单
- 已支持按 `courseSessionId` 读取课节维度状态

Query 示例：

```http
GET /api/courses/1001/students?courseSessionId=50001&filter=0
```

请求参数说明：

- `courseId` `long`
  - Path 参数
  - 课程 ID
- `courseSessionId` `long|null`
  - Query 参数
  - 可选
  - 带上时按课节读取最近状态
  - 不带时按课程最近一次点名记录读取状态
- `filter` `string|null`
  - Query 参数
  - 可选
  - 当前支持：
    - `ALL`
    - `UNMARKED`
    - `0`
    - `1`
    - `2`
    - 兼容旧值 `ABSENT / LEAVE / PRESENT`

单行返回示例：

```json
{
  "studentId": 1,
  "studentName": "王小明",
  "homeroomClassId": 10,
  "homeroomClassName": "一班",
  "lastAttendanceStatus": 0
}
```

返回字段说明：

- `studentId` `long`
  - 学生 ID
- `studentName` `string`
  - 学生姓名
- `homeroomClassId` `long|null`
  - 学生所属行政班 ID
- `homeroomClassName` `string|null`
  - 学生所属行政班名称
- `lastAttendanceStatus` `integer|null`
  - 最近一次点名状态
  - `0=未到`
  - `1=请假`
  - `2=已到`
  - `null=未点名`

### 3.2 `GET /api/admin/courses/{courseId}/students`

与教师端课程学生名单接口保持一致。

请求参数说明与返回字段说明完全一致，区别只是管理员权限访问。

## 4. 最近点名记录接口

### 4.1 `GET /api/courses/{courseId}/attendance/latest`

接口说明：

- 获取最近一次点名记录
- 已支持按课节读取

Query 示例：

```http
GET /api/courses/1001/attendance/latest?courseSessionId=50001
```

请求参数说明：

- `courseId` `long`
  - Path 参数
  - 课程 ID
- `courseSessionId` `long|null`
  - Query 参数
  - 可选
  - 带上时按该课节取最近一次记录
  - 不带时按课程取最近一次记录

返回示例：

```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "attendanceRecordId": 90001,
    "courseSessionId": 50001,
    "submittedAt": "2026-04-10T18:40:00",
    "hasSubmittedToday": true,
    "items": [
      {
        "studentId": 1,
        "status": 2
      },
      {
        "studentId": 2,
        "status": 0
      }
    ]
  }
}
```

返回字段说明：

- `attendanceRecordId` `long`
  - 点名记录主表 ID
- `courseSessionId` `long|null`
  - 这条点名记录对应的课节 ID
- `submittedAt` `string(datetime)`
  - 最近一次点名提交时间
- `hasSubmittedToday` `boolean`
  - 最近一次提交是否发生在今天
- `items` `array`
  - 点名明细列表

`items[]` 子项字段说明：

- `studentId` `long`
  - 学生 ID
- `status` `integer`
  - 点名状态
  - `0=未到`
  - `1=请假`
  - `2=已到`

### 4.2 `GET /api/admin/courses/{courseId}/attendance/latest`

与教师端最近点名接口保持一致。

## 5. 点名提交接口

### 5.1 `POST /api/courses/{courseId}/attendance`
### 5.2 `POST /api/admin/courses/{courseId}/attendance`

接口说明：

- 提交某门课程的点名结果
- 推荐前端按课节维度提交，即传 `courseSessionId`

请求体示例：

```json
{
  "courseSessionId": 50001,
  "items": [
    {
      "studentId": 1,
      "status": 2
    },
    {
      "studentId": 2,
      "status": 0
    },
    {
      "studentId": 3,
      "status": 1
    }
  ]
}
```

请求字段说明：

- `courseSessionId` `long|null`
  - 当前提交对应的课节 ID
  - 推荐传
- `items` `array`
  - 点名明细列表
  - 必须覆盖本课所有应到学生

`items[]` 子项字段说明：

- `studentId` `long`
  - 学生 ID
- `status` `integer`
  - 点名状态
  - `0=未到`
  - `1=请假`
  - `2=已到`

## 6. 未到学生接口

### 6.1 `GET /api/admin/absent-students`

接口说明：

- 获取未到 / 请假学生列表
- 当前语义是课节维度数据

Query 示例：

```http
GET /api/admin/absent-students?courseId=1001&courseSessionId=50001&q=王
```

请求参数说明：

- `date` `LocalDate|null`
  - 查询日期
  - 不传时默认今天
- `courseId` `long|null`
  - 限定某门课程
- `courseSessionId` `long|null`
  - 限定某个课节
- `q` `string|null`
  - 学生姓名关键字

单行返回示例：

```json
{
  "courseSessionId": 50001,
  "sessionStartAt": "2026-04-10T19:00:00",
  "sessionEndAt": "2026-04-10T20:30:00",
  "studentId": 1,
  "studentName": "王小明",
  "homeroomClassId": 10,
  "homeroomClassName": "一班",
  "courseId": 1001,
  "courseName": "数学提高班",
  "teacherNames": "李老师, 张老师",
  "status": 0,
  "attendanceSubmittedAt": "2026-04-10T19:45:00"
}
```

返回字段说明：

- `courseSessionId` `long`
  - 课节 ID
- `sessionStartAt` `string(datetime)`
  - 课节开始时间
- `sessionEndAt` `string(datetime)`
  - 课节结束时间
- `studentId` `long`
  - 学生 ID
- `studentName` `string`
  - 学生姓名
- `homeroomClassId` `long|null`
  - 行政班 ID
- `homeroomClassName` `string|null`
  - 行政班名称
- `courseId` `long`
  - 课程 ID
- `courseName` `string`
  - 课程名称
- `teacherNames` `string|null`
  - 当前课程老师姓名，逗号分隔
- `status` `integer`
  - 当前学生在该课节中的非已到状态
  - `0=未到`
  - `1=请假`
  - 本接口不会返回 `2`
- `attendanceSubmittedAt` `string(datetime)`
  - 该课节最近一次点名提交时间

## 7. 总控列表接口

### 7.1 `GET /api/admin/roll-call/overview`

接口说明：

- 返回管理端总控列表
- 统计口径已按学生人数补齐

单行返回示例：

```json
{
  "courseId": 1001,
  "courseName": "数学提高班",
  "sessionId": 50001,
  "sessionStartAt": "2026-04-10T19:00:00",
  "sessionEndAt": "2026-04-10T20:30:00",
  "rollCallCompleted": true,
  "shouldAttendCount": 30,
  "presentCount": 26,
  "leaveCount": 2,
  "absentCount": 2,
  "progressPercent": 87
}
```

返回字段说明：

- `courseId` `long`
  - 课程 ID
- `courseName` `string`
  - 课程名称
- `sessionId` `long`
  - 课节 ID
- `sessionStartAt` `string(datetime)`
  - 课节开始时间
- `sessionEndAt` `string(datetime)`
  - 课节结束时间
- `rollCallCompleted` `boolean`
  - 该课节今天是否已有点名记录
- `shouldAttendCount` `integer`
  - 应到人数
- `presentCount` `integer`
  - 已到人数
- `leaveCount` `integer`
  - 请假人数
- `absentCount` `integer`
  - 未到人数
- `progressPercent` `integer`
  - 已到率百分比
  - 当前口径：`presentCount / shouldAttendCount * 100`

## 8. 课节级时间设置接口

说明：

- 原有校区级 `roll-call-windows` 现在是默认模板规则
- 新增课节级时间设置接口
- 如果课节没有覆盖记录，后端会实时推导默认值返回
- 只有修改后才落库

### 8.1 `GET /api/admin/time-settings/sessions`

接口说明：

- 按日期读取本校区课节时间设置列表

Query 示例：

```http
GET /api/admin/time-settings/sessions?date=2026-04-10
```

请求参数说明：

- `date` `LocalDate|null`
  - 查询日期
  - 不传时默认今天
- `courseId` `long|null`
  - 只查某门课程的课节时间设置

单项返回示例：

```json
{
  "courseSessionId": 50001,
  "courseId": 1001,
  "courseName": "数学提高班",
  "campusId": 22,
  "sessionDate": "2026-04-10",
  "weekday": 4,
  "scheduledStartAt": "2026-04-10T19:00:00",
  "scheduledEndAt": "2026-04-10T20:30:00",
  "scheduledStartTime": "19:00:00",
  "scheduledEndTime": "20:30:00",
  "actualStartTime": "19:05:00",
  "actualEndTime": "20:35:00",
  "rollCallStartTime": "18:45:00",
  "rollCallEndTime": "19:15:00",
  "defaultRollCallStartTime": "18:45:00",
  "defaultRollCallEndTime": "19:15:00",
  "actualCustomized": true,
  "rollCallCustomized": false
}
```

返回字段说明：

- `courseSessionId` `long`
  - 课节 ID
- `courseId` `long`
  - 课程 ID
- `courseName` `string`
  - 课程名称
- `campusId` `long`
  - 校区 ID
- `sessionDate` `string(date)`
  - 课节所属日期
- `weekday` `integer`
  - 星期几
  - `1=周一 ... 7=周日`
- `scheduledStartAt` `string(datetime)`
  - 原始课节开始时间
- `scheduledEndAt` `string(datetime)`
  - 原始课节结束时间
- `scheduledStartTime` `string(time)`
  - 原始课节开始时刻，仅保留时间部分
- `scheduledEndTime` `string(time)`
  - 原始课节结束时刻，仅保留时间部分
- `actualStartTime` `string(time)|null`
  - 当前最终生效的实际上课开始时刻
  - 若没有单独覆盖，则等于 `scheduledStartTime`
- `actualEndTime` `string(time)|null`
  - 当前最终生效的实际上课结束时刻
  - 若没有单独覆盖，则等于 `scheduledEndTime`
- `rollCallStartTime` `string(time)|null`
  - 当前最终生效的点名开始时刻
  - 若没有单独覆盖，则等于默认规则推导值
- `rollCallEndTime` `string(time)|null`
  - 当前最终生效的点名结束时刻
  - 若没有单独覆盖，则等于默认规则推导值
- `defaultRollCallStartTime` `string(time)|null`
  - 默认点名开始时刻
- `defaultRollCallEndTime` `string(time)|null`
  - 默认点名结束时刻
- `actualCustomized` `boolean`
  - 实际上课时间是否被单独覆盖
- `rollCallCustomized` `boolean`
  - 点名时间是否被单独覆盖

### 8.2 `GET /api/admin/course-sessions/{courseSessionId}/time-settings`

接口说明：

- 读取单个课节的时间设置

请求参数说明：

- `courseSessionId` `long`
  - Path 参数
  - 课节 ID

返回结构与 `GET /api/admin/time-settings/sessions` 的单项完全一致。

### 8.3 `PUT /api/admin/course-sessions/{courseSessionId}/actual-time`

接口说明：

- 更新单个课节的实际上课时间

请求体示例：

```json
{
  "startTime": "19:05:00",
  "endTime": "20:35:00"
}
```

请求字段说明：

- `startTime` `string(time)`
  - 实际上课开始时刻
- `endTime` `string(time)`
  - 实际上课结束时刻

返回结构：

- 返回 `CourseSessionTimeSettingResponse`
- 字段说明同 8.1

### 8.4 `DELETE /api/admin/course-sessions/{courseSessionId}/actual-time`

接口说明：

- 恢复单个课节的默认实际上课时间

请求参数说明：

- `courseSessionId` `long`
  - 课节 ID

返回结构：

- 返回 `CourseSessionTimeSettingResponse`
- 恢复后：
  - `actualStartTime/actualEndTime` 回到原始课节时间
  - `actualCustomized=false`

### 8.5 `PUT /api/admin/course-sessions/{courseSessionId}/roll-call-time`

接口说明：

- 更新单个课节的点名时间

请求体示例：

```json
{
  "startTime": "18:45:00",
  "endTime": "19:15:00"
}
```

请求字段说明：

- `startTime` `string(time)`
  - 点名开始时刻
- `endTime` `string(time)`
  - 点名结束时刻

返回结构：

- 返回 `CourseSessionTimeSettingResponse`
- 字段说明同 8.1

### 8.6 `DELETE /api/admin/course-sessions/{courseSessionId}/roll-call-time`

接口说明：

- 恢复单个课节的默认点名时间

请求参数说明：

- `courseSessionId` `long`
  - 课节 ID

返回结构：

- 返回 `CourseSessionTimeSettingResponse`
- 恢复后：
  - `rollCallStartTime/rollCallEndTime` 回到默认规则推导值
  - `rollCallCustomized=false`

## 9. 原校区级时间窗接口的当前语义

以下旧接口仍保留：

- `GET /api/admin/campuses/{campusId}/roll-call-windows`
- `POST /api/admin/campuses/{campusId}/roll-call-windows`
- `PUT /api/admin/campuses/{campusId}/roll-call-windows/{windowId}`
- `DELETE /api/admin/campuses/{campusId}/roll-call-windows/{windowId}`

当前前端应理解为：

- 这是“校区默认点名时间模板规则”
- 不是某个具体课节的最终时间设置
- 某课节最终生效值，优先以后端课节级时间设置接口为准

这组接口返回字段如下：

- `id`
  - 校区时间窗规则 ID
- `weekday`
  - 星期几
- `windowStart`
  - 默认点名开始时刻
- `windowEnd`
  - 默认点名结束时刻
- `effectiveFrom`
  - 规则生效开始日期
- `effectiveTo`
  - 规则生效结束日期

## 10. 前端联调建议

建议前端按下面顺序接：

1. 登录主链
   - `/api/auth/login`
   - `/api/auth/select-campus`
   - `/api/auth/switch-campus`
2. 老师点名主链
   - `/api/courses/{courseId}/students?courseSessionId=...`
   - `/api/courses/{courseId}/attendance/latest?courseSessionId=...`
   - `POST /api/courses/{courseId}/attendance`
3. 管理端主链
   - `/api/admin/roll-call/overview`
   - `/api/admin/absent-students`
   - `/api/admin/courses/{courseId}/students?courseSessionId=...`
4. 时间设置
   - 先接 `GET /api/admin/time-settings/sessions`
   - 再接单课节读写与恢复默认接口
