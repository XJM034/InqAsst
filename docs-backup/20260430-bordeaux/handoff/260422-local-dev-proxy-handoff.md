# Handoff

## 1. 当前任务目标
- 本轮目标是把“仅走已部署 shared dev 后端”的本地运行方式收口稳定，确保后续前端开发不再被登录页长时间卡住或误导去起本机 `daoleme`
- 用户本轮明确边界：
  - 后端统一走线上 / shared dev
  - 不要再起本地后端
  - 先把文档口径修正到当前事实，再尽快完成本地运行优化，方便继续新的前端开发

## 2. 当前进展
- 文档口径已收敛到“本机前端 + 已部署 shared dev 后端”为默认工作流：
  - `AGENTS.md`
  - `CLAUDE.md`
  - `docs/inqasst-automation-testing-execution-plan.md`
  - `docs/上线前测试清单_20260414.md`
  - `docs/后端协同说明_20260414.md`
  - `docs/archive/本机-daoleme-联调工作流归档_20260422.md`
- 本轮本地运行优化已落地：
  - `lib/services/http-core.ts`
    - 请求层新增 `15s` 超时
    - `GET/HEAD` 默认单次重试
    - 对 `408/500/502/503/504` 与 `fetch failed / ETIMEDOUT / ECONNRESET` 做轻量重试
  - `lib/services/mobile-client.ts`
    - shared dev 抖动时统一转成“共享开发环境暂时无响应，请稍后重试”
    - 修正多处历史乱码中文提示
    - 保留“仅当 `NEXT_PUBLIC_API_BASE_URL` 指向 localhost 时”才提示本地后端未启动
  - `components/app/login-form.tsx`
    - 登录中或发送验证码超过 4 秒时，展示 shared dev 较慢提示，避免页面无反馈
  - 测试：
    - 新增 `tests/service/http-core.test.ts`
    - 更新 `tests/service/mobile-client.test.ts`
- 当前 dev server 仍在本机 `3000`

## 3. 已确认事实
- shared dev 当前可作为本地前端代理目标使用：
  - `curl -I https://daoleme-dev.jxare.cn/` 返回 `HTTP/2 200`
  - 通过本机 `3000` 的 `/api/auth/login/` 代理请求已能快速返回业务响应，不再表现为长时间无结果
- 浏览器不能直接从本机页面跨域打 shared dev API：
  - 对 `https://daoleme-dev.jxare.cn/api/auth/login` 与 `/api/admin/emergency/weekly` 的 `OPTIONS` 预检复核结果都是 `HTTP/2 403 Invalid CORS request`
  - 结论：当前不能把本地开发模式切成浏览器 `direct`；必须继续保留 `next dev` 同源 `proxy`
- 本轮没有再起本地后端，也没有把本机 `daoleme` 作为当前联调前置

## 4. 已完成验证
- `npx vitest run tests/service/http-core.test.ts tests/service/mobile-client.test.ts tests/contract/mobile-client.test.ts`
  - 通过
- `npm test`
  - 通过
- `npm run lint -- lib/services/http-core.ts lib/services/mobile-client.ts components/app/login-form.tsx tests/service/http-core.test.ts tests/service/mobile-client.test.ts`
  - 通过
- `npm run build`
  - 通过
- `curl -I http://127.0.0.1:3000/login/`
  - 返回 `HTTP/1.1 200 OK`

## 5. 关键结论
- 当前最稳妥、也是唯一已验证可用的本地开发方式：
  - 前端继续跑本机 `3000`
  - API 统一经 `next dev` 的 `/api/*` 代理到 `https://daoleme-dev.jxare.cn`
  - 不起本地后端
- 这次优化解决的是：
  - shared dev 短暂慢响应时页面长期无反馈
  - 登录 / 查询失败时把 shared dev 问题误提示成本地后端未启动
  - 请求偶发抖动时完全不重试
- 这次优化没有改变的是：
  - shared dev 的业务真值
  - shared dev 自身的可用性
  - 浏览器跨域直连 shared dev 的限制

## 6. 下一位 Agent 建议
- 如果用户接下来要继续做前端页面开发，直接复用当前 `http://127.0.0.1:3000/login/` 即可，不要再尝试起本地后端
- 如果后续又出现“真实页面加载不出来”：
  - 先看本机 `3000` 是否还在监听
  - 再看 `/api/*` 代理链路是否返回 `500/502/503/504` 或 timeout
  - 不要先把问题归因到“前端代码和线上不一致”
