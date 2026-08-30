# 认证与 API 配置

用于登录、选择 Nove API 地址，以及处理认证或网络错误。

需要解释结构化错误、退出状态和自动重试时，同时读取 [output-and-errors.md](output-and-errors.md)。

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

交互式终端运行 `nove login` 后会选择登录方式。浏览器 OAuth 授权适合个人登录并允许用户在授权页选择组织和权限；API Key 适合自动化与服务账号：

```bash
# 交互式选择浏览器 OAuth（推荐）或 API Key
nove login

# 明确使用浏览器 OAuth；无法自动打开浏览器时输出授权地址
nove login --method oauth
nove login --method oauth --no-browser

# 限制授权页可选择的权限；--scope 可以重复
nove login --method oauth --scope meeting:read --scope minute:read
```

OAuth 登录使用授权码与 PKCE，并通过本机回调完成认证。不要代替用户在授权页扩大权限，也不要读取或展示 CLI 配置目录中的 `auth.json`。

非交互式终端和 `--json` 模式不会显示选择菜单；没有可推断的登录来源时必须明确传入 `--method oauth` 或 `--method api-key`。自动化环境应由 secret manager 设置 `NOVE_API_KEY`，或通过标准输入提供 API Key：

```bash
nove login --method api-key
printf '%s' "$NOVE_API_KEY" | nove login --method api-key --api-key-stdin
```

不要让用户把 API Key 发到对话中，也不要把 API Key 放入命令参数、日志或回复。API Key 登录会先向目标 Nove API 校验 Key，验证通过后才写入本地凭据；网络不可达、Key 无效或服务未提供校验端点时不会保存。

## 查看状态与退出登录

查看状态使用 `auth` 主题，退出登录只使用顶层命令：

```bash
nove auth status
nove auth status --json
nove logout
nove logout --json
```

`auth status` 只报告非敏感的登录方式、组织、权限和有效期等状态，不返回 API Key 或 Token。`nove logout` 对 OAuth 凭据默认先请求服务端撤销，再删除本地凭据；只有在服务端不可用且用户明确接受仅清理本地状态时才使用 `nove logout --local-only`。API Key 登录退出时只删除本地凭据。`logout` 可以重复执行，未登录时也不会暴露或伪造凭据信息。

新增资源权限不会自动进入既有 OAuth 会话。执行项目、产品或订单操作前，可从 `nove auth status --json` 检查对应 `project:*`、`product:*` 或 `order:*` scope；缺失时请用户重新完成 OAuth 授权。API Key 的 scope 由服务端管理，CLI 不会自行扩大。

凭据文件写入时权限应为 `0600`。如果凭据或配置文件存在但 JSON 已损坏、结构不合法或字段类型错误，CLI 会明确报错；不要把它解释成“未登录”，也不要为了绕过错误读取、重写或删除用户文件。

## 执行前检查

```bash
command -v nove
nove --help
nove meeting list --help
```

若使用仓库内开发版本，只在用户已将该仓库置于任务范围时使用仓库提供的开发入口；不要假设任意工作目录都存在源码。

`auth status` 只证明本地存在结构合法的凭据，不证明 API 可连接、Key 仍有效或拥有目标权限。至少执行一次目标只读命令后，才能确认该操作可用。

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
