# 会议记录与转写

用于列出会议记录、查看记录详情、读取转写、管理参会者总结，以及删除记录。

会议 ID 用于筛选记录；记录 ID 用于详情、转写、参会者总结和删除；总结 ID 只标识一条参会者总结。不要把这些 ID 互换。

## 命令

| 任务 | 命令 |
| --- | --- |
| 列出记录 | `nove minute list` |
| 获取记录详情 | `nove minute get <minute-id>` |
| 获取转写 | `nove minute transcript <minute-id>` |
| 列出参会者总结 | `nove minute speaker-summary list <minute-id>` |
| 获取参会者总结 | `nove minute speaker-summary get <minute-id> <summary-id>` |
| 创建参会者总结 | `nove minute speaker-summary create <minute-id>` |
| 更新参会者总结 | `nove minute speaker-summary update <minute-id> <summary-id>` |
| 删除参会者总结 | `nove minute speaker-summary delete <minute-id> <summary-id>` |
| 删除记录 | `nove minute delete <minute-id>` |

## 查询记录

列表支持：

- `--meeting-id`：按会议 ID 筛选
- `--status`：例如 `PROCESSING`、`COMPLETED`、`FAILED`
- `--source`：`PLATFORM_AUTO`、`USER_MANUAL` 或 `THIRD_PARTY`
- `--page`，默认 `1`
- `--limit`，默认 `10`

```bash
nove minute list \
  --meeting-id <meeting-id> \
  --status COMPLETED \
  --all
```

用户要求全部记录时使用 `--all`。存在多条记录时，根据记录 ID、状态、来源和时间选择；信息不足时让用户确认，不默认取第一条。

## 获取转写

只对状态为 `COMPLETED` 的记录获取转写。先确认记录详情：

```bash
nove minute get <minute-id>
nove minute transcript <minute-id> --format json
```

`--format` 支持 `text` 和 `json`，默认 `text`。需要分析、时间轴或长文本处理时优先使用 `json`；仅展示可读正文时可使用 `text`。

若记录仍为 `PROCESSING`，报告当前状态并停止；若为 `FAILED`，报告失败，不用其他会议或记录的内容替代。

## 参会者总结

查询总结列表时使用记录 ID，支持 `--page`（默认 `1`）和 `--limit`（默认 `20`，最大 `100`）：

```bash
nove minute speaker-summary list <minute-id> --page 1 --limit 100
nove minute speaker-summary get <minute-id> <summary-id>
```

用户要求全部总结时根据响应中的分页元数据取完，不把当前页当成完整结果。

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

删除命令默认要求交互确认。执行前用 `minute get` 展示准确记录 ID、关联会议、状态和来源，取得明确确认后，可先执行 `nove minute delete <minute-id> --dry-run` 检查目标，再执行：

```bash
nove minute delete <minute-id>
```

删除后重新查询该记录或关联会议的记录列表验证结果。
