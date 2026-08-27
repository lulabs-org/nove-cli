# 会议记录、转写与参会者总结

用于列出会议记录、查看记录详情、读取转写、管理参会者总结，以及删除记录。

会议 ID 用于筛选记录；记录 ID 用于详情、转写、参会者总结和删除；总结 ID 只标识一条参会者总结。不要把这些 ID 互换。

完整资源关系见 [identifiers-and-relations.md](identifiers-and-relations.md)。需要分页合并、JSON 解析、空结果或错误恢复时读取 [output-and-errors.md](output-and-errors.md)。

## 命令

| 任务 | 命令 |
| --- | --- |
| 列出记录 | `nove minute list` |
| 获取记录详情 | `nove minute get <minute-id>` |
| 获取转写 | `nove minute transcript <minute-id>` |
| 查询平台用户在时间段内的会议及本人发言 | `nove minute meeting-transcripts <platform-user-id>` |
| 获取平台用户在指定记录中的转写上下文 | `nove minute transcript-context <minute-id> <platform-user-id>` |
| 列出参会者总结 | `nove minute speaker-summary list <minute-id>` |
| 获取参会者总结 | `nove minute speaker-summary get <minute-id> <summary-id>` |
| 创建参会者总结 | `nove minute speaker-summary create <minute-id>` |
| 更新参会者总结 | `nove minute speaker-summary update <minute-id> <summary-id>` |
| 删除参会者总结 | `nove minute speaker-summary delete <minute-id> <summary-id>` |
| 删除记录 | `nove minute delete <minute-id>` |

## 查询记录

列表支持：

- `--meeting-id`：按会议 ID 筛选
- `--source`：`PLATFORM_AUTO`、`USER_MANUAL` 或 `THIRD_PARTY`
- `--page`，默认 `1`
- `--limit`，默认 `10`
- `--all`，自动获取并合并全部分页
- `--fields`、`--sort`，只控制表格输出

```bash
nove minute list \
  --meeting-id <meeting-id> \
  --all
```

用户要求全部记录时使用 `--all`，不要再同时传 `--page`。需要机器处理时使用 `--json`，且不要同时传 `--fields` 或 `--sort`。存在多条记录时，根据记录 ID、来源、错误信息和时间选择；信息不足时让用户确认，不默认取第一条。

列表 `--json` 的数组位于 `data`。表格默认展示 `id`、`meetingId`、`source`、`errorMessage`、`startAt`、`createdAt`；`errorMessage` 为非空时，该记录不能作为正常转写或总结来源。

## 获取转写

获取转写前先确认记录详情：

```bash
nove minute get <minute-id>
nove minute transcript <minute-id> --format json --json
```

`--format` 决定 API 返回转写正文还是分段结构，支持 `text` 和 `json`，默认 `text`；`--json` 决定 CLI 是否以单个 JSON 值输出。需要分析、时间轴或长文本处理时使用 `--format json --json`；仅供人阅读正文时可保留默认格式。

若记录包含 `errorMessage`，先报告错误并停止，不用其他会议或记录的内容替代。没有错误但转写尚不可用时，明确说明资源尚未生成。

`--format json` 控制 API 返回分段结构，外层 `--json` 控制 CLI 输出协议；自动化分析通常两者都需要。只添加外层 `--json` 不会把文本转写自动变成分段数据。

## 按平台用户查询会议转写

使用平台用户 ID 和带明确时区的半开时间区间，查询该用户参加的会议、Minute，以及该用户自己的转写段落。单次区间最多 31 天：

```bash
nove minute meeting-transcripts <platform-user-id> \
  --start-date '2026-08-01T00:00:00+08:00' \
  --end-date '2026-09-01T00:00:00+08:00' \
  --json
```

响应保留 `meetings -> minutes -> transcripts -> segments` 嵌套结构；没有录制、转写或本人发言时，对应数组可能为空。这里必须传 `PlatformUser.id`，不能传 participant ID 或本地 user ID。

## 获取平台用户的转写上下文

使用 Minute ID、平台用户 ID 和 `--depth` 获取目标发言前后各 N 个段落；深度范围为 `0–20`：

```bash
nove minute transcript-context <minute-id> <platform-user-id> \
  --depth 3 \
  --json
```

不同 Transcript 独立返回，重叠窗口会合并去重；`isTargetSpeaker` 用于区分目标用户发言和上下文。用户必须是该 Minute 所属会议的有效参会者。

## 参会者总结

查询总结列表时使用记录 ID，支持 `--page`（默认 `1`）和 `--limit`（默认 `20`，最大 `100`）：

```bash
nove minute speaker-summary list <minute-id> --page 1 --limit 100
nove minute speaker-summary get <minute-id> <summary-id>
```

用户要求全部总结时使用 `--all`，不把当前页当成完整结果。列表默认表格；`--fields`、`--sort` 与 `--json` 不同时使用。

总结列表数组位于 `data`。`platformUserId` 标识平台身份，列表项 `id` 才是 summary ID；更新或删除必须传 summary ID。

创建总结必须提供平台用户 ID 和正文。关键词参数可重复；`--generated-by` 支持 `AI`、`HYBRID` 和 `MANUAL`：

```bash
nove minute speaker-summary create <minute-id> \
  --platform-user-id <platform-user-id> \
  --part-summary '<summary-text>' \
  --keywords '<keyword-1>' \
  --keywords '<keyword-2>' \
  --generated-by MANUAL
```

更新时至少提供 `--part-summary` 或一个或多个 `--keywords`：

```bash
nove minute speaker-summary update <minute-id> <summary-id> \
  --part-summary '<updated-summary-text>'
```

创建或更新前先确认记录 ID、平台用户 ID、总结 ID 与拟写入内容；执行后使用 `list` 或 `get` 重新读取验证结果。总结正文可能包含个人信息，只展示完成任务所需内容。

删除总结前先用 `get` 展示准确的记录 ID、总结 ID、平台用户 ID 和必要的正文摘要，取得明确确认后，可先用 `--dry-run` 检查目标，再执行删除并响应 CLI 确认提示：

```bash
nove minute speaker-summary delete <minute-id> <summary-id>
```

删除后重新运行 `get` 或 `list` 验证结果。

非交互环境只有在用户已经明确确认准确目标后，才为删除命令添加 `--yes`。

## 基于转写总结

1. 获取完整转写，不只处理输出开头或第一页。
2. 长转写可按时间段分块分析，但最后综合所有分块。
3. 区分转写原文、明确结论、建议和你的推断。
4. 对疑似 ASR 错词标记不确定性，不擅自修正为确定事实。
5. 隐去无关的电话、邮箱、访问凭据等敏感信息。

## 删除记录

删除命令默认要求交互确认。执行前用 `minute get` 展示准确记录 ID、关联会议、来源和错误信息，取得明确确认后，可先执行 `nove minute delete <minute-id> --dry-run` 检查目标，再执行：

```bash
nove minute delete <minute-id>
```

删除后重新查询该记录或关联会议的记录列表验证结果。

非交互环境只有在用户已经明确确认准确目标后，才使用 `nove minute delete <minute-id> --yes`。
