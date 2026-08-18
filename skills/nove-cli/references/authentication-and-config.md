# 认证与 API 配置

用于登录、选择 Nove API 地址，以及处理认证或网络错误。

## 地址优先级

CLI 按以下顺序选择 API 地址：

1. 当前命令的 `NOVE_API_URL` 环境变量
2. `nove config set api-url <url>` 保存的地址
3. 默认地址 `https://noveapi.proflu.cn`

临时访问本地或测试服务时，只为当前命令设置环境变量：

```bash
NOVE_API_URL=http://localhost:3000 nove meeting list --page 1 --limit 10
```

仅当用户明确要求长期切换时写入持久配置：

```bash
nove config set api-url https://api.example.com
```

`config set` 当前只支持键 `api-url`。不要为了排查一次连接失败而覆盖用户的持久配置。

## 登录

默认让用户在自己的终端交互式输入 API Key：

```bash
nove login
```

不要让用户把 API Key 发到对话中，不要使用带真实值的 `--api-key` 命令，也不要读取或展示 CLI 配置目录中的 `auth.json`。

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
| `API Error (401)` | 说明认证无效或已过期，请用户重新登录 |
| `API Error (403)` | 说明当前 Key 无权访问目标，不要换身份或扩大权限 |
| `fetch failed` / 连接拒绝 | 检查目标 URL、端口和服务监听状态；保持原配置不变 |
| `API Error (404)` | 复核资源类型与 ID，特别是会议 ID 和录像 ID |
| 未知参数或枚举 | 运行目标命令 `--help`，以实时帮助为准 |

输出错误时删除 API Key、认证头、手机号等敏感内容。连接恢复后重新执行原始查询，不能用先前失败结果回答用户。
