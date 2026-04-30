# 静态导出交付流程

日期：2026-04-18

说明：Vercel 正式 Production 部署内容必须来自 GitHub `origin/main`。功能分支只用于 Preview / smoke；验证通过后合并到 `origin/main`，再由 Vercel Git integration 生成 Production。

静态导出交付 = 测试 + build + commit + push

## 核心要求

1. 合并到 `origin/main` 前，先检查 Docker、部署脚本、CI/CD、Vercel project settings、Production environment variables 以及其它部署相关配置。
2. 如果这些部署相关配置不是本次明确要修改的范围，一律不要覆盖，也不要顺带提交。
3. 提交前先执行测试和打包，生成最新 `out` 文件。
4. 代码和静态导出相关内容可以按本地版本正常提交，但前提是不影响现有部署配置。
5. 提交时直接使用最简单的 Git 流程即可：`git add`、`git commit`、`git push`；功能分支先走 PR / Preview，正式 Production 以 `origin/main` 为准。
6. 当前前端仓库与目标仓库不一致时，以本文档指定的目标仓库和目标分支为准。
7. Vercel 静态部署使用 `vercel.json` 的 `framework: null`、`cleanUrls: true` 与 `outputDirectory: "out"`，不要改成 Next server 托管模式，除非先同步更新根文档和架构文档。
8. Vercel Production 必须配置 `NEXT_PUBLIC_API_BASE_URL` 与 `NEXT_PUBLIC_API_REQUEST_MODE=proxy`。当前 shared dev 后端没有开放 Vercel 域名 CORS，所以 `vercel.json` 暂时保留 `/api/*` external rewrite；若后端后续开放 CORS 或切换正式后端，需要同步更新本文档和 `docs/TOOLING.md`。

仓库：`https://github.com/XJM034/InqAsst`
分支：`main`
