# 登录与选择校区接口说明

本文档说明 2026-04-10 起生效的登录流程更新，包括：

- `/api/auth/login` 登录接口的新行为
- `/api/auth/select-campus` 选择校区并签发正式 token 的新接口

## 1. 流程概览

当前手机号登录分为两种情况：

1. 手机号只匹配到 1 个账号
   - 直接登录成功
   - 直接返回正式 `token`

2. 手机号匹配到多个管理员账号
   - 不直接返回正式 `token`
   - 返回 `selectionRequired=true`
   - 返回 `selectionToken` 和 `campusOptions`
   - 前端引导用户选择校区
   - 前端调用 `/api/auth/select-campus`
   - 后端按选中的 `adminUserId` 签发正式 `token`

补充说明：

- 当前仅对“多个管理员账号”的场景走校区选择流程
- 若手机号同时命中教师和管理员，后端仍返回业务错误
- 正式业务 token 仍然绑定单个 `campusId` 和单个 `adminUserId`
- `selectionToken` 是短时有效的一次性选择凭证，默认有效期 5 分钟

## 2. 通用响应结构

所有接口统一返回：

```json
{
  "code": 0,
  "message": "OK",
  "data": {}
}
```

字段说明：

- `code`
  - `0`：成功
  - `1`：普通业务失败
  - `40101`：token 或 selectionToken 无效/过期
- `message`：响应说明
- `data`：业务数据，失败时通常为 `null`

## 3. POST /api/auth/login

### 3.1 接口说明

- 路径：`/api/auth/login`
- 方法：`POST`
- 鉴权：否
- 作用：手机号 + 验证码登录；如果手机号对应多个管理员账号，则返回待选择校区列表

### 3.2 请求体

```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

字段说明：

- `phone` `string` 必填
  - 正则：`^1\d{10}$`
  - 含义：登录手机号
- `code` `string` 必填
  - 正则：`^\d{4,6}$`
  - 含义：短信验证码

### 3.3 成功响应一：手机号只匹配 1 个账号

适用场景：

- 手机号只命中 1 个教师账号，或
- 手机号只命中 1 个管理员账号

响应示例：

```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "id": 9001,
    "phone": "13800138000",
    "username": "a_13800138000",
    "token": "dm_7d2f4d3dcb074a72a0a8475c78d9b281",
    "role": "ADMIN",
    "campusId": 22,
    "campusName": "南山校区",
    "name": "张老师",
    "teacherId": null,
    "adminUserId": 152,
    "selectionRequired": false,
    "selectionToken": null,
    "campusOptions": null
  }
}
```

字段说明：

- `id` `long`
  - 系统用户 ID
  - 来源：`users.id`
- `phone` `string`
  - 登录手机号
- `username` `string`
  - 系统用户名
  - 管理员通常为 `a_手机号`
  - 教师通常为 `t_手机号`
- `token` `string`
  - 正式登录 token
  - 后续业务接口放在 `Authorization: Bearer <token>`
- `role` `string`
  - `ADMIN` 或 `TEACHER`
- `campusId` `long|null`
  - 当前登录校区 ID
- `campusName` `string|null`
  - 当前登录校区名称
- `name` `string`
  - 当前身份显示名称
- `teacherId` `long|null`
  - 教师身份时有值
- `adminUserId` `long|null`
  - 管理员身份时有值
- `selectionRequired` `boolean`
  - 是否还需要前端继续选择校区
  - 单账号直登时固定为 `false`
- `selectionToken` `string|null`
  - 单账号直登时为 `null`
- `campusOptions` `array|null`
  - 单账号直登时为 `null`

### 3.4 成功响应二：手机号匹配多个管理员账号

适用场景：

- 手机号命中多个 `admin_user`
- 这些管理员账号分别属于不同校区或不同管理员记录

响应示例：

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
    "selectionToken": "sel_b5d7f13f3d6b4df8b63f0ec9b8d09c31",
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

字段说明：

- `selectionRequired` `boolean`
  - 固定为 `true`
  - 前端应进入“选择校区”页面，而不是直接进入业务页
- `selectionToken` `string`
  - 选择校区阶段使用的临时凭证
  - 不是正式业务 token
  - 默认有效期 5 分钟
- `campusOptions` `LoginCampusOption[]`
  - 当前手机号可选的管理员身份列表

`campusOptions` 子项字段说明：

- `campusId` `long`
  - 校区 ID
- `campusName` `string|null`
  - 校区名称
- `adminUserId` `long`
  - 管理员记录 ID
- `adminName` `string`
  - 管理员名称

### 3.5 失败响应

常见失败场景：

- 验证码错误
- 验证码已过期
- 手机号未匹配到任何账号
- 手机号同时匹配教师和管理员
- 一个手机号匹配到多个教师账号

示例：

```json
{
  "code": 1,
  "message": "account not found",
  "data": null
}
```

可能的 `message` 包括：

- `invalid verification code`
- `code expired or not sent`
- `account not found`
- `phone matches both teacher and admin accounts`
- `multiple teacher accounts found for this phone`

## 4. POST /api/auth/select-campus

### 4.1 接口说明

- 路径：`/api/auth/select-campus`
- 方法：`POST`
- 鉴权：否
- 作用：在登录接口返回多个管理员候选校区时，提交所选的 `adminUserId`，换取正式业务 token

说明：

- 该接口必须和 `/api/auth/login` 返回的 `selectionToken` 配合使用
- 若只登录不选校区，不会拿到正式 token
- 该接口返回的 token 才能访问后续业务接口

### 4.2 请求体

```json
{
  "selectionToken": "sel_b5d7f13f3d6b4df8b63f0ec9b8d09c31",
  "adminUserId": 61
}
```

字段说明：

- `selectionToken` `string` 必填
  - 来源：`/api/auth/login` 返回的 `data.selectionToken`
- `adminUserId` `long` 必填
  - 来源：`/api/auth/login` 返回的 `data.campusOptions[].adminUserId`

### 4.3 成功响应

响应示例：

```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "id": 9001,
    "phone": "13800138000",
    "username": "a_13800138000",
    "token": "dm_20e2a59f17ef48ca9e1fa83ee5d7a1f0",
    "role": "ADMIN",
    "campusId": 22,
    "campusName": "南山校区",
    "name": "李老师",
    "teacherId": null,
    "adminUserId": 61,
    "selectionRequired": false,
    "selectionToken": null,
    "campusOptions": null
  }
}
```

字段含义与 `/api/auth/login` 的“单账号直登成功响应”一致。

重点说明：

- 这里返回的是正式 token
- 该 token 对应单个 `campusId`
- 该 token 对应单个 `adminUserId`
- 后续管理员接口的权限判断以该 token 中绑定的校区身份为准

### 4.4 失败响应

常见失败场景：

- `selectionToken` 无效
- `selectionToken` 过期
- 所选 `adminUserId` 不属于该手机号对应的候选列表

示例一：

```json
{
  "code": 40101,
  "message": "Selection token expired",
  "data": null
}
```

示例二：

```json
{
  "code": 1,
  "message": "selected admin account not found for this phone",
  "data": null
}
```

## 5. 前端接入建议

建议前端按以下顺序接入：

1. 调用 `/api/auth/send-code`
2. 调用 `/api/auth/login`
3. 判断 `data.selectionRequired`
4. 若为 `false`
   - 直接取 `data.token`
   - 进入业务页面
5. 若为 `true`
   - 展示 `data.campusOptions`
   - 让用户选择校区
   - 调用 `/api/auth/select-campus`
   - 使用返回的 `data.token` 进入业务页面

## 6. 当前模型限制

当前实现中：

- `users.phone` 是全局唯一
- 同一手机号复用同一条 `users` 记录
- 但每次正式登录生成的 token 只绑定一个校区身份

因此更准确的理解是：

- 一个手机号对应一个系统用户 `users.id`
- 一个正式 token 对应一个校区身份
- 切换校区后，需要重新拿一张新的正式 token

不应理解为：

- 一个 token 同时拥有多个校区权限
- 一个请求内可以不带后端身份切换直接跨校区访问
