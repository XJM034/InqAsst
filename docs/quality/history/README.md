# 质量历史记录索引

更新日期：2026-04-29

本目录保存按开发周期沉淀的测试记录、benchmark、账号矩阵、live smoke、专项验证和旧执行稿内容。

当前工作默认先读：

- `../README.md`
- `../regression-checklist.md`

只有追溯历史证据或复盘旧判断时再读本目录。

## 当前归档

- `2026-04-29-quality-source.md`：原 `docs/QUALITY.md` 全量迁移快照，包含旧自动化执行稿、Phase 0 / live smoke 覆盖、2026-04-15 benchmark 与历史专项记录。
- `2026-04-29-regression-source.md`：原 `docs/REGRESSION_CHECKLIST.md` 全量迁移快照，包含旧发布前测试清单、历史账号样例、课程样例和人工写流实测记录。

## 新增规则

- 新的专项验证用 `YYYY-MM-DD-topic.md` 命名。
- 文件开头写清环境口径：真实内测 / shared dev / 静态产物 / 代码静态判断。
- 大量日志不要直接堆进当前入口文档；放到本目录，并从入口文档短链接过去。
