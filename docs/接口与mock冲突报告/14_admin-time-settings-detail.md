# 接口与 Mock 冲突：`/admin/time-settings/[detail]`

## 1. 冲突等级

`高`

这页是时间设置详情页，和 `15_admin-time-settings-picker` 成对工作。

如果链路职责分错，会直接出现两个问题：

- `14` 的“保存上课时间 / 保存点名时间”变成假按钮
- `15` 的 picker 越权直接提交，页面语义和真实交互都错

## 2. 页面职责

这组页面的正确职责必须是：

- `14`：展示当前时间范围、承接 picker 结果、执行最终保存
- `15`：只做时间选择，不直接提交

也就是：

- `15` 选择开始 / 结束时间
- `15` 把 `draftStartTime / draftEndTime` 回传给 `14`
- `14` 回显新的时间范围
- `14` 点击保存后才真正提交后端

## 3. 当前真实对象

当前真实链路底层依赖的是课节时间设置对象：

- `getAdminTimeSettingDetail(settingKey)`
- `getAdminTimePicker(settingKey)`
- `fetchAdminTimeSettingsSessions`

底层现在已经不再依赖 `courseSessionId` 作为保存入参。

当前保存实际上课时间使用的是：

- `campusId`
- `targetDate`
- `startTime`
- `endTime`

## 4. 保存上课时间的真实语义

`14` 页点击“保存上课时间”时，前端提交的是：

- `campusId`
- `targetDate`
- `startTime`
- `endTime`

- 根据 `campusId + targetDate` 定位当天当前校区的课节范围
- 查询“当天当前校区”的全部课节
- 批量更新这些课节的 `actualStartTime / actualEndTime`

所以当前语义已经不是：

- 只改单个课节

而是：

- 改“当天当前校区”的全部实际上课时间

## 5. 后端处理链路

真实后端入口：

- `PUT /api/admin/campuses/{campusId}/actual-time`
- `DELETE /api/admin/campuses/{campusId}/actual-time?targetDate=...`

对应代码：

- `AdminController.updateActualTime`
- `CourseSessionTimeSettingService.updateActualTime`
- `CourseSessionTimeSettingService.resetActualTime`

### 5.1 保存时

后端现在会：

1. 校验 `startTime < endTime`
2. 用 `campusId + targetDate` 直接定位目标范围
3. 查询“当天当前校区”的全部课节
4. 一次性批量查询这些课节已有的 override
6. 统一写入：
   - `actualStartTime`
   - `actualEndTime`
7. 批量 `saveAll`
8. 仍返回锚点课节的详情响应给前端

### 5.2 恢复默认时

后端现在会：

1. 同样先解析锚点课节对应的校区和日期
2. 找出“当天当前校区”的全部课节 override
3. 统一清空：
   - `actualStartTime`
   - `actualEndTime`
4. 空 override 直接批量删除
5. 非空 override 批量保留

## 6. 落库范围

当前保存上课时间改的库表和字段是：

- 表：`course_session_time_setting`
- 关联键：`course_session_id`
- 字段：
  - `actual_start_time`
  - `actual_end_time`

和之前不同的是：

- 以前只会更新一条 `course_session_id`
- 现在会批量更新“当天当前校区”的全部相关 `course_session_id`

## 7. 性能约束

当天可能有四五十条课节时，后端必须避免逐条查库。

当前实现已经按批量方式处理：

- 1 次锚点课节查询
- 1 次当天当前校区课节查询
- 1 次 override 批量查询
- 1 次 `saveAll` 或 `deleteAllInBatch`

禁止退回到：

- 每个课节单独 `findByCourseSessionId`
- 每个课节单独 `save`

否则很容易变成 N+1 查询和 N 次写入。

## 8. 点名时间的边界

这页的“保存点名时间”仍然不是课节级保存，而是校区规则保存：

- `14` 提交
- `15` 只选择
- 后端改的是校区统一点名窗口规则

所以：

- 实际上课时间：当天当前校区课节批量更新
- 点名时间：校区规则更新

两条链路不能混。

## 9. 复核备注

后续复核 `14/15` 时，必须按下面标准判断：

- `15` 只负责 picker 选择和回传草稿时间
- `14` 必须负责最终保存
- “保存上课时间”不能再被理解成单课节写入
- “保存上课时间”的真实语义是：更新当天当前校区全部课节的实际上课时间

如果再出现：

- `15` 直接提交
- `14` 保存按钮无动作
- “保存上课时间”重新退化成只改单条课节

则应直接判定 `14/15` 不通过。
