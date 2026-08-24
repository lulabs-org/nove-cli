# 认证与 API 配置

用于登录、选择 Nove API 地址，以及处理认证或网络错误。

## 地址优先级

CLI 按以下顺序选择 API 地址：

1. 当前命令的 `NOVE_API_URL` 环境变量
2. `nove config set base-url <url>` 保存的地址
3. 默认地址 `https://noveapi.proflu.cn`

临时访问本地或测试服务时，只为当前命令设置环境变量：

```bash
NOVE_API_URL=http://localhost:3000 nove meeting list --page 1 --limit 10
```

仅当用户明确要求长期切换时写入持久配置：

```bash
nove config set base-url https://api.example.com
```

`config set` 当前只支持键 `base-url`。不要为了排查一次连接失败而覆盖用户的持久配置。

## 登录

默认让用户在自己的终端交互式输入 API Key：

```bash
nove login
```

不要让用户把 API Key 发到对话中，不要把 API Key 放入命令参数，也不要读取或展示 CLI 配置目录中的 `auth.json`。

自动化环境应由 secret manager 设置 `NOVE_API_KEY` 后运行 `nove login`，或通过标准输入调用 `nove login --api-key-stdin`。不要把真实 Key 写入命令文本、日志或回复。

登录会先向目标 Nove API 校验 Key，验证通过后才写入本地凭据文件；网络不可达、Key 无效或服务未提供校验端点时不会保存。

查看状态和退出登录不会暴露凭据：

```bash
nove auth status
nove auth status --json
nove logout
```

`auth status` 只报告是否已认证及凭据更新时间，不返回 API Key。`logout` 可以重复执行，未登录时也不会暴露或伪造凭据信息。

凭据文件写入时权限应为 `0600`。如果凭据或配置文件存在但 JSON 已损坏、结构不合法或字段类型错误，CLI 会明确报错；不要把它解释成“未登录”，也不要为了绕过错误读取、重写或删除用户文件。

## 执行前检查

```bash
command -v nove
nove --help
nove meeting list --help
```

若使用仓库内开发版本，只在用户已将该仓库置于任务范围时使用仓库提供的开发入口；不要假设任意工作目录都存在源码。

## 错误处理

| 现象 | 处理 |
| --- | --- |
| `API Key is missing` | 请用户运行 `nove login`，不要索取 Key |
| `API_AUTHENTICATION_ERROR` / 401 | 说明认证无效或已过期，请用户重新登录 |
| `API_PERMISSION_ERROR` / 403 | 说明当前 Key 无权访问目标，不要换身份或扩大权限 |
| `API_CONFLICT_ERROR` / 409 | 报告资源冲突及非敏感详情，不盲目重试写请求 |
| `fetch failed` / 连接拒绝 | 检查目标 URL、端口和服务监听状态；保持原配置不变 |
| `API Error (404)` | 复核资源类型与 ID，特别是会议 ID 和记录 ID |
| 未知参数或枚举 | 运行目标命令 `--help`，以实时帮助为准 |

自动化调用添加 `--json`：成功结果是 stdout 中的单个 JSON 值；失败详情在 stderr，退出状态非零。输出错误时删除 API Key、认证头、手机号等敏感内容。连接恢复后重新执行原始查询，不能用先前失败结果回答用户。
