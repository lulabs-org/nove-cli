# 会议资源

用于查询会议、统计、参会人，以及创建、更新或删除 Nove 中的会议资源。会议记录、转写和参会者总结属于 `minute` 领域。

`nove meeting create` 只创建 Nove 内部记录，不会在飞书或腾讯会议中安排真实日程。

会议、平台会议号、参会快照和用户身份的区别见 [identifiers-and-relations.md](identifiers-and-relations.md)。涉及完整分页、JSON 或错误判断时读取 [output-and-errors.md](output-and-errors.md)。

## 命令

| 任务 | 命令 |
| --- | --- |
| 列出会议 | `nove meeting list` |
| 获取详情 | `nove meeting get <meeting-id>` |
| 查询统计 | `nove meeting stats` |
| 查询参会人 | `nove meeting participants <meeting-id>` |
| 创建会议资源 | `nove meeting create --platform <platform> --platform-meeting-id <id> --title <title> --type <type>` |
| 更新会议资源 | `nove meeting update <meeting-id> --title <title>` |
| 删除会议资源 | `nove meeting delete <meeting-id>` |

执行前用 `nove meeting <command> --help` 核对当前参数。

## 查询会议

可用筛选项：

- `--page`，默认 `1`
- `--limit`，默认 `10`
- `--platform`：`TENCENT_MEETING`、`ZOOM`、`TEAMS`、`DINGTALK`、`FEISHU`、`WEBEX`、`VOOV`、`OTHER`
- `--status`：`PENDING`、`PROCESSING`、`COMPLETED`、`FAILED`、`SKIPPED`；这是关联记录的处理状态
- `--type`：`ONE_TIME`、`RECURRING`、`INSTANT`、`SCHEDULED`、`WEBINAR`
- `--start-date`、`--end-date`，包含显式时区的 ISO 时间半开区间
- `--date YYYY-MM-DD --timezone Asia/Shanghai`，按本地自然日生成半开区间
- `--search`，关键词
- `--all`，自动取完所有页
- `--fields`、`--sort`，控制表格字段和排序

示例：查询上海时区 2026-08-17 的会议：

```bash
nove meeting list \
  --date 2026-08-17 \
  --timezone Asia/Shanghai \
  --all
```

用户要求“全部”时使用 `--all`，不要再同时传 `--page`。脚本需要原始合并 JSON 时同时使用 `--json`。默认输出表格；`--fields`、`--sort` 不能与 `--json` 同用。

多条会议名称相近时，展示标题、会议 ID、平台和时间，让用户选择；不要根据标题猜测目标 ID。

列表表格默认展示 `id`、`title`、`platform`、`startAt`、`participantCount`；这些字段用于浏览，不代表完整对象。`--json` 的结果数组位于 `data`，跨步骤必须从每项 `id` 取得 Nove meeting ID。

## 统计与参会人

统计命令接受 `--start-date` 和 `--end-date`，也支持自然日查询：

```bash
nove meeting stats --date 2026-08-17 --timezone Asia/Shanghai
```

参会人列表默认每页 50 条，可按关键词筛选：

```bash
nove meeting participants <meeting-id> --search <name> --all
```

查询“谁参加过”时使用参会人接口，不要把转写中出现的人名当作完整参会人名单。

参会人表格中的行 `id` 是 participant ID；`platformUser.id` 与 `user.id` 分别表示平台身份和本地用户。默认字段使用点路径展示嵌套身份。需要判断关联关系或处理同名成员时使用 `--json`，不要从显示名反推用户 ID。

## 创建与更新

创建时 `--platform`、`--platform-meeting-id`、`--title` 和 `--type` 必填，可选 `--actual-start-at`、`--ended-at`、`--duration-seconds`。时间必须是带显式时区的 ISO 8601；同时提供开始与结束时间时，开始时间必须早于结束时间。执行前复述平台会议 ID、标题和时间；若用户实际想创建第三方日程，停止并说明边界。

更新支持标题、类型、实际开始时间、结束时间、时长、会议码和参会人数，时间规则与创建相同。会议处理状态来源于关联记录，不通过会议更新命令修改。先运行：

```bash
nove meeting get <meeting-id>
```

确认当前值和目标值后再更新，完成后再次获取详情验证。

## 删除

删除命令默认要求交互确认。执行前仍必须：

1. 用 `meeting get` 读取目标。
2. 向用户展示会议 ID、标题和时间。
3. 获得针对该目标的明确删除确认。
4. 可先执行 `nove meeting delete <meeting-id> --dry-run` 检查目标；再执行删除并响应 CLI 确认提示。
5. 通过重新查询或 API 的明确响应验证结果。

非交互环境只有在用户已经明确确认准确目标后，才使用 `nove meeting delete <meeting-id> --yes`。
