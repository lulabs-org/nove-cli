# 用户管理

用于查询、创建、更新、删除或批量导入 Nove 用户。

## 命令

| 任务 | 命令 |
| --- | --- |
| 列出用户 | `nove user list` |
| 获取详情 | `nove user get <user-id>` |
| 创建用户 | `nove user create [flags]` |
| 更新用户 | `nove user update <user-id> [flags]` |
| 删除用户 | `nove user delete <user-id>` |
| 批量导入 | `nove user import --file <path.csv|path.xlsx>` |

## 查询

列表支持：

- `--keyword`：搜索用户名、邮箱、电话或显示名
- `--active` / `--no-active`：按启用状态筛选
- `--page`，默认 `1`
- `--limit`，默认 `20`
- `--sort-by`，默认 `createdAt`
- `--sort-order`，默认 `desc`
- `--all`，自动取完全部分页
- `--fields`、`--sort`，控制表格字段和客户端排序

```bash
nove user list --keyword <keyword> --all
nove user list --active --sort-by createdAt --sort-order desc
```

用户要求全部结果时处理分页。关键词命中多名用户时展示用户 ID、用户名、显示名和经过脱敏的联系方式，让用户选择目标。

## 创建与更新

支持的资料字段包括：

`username`、`email`、`phone`、`country-code`、`display-name`、`first-name`、`last-name`、`active`、`gender`、`date-of-birth`、`avatar`、`bio`、`address`、`city`、`country`、`website`、`zip-code`。

使用 `--active` 设置启用，使用 `--no-active` 设置停用。日期格式为 `YYYY-MM-DD`，电话号码本体与 `--country-code` 必须一起传递。

更新前先获取用户详情，明确展示将改变的字段；未提供任何字段时不要执行。完成后再次 `user get` 验证。

## 批量导入

导入接受 CSV 或 XLSX 文件，并会直接写入服务端；当前命令没有 dry-run。

执行前：

1. 确认文件路径是用户指定的目标文件。
2. 检查扩展名、文件大小、表头和数据行数。
3. 提醒用户该操作会批量写入，并取得明确确认。
4. 执行 `nove user import --file <path>`。
5. 根据响应报告成功、失败和跳过情况；不要仅依据成功文案推断所有行均成功。

## 删除

删除命令默认要求交互确认。必须先运行：

```bash
nove user get <user-id>
```

展示准确用户 ID、用户名和脱敏联系方式，取得明确确认后，可先执行 `nove user delete <user-id> --dry-run` 检查目标，再执行删除并响应 CLI 确认提示，最后重新查询验证。不要用关键词搜索结果中的第一项直接删除。

非交互环境只有在用户已经明确确认准确目标后，才使用 `nove user delete <user-id> --yes`。
