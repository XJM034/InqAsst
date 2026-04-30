# Handoff

## 1. 当前任务目标
- 今天实际任务已切到管理端前端精修与本地预览验证，重点页面是：
  - `/admin/home`
  - `/admin/control`
  - `/admin/unarrived`
- 当前产出不是继续做业务链路联调，而是收口这 3 个管理端页面的布局、文案、骨架屏和局部数据呈现，让用户在 IAB 本地预览里直接确认。
- 当前完成标准：
  - 本机 `http://127.0.0.1:3000` 的管理端首页、点名页、未到学生列表符合用户当前审美和文案要求
  - 相关源码门禁通过
  - handoff 明确记录本轮 UI 范围、未做事项和不要误碰的方向
- 明确不在本轮范围：
  - `260422-handoff.md` 里提到的“同日老师互换点名课程”“更换老师副标题显示课程信息”仍按用户明确要求暂不考虑；用户已说后端正在改，这轮没有继续追那条链路

## 2. 当前进展
- 当前工作目录：`/Users/minxian/conductor/workspaces/inqasst/bordeaux`
- 当前分支：`XJM034/bordeaux`
- 当前源码改动集中在以下文件：
  - `app/admin/home/page.tsx`
  - `app/admin/home/loading.tsx`
  - `app/admin/control/page.tsx`
  - `app/admin/control/loading.tsx`
  - `app/admin/unarrived/page.tsx`
  - `app/admin/unarrived/loading.tsx`
  - `components/app/admin-home-skeleton.tsx`
  - `components/app/admin-control-skeleton.tsx`
  - `components/app/admin-unarrived-skeleton.tsx`
  - `components/app/admin-attendance-top-tools.tsx`
  - `components/app/admin-control-client.tsx`
  - `components/app/admin-unarrived-client.tsx`
  - `lib/admin-campus.ts`
  - `lib/domain/types.ts`
  - `lib/services/mobile-adapters.ts`
  - `lib/services/mobile-app.ts`
  - `tests/service/mobile-adapters.test.ts`
  - `tests/service/mobile-app.test.ts`
- 管理端首页已完成的主要改动：
  - `app/admin/home/page.tsx`
    - 顶部重排为同一上半区：`管理设置 / 校区 / 日期 / 今日生效规则`
    - 右上角日期保留显著强调，当前口径是 `4/23 周四`
    - 删除用户已明确不要的辅助文案
    - “老师设置”主卡与下方常用入口重新梳理层级与间距
  - `lib/services/mobile-adapters.ts`
    - 首页日期格式从 `周二 · 4/14` 调整为 `4/14 周二`
    - 首页入口卡新增 `description`
  - `components/app/admin-home-skeleton.tsx` + `app/admin/home/loading.tsx`
    - 已改为首页专属 skeleton，不再沿用旧节奏占位
- 管理端点名页已完成的主要改动：
  - `components/app/admin-control-client.tsx`
    - 顶部改成更强的“点名总控”头部
    - 课程列表文案统一，不再把课程管控误叫成“班级列表”
    - 复制按钮当前文案为：
      - `复制未完成课程信息`
      - `复制未完成班级信息`
    - 老师副标题已显示为 `老师姓名 · 手机号`
    - 长列表从“一行一个大卡片”改成优先事项更突出的布局，已完成项更紧凑
    - 用户明确要求删除的顶部说明文案已删
  - `lib/admin-campus.ts`
    - 点名页 tab 文案已改为 `课程列表`
  - `lib/services/mobile-app.ts`
    - 点名总控教师信息改为基于当天 `admin emergency weekly` 读链聚合，确保能拿到手机号
  - `components/app/admin-control-skeleton.tsx` + `app/admin/control/loading.tsx`
    - 已切到点名页专属 skeleton
  - `app/admin/control/page.tsx`
    - 原调试日志已移除
- 未到学生列表已完成的主要改动：
  - `components/app/admin-unarrived-client.tsx`
    - 顶部改成“未到学生总控”
    - 顶部复制按钮已与课程列表页对齐为：
      - `复制未完成课程信息`
      - `复制未完成班级信息`
    - 顶部多余说明文案已删
    - 顶部摘要卡已删掉 `行政班 xx`
    - `已修正` badge 保持放在最后一个
    - 分组仍按行政班折叠，展开后仍保留三列学生卡片；这是用户明确要求“克制一点，不要动太多”的部分
    - 行政班分组下原先“涉及 XXX 课程”的副标题已全部删除
  - `components/app/admin-unarrived-skeleton.tsx` + `app/admin/unarrived/loading.tsx`
    - 已切到未到学生页专属 skeleton
  - `app/admin/unarrived/page.tsx`
    - 加载时已使用专属 skeleton，而不是通用 loading
- 共享组件改动：
  - `components/app/admin-attendance-top-tools.tsx`
    - 复制按钮补了禁用态、hover/focus/active 反馈，当前首页/点名页/未到学生列表共用这套动作区节奏
- service / test 侧已同步：
  - `tests/service/mobile-adapters.test.ts`
    - 对齐首页日期格式与入口描述
    - 对齐点名页教师 `姓名 · 手机号` 口径
  - `tests/service/mobile-app.test.ts`
    - `getAdminControlData()` 改为基于 `fetchAdminEmergencyWeekly` 读当天教师信息，相关断言已更新
- 本轮用户最后停留页面：`http://127.0.0.1:3000/admin/unarrived/?campus=145`

## 3. 关键上下文
- 用户今天的工作方式是：在 IAB 打开本机页面，边看边提细化要求；偏好“直接改代码 + 立刻刷新验证”，不喜欢先给方案再等确认。
- 用户已经明确确认的界面边界：
  - `/admin/control` 是“课程管控”语境，应该用“课程”而不是“班级”
  - `/admin/unarrived` 仍是按学生所属行政班来组织，因此下半区保留“行政班 + 三列学生卡片”的结构是对的，不要为了和课程列表统一而强行改模型
  - `/admin/unarrived` 上半区可以明显优化，总控感可以加强；但下半区要克制
- 用户明确要求删除的文案已经删掉，不要恢复：
  - `先核今天时间，再看代课安排。`
  - `未完成课程会自动排在前面，先推进待点名和进行中的课程。`
  - `按行政班逐组查看，优先处理未到和待确认学生，再统一同步请假结果。`
  - 行政班分组下的 `涉及 XXX 课程`
- 当前仓库仍是静态导出项目：
  - 真实交付仍看 `out/`
  - 但今天的 UI 反馈是围绕本机 `3000` IAB 预览推进的
- 今天没有改执行稿、上线清单、后端协同说明；本轮是前端 UI polish，不是新增联调结论
- 当前 worktree 很脏，除了源码外还有大量生成物和本地辅助文件：
  - `.next/**`
  - `out/**`
  - `.codex/**`
  - `.impeccable.md`
  - 不要在后续提交里误混

## 4. 关键发现
- `admin control` 和 `admin unarrived` 不能用同一种命名体系：
  - 前者是课程进度总控
  - 后者是按行政班跟进未到学生
  - 这也是为什么用户要求 `/admin/control` 用“课程”，但 `/admin/unarrived` 仍允许保留“班级/行政班”语义
- `/admin/unarrived` 当前数据模型本来就是按行政班分组，不是我临时改成这样的；这也是下半区保留三列学生卡片的依据
- 点名页老师手机号的正确来源不是 `teacher settings overview`，而是当天 `admin emergency weekly`；如果后面老师副标题又丢手机号，优先查 `lib/services/mobile-app.ts` 这条读链
- 专属 skeleton 很重要：
  - 用户在刷新时会直接看到 loading 态
  - 之前用户已经因为看到旧 skeleton 节奏而误以为页面没有刷新到新样式
  - 现在首页、点名页、未到学生列表都已经有专属 skeleton
- 当前测试覆盖的事实边界：
  - `npm test` 已覆盖 service 口径变更
  - 但今天没有补新的页面级测试，也没有跑 `npm run test:e2e:smoke`
  - 如果后面要补测试，优先考虑 `admin/control` 与 `admin/unarrived` 的页面层交互断言
- 旧的 `260423-handoff.md` 原本是老师端 UI 精修内容，已经与今天实际范围不一致；本次 handoff 已整份重写，不要再把旧内容当成今天的接力基线

## 5. 未完成事项
1. 用 IAB 再做一轮显式人工确认：
   - `/admin/home`
   - `/admin/control`
   - `/admin/unarrived/?campus=145`
   - 重点确认：顶部总控区、复制按钮文案、课程/班级用词、未到学生下半区三列密度
2. 如果用户确认今天的 UI 收口完成，准备 source-only 提交范围：
   - 只 stage 源码文件
   - 不要混入 `.next/`、`out/`、`.codex/`、`.impeccable.md`
3. 如果用户下一步从“打磨”切到“补测试”，优先补：
   - `admin/control` 顶部总控区与课程列表文案/复制按钮
   - `admin/unarrived` 顶部总控区与分组折叠行为

## 6. 建议接手路径
- 优先查看：
  - `app/admin/home/page.tsx`
  - `components/app/admin-home-skeleton.tsx`
  - `components/app/admin-control-client.tsx`
  - `components/app/admin-control-skeleton.tsx`
  - `components/app/admin-unarrived-client.tsx`
  - `components/app/admin-unarrived-skeleton.tsx`
  - `components/app/admin-attendance-top-tools.tsx`
  - `lib/admin-campus.ts`
  - `lib/services/mobile-adapters.ts`
  - `lib/services/mobile-app.ts`
  - `tests/service/mobile-adapters.test.ts`
  - `tests/service/mobile-app.test.ts`
- 先验证：
  - `git status --short -- ':(exclude).next' ':(exclude)out'`
  - `lsof -iTCP:3000 -sTCP:LISTEN -n -P`
  - IAB 刷新当前 3 个管理端页面，确认文案和布局没有回退
  - 如果只继续 UI 微调，最低再跑 `npm run sync:tokens && npm run lint && npm run build`
  - 如果再动 `lib/services/*`，补跑 `npm test`
- 推荐动作：
  - 第一步先在 IAB 依次刷新 `/admin/home`、`/admin/control`、`/admin/unarrived/?campus=145`
  - 如果用户口头确认“可以了”，立刻切到 source-only 提交整理
  - 如果用户还要继续抠细节，优先在现有结构上小步调整，不要重做布局体系

## 7. 风险与注意事项
- 不要误把旧的老师端 `260423-handoff.md` 内容继续沿用；这个文件今天已经被重写成管理端 handoff
- 不要把 `.next/` 和 `out/` 的大规模变化当成源码改动提交
- 不要恢复用户已经明确删掉的解释性文案和分组副标题
- 不要把 `/admin/unarrived` 的下半区大改成“课程列表”样式；用户明确要求这一块克制处理
- 不要把“课程”与“班级/行政班”重新混用：
  - `/admin/control` 用课程
  - `/admin/unarrived` 下半区仍是行政班语义
- 今天最后几轮微调只跑了 `npm run sync:tokens`、`npm run lint`、`npm run build`；`npm test` 没有在“删文案/删 badge”这种纯 UI 小改后重复跑，这是合理的，但如果你再碰 service 层要补回
- 今天没有更新执行稿/上线清单/后端协同说明；如果下一位 agent 想把今天的 UI 收口写入文档，需要先确认用户是否需要额外文档同步

下一位 Agent 的第一步建议：
先在当前 IAB 依次刷新 `/admin/home`、`/admin/control`、`/admin/unarrived/?campus=145`，按用户已经确认过的口径逐页核对顶部总控区和文案是否全部对齐；如果没有新反馈，就立即整理 source-only 提交范围。
