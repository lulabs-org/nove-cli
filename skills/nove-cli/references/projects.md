# 项目管理

查询或维护当前组织的 Project 时读取本文件。Project 是组织隔离资源，CLI 不接受 `--org-id`，实际组织由 JWT、OAuth 或 API Key 的认证上下文决定。

## 命令与权限

| 操作 | 命令 | 权限 |
| --- | --- | --- |
| 列表 | `project list` | `project:read` |
| 详情 | `project get ID` | `project:read` |
| 创建 | `project create` | `project:create` |
| 更新 | `project update ID` | `project:update` |
| 状态 | `project status ID` | `project:toggle-status` |
| 删除 | `project delete ID` | `project:delete` |

创建至少需要 `--title`。状态为 `DRAFT|PUBLISHED|ENROLLING|IN_PROGRESS|COMPLETED|ARCHIVED`，难度为 `BEGINNER|INTERMEDIATE|ADVANCED`。首次进入非草稿状态时，API 自动记录 `publishedAt`。

`--tag`、`--prerequisite` 和 `--outcome` 可重复传入。`--metadata` 必须是 JSON 对象。图片可使用站内绝对路径或 HTTP(S) URL。日期必须是带明确时区的 ISO 8601 时间。

负责人使用 Nove 本地 `userId`，且必须是当前组织的有效成员；`productId` 使用 `product list/get` 返回的产品 ID。写入关联前分别查询用户和产品，不要用名称代替 ID。

列表支持关键词、分类、状态、难度、精选标记、负责人和产品筛选。用户要求全部项目时使用 `project list --all --json`，并核对 `total`、`totalPages` 和返回条数。

更新时可重复使用 `--clear FIELD` 清除可空值；数组字段会清为空数组。仅修改状态时优先使用 `project status`。删除是软删除，但仍必须先读取准确项目；`project delete` 会自动预读目标，并支持 `--dry-run` 和 `--yes`。

写入后用 `project get ID --json` 逐字段核对。删除后确认普通 `get` 返回 404 且列表不再包含目标。超时或断网时先查询，不要直接重放写请求。
