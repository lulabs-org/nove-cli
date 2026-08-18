# 会议记录

用于查询会议、统计、参会人，以及创建、更新或删除 Nove 中的会议记录。

`nove meeting create` 只创建 Nove 内部记录，不会在飞书或腾讯会议中安排真实日程。

## 命令

| 任务 | 命令 |
| --- | --- |
| 列出会议 | `nove meeting list` |
| 获取详情 | `nove meeting get <meeting-id>` |
| 查询统计 | `nove meeting stats` |
| 查询参会人 | `nove meeting participants <meeting-id>` |
| 创建记录 | `nove meeting create --platformMeetingId <id> --title <title>` |
| 更新记录 | `nove meeting update <meeting-id> --title <title>` 或 `--status <status>` |
| 删除记录 | `nove meeting delete <meeting-id>` |

执行前用 `nove meeting <command> --help` 核对当前参数。

## 查询会议

可用筛选项：

- `--page`，默认 `1`
- `--limit`，默认 `10`
- `--platform`，例如 `TENCENT_MEETING`、`FEISHU`
- `--status`，例如 `COMPLETED`、`PENDING`
- `--type`，例如 `SCHEDULED`、`INSTANT`
- `--startDate`、`--endDate`，ISO 时间
- `--search`，关键词

示例：查询上海时区 2026-08-17 的会议：

```bash
nove meeting list \
  --startDate 2026-08-17T00:00:00+08:00 \
  --endDate 2026-08-17T23:59:59.999+08:00 \
  --page 1 \
  --limit 100
```

用户要求“全部”时，先检查响应中的分页字段；若没有明确的总页数，则继续递增 `--page`，直到返回空页或返回条数小于 `--limit`。不要仅凭第一页下结论。

多条会议名称相近时，展示标题、会议 ID、平台和时间，让用户选择；不要根据标题猜测目标 ID。

## 统计与参会人

统计命令接受 `--startDate` 和 `--endDate`：

```bash
nove meeting stats --startDate <iso> --endDate <iso>
```

参会人列表默认每页 20 条，可按关键词筛选：

```bash
nove meeting participants <meeting-id> --keyword <name> --page 1 --limit 100
```

查询“谁参加过”时使用参会人接口，不要把转写中出现的人名当作完整参会人名单。

## 创建与更新

创建时 `--platformMeetingId` 和 `--title` 必填，可选 `--startTime`、`--endTime`、`--status`。执行前复述平台会议 ID、标题和时间；若用户实际想创建第三方日程，停止并说明边界。

更新只接受 `--title` 和 `--status`。先运行：

```bash
nove meeting get <meeting-id>
```

确认当前值和目标值后再更新，完成后再次获取详情验证。

## 删除

删除命令没有内置二次确认。执行前必须：

1. 用 `meeting get` 读取目标。
2. 向用户展示会议 ID、标题和时间。
3. 获得针对该目标的明确删除确认。
4. 执行 `nove meeting delete <meeting-id>`。
5. 通过重新查询或 API 的明确响应验证结果。
