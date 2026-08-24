# 追踪报告

用于查询、创建、更新和软删除 Nove 追踪报告。报告按目标、报告类型和服务端计算的周期唯一；创建时服务端根据 `cadence`、`base-date` 和 `timezone` 推导周期键与半开区间 `[periodStart, periodEnd)`。

追踪报告 ID 标识报告本身；`target-id` 是用户、平台用户、项目或组织的业务 ID；source 的 `sourceId` 则由 `sourceType` 决定。不要混用这些 ID。

目标与 source 的 ID 命名空间见 [identifiers-and-relations.md](identifiers-and-relations.md)。需要分页、JSON、409 或写请求结果判断时读取 [output-and-errors.md](output-and-errors.md)。

## 命令

| 任务 | 命令 |
| --- | --- |
| 列出报告 | `nove tracking-report list` |
| 获取详情与来源 | `nove tracking-report get <report-id>` |
| 创建报告 | `nove tracking-report create [flags]` |
| 更新正文、生成信息或来源 | `nove tracking-report update <report-id> [flags]` |
| 软删除报告 | `nove tracking-report delete <report-id>` |

执行前使用 `nove tracking-report <command> --help` 核对当前参数。CLI 不能预先证明当前 Key 拥有服务端要求的读、创建、更新或删除权限；遇到 403 时报告权限不足，不要改用其他身份。

## 查询

列表支持：

- `--target-type`：`USER`、`PLATFORM_USER`、`PROJECT`、`ORGANIZATION`
- `--target-id`：目标的业务 ID
- `--keyword`：按目标名称快照模糊搜索
- `--tracking-type`：`MEETING_SUMMARY`、`TRAINING_PLAN`、`DEVELOPMENT_PLAN`、`PROJECT_PROGRESS`、`USER_PROFILE`
- `--cadence`：`DAILY`、`WEEKLY`、`MONTHLY`、`QUARTERLY`、`YEARLY`
- `--period-start`、`--period-end`：带显式时区的 ISO 8601 时间；同时提供时开始必须早于结束
- `--page`、`--limit`（最大 100）、`--all`、`--fields`、`--sort` 和 `--json`

```bash
nove tracking-report list \
  --target-type USER \
  --target-id <user-id> \
  --tracking-type USER_PROFILE \
  --all
```

用户要求全部结果时使用 `--all`，不要同时传 `--page`。默认表格只展示摘要；需要正文、目标 metadata 和完整 sources 时，先从列表确认报告 ID，再运行：

```bash
nove tracking-report get <report-id> --json
```

列表 `--json` 的数组位于 `data`，每项包含目标摘要和 `sourceCount`，不包含正文及完整 sources。`get --json` 返回目标 metadata、`content` 和 `sources`；不要因为列表没有这些字段就判断报告内容为空。

## 创建

创建必填 `target-type`、`target-id`、`target-name`、`tracking-type`、`cadence`、`base-date`，以及 `content` 或 `content-file` 之一。`base-date` 必须带显式时区；`timezone` 是 IANA 时区，默认 `Asia/Shanghai`。

长正文优先使用 UTF-8 文件，复杂结构优先使用 JSON 文件：

```bash
nove tracking-report create \
  --target-type USER \
  --target-id <user-id> \
  --target-name '<name-snapshot>' \
  --tracking-type USER_PROFILE \
  --cadence MONTHLY \
  --base-date '2026-08-24T09:00:00+08:00' \
  --timezone Asia/Shanghai \
  --content-file ./report.md \
  --target-metadata-file ./target-metadata.json \
  --sources-file ./sources.json \
  --generated-by AI \
  --ai-model '<model-name>'
```

`target-metadata` 必须是 JSON object。`sources` 必须是 JSON array，每项格式为：

```json
{
  "sourceType": "MEETING",
  "sourceId": "<source-id>",
  "metadata": {}
}
```

`sourceType` 支持 `SPEAKER_SUMMARY`、`TRACKING_REPORT`、`DOCUMENT`、`MEETING`。也可直接传 `--content`、`--target-metadata '<json>'` 或 `--sources '<json>'`，但同一字段的直接参数与 `-file` 参数不能同时使用。创建前确认目标、报告类型、周期和来源；409 表示同一目标、类型和周期已经存在，不要盲目重试。

创建响应中的 `periodStart` 包含边界，`periodEnd` 是下一周期开始时间且不包含；AI 应以服务端返回周期为准，不自行修正为一天或一个月的最后一秒。

## 更新

更新不允许改变目标或周期身份，只能修改正文、生成信息和 sources。先读取当前详情，再按需更新：

```bash
nove tracking-report get <report-id> --json
nove tracking-report update <report-id> \
  --content-file ./updated-report.md \
  --sources-file ./replacement-sources.json
nove tracking-report get <report-id> --json
```

传入 `--sources` 或 `--sources-file` 会整体替换来源；传 `--sources '[]'` 会清空来源。使用 `--clear-generated-by` 或 `--clear-ai-model` 显式清空对应值，不能与同字段的赋值参数并用。没有任何更新字段时不要调用。

## 删除

删除是软删除，但删除后不会出现在普通查询中。必须先 `get` 展示报告 ID、目标、类型、周期和必要的正文摘要，取得针对该报告的明确确认。可先检查：

```bash
nove tracking-report delete <report-id> --dry-run
```

交互执行删除并响应确认提示；非交互环境只有在用户已经确认准确目标后才使用 `--yes`。删除后再次 `get` 或按相同目标和周期 `list`，验证报告不再可见。
