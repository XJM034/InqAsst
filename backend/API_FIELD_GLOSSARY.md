# API 完整字段中文释意（按代码与 OpenAPI 自动生成）

- 生成来源：`docs/swagger-local.json` + 控制器/DTO 注解（`@Operation` / `@Schema`）
- 范围：全部接口，覆盖入参（Path/Query/Header/Body）与回参（含 `data` 递归字段）
- 说明：无明确注解的字段已标注“字段名+类型推断”

## Admin

### GET `/api/admin/absent-students`

- 接口说明：未到学生列表
- operationId：`absentStudents`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `query.date` | `string(date)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `query.courseId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `query.q` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `array<AbsentStudentRowResponse>` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data[]` | `array<AbsentStudentRowResponse>` | 否 | 数组元素 | OpenAPI schema |
| `response.data[]` | `object` | 否 | 未到学生列表行信息 | OpenAPI schema |
| `response.data[].studentId` | `integer(int64)` | 否 | 学生ID（student.id） | OpenAPI @Schema/注解 |
| `response.data[].studentName` | `string` | 否 | 学生姓名 | OpenAPI @Schema/注解 |
| `response.data[].courseId` | `integer(int64)` | 否 | 课程ID（course.id） | OpenAPI @Schema/注解 |
| `response.data[].courseName` | `string` | 否 | 课程名称 | OpenAPI @Schema/注解 |
| `response.data[].attendanceSubmittedAt` | `string(date-time)` | 否 | 最近一次点名提交时间（attendance_record.submitted_at） | OpenAPI @Schema/注解 |

---

### GET `/api/admin/campuses/{campusId}/classes`

- 接口说明：校区下行政班列表（不分页）
- operationId：`campusClasses`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `path.campusId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `array<HomeroomClassListItemResponse>` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data[]` | `array<HomeroomClassListItemResponse>` | 否 | 数组元素 | OpenAPI schema |
| `response.data[].id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `response.data[].name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `response.data[].homeroomTeacherId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |

---

### GET `/api/admin/campuses/{campusId}/roll-call-windows`

- 接口说明：校区点名时间窗列表
- operationId：`listRollCallWindows`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `path.campusId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `array<RollCallWindowResponse>` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data[]` | `array<RollCallWindowResponse>` | 否 | 数组元素 | OpenAPI schema |
| `response.data[]` | `object` | 否 | 点名时间窗信息 | OpenAPI schema |
| `response.data[].id` | `integer(int64)` | 否 | 时间窗ID（campus_roll_call_window.id） | OpenAPI @Schema/注解 |
| `response.data[].weekday` | `integer(int32)` | 否 | 星期几：1=周一 … 7=周日 | OpenAPI @Schema/注解 |
| `response.data[].windowStart` | `LocalTime` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].windowStart` | `object` | 否 | 点名窗口结束时间 | OpenAPI schema |
| `response.data[].windowStart.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].windowStart.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].windowStart.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].windowStart.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].windowEnd` | `LocalTime` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].windowEnd` | `object` | 否 | 点名窗口结束时间 | OpenAPI schema |
| `response.data[].windowEnd.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].windowEnd.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].windowEnd.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].windowEnd.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].effectiveFrom` | `string(date)` | 否 | 生效开始日期（可空：长期有效） | OpenAPI @Schema/注解 |
| `response.data[].effectiveTo` | `string(date)` | 否 | 生效结束日期（可空） | OpenAPI @Schema/注解 |

---

### POST `/api/admin/campuses/{campusId}/roll-call-windows`

- 接口说明：新增点名时间窗
- operationId：`createRollCallWindow`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `path.campusId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `body` | `object` | 是 | 点名时间窗新增/更新请求 | OpenAPI schema |
| `body.weekday` | `integer(int32)` | 是 | 星期几：1=周一 ... 7=周日 | OpenAPI @Schema/注解 |
| `body.windowStart` | `LocalTime` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `body.windowStart` | `object` | 是 | 点名窗口结束时间 | OpenAPI schema |
| `body.windowStart.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `body.windowStart.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `body.windowStart.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `body.windowStart.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `body.windowEnd` | `LocalTime` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `body.windowEnd` | `object` | 是 | 点名窗口结束时间 | OpenAPI schema |
| `body.windowEnd.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `body.windowEnd.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `body.windowEnd.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `body.windowEnd.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `body.effectiveFrom` | `string(date)` | 否 | 生效开始日期（可空：长期有效） | OpenAPI @Schema/注解 |
| `body.effectiveTo` | `string(date)` | 否 | 生效结束日期（可空：长期有效） | OpenAPI @Schema/注解 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `RollCallWindowResponse` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data` | `object` | 否 | 点名时间窗信息 | OpenAPI schema |
| `response.data.id` | `integer(int64)` | 否 | 时间窗ID（campus_roll_call_window.id） | OpenAPI @Schema/注解 |
| `response.data.weekday` | `integer(int32)` | 否 | 星期几：1=周一 … 7=周日 | OpenAPI @Schema/注解 |
| `response.data.windowStart` | `LocalTime` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.windowStart` | `object` | 否 | 点名窗口结束时间 | OpenAPI schema |
| `response.data.windowStart.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.windowStart.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.windowStart.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.windowStart.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.windowEnd` | `LocalTime` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.windowEnd` | `object` | 否 | 点名窗口结束时间 | OpenAPI schema |
| `response.data.windowEnd.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.windowEnd.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.windowEnd.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.windowEnd.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.effectiveFrom` | `string(date)` | 否 | 生效开始日期（可空：长期有效） | OpenAPI @Schema/注解 |
| `response.data.effectiveTo` | `string(date)` | 否 | 生效结束日期（可空） | OpenAPI @Schema/注解 |

---

### DELETE `/api/admin/campuses/{campusId}/roll-call-windows/{windowId}`

- 接口说明：删除点名时间窗
- operationId：`deleteRollCallWindow`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `path.campusId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `path.windowId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `object` | 否 | 业务数据 | 字段名+类型推断 |

---

### PUT `/api/admin/campuses/{campusId}/roll-call-windows/{windowId}`

- 接口说明：更新点名时间窗
- operationId：`updateRollCallWindow`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `path.campusId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `path.windowId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `body` | `object` | 是 | 点名时间窗新增/更新请求 | OpenAPI schema |
| `body.weekday` | `integer(int32)` | 是 | 星期几：1=周一 ... 7=周日 | OpenAPI @Schema/注解 |
| `body.windowStart` | `LocalTime` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `body.windowStart` | `object` | 是 | 点名窗口结束时间 | OpenAPI schema |
| `body.windowStart.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `body.windowStart.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `body.windowStart.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `body.windowStart.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `body.windowEnd` | `LocalTime` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `body.windowEnd` | `object` | 是 | 点名窗口结束时间 | OpenAPI schema |
| `body.windowEnd.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `body.windowEnd.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `body.windowEnd.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `body.windowEnd.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `body.effectiveFrom` | `string(date)` | 否 | 生效开始日期（可空：长期有效） | OpenAPI @Schema/注解 |
| `body.effectiveTo` | `string(date)` | 否 | 生效结束日期（可空：长期有效） | OpenAPI @Schema/注解 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `RollCallWindowResponse` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data` | `object` | 否 | 点名时间窗信息 | OpenAPI schema |
| `response.data.id` | `integer(int64)` | 否 | 时间窗ID（campus_roll_call_window.id） | OpenAPI @Schema/注解 |
| `response.data.weekday` | `integer(int32)` | 否 | 星期几：1=周一 … 7=周日 | OpenAPI @Schema/注解 |
| `response.data.windowStart` | `LocalTime` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.windowStart` | `object` | 否 | 点名窗口结束时间 | OpenAPI schema |
| `response.data.windowStart.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.windowStart.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.windowStart.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.windowStart.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.windowEnd` | `LocalTime` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.windowEnd` | `object` | 否 | 点名窗口结束时间 | OpenAPI schema |
| `response.data.windowEnd.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.windowEnd.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.windowEnd.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.windowEnd.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.effectiveFrom` | `string(date)` | 否 | 生效开始日期（可空：长期有效） | OpenAPI @Schema/注解 |
| `response.data.effectiveTo` | `string(date)` | 否 | 生效结束日期（可空） | OpenAPI @Schema/注解 |

---

### GET `/api/admin/classes`

- 接口说明：班级分页列表
- operationId：`classes`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `query.q` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `query.page` | `integer(int32)` | 否 | 页码（从0开始） | 字段名+类型推断 |
| `query.size` | `integer(int32)` | 否 | 分页大小 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `PagedRowsHomeroomClassListItemResponse` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data.items` | `array<HomeroomClassListItemResponse>` | 否 | 列表项 | 字段名+类型推断 |
| `response.data.items[]` | `array<HomeroomClassListItemResponse>` | 否 | 数组元素 | OpenAPI schema |
| `response.data.items[].id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `response.data.items[].name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `response.data.items[].homeroomTeacherId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.totalElements` | `integer(int64)` | 否 | 总记录数 | 字段名+类型推断 |
| `response.data.totalPages` | `integer(int32)` | 否 | 总页数 | 字段名+类型推断 |
| `response.data.page` | `integer(int32)` | 否 | 页码（从0开始） | 字段名+类型推断 |
| `response.data.size` | `integer(int32)` | 否 | 分页大小 | 字段名+类型推断 |

---

### POST `/api/admin/courses/{courseId}/attendance`

- 接口说明：代提交点名（同校区管理员）
- operationId：`submitAttendance_1`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `path.courseId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `body` | `object` | 是 | 提交点名请求 | OpenAPI schema |
| `body.courseSessionId` | `integer(int64)` | 否 | 课节ID（对应 course_session.id）。可为空（表示不按课节维度点名） | OpenAPI @Schema/注解 |
| `body.items` | `array<Line>` | 是 | 点名明细列表（必须包含本课应到学生的每一条） | OpenAPI @Schema/注解 |
| `body.items[]` | `array<Line>` | 是 | 点名明细列表（必须包含本课应到学生的每一条） | OpenAPI schema |
| `body.items[].studentId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `body.items[].name` | `string` | 是 | 名称 | 字段名+类型推断 |
| `body.items[].homeroomClassId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `object` | 否 | 业务数据 | 字段名+类型推断 |

---

### GET `/api/admin/courses/{courseId}/attendance/latest`

- 接口说明：课程最近点名
- operationId：`latestAttendance_1`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `path.courseId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `AttendanceLatestResponse` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data` | `object` | 否 | 最近一次点名记录（若无记录则 data 为 null） | OpenAPI schema |
| `response.data.attendanceRecordId` | `integer(int64)` | 否 | 点名提交记录ID（attendance_record.id） | OpenAPI @Schema/注解 |
| `response.data.courseSessionId` | `integer(int64)` | 否 | 点名对应课节ID（course_session.id，可为空） | OpenAPI @Schema/注解 |
| `response.data.submittedAt` | `string(date-time)` | 否 | 提交时间 | OpenAPI @Schema/注解 |
| `response.data.hasSubmittedToday` | `boolean` | 否 | 最近一次提交是否发生在当日（按系统默认时区的日历日） | OpenAPI @Schema/注解 |
| `response.data.items` | `array<AttendanceItemResponse>` | 否 | 点名明细列表 | OpenAPI @Schema/注解 |
| `response.data.items[]` | `array<AttendanceItemResponse>` | 否 | 点名明细列表 | OpenAPI schema |
| `response.data.items[]` | `object` | 否 | 点名明细行 | OpenAPI schema |
| `response.data.items[].studentId` | `integer(int64)` | 否 | 学生ID（student.id） | OpenAPI @Schema/注解 |
| `response.data.items[].status` | `string` | 否 | 点名状态：PRESENT(已到) / ABSENT(未到) / LEAVE(请假) | OpenAPI @Schema/注解 |

---

### POST `/api/admin/courses/{courseId}/roster`

- 接口说明：同步课程名单（全量覆盖应到学生）
- operationId：`roster`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `path.courseId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `body.studentIds` | `array<integer(int64)>` | 是 | 数组列表 | 字段名+类型推断 |
| `body.studentIds[]` | `array<integer(int64)>` | 是 | 数组元素 | OpenAPI schema |
| `body.studentIds[]` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `object` | 否 | 业务数据 | 字段名+类型推断 |

---

### GET `/api/admin/courses/{courseId}/students`

- 接口说明：课程学生名单（管理端）
- operationId：`courseStudents`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `path.courseId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `query.filter` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `array<CourseStudentRowResponse>` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data[]` | `array<CourseStudentRowResponse>` | 否 | 数组元素 | OpenAPI schema |
| `response.data[]` | `object` | 否 | 课程学生名单行信息 | OpenAPI schema |
| `response.data[].studentId` | `integer(int64)` | 否 | 学生ID（student.id） | OpenAPI @Schema/注解 |
| `response.data[].studentName` | `string` | 否 | 学生姓名 | OpenAPI @Schema/注解 |
| `response.data[].homeroomClassId` | `integer(int64)` | 否 | 行政班ID（homeroom_class.id） | OpenAPI @Schema/注解 |
| `response.data[].homeroomClassName` | `string` | 否 | 行政班名称 | OpenAPI @Schema/注解 |
| `response.data[].lastAttendanceStatus` | `string` | 否 | 最近点名状态（含未到/请假/已到等按系统口径） | OpenAPI @Schema/注解 |

---

### POST `/api/admin/courses/{courseId}/teachers`

- 接口说明：为课程绑定教师（course_teacher，幂等）
- operationId：`assignCourseTeacher`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `path.courseId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `body.teacherId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `body.role` | `string` | 是 | 角色 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `object` | 否 | 业务数据 | 字段名+类型推断 |

---

### GET `/api/admin/exports/roll-call`

- 接口说明：导出总控 CSV
- operationId：`exportRollCall`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `query.date` | `string(date)` | 否 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

_无字段_

---

### GET `/api/admin/home/summary`

- 接口说明：管理端首页摘要
- operationId：`homeSummary`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `query.date` | `string(date)` | 否 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `AdminHomeSummaryResponse` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data.date` | `string(date)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.distinctCoursesWithSessionsToday` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.sessionCountToday` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.pendingRollCallSessions` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.rollCallWindowRuleCount` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.rollCallRulesSummary` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |

---

### POST `/api/admin/homeroom-classes`

- 接口说明：新建行政班
- operationId：`createHomeroom`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `body.name` | `string` | 是 | 名称 | 字段名+类型推断 |
| `body.homeroomTeacherId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `HomeroomClassListItemResponse` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data.id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `response.data.name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `response.data.homeroomTeacherId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |

---

### DELETE `/api/admin/homeroom-classes/{homeroomId}`

- 接口说明：软删行政班
- operationId：`deleteHomeroom`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `path.homeroomId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `object` | 否 | 业务数据 | 字段名+类型推断 |

---

### PUT `/api/admin/homeroom-classes/{homeroomId}`

- 接口说明：更新行政班
- operationId：`updateHomeroom`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `path.homeroomId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `body.name` | `string` | 是 | 名称 | 字段名+类型推断 |
| `body.homeroomTeacherId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `HomeroomClassListItemResponse` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data.id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `response.data.name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `response.data.homeroomTeacherId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |

---

### GET `/api/admin/me`

- 接口说明：管理员个人信息（同 /api/me，限制角色）
- operationId：`adminMe`

#### 入参字段

_无字段_

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `MeResponse` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data.id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `response.data.phone` | `string` | 否 | 手机号 | 字段名+类型推断 |
| `response.data.username` | `string` | 否 | 用户名 | 字段名+类型推断 |
| `response.data.role` | `string` | 否 | 角色 | 字段名+类型推断 |
| `response.data.campusId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.campusName` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `response.data.teacherId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.adminUserId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |

---

### GET `/api/admin/roll-call/overview`

- 接口说明：点名总控列表
- operationId：`rollCallOverview`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `query.date` | `string(date)` | 否 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `array<RollCallOverviewRowResponse>` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data[]` | `array<RollCallOverviewRowResponse>` | 否 | 数组元素 | OpenAPI schema |
| `response.data[]` | `object` | 否 | 点名总控列表行信息 | OpenAPI schema |
| `response.data[].courseId` | `integer(int64)` | 否 | 课程ID | OpenAPI @Schema/注解 |
| `response.data[].courseName` | `string` | 否 | 课程名称 | OpenAPI @Schema/注解 |
| `response.data[].sessionId` | `integer(int64)` | 否 | 课节ID（course_session.id） | OpenAPI @Schema/注解 |
| `response.data[].sessionStartAt` | `string(date-time)` | 否 | 课节开始时间 | OpenAPI @Schema/注解 |
| `response.data[].sessionEndAt` | `string(date-time)` | 否 | 课节结束时间 | OpenAPI @Schema/注解 |
| `response.data[].rollCallCompleted` | `boolean` | 否 | 是否已完成点名 | OpenAPI @Schema/注解 |
| `response.data[].absentCount` | `integer(int32)` | 否 | 缺勤人数（未到/请假等按系统口径汇总） | OpenAPI @Schema/注解 |

---

### GET `/api/admin/students`

- 接口说明：学生分页
- operationId：`students_1`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `query.homeroomClassId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `query.page` | `integer(int32)` | 否 | 页码（从0开始） | 字段名+类型推断 |
| `query.size` | `integer(int32)` | 否 | 分页大小 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `PagedRowsStudentEntity` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data.items` | `array<StudentEntity>` | 否 | 列表项 | 字段名+类型推断 |
| `response.data.items[]` | `array<StudentEntity>` | 否 | 数组元素 | OpenAPI schema |
| `response.data.items[].id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `response.data.items[].campusId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.items[].homeroomClassId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.items[].name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `response.data.items[].externalStudentId` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.items[].externalSource` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.items[].createdAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.items[].updatedAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.items[].deletedAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.totalElements` | `integer(int64)` | 否 | 总记录数 | 字段名+类型推断 |
| `response.data.totalPages` | `integer(int32)` | 否 | 总页数 | 字段名+类型推断 |
| `response.data.page` | `integer(int32)` | 否 | 页码（从0开始） | 字段名+类型推断 |
| `response.data.size` | `integer(int32)` | 否 | 分页大小 | 字段名+类型推断 |

---

### PUT `/api/admin/students/batch`

- 接口说明：批量更新学生姓名与行政班
- operationId：`batchStudents`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `body.items` | `array<Line>` | 是 | 列表项 | 字段名+类型推断 |
| `body.items[]` | `array<Line>` | 是 | 数组元素 | OpenAPI schema |
| `body.items[].studentId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `body.items[].name` | `string` | 是 | 名称 | 字段名+类型推断 |
| `body.items[].homeroomClassId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `object` | 否 | 业务数据 | 字段名+类型推断 |

---

### GET `/api/admin/teachers`

- 接口说明：本校教师列表
- operationId：`teachers`

#### 入参字段

_无字段_

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `array<TeacherEntity>` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data[]` | `array<TeacherEntity>` | 否 | 数组元素 | OpenAPI schema |
| `response.data[].id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `response.data[].campusId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `response.data[].phone` | `string` | 否 | 手机号 | 字段名+类型推断 |
| `response.data[].externalTeacherId` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].externalSource` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].createdAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].updatedAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].deletedAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |

---

### POST `/api/admin/teachers`

- 接口说明：新建教师
- operationId：`createTeacher`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `body.name` | `string` | 是 | 名称 | 字段名+类型推断 |
| `body.phone` | `string` | 是 | 手机号 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `TeacherEntity` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data.id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `response.data.campusId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `response.data.phone` | `string` | 否 | 手机号 | 字段名+类型推断 |
| `response.data.externalTeacherId` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.externalSource` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.createdAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.updatedAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.deletedAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |

---

### PUT `/api/admin/teachers/{teacherId}`

- 接口说明：更新教师
- operationId：`updateTeacher`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `path.teacherId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `body.name` | `string` | 是 | 名称 | 字段名+类型推断 |
| `body.phone` | `string` | 是 | 手机号 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `TeacherEntity` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data.id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `response.data.campusId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `response.data.phone` | `string` | 否 | 手机号 | 字段名+类型推断 |
| `response.data.externalTeacherId` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.externalSource` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.createdAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.updatedAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.deletedAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |

---

## Auth

### POST `/api/auth/login`

- 接口说明：验证码登录
- 补充描述：仅需手机号和验证码，系统自动识别所属校区与身份（TEACHER/ADMIN）。
- operationId：`login`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `body.phone` | `string` | 是 | 手机号 | 字段名+类型推断 |
| `body.code` | `string` | 是 | 业务状态码 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `LoginResponse` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data.id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `response.data.phone` | `string` | 否 | 手机号 | 字段名+类型推断 |
| `response.data.username` | `string` | 否 | 用户名 | 字段名+类型推断 |
| `response.data.token` | `string` | 否 | 登录令牌 | 字段名+类型推断 |
| `response.data.role` | `string` | 否 | 角色 | 字段名+类型推断 |
| `response.data.campusId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.campusName` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `response.data.teacherId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.adminUserId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |

---

### POST `/api/auth/logout`

- 接口说明：登出并作废 Token
- operationId：`logout`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `header.Authorization` | `string` | 是 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `object` | 否 | 业务数据 | 字段名+类型推断 |

---

### POST `/api/auth/send-code`

- 接口说明：发送短信验证码（开发环境使用固定验证码）
- operationId：`sendCode`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `body.phone` | `string` | 是 | 手机号 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `object` | 否 | 业务数据 | 字段名+类型推断 |

---

## Courses

### GET `/api/courses/week`

- 接口说明：周课表聚合（含本周课节与是否已有周维度点名记录）
- operationId：`week`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `query.weekStart` | `string(date)` | 是 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `array<CourseWeekItemResponse>` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data[]` | `array<CourseWeekItemResponse>` | 否 | 数组元素 | OpenAPI schema |
| `response.data[]` | `object` | 否 | 周课表聚合项 | OpenAPI schema |
| `response.data[].id` | `integer(int64)` | 否 | 课程ID（course.id） | OpenAPI @Schema/注解 |
| `response.data[].name` | `string` | 否 | 课程名称 | OpenAPI @Schema/注解 |
| `response.data[].location` | `string` | 否 | 上课地点 | OpenAPI @Schema/注解 |
| `response.data[].campusId` | `integer(int64)` | 否 | 校区ID（campus.id） | OpenAPI @Schema/注解 |
| `response.data[].sessionsInWeek` | `array<CourseSessionResponse>` | 否 | 本周的课节列表 | OpenAPI @Schema/注解 |
| `response.data[].sessionsInWeek[]` | `array<CourseSessionResponse>` | 否 | 本周的课节列表 | OpenAPI schema |
| `response.data[].sessionsInWeek[]` | `object` | 否 | 课节时间信息 | OpenAPI schema |
| `response.data[].sessionsInWeek[].id` | `integer(int64)` | 否 | 课节ID（course_session.id） | OpenAPI @Schema/注解 |
| `response.data[].sessionsInWeek[].startAt` | `string(date-time)` | 否 | 课节开始时间 | OpenAPI @Schema/注解 |
| `response.data[].sessionsInWeek[].endAt` | `string(date-time)` | 否 | 课节结束时间 | OpenAPI @Schema/注解 |
| `response.data[].hasAttendanceRecord` | `boolean` | 否 | 是否已经有周维度点名记录 | OpenAPI @Schema/注解 |

---

### GET `/api/courses/{courseId}`

- 接口说明：课程详情
- operationId：`detail`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `path.courseId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `CourseDetailResponse` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data` | `object` | 否 | 课程详情信息 | OpenAPI schema |
| `response.data.id` | `integer(int64)` | 否 | 课程ID（course.id） | OpenAPI @Schema/注解 |
| `response.data.name` | `string` | 否 | 课程名称 | OpenAPI @Schema/注解 |
| `response.data.location` | `string` | 否 | 上课地点 | OpenAPI @Schema/注解 |
| `response.data.campusId` | `integer(int64)` | 否 | 校区ID（campus.id） | OpenAPI @Schema/注解 |
| `response.data.status` | `string` | 否 | 课程状态 | OpenAPI @Schema/注解 |
| `response.data.remark` | `string` | 否 | 备注 | OpenAPI @Schema/注解 |
| `response.data.sessions` | `array<CourseSessionResponse>` | 否 | 课程的课节列表 | OpenAPI @Schema/注解 |
| `response.data.sessions[]` | `array<CourseSessionResponse>` | 否 | 课程的课节列表 | OpenAPI schema |
| `response.data.sessions[]` | `object` | 否 | 课节时间信息 | OpenAPI schema |
| `response.data.sessions[].id` | `integer(int64)` | 否 | 课节ID（course_session.id） | OpenAPI @Schema/注解 |
| `response.data.sessions[].startAt` | `string(date-time)` | 否 | 课节开始时间 | OpenAPI @Schema/注解 |
| `response.data.sessions[].endAt` | `string(date-time)` | 否 | 课节结束时间 | OpenAPI @Schema/注解 |
| `response.data.teachers` | `array<CourseTeacherRefResponse>` | 否 | 课程绑定教师列表 | OpenAPI @Schema/注解 |
| `response.data.teachers[]` | `array<CourseTeacherRefResponse>` | 否 | 课程绑定教师列表 | OpenAPI schema |
| `response.data.teachers[]` | `object` | 否 | 课程教师引用信息 | OpenAPI schema |
| `response.data.teachers[].teacherId` | `integer(int64)` | 否 | 教师ID（teacher.id） | OpenAPI @Schema/注解 |
| `response.data.teachers[].role` | `string` | 否 | 课程中的角色（PRIMARY/ROLL_CALL/SUPPLEMENTARY） | OpenAPI @Schema/注解 |
| `response.data.teachers[].name` | `string` | 否 | 教师姓名 | OpenAPI @Schema/注解 |

---

### POST `/api/courses/{courseId}/attendance`

- 接口说明：提交点名（须含全部应到学生；教师或同校区管理员）
- operationId：`submitAttendance`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `path.courseId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `body` | `object` | 是 | 提交点名请求 | OpenAPI schema |
| `body.courseSessionId` | `integer(int64)` | 否 | 课节ID（对应 course_session.id）。可为空（表示不按课节维度点名） | OpenAPI @Schema/注解 |
| `body.items` | `array<Line>` | 是 | 点名明细列表（必须包含本课应到学生的每一条） | OpenAPI @Schema/注解 |
| `body.items[]` | `array<Line>` | 是 | 点名明细列表（必须包含本课应到学生的每一条） | OpenAPI schema |
| `body.items[].studentId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `body.items[].name` | `string` | 是 | 名称 | 字段名+类型推断 |
| `body.items[].homeroomClassId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `object` | 否 | 业务数据 | 字段名+类型推断 |

---

### GET `/api/courses/{courseId}/attendance/latest`

- 接口说明：最近一次点名记录（无则 data 为 null）
- operationId：`latestAttendance`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `path.courseId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `AttendanceLatestResponse` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data` | `object` | 否 | 最近一次点名记录（若无记录则 data 为 null） | OpenAPI schema |
| `response.data.attendanceRecordId` | `integer(int64)` | 否 | 点名提交记录ID（attendance_record.id） | OpenAPI @Schema/注解 |
| `response.data.courseSessionId` | `integer(int64)` | 否 | 点名对应课节ID（course_session.id，可为空） | OpenAPI @Schema/注解 |
| `response.data.submittedAt` | `string(date-time)` | 否 | 提交时间 | OpenAPI @Schema/注解 |
| `response.data.hasSubmittedToday` | `boolean` | 否 | 最近一次提交是否发生在当日（按系统默认时区的日历日） | OpenAPI @Schema/注解 |
| `response.data.items` | `array<AttendanceItemResponse>` | 否 | 点名明细列表 | OpenAPI @Schema/注解 |
| `response.data.items[]` | `array<AttendanceItemResponse>` | 否 | 点名明细列表 | OpenAPI schema |
| `response.data.items[]` | `object` | 否 | 点名明细行 | OpenAPI schema |
| `response.data.items[].studentId` | `integer(int64)` | 否 | 学生ID（student.id） | OpenAPI @Schema/注解 |
| `response.data.items[].status` | `string` | 否 | 点名状态：PRESENT(已到) / ABSENT(未到) / LEAVE(请假) | OpenAPI @Schema/注解 |

---

### GET `/api/courses/{courseId}/roll-call-windows`

- 接口说明：课程所属校区的点名时间窗
- operationId：`rollCallWindows`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `path.courseId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `array<RollCallWindowResponse>` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data[]` | `array<RollCallWindowResponse>` | 否 | 数组元素 | OpenAPI schema |
| `response.data[]` | `object` | 否 | 点名时间窗信息 | OpenAPI schema |
| `response.data[].id` | `integer(int64)` | 否 | 时间窗ID（campus_roll_call_window.id） | OpenAPI @Schema/注解 |
| `response.data[].weekday` | `integer(int32)` | 否 | 星期几：1=周一 … 7=周日 | OpenAPI @Schema/注解 |
| `response.data[].windowStart` | `LocalTime` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].windowStart` | `object` | 否 | 点名窗口结束时间 | OpenAPI schema |
| `response.data[].windowStart.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].windowStart.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].windowStart.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].windowStart.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].windowEnd` | `LocalTime` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].windowEnd` | `object` | 否 | 点名窗口结束时间 | OpenAPI schema |
| `response.data[].windowEnd.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].windowEnd.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].windowEnd.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].windowEnd.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data[].effectiveFrom` | `string(date)` | 否 | 生效开始日期（可空：长期有效） | OpenAPI @Schema/注解 |
| `response.data[].effectiveTo` | `string(date)` | 否 | 生效结束日期（可空） | OpenAPI @Schema/注解 |

---

### GET `/api/courses/{courseId}/students`

- 接口说明：课程点名名单（可选筛选 ALL / UNMARKED / LEAVE / ABSENT / PRESENT）
- operationId：`students`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `path.courseId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `query.filter` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `array<CourseStudentRowResponse>` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data[]` | `array<CourseStudentRowResponse>` | 否 | 数组元素 | OpenAPI schema |
| `response.data[]` | `object` | 否 | 课程学生名单行信息 | OpenAPI schema |
| `response.data[].studentId` | `integer(int64)` | 否 | 学生ID（student.id） | OpenAPI @Schema/注解 |
| `response.data[].studentName` | `string` | 否 | 学生姓名 | OpenAPI @Schema/注解 |
| `response.data[].homeroomClassId` | `integer(int64)` | 否 | 行政班ID（homeroom_class.id） | OpenAPI @Schema/注解 |
| `response.data[].homeroomClassName` | `string` | 否 | 行政班名称 | OpenAPI @Schema/注解 |
| `response.data[].lastAttendanceStatus` | `string` | 否 | 最近点名状态（含未到/请假/已到等按系统口径） | OpenAPI @Schema/注解 |

---

## Profile

### GET `/api/me`

- 接口说明：当前登录用户档案（教师/管理员通用）
- operationId：`me`

#### 入参字段

_无字段_

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `MeResponse` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data.id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `response.data.phone` | `string` | 否 | 手机号 | 字段名+类型推断 |
| `response.data.username` | `string` | 否 | 用户名 | 字段名+类型推断 |
| `response.data.role` | `string` | 否 | 角色 | 字段名+类型推断 |
| `response.data.campusId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.campusName` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `response.data.teacherId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.adminUserId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |

---

## Teacher App

### GET `/api/teacher/courses/today`

- 接口说明：当日课节列表（含是否已点名）
- operationId：`today`

#### 入参字段

_无字段_

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `array<TeacherTodaySessionResponse>` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data[]` | `array<TeacherTodaySessionResponse>` | 否 | 数组元素 | OpenAPI schema |
| `response.data[]` | `object` | 否 | 教师端当日课节信息 | OpenAPI schema |
| `response.data[].courseId` | `integer(int64)` | 否 | 课程ID（course.id） | OpenAPI @Schema/注解 |
| `response.data[].courseName` | `string` | 否 | 课程名称 | OpenAPI @Schema/注解 |
| `response.data[].location` | `string` | 否 | 上课地点 | OpenAPI @Schema/注解 |
| `response.data[].sessionId` | `integer(int64)` | 否 | 课节ID（course_session.id） | OpenAPI @Schema/注解 |
| `response.data[].sessionStartAt` | `string(date-time)` | 否 | 课节开始时间 | OpenAPI @Schema/注解 |
| `response.data[].sessionEndAt` | `string(date-time)` | 否 | 课节结束时间 | OpenAPI @Schema/注解 |
| `response.data[].rollCallCompleted` | `boolean` | 否 | 当日该课节是否已有点名完成记录 | OpenAPI @Schema/注解 |

---

### GET `/api/teacher/home`

- 接口说明：教师首页：周课表 + 校区点名窗口
- operationId：`home`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `query.weekStart` | `string(date)` | 是 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `TeacherHomeResponse` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data` | `object` | 否 | 教师端首页返回 | OpenAPI schema |
| `response.data.weekStart` | `string(date)` | 否 | 周开始日期（周一） | OpenAPI @Schema/注解 |
| `response.data.weekCourses` | `array<CourseWeekItemResponse>` | 否 | 本周课程聚合列表 | OpenAPI @Schema/注解 |
| `response.data.weekCourses[]` | `array<CourseWeekItemResponse>` | 否 | 本周课程聚合列表 | OpenAPI schema |
| `response.data.weekCourses[]` | `object` | 否 | 周课表聚合项 | OpenAPI schema |
| `response.data.weekCourses[].id` | `integer(int64)` | 否 | 课程ID（course.id） | OpenAPI @Schema/注解 |
| `response.data.weekCourses[].name` | `string` | 否 | 课程名称 | OpenAPI @Schema/注解 |
| `response.data.weekCourses[].location` | `string` | 否 | 上课地点 | OpenAPI @Schema/注解 |
| `response.data.weekCourses[].campusId` | `integer(int64)` | 否 | 校区ID（campus.id） | OpenAPI @Schema/注解 |
| `response.data.weekCourses[].sessionsInWeek` | `array<CourseSessionResponse>` | 否 | 本周的课节列表 | OpenAPI @Schema/注解 |
| `response.data.weekCourses[].sessionsInWeek[]` | `array<CourseSessionResponse>` | 否 | 本周的课节列表 | OpenAPI schema |
| `response.data.weekCourses[].sessionsInWeek[]` | `object` | 否 | 课节时间信息 | OpenAPI schema |
| `response.data.weekCourses[].sessionsInWeek[].id` | `integer(int64)` | 否 | 课节ID（course_session.id） | OpenAPI @Schema/注解 |
| `response.data.weekCourses[].sessionsInWeek[].startAt` | `string(date-time)` | 否 | 课节开始时间 | OpenAPI @Schema/注解 |
| `response.data.weekCourses[].sessionsInWeek[].endAt` | `string(date-time)` | 否 | 课节结束时间 | OpenAPI @Schema/注解 |
| `response.data.weekCourses[].hasAttendanceRecord` | `boolean` | 否 | 是否已经有周维度点名记录 | OpenAPI @Schema/注解 |
| `response.data.campusRollCallWindows` | `array<RollCallWindowResponse>` | 否 | 本校区点名时间窗列表 | OpenAPI @Schema/注解 |
| `response.data.campusRollCallWindows[]` | `array<RollCallWindowResponse>` | 否 | 本校区点名时间窗列表 | OpenAPI schema |
| `response.data.campusRollCallWindows[]` | `object` | 否 | 点名时间窗信息 | OpenAPI schema |
| `response.data.campusRollCallWindows[].id` | `integer(int64)` | 否 | 时间窗ID（campus_roll_call_window.id） | OpenAPI @Schema/注解 |
| `response.data.campusRollCallWindows[].weekday` | `integer(int32)` | 否 | 星期几：1=周一 … 7=周日 | OpenAPI @Schema/注解 |
| `response.data.campusRollCallWindows[].windowStart` | `LocalTime` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.campusRollCallWindows[].windowStart` | `object` | 否 | 点名窗口结束时间 | OpenAPI schema |
| `response.data.campusRollCallWindows[].windowStart.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.campusRollCallWindows[].windowStart.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.campusRollCallWindows[].windowStart.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.campusRollCallWindows[].windowStart.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.campusRollCallWindows[].windowEnd` | `LocalTime` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.campusRollCallWindows[].windowEnd` | `object` | 否 | 点名窗口结束时间 | OpenAPI schema |
| `response.data.campusRollCallWindows[].windowEnd.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.campusRollCallWindows[].windowEnd.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.campusRollCallWindows[].windowEnd.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.campusRollCallWindows[].windowEnd.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `response.data.campusRollCallWindows[].effectiveFrom` | `string(date)` | 否 | 生效开始日期（可空：长期有效） | OpenAPI @Schema/注解 |
| `response.data.campusRollCallWindows[].effectiveTo` | `string(date)` | 否 | 生效结束日期（可空） | OpenAPI @Schema/注解 |

---

## Test

### GET `/api/test/token`

- 接口说明：校验当前 Token 并返回身份字段
- operationId：`testToken`

#### 入参字段

_无字段_

#### 回参字段

**HTTP 200**

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `response.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `response.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `response.data` | `object<string,object>` | 否 | 业务数据 | 字段名+类型推断 |
| `response.data` | `object<string,object>` | 否 | 动态键值映射 | OpenAPI schema |

---

## external-api-debug-controller

### GET `/debug/external/meta`

- operationId：`meta`

#### 入参字段

_无字段_

#### 回参字段

**HTTP 200**

_无字段_

---

### GET `/debug/external/preview`

- operationId：`preview`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `query.endpoint` | `string` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `query.page` | `integer(int32)` | 否 | 页码（从0开始） | 字段名+类型推断 |
| `query.pageSize` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `query.schoolId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `query.teacherId` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `query.studentId` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

_无字段_

---

### GET `/debug/external/query`

- operationId：`query`

#### 入参字段

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `query.endpoint` | `string` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `query.page` | `integer(int32)` | 否 | 页码（从0开始） | 字段名+类型推断 |
| `query.pageSize` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `query.schoolId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `query.teacherId` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `query.studentId` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |

#### 回参字段

**HTTP 200**

_无字段_

---

## 附录：Schema 字段索引

### `AbsentStudentRowResponse`

- 说明：未到学生列表行信息

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `AbsentStudentRowResponse` | `object` | 否 | 未到学生列表行信息 | OpenAPI schema |
| `AbsentStudentRowResponse.studentId` | `integer(int64)` | 否 | 学生ID（student.id） | OpenAPI @Schema/注解 |
| `AbsentStudentRowResponse.studentName` | `string` | 否 | 学生姓名 | OpenAPI @Schema/注解 |
| `AbsentStudentRowResponse.courseId` | `integer(int64)` | 否 | 课程ID（course.id） | OpenAPI @Schema/注解 |
| `AbsentStudentRowResponse.courseName` | `string` | 否 | 课程名称 | OpenAPI @Schema/注解 |
| `AbsentStudentRowResponse.attendanceSubmittedAt` | `string(date-time)` | 否 | 最近一次点名提交时间（attendance_record.submitted_at） | OpenAPI @Schema/注解 |

### `AdminHomeSummaryResponse`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `AdminHomeSummaryResponse.date` | `string(date)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `AdminHomeSummaryResponse.distinctCoursesWithSessionsToday` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `AdminHomeSummaryResponse.sessionCountToday` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `AdminHomeSummaryResponse.pendingRollCallSessions` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `AdminHomeSummaryResponse.rollCallWindowRuleCount` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `AdminHomeSummaryResponse.rollCallRulesSummary` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |

### `ApiResponseAdminHomeSummaryResponse`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `ApiResponseAdminHomeSummaryResponse.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `ApiResponseAdminHomeSummaryResponse.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `ApiResponseAdminHomeSummaryResponse.data` | `AdminHomeSummaryResponse` | 否 | 业务数据 | 字段名+类型推断 |
| `ApiResponseAdminHomeSummaryResponse.data.date` | `string(date)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseAdminHomeSummaryResponse.data.distinctCoursesWithSessionsToday` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseAdminHomeSummaryResponse.data.sessionCountToday` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseAdminHomeSummaryResponse.data.pendingRollCallSessions` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseAdminHomeSummaryResponse.data.rollCallWindowRuleCount` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseAdminHomeSummaryResponse.data.rollCallRulesSummary` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |

### `ApiResponseAttendanceLatestResponse`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `ApiResponseAttendanceLatestResponse.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `ApiResponseAttendanceLatestResponse.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `ApiResponseAttendanceLatestResponse.data` | `AttendanceLatestResponse` | 否 | 业务数据 | 字段名+类型推断 |
| `ApiResponseAttendanceLatestResponse.data` | `object` | 否 | 最近一次点名记录（若无记录则 data 为 null） | OpenAPI schema |
| `ApiResponseAttendanceLatestResponse.data.attendanceRecordId` | `integer(int64)` | 否 | 点名提交记录ID（attendance_record.id） | OpenAPI @Schema/注解 |
| `ApiResponseAttendanceLatestResponse.data.courseSessionId` | `integer(int64)` | 否 | 点名对应课节ID（course_session.id，可为空） | OpenAPI @Schema/注解 |
| `ApiResponseAttendanceLatestResponse.data.submittedAt` | `string(date-time)` | 否 | 提交时间 | OpenAPI @Schema/注解 |
| `ApiResponseAttendanceLatestResponse.data.hasSubmittedToday` | `boolean` | 否 | 最近一次提交是否发生在当日（按系统默认时区的日历日） | OpenAPI @Schema/注解 |
| `ApiResponseAttendanceLatestResponse.data.items` | `array<AttendanceItemResponse>` | 否 | 点名明细列表 | OpenAPI @Schema/注解 |
| `ApiResponseAttendanceLatestResponse.data.items[]` | `array<AttendanceItemResponse>` | 否 | 点名明细列表 | OpenAPI schema |
| `ApiResponseAttendanceLatestResponse.data.items[]` | `object` | 否 | 点名明细行 | OpenAPI schema |
| `ApiResponseAttendanceLatestResponse.data.items[].studentId` | `integer(int64)` | 否 | 学生ID（student.id） | OpenAPI @Schema/注解 |
| `ApiResponseAttendanceLatestResponse.data.items[].status` | `string` | 否 | 点名状态：PRESENT(已到) / ABSENT(未到) / LEAVE(请假) | OpenAPI @Schema/注解 |

### `ApiResponseCourseDetailResponse`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `ApiResponseCourseDetailResponse.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `ApiResponseCourseDetailResponse.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `ApiResponseCourseDetailResponse.data` | `CourseDetailResponse` | 否 | 业务数据 | 字段名+类型推断 |
| `ApiResponseCourseDetailResponse.data` | `object` | 否 | 课程详情信息 | OpenAPI schema |
| `ApiResponseCourseDetailResponse.data.id` | `integer(int64)` | 否 | 课程ID（course.id） | OpenAPI @Schema/注解 |
| `ApiResponseCourseDetailResponse.data.name` | `string` | 否 | 课程名称 | OpenAPI @Schema/注解 |
| `ApiResponseCourseDetailResponse.data.location` | `string` | 否 | 上课地点 | OpenAPI @Schema/注解 |
| `ApiResponseCourseDetailResponse.data.campusId` | `integer(int64)` | 否 | 校区ID（campus.id） | OpenAPI @Schema/注解 |
| `ApiResponseCourseDetailResponse.data.status` | `string` | 否 | 课程状态 | OpenAPI @Schema/注解 |
| `ApiResponseCourseDetailResponse.data.remark` | `string` | 否 | 备注 | OpenAPI @Schema/注解 |
| `ApiResponseCourseDetailResponse.data.sessions` | `array<CourseSessionResponse>` | 否 | 课程的课节列表 | OpenAPI @Schema/注解 |
| `ApiResponseCourseDetailResponse.data.sessions[]` | `array<CourseSessionResponse>` | 否 | 课程的课节列表 | OpenAPI schema |
| `ApiResponseCourseDetailResponse.data.sessions[]` | `object` | 否 | 课节时间信息 | OpenAPI schema |
| `ApiResponseCourseDetailResponse.data.sessions[].id` | `integer(int64)` | 否 | 课节ID（course_session.id） | OpenAPI @Schema/注解 |
| `ApiResponseCourseDetailResponse.data.sessions[].startAt` | `string(date-time)` | 否 | 课节开始时间 | OpenAPI @Schema/注解 |
| `ApiResponseCourseDetailResponse.data.sessions[].endAt` | `string(date-time)` | 否 | 课节结束时间 | OpenAPI @Schema/注解 |
| `ApiResponseCourseDetailResponse.data.teachers` | `array<CourseTeacherRefResponse>` | 否 | 课程绑定教师列表 | OpenAPI @Schema/注解 |
| `ApiResponseCourseDetailResponse.data.teachers[]` | `array<CourseTeacherRefResponse>` | 否 | 课程绑定教师列表 | OpenAPI schema |
| `ApiResponseCourseDetailResponse.data.teachers[]` | `object` | 否 | 课程教师引用信息 | OpenAPI schema |
| `ApiResponseCourseDetailResponse.data.teachers[].teacherId` | `integer(int64)` | 否 | 教师ID（teacher.id） | OpenAPI @Schema/注解 |
| `ApiResponseCourseDetailResponse.data.teachers[].role` | `string` | 否 | 课程中的角色（PRIMARY/ROLL_CALL/SUPPLEMENTARY） | OpenAPI @Schema/注解 |
| `ApiResponseCourseDetailResponse.data.teachers[].name` | `string` | 否 | 教师姓名 | OpenAPI @Schema/注解 |

### `ApiResponseHomeroomClassListItemResponse`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `ApiResponseHomeroomClassListItemResponse.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `ApiResponseHomeroomClassListItemResponse.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `ApiResponseHomeroomClassListItemResponse.data` | `HomeroomClassListItemResponse` | 否 | 业务数据 | 字段名+类型推断 |
| `ApiResponseHomeroomClassListItemResponse.data.id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `ApiResponseHomeroomClassListItemResponse.data.name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `ApiResponseHomeroomClassListItemResponse.data.homeroomTeacherId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |

### `ApiResponseListAbsentStudentRowResponse`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `ApiResponseListAbsentStudentRowResponse.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `ApiResponseListAbsentStudentRowResponse.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `ApiResponseListAbsentStudentRowResponse.data` | `array<AbsentStudentRowResponse>` | 否 | 业务数据 | 字段名+类型推断 |
| `ApiResponseListAbsentStudentRowResponse.data[]` | `array<AbsentStudentRowResponse>` | 否 | 数组元素 | OpenAPI schema |
| `ApiResponseListAbsentStudentRowResponse.data[]` | `object` | 否 | 未到学生列表行信息 | OpenAPI schema |
| `ApiResponseListAbsentStudentRowResponse.data[].studentId` | `integer(int64)` | 否 | 学生ID（student.id） | OpenAPI @Schema/注解 |
| `ApiResponseListAbsentStudentRowResponse.data[].studentName` | `string` | 否 | 学生姓名 | OpenAPI @Schema/注解 |
| `ApiResponseListAbsentStudentRowResponse.data[].courseId` | `integer(int64)` | 否 | 课程ID（course.id） | OpenAPI @Schema/注解 |
| `ApiResponseListAbsentStudentRowResponse.data[].courseName` | `string` | 否 | 课程名称 | OpenAPI @Schema/注解 |
| `ApiResponseListAbsentStudentRowResponse.data[].attendanceSubmittedAt` | `string(date-time)` | 否 | 最近一次点名提交时间（attendance_record.submitted_at） | OpenAPI @Schema/注解 |

### `ApiResponseListCourseStudentRowResponse`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `ApiResponseListCourseStudentRowResponse.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `ApiResponseListCourseStudentRowResponse.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `ApiResponseListCourseStudentRowResponse.data` | `array<CourseStudentRowResponse>` | 否 | 业务数据 | 字段名+类型推断 |
| `ApiResponseListCourseStudentRowResponse.data[]` | `array<CourseStudentRowResponse>` | 否 | 数组元素 | OpenAPI schema |
| `ApiResponseListCourseStudentRowResponse.data[]` | `object` | 否 | 课程学生名单行信息 | OpenAPI schema |
| `ApiResponseListCourseStudentRowResponse.data[].studentId` | `integer(int64)` | 否 | 学生ID（student.id） | OpenAPI @Schema/注解 |
| `ApiResponseListCourseStudentRowResponse.data[].studentName` | `string` | 否 | 学生姓名 | OpenAPI @Schema/注解 |
| `ApiResponseListCourseStudentRowResponse.data[].homeroomClassId` | `integer(int64)` | 否 | 行政班ID（homeroom_class.id） | OpenAPI @Schema/注解 |
| `ApiResponseListCourseStudentRowResponse.data[].homeroomClassName` | `string` | 否 | 行政班名称 | OpenAPI @Schema/注解 |
| `ApiResponseListCourseStudentRowResponse.data[].lastAttendanceStatus` | `string` | 否 | 最近点名状态（含未到/请假/已到等按系统口径） | OpenAPI @Schema/注解 |

### `ApiResponseListCourseWeekItemResponse`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `ApiResponseListCourseWeekItemResponse.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `ApiResponseListCourseWeekItemResponse.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `ApiResponseListCourseWeekItemResponse.data` | `array<CourseWeekItemResponse>` | 否 | 业务数据 | 字段名+类型推断 |
| `ApiResponseListCourseWeekItemResponse.data[]` | `array<CourseWeekItemResponse>` | 否 | 数组元素 | OpenAPI schema |
| `ApiResponseListCourseWeekItemResponse.data[]` | `object` | 否 | 周课表聚合项 | OpenAPI schema |
| `ApiResponseListCourseWeekItemResponse.data[].id` | `integer(int64)` | 否 | 课程ID（course.id） | OpenAPI @Schema/注解 |
| `ApiResponseListCourseWeekItemResponse.data[].name` | `string` | 否 | 课程名称 | OpenAPI @Schema/注解 |
| `ApiResponseListCourseWeekItemResponse.data[].location` | `string` | 否 | 上课地点 | OpenAPI @Schema/注解 |
| `ApiResponseListCourseWeekItemResponse.data[].campusId` | `integer(int64)` | 否 | 校区ID（campus.id） | OpenAPI @Schema/注解 |
| `ApiResponseListCourseWeekItemResponse.data[].sessionsInWeek` | `array<CourseSessionResponse>` | 否 | 本周的课节列表 | OpenAPI @Schema/注解 |
| `ApiResponseListCourseWeekItemResponse.data[].sessionsInWeek[]` | `array<CourseSessionResponse>` | 否 | 本周的课节列表 | OpenAPI schema |
| `ApiResponseListCourseWeekItemResponse.data[].sessionsInWeek[]` | `object` | 否 | 课节时间信息 | OpenAPI schema |
| `ApiResponseListCourseWeekItemResponse.data[].sessionsInWeek[].id` | `integer(int64)` | 否 | 课节ID（course_session.id） | OpenAPI @Schema/注解 |
| `ApiResponseListCourseWeekItemResponse.data[].sessionsInWeek[].startAt` | `string(date-time)` | 否 | 课节开始时间 | OpenAPI @Schema/注解 |
| `ApiResponseListCourseWeekItemResponse.data[].sessionsInWeek[].endAt` | `string(date-time)` | 否 | 课节结束时间 | OpenAPI @Schema/注解 |
| `ApiResponseListCourseWeekItemResponse.data[].hasAttendanceRecord` | `boolean` | 否 | 是否已经有周维度点名记录 | OpenAPI @Schema/注解 |

### `ApiResponseListHomeroomClassListItemResponse`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `ApiResponseListHomeroomClassListItemResponse.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `ApiResponseListHomeroomClassListItemResponse.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `ApiResponseListHomeroomClassListItemResponse.data` | `array<HomeroomClassListItemResponse>` | 否 | 业务数据 | 字段名+类型推断 |
| `ApiResponseListHomeroomClassListItemResponse.data[]` | `array<HomeroomClassListItemResponse>` | 否 | 数组元素 | OpenAPI schema |
| `ApiResponseListHomeroomClassListItemResponse.data[].id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `ApiResponseListHomeroomClassListItemResponse.data[].name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `ApiResponseListHomeroomClassListItemResponse.data[].homeroomTeacherId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |

### `ApiResponseListRollCallOverviewRowResponse`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `ApiResponseListRollCallOverviewRowResponse.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `ApiResponseListRollCallOverviewRowResponse.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `ApiResponseListRollCallOverviewRowResponse.data` | `array<RollCallOverviewRowResponse>` | 否 | 业务数据 | 字段名+类型推断 |
| `ApiResponseListRollCallOverviewRowResponse.data[]` | `array<RollCallOverviewRowResponse>` | 否 | 数组元素 | OpenAPI schema |
| `ApiResponseListRollCallOverviewRowResponse.data[]` | `object` | 否 | 点名总控列表行信息 | OpenAPI schema |
| `ApiResponseListRollCallOverviewRowResponse.data[].courseId` | `integer(int64)` | 否 | 课程ID | OpenAPI @Schema/注解 |
| `ApiResponseListRollCallOverviewRowResponse.data[].courseName` | `string` | 否 | 课程名称 | OpenAPI @Schema/注解 |
| `ApiResponseListRollCallOverviewRowResponse.data[].sessionId` | `integer(int64)` | 否 | 课节ID（course_session.id） | OpenAPI @Schema/注解 |
| `ApiResponseListRollCallOverviewRowResponse.data[].sessionStartAt` | `string(date-time)` | 否 | 课节开始时间 | OpenAPI @Schema/注解 |
| `ApiResponseListRollCallOverviewRowResponse.data[].sessionEndAt` | `string(date-time)` | 否 | 课节结束时间 | OpenAPI @Schema/注解 |
| `ApiResponseListRollCallOverviewRowResponse.data[].rollCallCompleted` | `boolean` | 否 | 是否已完成点名 | OpenAPI @Schema/注解 |
| `ApiResponseListRollCallOverviewRowResponse.data[].absentCount` | `integer(int32)` | 否 | 缺勤人数（未到/请假等按系统口径汇总） | OpenAPI @Schema/注解 |

### `ApiResponseListRollCallWindowResponse`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `ApiResponseListRollCallWindowResponse.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `ApiResponseListRollCallWindowResponse.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `ApiResponseListRollCallWindowResponse.data` | `array<RollCallWindowResponse>` | 否 | 业务数据 | 字段名+类型推断 |
| `ApiResponseListRollCallWindowResponse.data[]` | `array<RollCallWindowResponse>` | 否 | 数组元素 | OpenAPI schema |
| `ApiResponseListRollCallWindowResponse.data[]` | `object` | 否 | 点名时间窗信息 | OpenAPI schema |
| `ApiResponseListRollCallWindowResponse.data[].id` | `integer(int64)` | 否 | 时间窗ID（campus_roll_call_window.id） | OpenAPI @Schema/注解 |
| `ApiResponseListRollCallWindowResponse.data[].weekday` | `integer(int32)` | 否 | 星期几：1=周一 … 7=周日 | OpenAPI @Schema/注解 |
| `ApiResponseListRollCallWindowResponse.data[].windowStart` | `LocalTime` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseListRollCallWindowResponse.data[].windowStart` | `object` | 否 | 点名窗口结束时间 | OpenAPI schema |
| `ApiResponseListRollCallWindowResponse.data[].windowStart.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseListRollCallWindowResponse.data[].windowStart.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseListRollCallWindowResponse.data[].windowStart.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseListRollCallWindowResponse.data[].windowStart.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseListRollCallWindowResponse.data[].windowEnd` | `LocalTime` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseListRollCallWindowResponse.data[].windowEnd` | `object` | 否 | 点名窗口结束时间 | OpenAPI schema |
| `ApiResponseListRollCallWindowResponse.data[].windowEnd.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseListRollCallWindowResponse.data[].windowEnd.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseListRollCallWindowResponse.data[].windowEnd.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseListRollCallWindowResponse.data[].windowEnd.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseListRollCallWindowResponse.data[].effectiveFrom` | `string(date)` | 否 | 生效开始日期（可空：长期有效） | OpenAPI @Schema/注解 |
| `ApiResponseListRollCallWindowResponse.data[].effectiveTo` | `string(date)` | 否 | 生效结束日期（可空） | OpenAPI @Schema/注解 |

### `ApiResponseListTeacherEntity`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `ApiResponseListTeacherEntity.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `ApiResponseListTeacherEntity.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `ApiResponseListTeacherEntity.data` | `array<TeacherEntity>` | 否 | 业务数据 | 字段名+类型推断 |
| `ApiResponseListTeacherEntity.data[]` | `array<TeacherEntity>` | 否 | 数组元素 | OpenAPI schema |
| `ApiResponseListTeacherEntity.data[].id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `ApiResponseListTeacherEntity.data[].campusId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseListTeacherEntity.data[].name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `ApiResponseListTeacherEntity.data[].phone` | `string` | 否 | 手机号 | 字段名+类型推断 |
| `ApiResponseListTeacherEntity.data[].externalTeacherId` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseListTeacherEntity.data[].externalSource` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseListTeacherEntity.data[].createdAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseListTeacherEntity.data[].updatedAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseListTeacherEntity.data[].deletedAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |

### `ApiResponseListTeacherTodaySessionResponse`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `ApiResponseListTeacherTodaySessionResponse.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `ApiResponseListTeacherTodaySessionResponse.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `ApiResponseListTeacherTodaySessionResponse.data` | `array<TeacherTodaySessionResponse>` | 否 | 业务数据 | 字段名+类型推断 |
| `ApiResponseListTeacherTodaySessionResponse.data[]` | `array<TeacherTodaySessionResponse>` | 否 | 数组元素 | OpenAPI schema |
| `ApiResponseListTeacherTodaySessionResponse.data[]` | `object` | 否 | 教师端当日课节信息 | OpenAPI schema |
| `ApiResponseListTeacherTodaySessionResponse.data[].courseId` | `integer(int64)` | 否 | 课程ID（course.id） | OpenAPI @Schema/注解 |
| `ApiResponseListTeacherTodaySessionResponse.data[].courseName` | `string` | 否 | 课程名称 | OpenAPI @Schema/注解 |
| `ApiResponseListTeacherTodaySessionResponse.data[].location` | `string` | 否 | 上课地点 | OpenAPI @Schema/注解 |
| `ApiResponseListTeacherTodaySessionResponse.data[].sessionId` | `integer(int64)` | 否 | 课节ID（course_session.id） | OpenAPI @Schema/注解 |
| `ApiResponseListTeacherTodaySessionResponse.data[].sessionStartAt` | `string(date-time)` | 否 | 课节开始时间 | OpenAPI @Schema/注解 |
| `ApiResponseListTeacherTodaySessionResponse.data[].sessionEndAt` | `string(date-time)` | 否 | 课节结束时间 | OpenAPI @Schema/注解 |
| `ApiResponseListTeacherTodaySessionResponse.data[].rollCallCompleted` | `boolean` | 否 | 当日该课节是否已有点名完成记录 | OpenAPI @Schema/注解 |

### `ApiResponseLoginResponse`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `ApiResponseLoginResponse.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `ApiResponseLoginResponse.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `ApiResponseLoginResponse.data` | `LoginResponse` | 否 | 业务数据 | 字段名+类型推断 |
| `ApiResponseLoginResponse.data.id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `ApiResponseLoginResponse.data.phone` | `string` | 否 | 手机号 | 字段名+类型推断 |
| `ApiResponseLoginResponse.data.username` | `string` | 否 | 用户名 | 字段名+类型推断 |
| `ApiResponseLoginResponse.data.token` | `string` | 否 | 登录令牌 | 字段名+类型推断 |
| `ApiResponseLoginResponse.data.role` | `string` | 否 | 角色 | 字段名+类型推断 |
| `ApiResponseLoginResponse.data.campusId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseLoginResponse.data.campusName` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseLoginResponse.data.name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `ApiResponseLoginResponse.data.teacherId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseLoginResponse.data.adminUserId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |

### `ApiResponseMapStringObject`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `ApiResponseMapStringObject.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `ApiResponseMapStringObject.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `ApiResponseMapStringObject.data` | `object<string,object>` | 否 | 业务数据 | 字段名+类型推断 |
| `ApiResponseMapStringObject.data` | `object<string,object>` | 否 | 动态键值映射 | OpenAPI schema |

### `ApiResponseMeResponse`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `ApiResponseMeResponse.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `ApiResponseMeResponse.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `ApiResponseMeResponse.data` | `MeResponse` | 否 | 业务数据 | 字段名+类型推断 |
| `ApiResponseMeResponse.data.id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `ApiResponseMeResponse.data.phone` | `string` | 否 | 手机号 | 字段名+类型推断 |
| `ApiResponseMeResponse.data.username` | `string` | 否 | 用户名 | 字段名+类型推断 |
| `ApiResponseMeResponse.data.role` | `string` | 否 | 角色 | 字段名+类型推断 |
| `ApiResponseMeResponse.data.campusId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseMeResponse.data.campusName` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseMeResponse.data.name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `ApiResponseMeResponse.data.teacherId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseMeResponse.data.adminUserId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |

### `ApiResponsePagedRowsHomeroomClassListItemResponse`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `ApiResponsePagedRowsHomeroomClassListItemResponse.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `ApiResponsePagedRowsHomeroomClassListItemResponse.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `ApiResponsePagedRowsHomeroomClassListItemResponse.data` | `PagedRowsHomeroomClassListItemResponse` | 否 | 业务数据 | 字段名+类型推断 |
| `ApiResponsePagedRowsHomeroomClassListItemResponse.data.items` | `array<HomeroomClassListItemResponse>` | 否 | 列表项 | 字段名+类型推断 |
| `ApiResponsePagedRowsHomeroomClassListItemResponse.data.items[]` | `array<HomeroomClassListItemResponse>` | 否 | 数组元素 | OpenAPI schema |
| `ApiResponsePagedRowsHomeroomClassListItemResponse.data.items[].id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `ApiResponsePagedRowsHomeroomClassListItemResponse.data.items[].name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `ApiResponsePagedRowsHomeroomClassListItemResponse.data.items[].homeroomTeacherId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponsePagedRowsHomeroomClassListItemResponse.data.totalElements` | `integer(int64)` | 否 | 总记录数 | 字段名+类型推断 |
| `ApiResponsePagedRowsHomeroomClassListItemResponse.data.totalPages` | `integer(int32)` | 否 | 总页数 | 字段名+类型推断 |
| `ApiResponsePagedRowsHomeroomClassListItemResponse.data.page` | `integer(int32)` | 否 | 页码（从0开始） | 字段名+类型推断 |
| `ApiResponsePagedRowsHomeroomClassListItemResponse.data.size` | `integer(int32)` | 否 | 分页大小 | 字段名+类型推断 |

### `ApiResponsePagedRowsStudentEntity`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `ApiResponsePagedRowsStudentEntity.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `ApiResponsePagedRowsStudentEntity.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `ApiResponsePagedRowsStudentEntity.data` | `PagedRowsStudentEntity` | 否 | 业务数据 | 字段名+类型推断 |
| `ApiResponsePagedRowsStudentEntity.data.items` | `array<StudentEntity>` | 否 | 列表项 | 字段名+类型推断 |
| `ApiResponsePagedRowsStudentEntity.data.items[]` | `array<StudentEntity>` | 否 | 数组元素 | OpenAPI schema |
| `ApiResponsePagedRowsStudentEntity.data.items[].id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `ApiResponsePagedRowsStudentEntity.data.items[].campusId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponsePagedRowsStudentEntity.data.items[].homeroomClassId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponsePagedRowsStudentEntity.data.items[].name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `ApiResponsePagedRowsStudentEntity.data.items[].externalStudentId` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponsePagedRowsStudentEntity.data.items[].externalSource` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponsePagedRowsStudentEntity.data.items[].createdAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponsePagedRowsStudentEntity.data.items[].updatedAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponsePagedRowsStudentEntity.data.items[].deletedAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponsePagedRowsStudentEntity.data.totalElements` | `integer(int64)` | 否 | 总记录数 | 字段名+类型推断 |
| `ApiResponsePagedRowsStudentEntity.data.totalPages` | `integer(int32)` | 否 | 总页数 | 字段名+类型推断 |
| `ApiResponsePagedRowsStudentEntity.data.page` | `integer(int32)` | 否 | 页码（从0开始） | 字段名+类型推断 |
| `ApiResponsePagedRowsStudentEntity.data.size` | `integer(int32)` | 否 | 分页大小 | 字段名+类型推断 |

### `ApiResponseRollCallWindowResponse`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `ApiResponseRollCallWindowResponse.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `ApiResponseRollCallWindowResponse.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `ApiResponseRollCallWindowResponse.data` | `RollCallWindowResponse` | 否 | 业务数据 | 字段名+类型推断 |
| `ApiResponseRollCallWindowResponse.data` | `object` | 否 | 点名时间窗信息 | OpenAPI schema |
| `ApiResponseRollCallWindowResponse.data.id` | `integer(int64)` | 否 | 时间窗ID（campus_roll_call_window.id） | OpenAPI @Schema/注解 |
| `ApiResponseRollCallWindowResponse.data.weekday` | `integer(int32)` | 否 | 星期几：1=周一 … 7=周日 | OpenAPI @Schema/注解 |
| `ApiResponseRollCallWindowResponse.data.windowStart` | `LocalTime` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseRollCallWindowResponse.data.windowStart` | `object` | 否 | 点名窗口结束时间 | OpenAPI schema |
| `ApiResponseRollCallWindowResponse.data.windowStart.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseRollCallWindowResponse.data.windowStart.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseRollCallWindowResponse.data.windowStart.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseRollCallWindowResponse.data.windowStart.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseRollCallWindowResponse.data.windowEnd` | `LocalTime` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseRollCallWindowResponse.data.windowEnd` | `object` | 否 | 点名窗口结束时间 | OpenAPI schema |
| `ApiResponseRollCallWindowResponse.data.windowEnd.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseRollCallWindowResponse.data.windowEnd.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseRollCallWindowResponse.data.windowEnd.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseRollCallWindowResponse.data.windowEnd.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseRollCallWindowResponse.data.effectiveFrom` | `string(date)` | 否 | 生效开始日期（可空：长期有效） | OpenAPI @Schema/注解 |
| `ApiResponseRollCallWindowResponse.data.effectiveTo` | `string(date)` | 否 | 生效结束日期（可空） | OpenAPI @Schema/注解 |

### `ApiResponseTeacherEntity`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `ApiResponseTeacherEntity.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `ApiResponseTeacherEntity.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `ApiResponseTeacherEntity.data` | `TeacherEntity` | 否 | 业务数据 | 字段名+类型推断 |
| `ApiResponseTeacherEntity.data.id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `ApiResponseTeacherEntity.data.campusId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseTeacherEntity.data.name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `ApiResponseTeacherEntity.data.phone` | `string` | 否 | 手机号 | 字段名+类型推断 |
| `ApiResponseTeacherEntity.data.externalTeacherId` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseTeacherEntity.data.externalSource` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseTeacherEntity.data.createdAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseTeacherEntity.data.updatedAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseTeacherEntity.data.deletedAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |

### `ApiResponseTeacherHomeResponse`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `ApiResponseTeacherHomeResponse.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `ApiResponseTeacherHomeResponse.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `ApiResponseTeacherHomeResponse.data` | `TeacherHomeResponse` | 否 | 业务数据 | 字段名+类型推断 |
| `ApiResponseTeacherHomeResponse.data` | `object` | 否 | 教师端首页返回 | OpenAPI schema |
| `ApiResponseTeacherHomeResponse.data.weekStart` | `string(date)` | 否 | 周开始日期（周一） | OpenAPI @Schema/注解 |
| `ApiResponseTeacherHomeResponse.data.weekCourses` | `array<CourseWeekItemResponse>` | 否 | 本周课程聚合列表 | OpenAPI @Schema/注解 |
| `ApiResponseTeacherHomeResponse.data.weekCourses[]` | `array<CourseWeekItemResponse>` | 否 | 本周课程聚合列表 | OpenAPI schema |
| `ApiResponseTeacherHomeResponse.data.weekCourses[]` | `object` | 否 | 周课表聚合项 | OpenAPI schema |
| `ApiResponseTeacherHomeResponse.data.weekCourses[].id` | `integer(int64)` | 否 | 课程ID（course.id） | OpenAPI @Schema/注解 |
| `ApiResponseTeacherHomeResponse.data.weekCourses[].name` | `string` | 否 | 课程名称 | OpenAPI @Schema/注解 |
| `ApiResponseTeacherHomeResponse.data.weekCourses[].location` | `string` | 否 | 上课地点 | OpenAPI @Schema/注解 |
| `ApiResponseTeacherHomeResponse.data.weekCourses[].campusId` | `integer(int64)` | 否 | 校区ID（campus.id） | OpenAPI @Schema/注解 |
| `ApiResponseTeacherHomeResponse.data.weekCourses[].sessionsInWeek` | `array<CourseSessionResponse>` | 否 | 本周的课节列表 | OpenAPI @Schema/注解 |
| `ApiResponseTeacherHomeResponse.data.weekCourses[].sessionsInWeek[]` | `array<CourseSessionResponse>` | 否 | 本周的课节列表 | OpenAPI schema |
| `ApiResponseTeacherHomeResponse.data.weekCourses[].sessionsInWeek[]` | `object` | 否 | 课节时间信息 | OpenAPI schema |
| `ApiResponseTeacherHomeResponse.data.weekCourses[].sessionsInWeek[].id` | `integer(int64)` | 否 | 课节ID（course_session.id） | OpenAPI @Schema/注解 |
| `ApiResponseTeacherHomeResponse.data.weekCourses[].sessionsInWeek[].startAt` | `string(date-time)` | 否 | 课节开始时间 | OpenAPI @Schema/注解 |
| `ApiResponseTeacherHomeResponse.data.weekCourses[].sessionsInWeek[].endAt` | `string(date-time)` | 否 | 课节结束时间 | OpenAPI @Schema/注解 |
| `ApiResponseTeacherHomeResponse.data.weekCourses[].hasAttendanceRecord` | `boolean` | 否 | 是否已经有周维度点名记录 | OpenAPI @Schema/注解 |
| `ApiResponseTeacherHomeResponse.data.campusRollCallWindows` | `array<RollCallWindowResponse>` | 否 | 本校区点名时间窗列表 | OpenAPI @Schema/注解 |
| `ApiResponseTeacherHomeResponse.data.campusRollCallWindows[]` | `array<RollCallWindowResponse>` | 否 | 本校区点名时间窗列表 | OpenAPI schema |
| `ApiResponseTeacherHomeResponse.data.campusRollCallWindows[]` | `object` | 否 | 点名时间窗信息 | OpenAPI schema |
| `ApiResponseTeacherHomeResponse.data.campusRollCallWindows[].id` | `integer(int64)` | 否 | 时间窗ID（campus_roll_call_window.id） | OpenAPI @Schema/注解 |
| `ApiResponseTeacherHomeResponse.data.campusRollCallWindows[].weekday` | `integer(int32)` | 否 | 星期几：1=周一 … 7=周日 | OpenAPI @Schema/注解 |
| `ApiResponseTeacherHomeResponse.data.campusRollCallWindows[].windowStart` | `LocalTime` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseTeacherHomeResponse.data.campusRollCallWindows[].windowStart` | `object` | 否 | 点名窗口结束时间 | OpenAPI schema |
| `ApiResponseTeacherHomeResponse.data.campusRollCallWindows[].windowStart.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseTeacherHomeResponse.data.campusRollCallWindows[].windowStart.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseTeacherHomeResponse.data.campusRollCallWindows[].windowStart.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseTeacherHomeResponse.data.campusRollCallWindows[].windowStart.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseTeacherHomeResponse.data.campusRollCallWindows[].windowEnd` | `LocalTime` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseTeacherHomeResponse.data.campusRollCallWindows[].windowEnd` | `object` | 否 | 点名窗口结束时间 | OpenAPI schema |
| `ApiResponseTeacherHomeResponse.data.campusRollCallWindows[].windowEnd.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseTeacherHomeResponse.data.campusRollCallWindows[].windowEnd.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseTeacherHomeResponse.data.campusRollCallWindows[].windowEnd.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseTeacherHomeResponse.data.campusRollCallWindows[].windowEnd.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `ApiResponseTeacherHomeResponse.data.campusRollCallWindows[].effectiveFrom` | `string(date)` | 否 | 生效开始日期（可空：长期有效） | OpenAPI @Schema/注解 |
| `ApiResponseTeacherHomeResponse.data.campusRollCallWindows[].effectiveTo` | `string(date)` | 否 | 生效结束日期（可空） | OpenAPI @Schema/注解 |

### `ApiResponseVoid`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `ApiResponseVoid.code` | `integer(int32)` | 否 | 业务状态码 | 字段名+类型推断 |
| `ApiResponseVoid.message` | `string` | 否 | 业务消息 | 字段名+类型推断 |
| `ApiResponseVoid.data` | `object` | 否 | 业务数据 | 字段名+类型推断 |

### `AttendanceItemResponse`

- 说明：点名明细行

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `AttendanceItemResponse` | `object` | 否 | 点名明细行 | OpenAPI schema |
| `AttendanceItemResponse.studentId` | `integer(int64)` | 否 | 学生ID（student.id） | OpenAPI @Schema/注解 |
| `AttendanceItemResponse.status` | `string` | 否 | 点名状态：PRESENT(已到) / ABSENT(未到) / LEAVE(请假) | OpenAPI @Schema/注解 |

### `AttendanceLatestResponse`

- 说明：最近一次点名记录（若无记录则 data 为 null）

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `AttendanceLatestResponse` | `object` | 否 | 最近一次点名记录（若无记录则 data 为 null） | OpenAPI schema |
| `AttendanceLatestResponse.attendanceRecordId` | `integer(int64)` | 否 | 点名提交记录ID（attendance_record.id） | OpenAPI @Schema/注解 |
| `AttendanceLatestResponse.courseSessionId` | `integer(int64)` | 否 | 点名对应课节ID（course_session.id，可为空） | OpenAPI @Schema/注解 |
| `AttendanceLatestResponse.submittedAt` | `string(date-time)` | 否 | 提交时间 | OpenAPI @Schema/注解 |
| `AttendanceLatestResponse.hasSubmittedToday` | `boolean` | 否 | 最近一次提交是否发生在当日（按系统默认时区的日历日） | OpenAPI @Schema/注解 |
| `AttendanceLatestResponse.items` | `array<AttendanceItemResponse>` | 否 | 点名明细列表 | OpenAPI @Schema/注解 |
| `AttendanceLatestResponse.items[]` | `array<AttendanceItemResponse>` | 否 | 点名明细列表 | OpenAPI schema |
| `AttendanceLatestResponse.items[]` | `object` | 否 | 点名明细行 | OpenAPI schema |
| `AttendanceLatestResponse.items[].studentId` | `integer(int64)` | 否 | 学生ID（student.id） | OpenAPI @Schema/注解 |
| `AttendanceLatestResponse.items[].status` | `string` | 否 | 点名状态：PRESENT(已到) / ABSENT(未到) / LEAVE(请假) | OpenAPI @Schema/注解 |

### `AttendanceSubmitRequest`

- 说明：提交点名请求

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `AttendanceSubmitRequest` | `object` | 否 | 提交点名请求 | OpenAPI schema |
| `AttendanceSubmitRequest.courseSessionId` | `integer(int64)` | 否 | 课节ID（对应 course_session.id）。可为空（表示不按课节维度点名） | OpenAPI @Schema/注解 |
| `AttendanceSubmitRequest.items` | `array<Line>` | 是 | 点名明细列表（必须包含本课应到学生的每一条） | OpenAPI @Schema/注解 |
| `AttendanceSubmitRequest.items[]` | `array<Line>` | 是 | 点名明细列表（必须包含本课应到学生的每一条） | OpenAPI schema |
| `AttendanceSubmitRequest.items[].studentId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `AttendanceSubmitRequest.items[].name` | `string` | 是 | 名称 | 字段名+类型推断 |
| `AttendanceSubmitRequest.items[].homeroomClassId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |

### `CourseDetailResponse`

- 说明：课程详情信息

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `CourseDetailResponse` | `object` | 否 | 课程详情信息 | OpenAPI schema |
| `CourseDetailResponse.id` | `integer(int64)` | 否 | 课程ID（course.id） | OpenAPI @Schema/注解 |
| `CourseDetailResponse.name` | `string` | 否 | 课程名称 | OpenAPI @Schema/注解 |
| `CourseDetailResponse.location` | `string` | 否 | 上课地点 | OpenAPI @Schema/注解 |
| `CourseDetailResponse.campusId` | `integer(int64)` | 否 | 校区ID（campus.id） | OpenAPI @Schema/注解 |
| `CourseDetailResponse.status` | `string` | 否 | 课程状态 | OpenAPI @Schema/注解 |
| `CourseDetailResponse.remark` | `string` | 否 | 备注 | OpenAPI @Schema/注解 |
| `CourseDetailResponse.sessions` | `array<CourseSessionResponse>` | 否 | 课程的课节列表 | OpenAPI @Schema/注解 |
| `CourseDetailResponse.sessions[]` | `array<CourseSessionResponse>` | 否 | 课程的课节列表 | OpenAPI schema |
| `CourseDetailResponse.sessions[]` | `object` | 否 | 课节时间信息 | OpenAPI schema |
| `CourseDetailResponse.sessions[].id` | `integer(int64)` | 否 | 课节ID（course_session.id） | OpenAPI @Schema/注解 |
| `CourseDetailResponse.sessions[].startAt` | `string(date-time)` | 否 | 课节开始时间 | OpenAPI @Schema/注解 |
| `CourseDetailResponse.sessions[].endAt` | `string(date-time)` | 否 | 课节结束时间 | OpenAPI @Schema/注解 |
| `CourseDetailResponse.teachers` | `array<CourseTeacherRefResponse>` | 否 | 课程绑定教师列表 | OpenAPI @Schema/注解 |
| `CourseDetailResponse.teachers[]` | `array<CourseTeacherRefResponse>` | 否 | 课程绑定教师列表 | OpenAPI schema |
| `CourseDetailResponse.teachers[]` | `object` | 否 | 课程教师引用信息 | OpenAPI schema |
| `CourseDetailResponse.teachers[].teacherId` | `integer(int64)` | 否 | 教师ID（teacher.id） | OpenAPI @Schema/注解 |
| `CourseDetailResponse.teachers[].role` | `string` | 否 | 课程中的角色（PRIMARY/ROLL_CALL/SUPPLEMENTARY） | OpenAPI @Schema/注解 |
| `CourseDetailResponse.teachers[].name` | `string` | 否 | 教师姓名 | OpenAPI @Schema/注解 |

### `CourseRosterRequest`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `CourseRosterRequest.studentIds` | `array<integer(int64)>` | 是 | 数组列表 | 字段名+类型推断 |
| `CourseRosterRequest.studentIds[]` | `array<integer(int64)>` | 是 | 数组元素 | OpenAPI schema |
| `CourseRosterRequest.studentIds[]` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |

### `CourseSessionResponse`

- 说明：课节时间信息

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `CourseSessionResponse` | `object` | 否 | 课节时间信息 | OpenAPI schema |
| `CourseSessionResponse.id` | `integer(int64)` | 否 | 课节ID（course_session.id） | OpenAPI @Schema/注解 |
| `CourseSessionResponse.startAt` | `string(date-time)` | 否 | 课节开始时间 | OpenAPI @Schema/注解 |
| `CourseSessionResponse.endAt` | `string(date-time)` | 否 | 课节结束时间 | OpenAPI @Schema/注解 |

### `CourseStudentRowResponse`

- 说明：课程学生名单行信息

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `CourseStudentRowResponse` | `object` | 否 | 课程学生名单行信息 | OpenAPI schema |
| `CourseStudentRowResponse.studentId` | `integer(int64)` | 否 | 学生ID（student.id） | OpenAPI @Schema/注解 |
| `CourseStudentRowResponse.studentName` | `string` | 否 | 学生姓名 | OpenAPI @Schema/注解 |
| `CourseStudentRowResponse.homeroomClassId` | `integer(int64)` | 否 | 行政班ID（homeroom_class.id） | OpenAPI @Schema/注解 |
| `CourseStudentRowResponse.homeroomClassName` | `string` | 否 | 行政班名称 | OpenAPI @Schema/注解 |
| `CourseStudentRowResponse.lastAttendanceStatus` | `string` | 否 | 最近点名状态（含未到/请假/已到等按系统口径） | OpenAPI @Schema/注解 |

### `CourseTeacherAssignRequest`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `CourseTeacherAssignRequest.teacherId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `CourseTeacherAssignRequest.role` | `string` | 是 | 角色 | 字段名+类型推断 |

### `CourseTeacherRefResponse`

- 说明：课程教师引用信息

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `CourseTeacherRefResponse` | `object` | 否 | 课程教师引用信息 | OpenAPI schema |
| `CourseTeacherRefResponse.teacherId` | `integer(int64)` | 否 | 教师ID（teacher.id） | OpenAPI @Schema/注解 |
| `CourseTeacherRefResponse.role` | `string` | 否 | 课程中的角色（PRIMARY/ROLL_CALL/SUPPLEMENTARY） | OpenAPI @Schema/注解 |
| `CourseTeacherRefResponse.name` | `string` | 否 | 教师姓名 | OpenAPI @Schema/注解 |

### `CourseWeekItemResponse`

- 说明：周课表聚合项

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `CourseWeekItemResponse` | `object` | 否 | 周课表聚合项 | OpenAPI schema |
| `CourseWeekItemResponse.id` | `integer(int64)` | 否 | 课程ID（course.id） | OpenAPI @Schema/注解 |
| `CourseWeekItemResponse.name` | `string` | 否 | 课程名称 | OpenAPI @Schema/注解 |
| `CourseWeekItemResponse.location` | `string` | 否 | 上课地点 | OpenAPI @Schema/注解 |
| `CourseWeekItemResponse.campusId` | `integer(int64)` | 否 | 校区ID（campus.id） | OpenAPI @Schema/注解 |
| `CourseWeekItemResponse.sessionsInWeek` | `array<CourseSessionResponse>` | 否 | 本周的课节列表 | OpenAPI @Schema/注解 |
| `CourseWeekItemResponse.sessionsInWeek[]` | `array<CourseSessionResponse>` | 否 | 本周的课节列表 | OpenAPI schema |
| `CourseWeekItemResponse.sessionsInWeek[]` | `object` | 否 | 课节时间信息 | OpenAPI schema |
| `CourseWeekItemResponse.sessionsInWeek[].id` | `integer(int64)` | 否 | 课节ID（course_session.id） | OpenAPI @Schema/注解 |
| `CourseWeekItemResponse.sessionsInWeek[].startAt` | `string(date-time)` | 否 | 课节开始时间 | OpenAPI @Schema/注解 |
| `CourseWeekItemResponse.sessionsInWeek[].endAt` | `string(date-time)` | 否 | 课节结束时间 | OpenAPI @Schema/注解 |
| `CourseWeekItemResponse.hasAttendanceRecord` | `boolean` | 否 | 是否已经有周维度点名记录 | OpenAPI @Schema/注解 |

### `HomeroomClassCreateRequest`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `HomeroomClassCreateRequest.name` | `string` | 是 | 名称 | 字段名+类型推断 |
| `HomeroomClassCreateRequest.homeroomTeacherId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |

### `HomeroomClassListItemResponse`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `HomeroomClassListItemResponse.id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `HomeroomClassListItemResponse.name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `HomeroomClassListItemResponse.homeroomTeacherId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |

### `HomeroomClassUpdateRequest`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `HomeroomClassUpdateRequest.name` | `string` | 是 | 名称 | 字段名+类型推断 |
| `HomeroomClassUpdateRequest.homeroomTeacherId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |

### `Line`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `Line.studentId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `Line.name` | `string` | 是 | 名称 | 字段名+类型推断 |
| `Line.homeroomClassId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |

### `LocalTime`

- 说明：点名窗口结束时间

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `LocalTime` | `object` | 否 | 点名窗口结束时间 | OpenAPI schema |
| `LocalTime.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `LocalTime.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `LocalTime.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `LocalTime.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |

### `LoginRequest`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `LoginRequest.phone` | `string` | 是 | 手机号 | 字段名+类型推断 |
| `LoginRequest.code` | `string` | 是 | 业务状态码 | 字段名+类型推断 |

### `LoginResponse`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `LoginResponse.id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `LoginResponse.phone` | `string` | 否 | 手机号 | 字段名+类型推断 |
| `LoginResponse.username` | `string` | 否 | 用户名 | 字段名+类型推断 |
| `LoginResponse.token` | `string` | 否 | 登录令牌 | 字段名+类型推断 |
| `LoginResponse.role` | `string` | 否 | 角色 | 字段名+类型推断 |
| `LoginResponse.campusId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `LoginResponse.campusName` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `LoginResponse.name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `LoginResponse.teacherId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `LoginResponse.adminUserId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |

### `MeResponse`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `MeResponse.id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `MeResponse.phone` | `string` | 否 | 手机号 | 字段名+类型推断 |
| `MeResponse.username` | `string` | 否 | 用户名 | 字段名+类型推断 |
| `MeResponse.role` | `string` | 否 | 角色 | 字段名+类型推断 |
| `MeResponse.campusId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `MeResponse.campusName` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `MeResponse.name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `MeResponse.teacherId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `MeResponse.adminUserId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |

### `PagedRowsHomeroomClassListItemResponse`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `PagedRowsHomeroomClassListItemResponse.items` | `array<HomeroomClassListItemResponse>` | 否 | 列表项 | 字段名+类型推断 |
| `PagedRowsHomeroomClassListItemResponse.items[]` | `array<HomeroomClassListItemResponse>` | 否 | 数组元素 | OpenAPI schema |
| `PagedRowsHomeroomClassListItemResponse.items[].id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `PagedRowsHomeroomClassListItemResponse.items[].name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `PagedRowsHomeroomClassListItemResponse.items[].homeroomTeacherId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `PagedRowsHomeroomClassListItemResponse.totalElements` | `integer(int64)` | 否 | 总记录数 | 字段名+类型推断 |
| `PagedRowsHomeroomClassListItemResponse.totalPages` | `integer(int32)` | 否 | 总页数 | 字段名+类型推断 |
| `PagedRowsHomeroomClassListItemResponse.page` | `integer(int32)` | 否 | 页码（从0开始） | 字段名+类型推断 |
| `PagedRowsHomeroomClassListItemResponse.size` | `integer(int32)` | 否 | 分页大小 | 字段名+类型推断 |

### `PagedRowsStudentEntity`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `PagedRowsStudentEntity.items` | `array<StudentEntity>` | 否 | 列表项 | 字段名+类型推断 |
| `PagedRowsStudentEntity.items[]` | `array<StudentEntity>` | 否 | 数组元素 | OpenAPI schema |
| `PagedRowsStudentEntity.items[].id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `PagedRowsStudentEntity.items[].campusId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `PagedRowsStudentEntity.items[].homeroomClassId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `PagedRowsStudentEntity.items[].name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `PagedRowsStudentEntity.items[].externalStudentId` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `PagedRowsStudentEntity.items[].externalSource` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `PagedRowsStudentEntity.items[].createdAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `PagedRowsStudentEntity.items[].updatedAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `PagedRowsStudentEntity.items[].deletedAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `PagedRowsStudentEntity.totalElements` | `integer(int64)` | 否 | 总记录数 | 字段名+类型推断 |
| `PagedRowsStudentEntity.totalPages` | `integer(int32)` | 否 | 总页数 | 字段名+类型推断 |
| `PagedRowsStudentEntity.page` | `integer(int32)` | 否 | 页码（从0开始） | 字段名+类型推断 |
| `PagedRowsStudentEntity.size` | `integer(int32)` | 否 | 分页大小 | 字段名+类型推断 |

### `RollCallOverviewRowResponse`

- 说明：点名总控列表行信息

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `RollCallOverviewRowResponse` | `object` | 否 | 点名总控列表行信息 | OpenAPI schema |
| `RollCallOverviewRowResponse.courseId` | `integer(int64)` | 否 | 课程ID | OpenAPI @Schema/注解 |
| `RollCallOverviewRowResponse.courseName` | `string` | 否 | 课程名称 | OpenAPI @Schema/注解 |
| `RollCallOverviewRowResponse.sessionId` | `integer(int64)` | 否 | 课节ID（course_session.id） | OpenAPI @Schema/注解 |
| `RollCallOverviewRowResponse.sessionStartAt` | `string(date-time)` | 否 | 课节开始时间 | OpenAPI @Schema/注解 |
| `RollCallOverviewRowResponse.sessionEndAt` | `string(date-time)` | 否 | 课节结束时间 | OpenAPI @Schema/注解 |
| `RollCallOverviewRowResponse.rollCallCompleted` | `boolean` | 否 | 是否已完成点名 | OpenAPI @Schema/注解 |
| `RollCallOverviewRowResponse.absentCount` | `integer(int32)` | 否 | 缺勤人数（未到/请假等按系统口径汇总） | OpenAPI @Schema/注解 |

### `RollCallWindowResponse`

- 说明：点名时间窗信息

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `RollCallWindowResponse` | `object` | 否 | 点名时间窗信息 | OpenAPI schema |
| `RollCallWindowResponse.id` | `integer(int64)` | 否 | 时间窗ID（campus_roll_call_window.id） | OpenAPI @Schema/注解 |
| `RollCallWindowResponse.weekday` | `integer(int32)` | 否 | 星期几：1=周一 … 7=周日 | OpenAPI @Schema/注解 |
| `RollCallWindowResponse.windowStart` | `LocalTime` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `RollCallWindowResponse.windowStart` | `object` | 否 | 点名窗口结束时间 | OpenAPI schema |
| `RollCallWindowResponse.windowStart.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `RollCallWindowResponse.windowStart.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `RollCallWindowResponse.windowStart.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `RollCallWindowResponse.windowStart.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `RollCallWindowResponse.windowEnd` | `LocalTime` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `RollCallWindowResponse.windowEnd` | `object` | 否 | 点名窗口结束时间 | OpenAPI schema |
| `RollCallWindowResponse.windowEnd.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `RollCallWindowResponse.windowEnd.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `RollCallWindowResponse.windowEnd.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `RollCallWindowResponse.windowEnd.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `RollCallWindowResponse.effectiveFrom` | `string(date)` | 否 | 生效开始日期（可空：长期有效） | OpenAPI @Schema/注解 |
| `RollCallWindowResponse.effectiveTo` | `string(date)` | 否 | 生效结束日期（可空） | OpenAPI @Schema/注解 |

### `RollCallWindowUpsertRequest`

- 说明：点名时间窗新增/更新请求

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `RollCallWindowUpsertRequest` | `object` | 否 | 点名时间窗新增/更新请求 | OpenAPI schema |
| `RollCallWindowUpsertRequest.weekday` | `integer(int32)` | 是 | 星期几：1=周一 ... 7=周日 | OpenAPI @Schema/注解 |
| `RollCallWindowUpsertRequest.windowStart` | `LocalTime` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `RollCallWindowUpsertRequest.windowStart` | `object` | 是 | 点名窗口结束时间 | OpenAPI schema |
| `RollCallWindowUpsertRequest.windowStart.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `RollCallWindowUpsertRequest.windowStart.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `RollCallWindowUpsertRequest.windowStart.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `RollCallWindowUpsertRequest.windowStart.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `RollCallWindowUpsertRequest.windowEnd` | `LocalTime` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `RollCallWindowUpsertRequest.windowEnd` | `object` | 是 | 点名窗口结束时间 | OpenAPI schema |
| `RollCallWindowUpsertRequest.windowEnd.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `RollCallWindowUpsertRequest.windowEnd.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `RollCallWindowUpsertRequest.windowEnd.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `RollCallWindowUpsertRequest.windowEnd.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `RollCallWindowUpsertRequest.effectiveFrom` | `string(date)` | 否 | 生效开始日期（可空：长期有效） | OpenAPI @Schema/注解 |
| `RollCallWindowUpsertRequest.effectiveTo` | `string(date)` | 否 | 生效结束日期（可空：长期有效） | OpenAPI @Schema/注解 |

### `SendCodeRequest`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `SendCodeRequest.phone` | `string` | 是 | 手机号 | 字段名+类型推断 |

### `StudentBatchUpdateRequest`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `StudentBatchUpdateRequest.items` | `array<Line>` | 是 | 列表项 | 字段名+类型推断 |
| `StudentBatchUpdateRequest.items[]` | `array<Line>` | 是 | 数组元素 | OpenAPI schema |
| `StudentBatchUpdateRequest.items[].studentId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |
| `StudentBatchUpdateRequest.items[].name` | `string` | 是 | 名称 | 字段名+类型推断 |
| `StudentBatchUpdateRequest.items[].homeroomClassId` | `integer(int64)` | 是 | 按字段语义推断 | 字段名+类型推断 |

### `StudentEntity`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `StudentEntity.id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `StudentEntity.campusId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `StudentEntity.homeroomClassId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `StudentEntity.name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `StudentEntity.externalStudentId` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `StudentEntity.externalSource` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `StudentEntity.createdAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `StudentEntity.updatedAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `StudentEntity.deletedAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |

### `TeacherCreateRequest`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `TeacherCreateRequest.name` | `string` | 是 | 名称 | 字段名+类型推断 |
| `TeacherCreateRequest.phone` | `string` | 是 | 手机号 | 字段名+类型推断 |

### `TeacherEntity`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `TeacherEntity.id` | `integer(int64)` | 否 | 主键ID | 字段名+类型推断 |
| `TeacherEntity.campusId` | `integer(int64)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `TeacherEntity.name` | `string` | 否 | 名称 | 字段名+类型推断 |
| `TeacherEntity.phone` | `string` | 否 | 手机号 | 字段名+类型推断 |
| `TeacherEntity.externalTeacherId` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `TeacherEntity.externalSource` | `string` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `TeacherEntity.createdAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `TeacherEntity.updatedAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `TeacherEntity.deletedAt` | `string(date-time)` | 否 | 按字段语义推断 | 字段名+类型推断 |

### `TeacherHomeResponse`

- 说明：教师端首页返回

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `TeacherHomeResponse` | `object` | 否 | 教师端首页返回 | OpenAPI schema |
| `TeacherHomeResponse.weekStart` | `string(date)` | 否 | 周开始日期（周一） | OpenAPI @Schema/注解 |
| `TeacherHomeResponse.weekCourses` | `array<CourseWeekItemResponse>` | 否 | 本周课程聚合列表 | OpenAPI @Schema/注解 |
| `TeacherHomeResponse.weekCourses[]` | `array<CourseWeekItemResponse>` | 否 | 本周课程聚合列表 | OpenAPI schema |
| `TeacherHomeResponse.weekCourses[]` | `object` | 否 | 周课表聚合项 | OpenAPI schema |
| `TeacherHomeResponse.weekCourses[].id` | `integer(int64)` | 否 | 课程ID（course.id） | OpenAPI @Schema/注解 |
| `TeacherHomeResponse.weekCourses[].name` | `string` | 否 | 课程名称 | OpenAPI @Schema/注解 |
| `TeacherHomeResponse.weekCourses[].location` | `string` | 否 | 上课地点 | OpenAPI @Schema/注解 |
| `TeacherHomeResponse.weekCourses[].campusId` | `integer(int64)` | 否 | 校区ID（campus.id） | OpenAPI @Schema/注解 |
| `TeacherHomeResponse.weekCourses[].sessionsInWeek` | `array<CourseSessionResponse>` | 否 | 本周的课节列表 | OpenAPI @Schema/注解 |
| `TeacherHomeResponse.weekCourses[].sessionsInWeek[]` | `array<CourseSessionResponse>` | 否 | 本周的课节列表 | OpenAPI schema |
| `TeacherHomeResponse.weekCourses[].sessionsInWeek[]` | `object` | 否 | 课节时间信息 | OpenAPI schema |
| `TeacherHomeResponse.weekCourses[].sessionsInWeek[].id` | `integer(int64)` | 否 | 课节ID（course_session.id） | OpenAPI @Schema/注解 |
| `TeacherHomeResponse.weekCourses[].sessionsInWeek[].startAt` | `string(date-time)` | 否 | 课节开始时间 | OpenAPI @Schema/注解 |
| `TeacherHomeResponse.weekCourses[].sessionsInWeek[].endAt` | `string(date-time)` | 否 | 课节结束时间 | OpenAPI @Schema/注解 |
| `TeacherHomeResponse.weekCourses[].hasAttendanceRecord` | `boolean` | 否 | 是否已经有周维度点名记录 | OpenAPI @Schema/注解 |
| `TeacherHomeResponse.campusRollCallWindows` | `array<RollCallWindowResponse>` | 否 | 本校区点名时间窗列表 | OpenAPI @Schema/注解 |
| `TeacherHomeResponse.campusRollCallWindows[]` | `array<RollCallWindowResponse>` | 否 | 本校区点名时间窗列表 | OpenAPI schema |
| `TeacherHomeResponse.campusRollCallWindows[]` | `object` | 否 | 点名时间窗信息 | OpenAPI schema |
| `TeacherHomeResponse.campusRollCallWindows[].id` | `integer(int64)` | 否 | 时间窗ID（campus_roll_call_window.id） | OpenAPI @Schema/注解 |
| `TeacherHomeResponse.campusRollCallWindows[].weekday` | `integer(int32)` | 否 | 星期几：1=周一 … 7=周日 | OpenAPI @Schema/注解 |
| `TeacherHomeResponse.campusRollCallWindows[].windowStart` | `LocalTime` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `TeacherHomeResponse.campusRollCallWindows[].windowStart` | `object` | 否 | 点名窗口结束时间 | OpenAPI schema |
| `TeacherHomeResponse.campusRollCallWindows[].windowStart.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `TeacherHomeResponse.campusRollCallWindows[].windowStart.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `TeacherHomeResponse.campusRollCallWindows[].windowStart.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `TeacherHomeResponse.campusRollCallWindows[].windowStart.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `TeacherHomeResponse.campusRollCallWindows[].windowEnd` | `LocalTime` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `TeacherHomeResponse.campusRollCallWindows[].windowEnd` | `object` | 否 | 点名窗口结束时间 | OpenAPI schema |
| `TeacherHomeResponse.campusRollCallWindows[].windowEnd.hour` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `TeacherHomeResponse.campusRollCallWindows[].windowEnd.minute` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `TeacherHomeResponse.campusRollCallWindows[].windowEnd.second` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `TeacherHomeResponse.campusRollCallWindows[].windowEnd.nano` | `integer(int32)` | 否 | 按字段语义推断 | 字段名+类型推断 |
| `TeacherHomeResponse.campusRollCallWindows[].effectiveFrom` | `string(date)` | 否 | 生效开始日期（可空：长期有效） | OpenAPI @Schema/注解 |
| `TeacherHomeResponse.campusRollCallWindows[].effectiveTo` | `string(date)` | 否 | 生效结束日期（可空） | OpenAPI @Schema/注解 |

### `TeacherTodaySessionResponse`

- 说明：教师端当日课节信息

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `TeacherTodaySessionResponse` | `object` | 否 | 教师端当日课节信息 | OpenAPI schema |
| `TeacherTodaySessionResponse.courseId` | `integer(int64)` | 否 | 课程ID（course.id） | OpenAPI @Schema/注解 |
| `TeacherTodaySessionResponse.courseName` | `string` | 否 | 课程名称 | OpenAPI @Schema/注解 |
| `TeacherTodaySessionResponse.location` | `string` | 否 | 上课地点 | OpenAPI @Schema/注解 |
| `TeacherTodaySessionResponse.sessionId` | `integer(int64)` | 否 | 课节ID（course_session.id） | OpenAPI @Schema/注解 |
| `TeacherTodaySessionResponse.sessionStartAt` | `string(date-time)` | 否 | 课节开始时间 | OpenAPI @Schema/注解 |
| `TeacherTodaySessionResponse.sessionEndAt` | `string(date-time)` | 否 | 课节结束时间 | OpenAPI @Schema/注解 |
| `TeacherTodaySessionResponse.rollCallCompleted` | `boolean` | 否 | 当日该课节是否已有点名完成记录 | OpenAPI @Schema/注解 |

### `TeacherUpdateRequest`

| 字段路径 | 类型 | 必填 | 中文释意 | 来源 |
|---|---|---|---|---|
| `TeacherUpdateRequest.name` | `string` | 是 | 名称 | 字段名+类型推断 |
| `TeacherUpdateRequest.phone` | `string` | 是 | 手机号 | 字段名+类型推断 |
