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
- `--sortBy`，默认 `createdAt`
- `--sortOrder`，默认 `desc`

```bash
nove user list --keyword <keyword> --page 1 --limit 100
nove user list --active --sortBy createdAt --sortOrder desc
```

用户要求全部结果时处理分页。关键词命中多名用户时展示用户 ID、用户名、显示名和经过脱敏的联系方式，让用户选择目标。

## 创建与更新

支持的资料字段包括：

`username`、`email`、`phone`、`countryCode`、`displayName`、`firstName`、`lastName`、`active`、`gender`、`dateOfBirth`、`avatar`、`bio`、`address`、`city`、`country`、`website`、`zipCode`。

使用 `--active` 设置启用，使用 `--no-active` 设置停用。日期格式为 `YYYY-MM-DD`，电话号码本体与 `countryCode` 分开传递。

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

删除命令没有内置二次确认。必须先运行：

```bash
nove user get <user-id>
```

展示准确用户 ID、用户名和脱敏联系方式，取得明确确认后再执行 `nove user delete <user-id>`，最后重新查询验证。不要用关键词搜索结果中的第一项直接删除。
