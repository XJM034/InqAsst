# 页面对比报告：`/admin/unarrived`

## 1. 先说结论

这页是当前另一个重灾区。mock 的逻辑是“按行政班找未到学生”，当前接口版却变成了“按课程课节看异常学生”。两者关注中心完全不同。

## 2. mock 页面到底在表达什么

mock 的未到名单页首先关心的是“人在哪个班”。

所以它的组织方式是：

- 先按行政班分组
- 再看这个班哪些学生没到
- 每个学生卡片里再写缺的是哪门课

这是一种“以学生/班级为中心”的异常视角。

## 3. 当前接口版实际做成了什么

当前实现主要在：

- `app/admin/unarrived/page.tsx`
- `components/app/admin-unarrived-client.tsx`
- `lib/services/mobile-app.ts` 中的 `getAdminUnarrivedData`

当前数据链路是：

- `fetchAdminAbsentStudents`
- `mapAdminUnarrivedData`

适配后页面被组织成：

- 按 `courseId:courseSessionId` 分组
- 组头显示课程名、时间、老师
- 组内再列该课节的异常学生

## 4. 页面展示差异

### 4.1 分组维度彻底变了

mock：

- 先看班

当前：

- 先看课

这会让管理员从“找班里的未到学生”变成“看某节课有哪些异常学生”。

### 4.2 学生卡片信息主次变了

mock 中学生卡片重点是：

- 学生是谁
- 属于哪个班
- 缺的是哪门课

当前页因为页面已经按课程分组，所以学生卡片更容易退成：

- 学生是谁
- 行政班是什么

“缺的是哪门课”被提前吸收到分组标题里了。

### 4.3 页面工作方式变了

mock 更适合行政班视角巡检。

当前更适合课程执行视角排查。

这两种视角都合理，但 mock 要的显然是前者。

## 5. mock 与实际接口数据差异

### 5.1 mock 数据来源

mock 使用：

- `adminUnarrivedData`
- `adminUnarrivedDataByCampus`

其结构天然支持按班级优先分组。

### 5.2 当前接口数据来源

当前使用：

- `getAdminUnarrivedData`
- `fetchAdminAbsentStudents`
- `mapAdminUnarrivedData`

当前 adapter 的核心分组依据是：

- `courseId:courseSessionId`

### 5.3 关键错位

只要分组基准还是课程课节，页面就不可能回到 mock 那个按行政班组织的形态。

因此这里不是调一下卡片文案就能解决，而是要先换页面聚合逻辑。

## 6. 对齐建议

- 把页面主分组恢复为行政班。
- 课程与课节信息下沉到学生项或次级说明。
- 如果真实接口原始结果是按课节给的，就需要在前端重聚合，不要直接按接口结构渲染。

## 7. 对齐时要重点核对的点

- 第一层标题是不是行政班，而不是课程名。
- 管理员是否能快速回答“哪个班还有哪些学生没到”。
- 同一个学生跨课节异常时，是否仍能符合 mock 的班级视角浏览方式。
