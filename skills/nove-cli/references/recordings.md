# 录像与转写

用于列出会议录像、查看录像详情、读取转写，以及删除录像。

会议 ID 用于筛选录像；录像 ID 用于详情、转写和删除。不要把两者互换。

## 命令

| 任务 | 命令 |
| --- | --- |
| 列出录像 | `nove meeting recording list` |
| 获取录像详情 | `nove meeting recording get <recording-id>` |
| 获取转写 | `nove meeting recording transcript <recording-id>` |
| 删除录像 | `nove meeting recording delete <recording-id>` |

## 查询录像

列表支持：

- `--meetingId`：按会议 ID 筛选
- `--status`：例如 `PROCESSING`、`COMPLETED`、`FAILED`
- `--source`：例如 `PLATFORM_AUTO`、`UPLOAD`
- `--page`，默认 `1`
- `--limit`，默认 `10`

```bash
nove meeting recording list \
  --meetingId <meeting-id> \
  --status COMPLETED \
  --page 1 \
  --limit 100
```

用户要求全部录像时按分页取完。存在多条录像时，根据录像 ID、状态、来源和时间选择；信息不足时让用户确认，不默认取第一条。

## 获取转写

只对状态为 `COMPLETED` 的录像获取转写。先确认录像详情：

```bash
nove meeting recording get <recording-id>
nove meeting recording transcript <recording-id> --format json
```

`--format` 支持 `text` 和 `json`，默认 `text`。需要分析、时间轴或长文本处理时优先使用 `json`；仅展示可读正文时可使用 `text`。

若录像仍为 `PROCESSING`，报告当前状态并停止；若为 `FAILED`，报告失败，不用其他会议或录像的内容替代。

## 基于转写总结

1. 获取完整转写，不只处理输出开头或第一页录像。
2. 长转写可按时间段分块分析，但最后综合所有分块。
3. 区分转写原文、明确结论、建议和你的推断。
4. 对疑似 ASR 错词标记不确定性，不擅自修正为确定事实。
5. 隐去无关的电话、邮箱、访问凭据等敏感信息。

## 删除录像

删除命令没有内置二次确认。执行前用 `recording get` 展示准确录像 ID、关联会议、状态和来源，取得明确确认后再执行：

```bash
nove meeting recording delete <recording-id>
```

删除后重新查询该录像或关联会议的录像列表验证结果。
