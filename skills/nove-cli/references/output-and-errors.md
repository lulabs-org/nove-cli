# 输出、分页与错误契约

需要机器解析、获取全部结果、选择字段、诊断失败或判断命令是否真正成功时读取本文件。

## 输出模式

| 场景 | 使用方式 | stdout | stderr |
| --- | --- | --- | --- |
| 人工浏览列表 | 默认表格 | 表头、行和数量摘要 | 错误 |
| 人工查看详情 | 默认输出 | 可读 JSON 和可选成功提示 | 错误 |
| 自动化/跨步骤处理 | `--json` | 恰好一个 JSON 值 | 结构化错误 JSON |

不要从表格列宽、截断文本、成功文案或 Unicode 分隔线中解析数据。需要 ID、嵌套字段、正文、sources 或完整分页时使用 `--json`。

成功但 API 无响应体时，`--json` 输出 `null`。非 JSON 模式下，写命令可能同时输出成功提示和响应对象，不能只看到提示就认为所有预期字段都已落库。

## 列表结构

列表 API 使用两种容器：

- meeting、participant、minute、speaker summary、tracking report：结果数组通常在 `data`。
- user：结果数组在 `items`。

分页响应通常还包含 `total`、`page`、`limit` 或 `pageSize`、`totalPages`。不要假设当前响应已经包含全部数据。

### `--all`

- 用户明确说“所有、全部、完整名单”时使用 `--all`。
- `--all` 与 `--page` 互斥。
- CLI 从第 1 页遍历到 `totalPages` 并合并数组。
- `--all --json` 返回一个合并后的响应对象，不是逐行 JSON 流。
- 如果请求中途失败，整个命令失败；不要把已取到的前几页描述为完整结果。

### `--fields` 与 `--sort`

- 只影响表格展示，不发送给 API。
- 不能与 `--json` 同用。
- 嵌套字段使用点路径，例如 `target.nameSnapshot`、`platformUser.displayName`。
- `--sort field:asc|desc` 是当前已获取结果的客户端排序；它不改变服务端分页顺序。
- 对全量数据排序时先使用 `--all`，否则只能排序当前页。

## 空结果与未就绪

- 表格模式的空列表显示 `No ... found.`，这是成功的空结果，不是错误。
- JSON 模式保留 API 的空数组和分页元数据，不额外输出提示。
- 空列表不能证明上游资源不存在；先复核 ID、筛选条件、时区和分页。
- minute 存在但 transcript/summary 尚未生成时，明确报告“资源未就绪”，不要用其他记录代替。
- minute 含 `errorMessage` 时先报告错误并停止依赖该记录的后续分析。

## 结构化错误

使用 `--json` 时，错误写入 stderr，stdout 保持为空。错误对象可能包含：

```json
{
  "code": "API_PERMISSION_ERROR",
  "message": "Forbidden resource",
  "status": 403,
  "requestId": "optional-request-id",
  "details": {}
}
```

| `code` | 含义 | AI 应采取的动作 |
| --- | --- | --- |
| `CLI_USAGE_ERROR` | 缺少参数、未知 flag、枚举或整数边界错误 | 读取目标命令 `--help`，修正参数后再运行 |
| `CLI_ERROR` | 本地验证、文件读取或参数组合失败 | 根据 message 修正输入；未发出 API 请求 |
| `AUTHENTICATION_REQUIRED` | 本地没有可用凭据 | 请用户运行 `nove login`；不要索取 Key |
| `API_AUTHENTICATION_ERROR` | 401，凭据无效或过期 | 请用户重新登录；不要尝试其他凭据 |
| `API_PERMISSION_ERROR` | 403，当前身份缺少权限 | 报告所需操作和权限；停止，不绕过权限 |
| `API_REQUEST_ERROR` | 其他 4xx，例如资源不存在或验证失败 | 复核资源类型、ID 和 details；不要盲目重试 |
| `API_CONFLICT_ERROR` | 409，唯一资源或周期冲突 | 查询现有资源，向用户说明冲突，不重复创建 |
| `API_RATE_LIMITED` | 429 | 尊重自动重试结果；仍失败时稍后再试 |
| `API_SERVER_ERROR` | 5xx | 保留 requestId，说明服务端失败，不声称成功 |
| `API_NETWORK_ERROR` | 无法连接 API | 检查目标地址与服务状态，不改持久配置 |
| `API_TIMEOUT` | 请求超过超时 | 说明结果未知；写请求不要自动重放 |
| `INVALID_API_RESPONSE` | API 返回无法解析的 JSON 或验证响应异常 | 报告契约异常，保留非敏感详情 |

GET/HEAD 请求会对网络错误以及 429、502、503、504 做有限自动重试；POST、PUT、PATCH、DELETE 不自动重试。写请求超时或断网时，先通过 `get/list` 判断是否已生效，再决定是否需要用户授权重试。

## 成功判定

读操作成功需要满足：退出码为 0、JSON 可解析、筛选/分页范围符合用户意图。

写操作成功需要满足：

1. 命令退出码为 0，并得到 API 成功响应。
2. 使用返回对象或后续 `get/list` 验证关键字段。
3. 删除后确认目标不再由普通查询返回。
4. 批量导入分别报告 `successCount`、`failureCount` 和总数；部分失败不能描述为全部成功。

不要只根据 HTTP 请求已发送、成功提示、当前页为空或测试环境旧数据推断最终状态。
