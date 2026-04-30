# 接口与 Mock 冲突：`/admin/home`

## 1. 先说结论

`/admin/home` 这页不是布局问题，而是“首页视图模型被映射错了”。

对照分支 `origin/XJM034/check-push-rules` 看，mock 基准页本身很简单：

- 顶部 3 个规则卡
- 中间老师设置 hero 区
- 底部 2 个常用入口卡

当前页视觉骨架大体还在，但代码里有 4 个明确问题：

1. `课程设置` badge 用错了字段。
2. `实际上课` 和 `今日代课` 两张规则卡的值被错误改写了。
3. 页面本地还保留了 mock 式 fallback 卡片。
4. 当前页读取数据时根本没有把 `campus` 传进 `getAdminHomeData()`。

所以这页的改法不是“重新设计”，而是把首页数据映射重新拉回 mock 分支语义，并且全部基于真实接口返回值完成。

还要补一个执行原则：

- 前端页面必须和 `origin/XJM034/check-push-rules` 保持一致。
- 这一页不要在当前代码上继续做局部修补式前端改造。
- 最稳妥的做法是直接复用 `XJM034/check-push-rules` 的页面布局与样式代码。
- 这里“复用”的范围，只限于页面布局样式层。
- 不复用 `XJM034/check-push-rules` 里的数据层、mock 数据、fallback 逻辑、页面取数逻辑。
- 当前分支需要修改的重点，仍然放在真实接口的数据获取层、adapter 映射层和去除 mock fallback 上。

## 2. 先看基准分支到底要什么

基准分支 `origin/XJM034/check-push-rules` 的页面代码在：

- `app/admin/home/page.tsx`

它的核心特征有两个：

### 2.1 页面直接消费 `home` 对象，不自己拼 fallback

基准页是直接渲染：

- `home.effectiveRules`
- `home.heroDescription`
- `home.entryCards`

页面本身不再额外定义一套“课程设置/时间设置”的本地兜底卡片。

### 2.2 `home` 对象的语义非常具体

mock 数据对象里，首页需要的值是：

- `effectiveRules[0].value = 实际上课时间范围`
- `effectiveRules[1].value = 点名时间范围`
- `effectiveRules[2].value = 今日代课的班级数 + 老师数`
- `entryCards[0].badge = 8 节生效`
- `entryCards[1].badge = 默认 / 锦江方案 / 高新方案`

也就是说，首页对象不是“统计总览”，而是“首页专用展示对象”。

## 3. 当前代码具体错在哪里

## 3.1 `mapAdminHomeData()` 用错字段

当前实现位置：

- [mobile-adapters.ts](/d:/proj/backproj/InqAsst/lib/services/mobile-adapters.ts:684)

当前映射里最关键的几行是：

- `effectiveRules[0].value` 用的是 `"按今日课节执行"` / `"暂无实际上课"`
- `effectiveRules[2].value` 用的是 `"有待跟进"` / `"暂无代课"`
- `entryCards[0].badge` 用的是 ``${payload.summary.rollCallWindowRuleCount} 节生效``

这里有 3 个具体问题。

### 问题 A：`实际上课` 不该展示“按今日课节执行”

真实接口 `AdminHomeSummaryDto` 其实已经给了：

- `actualClassTimeRange?: string | null`

定义位置：

- [mobile-schema.ts](/d:/proj/backproj/InqAsst/lib/services/mobile-schema.ts:140)

但当前 adapter 完全没用这个字段，而是自己写成了泛化文案。

结果就是 mock 分支里的：

- `15:50 - 17:20`

被改成了：

- `按今日课节执行`

这不是接口不够，而是前端没用对字段。

### 问题 B：`今日代课` 不该展示“有待跟进”

真实接口其实也已经给了：

- `todaySubstituteCourseCount?: number`
- `todaySubstituteTeacherCount?: number`

但当前 adapter 把这两个数放进了 `meta`，把主值写成了：

- `有待跟进`
- `暂无代课`

这和基准分支不一致。

基准分支需要的主值其实就是：

- `1 班级 · 1 老师`
- `0 班级 · 0 老师`

也就是说，这里不是“后端没给”，而是“前端主值和副值放反了”。

### 问题 C：`课程设置` badge 不该用 `rollCallWindowRuleCount`

当前代码：

- [mobile-adapters.ts](/d:/proj/backproj/InqAsst/lib/services/mobile-adapters.ts:729)

现在写的是：

```ts
badge: `${payload.summary.rollCallWindowRuleCount} 节生效`
```

这个字段语义是：

- 点名窗口规则条数

但首页这张卡在 mock 基准里表达的是：

- 今日生效课节数

真实接口里当前已经有更接近的字段：

- `sessionCountToday`

所以这张卡至少应该优先改成：

```ts
badge: payload.summary.sessionCountToday > 0
  ? `${payload.summary.sessionCountToday} 节生效`
  : "暂无生效"
```

如果业务最终确认这里要展示的不是“课节数”，而是“课程数”，那当前接口其实还差一个新字段，例如：

- `effectiveCourseCountToday`

但不管怎样，都绝不能继续用 `rollCallWindowRuleCount` 冒充。

## 3.2 `app/admin/home/page.tsx` 当前自己写了本地 fallback

当前实现位置：

- [page.tsx](/d:/proj/backproj/InqAsst/app/admin/home/page.tsx:16)

页面里定义了：

```ts
const ADMIN_HOME_ENTRY_FALLBACKS = [...]
```

然后又用：

- `home.entryCards.find(...)`

去合并真实数据。

这套逻辑和你刚定的原则是冲突的，因为它本质上还是在页面层保留一份 mock 风格兜底。

这段应该删掉，页面应直接渲染真实接口转换后的 `home.entryCards`。

否则会有两个风险：

1. 接口没返回完整 entryCards 时，页面悄悄回到本地假数据。
2. 后面即使 adapter 改对了，页面还可能继续显示 fallback 文案。

## 3.3 当前页根本没把 `campus` 传给 `getAdminHomeData()`

当前实现位置：

- [page.tsx](/d:/proj/backproj/InqAsst/app/admin/home/page.tsx:57)

现在写的是：

```ts
useEffect(() => {
  getAdminHomeData().then((d) => setHome(d));
}, []);
```

但当前页上面其实已经拿到了：

- `activeCampus`

所以这里应该至少改成：

```ts
useEffect(() => {
  getAdminHomeData(activeCampus).then((d) => setHome(d));
}, [activeCampus]);
```

否则页面在切校区或带 `campus` 参数进入时，首页数据并不会按校区取。

基准分支 `origin/XJM034/check-push-rules` 里这页其实是直接：

- `await getAdminHomeData(activeCampus)`

也就是说，基准分支的“按校区取首页数据”是对的，当前页是退化了。

## 3.4 `getAdminHomeData()` 还在走 mock fallback

当前实现位置：

- [mobile-app.ts](/d:/proj/backproj/InqAsst/lib/services/mobile-app.ts:320)

现在写的是：

```ts
return withLiveFallback(
  async () => {
    const [me, summary] = await Promise.all([fetchAdminMeProfile(), fetchAdminHomeSummary()]);
    return mapAdminHomeData({ me, summary });
  },
  () => adminHomeDataByCampus[campusKey] ?? adminHomeData,
);
```

这和当前结论直接冲突：

- 首页不允许继续用 mock 兜底。

这页的处理方案应该变成：

1. 要么直接只走真实接口。
2. 要么走真实接口失败后的“错误态/空态”，但不能落回 `adminHomeData`。

也就是说，这一页的数据入口至少要从：

- `withLiveFallback(live, mockFallback)`

改成：

- `live only`
- 或 `live + real empty/error state`

## 4. 具体怎么改：代码级方案

## 4.0 先定处理边界：前端直接对齐基准分支

这一页建议先定一个边界，避免后面一边修数据、一边又把页面结构修散：

- `app/admin/home/page.tsx` 以前端一致性为第一优先级。
- 页面结构、文案、层级、卡片顺序、className，直接对齐 `origin/XJM034/check-push-rules:app/admin/home/page.tsx`。
- 这里“对齐”的范围只限于布局样式层，不包含数据层和逻辑层。
- 当前分支不要复用基准分支里的 mock 取数方式、mock fallback、页面级数据拼装逻辑。
- 当前分支自己的真实接口适配、数据清洗、字段映射，仍然保留在当前分支的数据层里处理。

也就是说，这一页的正确改法不是：

- 在当前 `page.tsx` 上继续一点点修

而是：

- 直接把 `XJM034/check-push-rules` 的页面布局样式代码作为前端基准
- 再把当前分支的数据逻辑层改到能喂出同样语义的 `home` 对象

这样做的好处是很明确的：

1. 前端呈现不会继续漂移。
2. 问题边界会被收敛到数据层，而不是页面层和数据层同时乱改。
3. 后续如果别的页面也要同样处理，可以统一成“前端对齐基准分支，数据层做真实接口适配”的工作模式。

## 4.1 先改 adapter，别先改页面样式

优先修改：

- [mobile-adapters.ts](/d:/proj/backproj/InqAsst/lib/services/mobile-adapters.ts:684)

把 `mapAdminHomeData()` 至少改成下面这组语义。

### 改法 A：修正规则卡映射

建议改成：

```ts
effectiveRules: [
  {
    label: "实际上课",
    value: payload.summary.actualClassTimeRange?.trim() || "暂无实际上课",
    tone: "neutral",
  },
  {
    label: "点名时间",
    value: payload.summary.rollCallTimeRange?.trim() || "按规则执行",
    tone: "warning",
  },
  {
    label: "今日代课",
    value: `${payload.summary.todaySubstituteCourseCount ?? 0} 班级 · ${payload.summary.todaySubstituteTeacherCount ?? 0} 老师`,
    tone: "success",
  },
],
```

这里注意两点：

1. `今日代课` 的数量应该放在 `value`，不要再塞进 `meta`。
2. `实际上课` 优先吃 `actualClassTimeRange`，不要前端自己造“按今日课节执行”。

### 改法 B：修正入口卡 badge

建议改成：

```ts
entryCards: [
  {
    href: "/admin/course-settings",
    title: "课程设置",
    badge:
      payload.summary.sessionCountToday > 0
        ? `${payload.summary.sessionCountToday} 节生效`
        : "暂无生效",
    icon: "users",
    iconTone: "success",
    badgeTone: "success",
  },
  {
    href: "/admin/time-settings",
    title: "时间设置",
    badge:
      payload.summary.rollCallRulesSummary?.trim() ||
      (payload.summary.rollCallWindowRuleCount > 0 ? "默认" : "待配置"),
    icon: "clock",
    iconTone: "info",
    badgeTone: "info",
  },
],
```

这里也有两点：

1. `课程设置` 先用 `sessionCountToday`，不要再用 `rollCallWindowRuleCount`。
2. `时间设置` 优先用 `rollCallRulesSummary`，因为 mock 基准页里这张卡本来就是“默认 / 某校区方案”这种规则摘要，而不是简单布尔态。

## 4.2 再改页面，去掉本地 fallback 和错误取数方式

修改文件：

- [page.tsx](/d:/proj/backproj/InqAsst/app/admin/home/page.tsx:1)

这一段最好的落地方式不是手工继续修补当前文件，而是：

- 直接以 `origin/XJM034/check-push-rules:app/admin/home/page.tsx` 的布局样式为蓝本整理当前页面代码
- 然后只保留当前分支必须要有的真实数据接入差异
- 注意不要把基准分支里的页面级取数方式、mock 依赖、数据层逻辑原样搬过来

也就是说，这一节本质上是“基准分支页面代码落地后，需要确认的 3 个点”。

建议改 3 件事。

### 改法 A：把 `campus` 传进数据层

至少改成：

```ts
useEffect(() => {
  getAdminHomeData(activeCampus).then((d) => setHome(d));
}, [activeCampus]);
```

### 改法 B：删除 `ADMIN_HOME_ENTRY_FALLBACKS`

删掉：

- `ADMIN_HOME_ENTRY_FALLBACKS`
- `home.entryCards.find(...)` 合并逻辑

直接渲染：

```ts
{home.entryCards.map((card) => ...)}
```

### 改法 C：不要在页面里再次加工 `ruleDateLabel`

现在页面里还有：

- `formatRuleDateLabel(home.ruleDateLabel)`

更稳妥的做法是把日期格式化下沉到 adapter，让 `home.ruleDateLabel` 直接成为展示字符串，这样更接近 mock 分支的数据语义。

也就是说，建议把：

- `formatRuleDateLabel()`

从页面里删掉，改成在 `mapAdminHomeData()` 里产出最终展示文案。

## 4.3 最后改数据入口，禁止首页走 mock fallback

修改文件：

- [mobile-app.ts](/d:/proj/backproj/InqAsst/lib/services/mobile-app.ts:320)

`getAdminHomeData()` 这一页建议单独脱离 `withLiveFallback()`。

更合理的方向是：

```ts
export async function getAdminHomeData(campus?: string) {
  const [me, summary] = await Promise.all([
    fetchAdminMeProfile(),
    fetchAdminHomeSummary(),
  ]);

  return mapAdminHomeData({ me, summary });
}
```

如果必须保留失败保护，也应该走真实错误态，而不是：

- `adminHomeDataByCampus`
- `adminHomeData`

## 5. 这页最终应达到什么效果

按 `XJM034/check-push-rules` 分支为基准，改完后首页应满足：

1. `实际上课` 卡显示真实时间范围，而不是泛文案。
2. `今日代课` 卡主值直接显示班级数和老师数。
3. `课程设置` badge 反映真实“今日生效课节数/课程数”，绝不再用规则条数冒充。
4. `时间设置` badge 反映真实规则摘要。
5. 首页按 `campus` 取对校区数据。
6. 页面和数据层都不再保留任何 mock fallback。

## 6. 当前页的最小改动顺序

如果你要按最小风险顺序落地，建议就是这 4 步：

1. 先改 `mapAdminHomeData()` 字段映射。
2. 再改 `app/admin/home/page.tsx` 的 `campus` 传参。
3. 再删掉页面本地 `ADMIN_HOME_ENTRY_FALLBACKS`。
4. 最后把 `getAdminHomeData()` 从 mock fallback 中拆出来。

这 4 步做完，`/admin/home` 这一页的“怎么改”就已经基本明确，而且全部建立在真实接口数据上，不再依赖 mock。

如果按你现在定的统一原则来收口，这 4 步也可以压缩成一句话：

- `page.tsx` 的布局和样式直接回到 `XJM034/check-push-rules`；
- `mobile-adapters.ts`、`mobile-app.ts`、必要时 `mobile-schema.ts` 负责把真实接口数据改造成该页面所需语义；
- 基准分支里的数据层、逻辑层、mock 依赖不复用。
