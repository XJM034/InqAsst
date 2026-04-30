# Handoff

## 1. 当前任务目标
- 当前工作集中在管理端 UI 收敛，主要涉及 3 个页面：
  - `/admin/emergency`
  - `/admin/home`
  - `/admin/course-settings/_/edit?courseId=...&courseSessionId=...`
- 目标是把“老师设置/代课/课程设置”之间的信息层级重新理顺：
  - `/admin/emergency` 的“全部课程”卡片优先展示点名老师，而不是课程名
  - `/admin/home` 的“老师设置”卡片去掉无信息量元素，只保留直观入口和清晰文案
  - `/admin/course-settings/_/edit` 中，点名老师改为只读展示，不再在课程设置里改老师
- 当前用户最近一次明确要求：
  - 课程设置页“点名老师”只保留老师姓名，不显示电话
  - 底部按钮文案从“保存上课地点”改为“保存课程信息”
- 完成标准（当前尚未走到最终收口）：
  - 本地页面视觉和文案符合用户最新批注
  - 相关门禁通过
  - 若用户确认方向，下一步再决定是否提交/推送 Codeup

## 2. 当前进展
- 当前分支：`XJM034/bordeaux`
- 当前未提交源码改动（不含 `.next/`、`out/` 构建产物）：
  - `app/admin/course-settings/[courseId]/edit/client.tsx`
  - `app/admin/home/page.tsx`
  - `components/app/admin-emergency-client.tsx`
  - `lib/domain/types.ts`
  - `lib/services/course-settings-draft.ts`
  - `lib/services/mobile-adapters.ts`
  - `tests/e2e/smoke.spec.ts`
  - `tests/service/mobile-adapters.test.ts`
- 当前还有未跟踪文件：
  - `.codex/environments/environment.toml`
- `/admin/emergency` 已完成的收敛：
  - “全部课程”卡片删除了 `点名老师` 标签
  - 删除了右侧漂浮的 `去设置` 区域，整张卡直接作为点击入口
  - 卡片第一视觉改为老师姓名，手机号次级显示；下方一行只保留 `课程名 · 地点`
  - 对应实现集中在 `components/app/admin-emergency-client.tsx`
- `/admin/home` 已完成的收敛：
  - “老师设置”卡删除了 `默认同步与代课管理`
  - 删除了右上角 `今日启用 / 今日代课` 的额外块
  - 删除了 `查看课程老师` 次按钮以及中部“打开后直接查看”说明块
  - 只保留标题、一句说明文案、一个 `进入老师设置` 主按钮
  - `时间设置` 角标文案已改为 `点名时间已生效` / `点名时间待配置`
- `/admin/course-settings/_/edit` 已完成的收敛：
  - 删除了独立的“点名老师”可编辑卡片和 `选择老师` 按钮
  - 删除了课程设置页中的“学生名单”入口卡片
  - 在“课程信息”卡片内部新增只读 `点名老师` 字段，只显示老师姓名
  - 底部主按钮文案已改为 `保存课程信息`
- 已完成验证：
  - 在课程设置页“点名老师只读+移除电话”版本上，跑过：
    - `npm run sync:tokens`
    - `npm test`
    - `npm run lint`
    - `npm run build`
    - 结果：通过；`lint` 仍为仓库原有 39 条 warning，0 error
  - 在最后一次仅改按钮文案为 `保存课程信息` 后，又跑过：
    - `npm run sync:tokens`
    - `npm run lint`
    - `npm run build`
    - 结果：通过；未重跑 `npm test` / `npm run test:e2e:smoke`
- 当前未提交、未推送 Codeup

## 3. 关键上下文
- 用户这几轮的核心设计判断非常明确：
  - “老师设置”页和“课程设置”页要分工清楚
  - `/admin/emergency` 应该强调“点名老师是谁”，而不是继续强调课程名
  - `/admin/course-settings/_/edit` 不应该再次修改点名老师，点名老师应由老师设置统一调整
  - 页面上无信息量、读不通、像“飘在空中”的元素都要删
- 已做出的关键决定：
  - `/admin/emergency` 的“全部课程”卡采用“老师名优先、课程信息退后”的层级，但不做成与“今日代课老师”一样强烈的高亮
  - `/admin/home` 的“老师设置”卡不再承担摘要面板功能，只保留进入动作和一句说明
  - `/admin/course-settings/_/edit` 只允许编辑上课地点；课程名、时间、点名老师都只读展示
- 关键实现落点：
  - `/admin/emergency` 卡片布局调整：`components/app/admin-emergency-client.tsx:46-88`
  - `/admin/home` 老师设置卡结构：`app/admin/home/page.tsx:137-154`
  - `/admin/home` 老师设置文案与时间设置 badge 映射：`lib/services/mobile-adapters.ts:904-951`
  - `/admin/course-settings/_/edit` 课程信息只读老师字段与按钮文案：`app/admin/course-settings/[courseId]/edit/client.tsx:83-96`、`296-350`
  - 草稿兜底按钮文案同步：`lib/services/course-settings-draft.ts:232-240`
- 已知约束：
  - 用户当前主要通过 IAB 实时看 `http://127.0.0.1:3000/admin/*` 页面给批注
  - 当前 repo 很脏，`npm run build` 会大量改写 `.next/` 与 `out/`
  - 不要把 `.next/` / `out/` 的噪音当成业务源码变更
  - 当前没有提交，也没有推送
- 重要假设：
  - 用户大概率还会继续做视觉批注，而不是马上要求提交
  - 当前本地 dev server 可正常预览，近期批注都基于 IAB 实时页面而不是纯静态 diff

## 4. 关键发现
- `/admin/emergency` 的“全部课程”如果先展示课程名，会让页面视觉回到“课程设置”视角；改成老师优先后，页面角色才和“老师设置”一致。
- `/admin/home` 的“老师设置”卡一旦叠加状态角标、次按钮、说明块，会产生重复信息；顶部“今日生效规则”已经承担了规则/代课摘要，因此卡片本身应该极简。
- `/admin/course-settings/_/edit` 之前把“点名老师”做成可编辑模块，和用户对信息架构的理解冲突；当前已回退为只读字段，且电话也按用户要求移除。
- `lib/domain/types.ts` 中 `heroSecondaryHref` 已删除，说明首页“查看课程老师”次入口已经从数据层一并收掉，而不是只改了视图层。
- `tests/e2e/smoke.spec.ts` 只同步了课程设置页按钮文案断言为 `保存课程信息`，但这轮没有重跑 `npm run test:e2e:smoke`。
- 当前真正需要交接的是源码层 8 个文件；`git status` 里的绝大部分噪音来自 `.next/`、`out/` 以及构建生成的静态产物。

## 5. 未完成事项
1. 等用户继续看当前本地页面后，处理下一轮 UI/文案批注；当前还没有用户对这版做“最终确认”。
2. 若用户确认方向，需要决定是否：
   - 清理/忽略 `.next`、`out` 构建噪音后再提交
   - 提交并推送到 Codeup
   - 是否补跑 `npm run test:e2e:smoke`

## 6. 建议接手路径
- 优先查看：
  - 当前 handoff 前的主要 UI 变更：`components/app/admin-emergency-client.tsx`
  - 首页老师设置卡：`app/admin/home/page.tsx`
  - 首页数据映射：`lib/services/mobile-adapters.ts`
  - 课程设置编辑页：`app/admin/course-settings/[courseId]/edit/client.tsx`
  - 本轮同步的测试：`tests/service/mobile-adapters.test.ts`、`tests/e2e/smoke.spec.ts`
- 先验证：
  - 先在浏览器中核对当前本地页面是否已经体现以下状态：
    - `/admin/emergency` 全部课程卡片为“老师优先”
    - `/admin/home` 老师设置卡为单按钮极简版
    - `/admin/course-settings/_/edit` 的点名老师只显示姓名，底部按钮为 `保存课程信息`
  - 若准备提交，先确认是否要保留 `.next/`、`out/` 噪音；当前用户没有要求清理它们
  - 若用户要求“已全部验证”，需要说明最后一次文案修改后并未重跑 `npm test` / `npm run test:e2e:smoke`
- 推荐动作：
  - 先等待/获取用户对当前 UI 的下一条批注
  - 如果用户直接要求推送，先用 `git status --short -- ':(exclude).next' ':(exclude)out'` 只看源码改动，再决定提交流程
  - 如果用户要求补验收，再补跑 `npm test`，必要时补 `npm run test:e2e:smoke`

## 7. 风险与注意事项
- 不要把 `.next/`、`out/` 的大规模变更误判成需要 hand-edit 或一并提交的业务文件；它们是 `build` 噪音。
- 不要把 `/admin/course-settings/_/edit` 又改回可编辑老师入口；用户已多次明确“点名老师应由老师设置更改，而非再次修改”。
- 不要重新加回首页的 `查看课程老师`、右上角代课摘要块、`默认同步与代课管理` 等已被用户否定的信息。
- `lib/services/course-settings-draft.ts` 仍保留了旧 draft 结构中的 `teacherBadges` / `studentCount` / `allowTeacherEdit` 等字段；本轮只同步了按钮文案，并未顺手重构该 helper。若后续用户要求彻底清理草稿链路，再单独处理。
- 当前状态下可以确认：
  - 源码变更已落地
  - 本地页面近期一直是通过 IAB 实时验证的
  - 还没有 commit / push
- 当前状态下不能夸大为：
  - “已经走完最终验收”
  - “最后一次文案改动后所有测试都重跑过”

下一位 Agent 的第一步建议：
先执行 `git status --short -- ':(exclude).next' ':(exclude)out'` 确认当前真正待交接的源码只有 8 个文件，然后在 IAB 对照检查 `/admin/emergency`、`/admin/home`、`/admin/course-settings/_/edit` 三个页面是否与 handoff 描述一致，再继续接用户下一条批注或提交指令。
