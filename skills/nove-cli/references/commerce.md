# 产品与订单

查询或维护 Nove 产品、订单，或调整其状态时读取本文件。两个 topic 都访问管理员接口，当前身份必须拥有对应权限。

## 命令与权限

| 操作 | 产品命令 / 权限 | 订单命令 / 权限 |
| --- | --- | --- |
| 列表 | `product list` / `product:read` | `order list` / `order:read` |
| 详情 | `product get ID` / `product:read` | `order get ID` / `order:read` |
| 创建 | `product create` / `product:create` | `order create` / `order:create` |
| 更新 | `product update ID` / `product:update` | `order update ID` / `order:update` |
| 状态 | `product status ID` / `product:toggle-status` | `order status ID` / `order:status` |
| 删除 | `product delete ID` / `product:delete` | `order delete ID` / `order:delete` |

以目标命令的 `--help` 为完整参数权威。权限不足时报告 403 和所需操作，不尝试绕过管理员权限。

先用 `nove auth status --json` 检查当前 OAuth 会话是否包含目标 scope。既有会话不会因 CLI 升级自动增加产品或订单权限；缺失时由用户重新完成 OAuth 授权。API Key scope 也必须由服务端预先授予。

## 产品

创建产品至少需要 `--product-code`、`--name` 和 `--category`。分类为 `COURSE|MEMBERSHIP|CONSULTATION|MATERIAL|OTHER`，状态为 `ACTIVE|INACTIVE|DRAFT|ARCHIVED`。

价格字段使用最小货币单位，例如 CNY 的 29900 表示 299.00 元。`--tag` 可重复传入；布尔值使用 `--recommended` / `--no-recommended` 与 `--featured` / `--no-featured`。更新时，可重复使用 `--clear FIELD` 清空可空字段；清空 `tags` 会写入空数组。

列表支持关键词、分类、状态、币种、推荐/精选状态、分页和服务端排序。用户要求全部时使用 `--all --json`，并以 `total`、`totalPages` 和返回条数核对完整性。

## 订单

创建订单至少需要 `--amount`；内部订单号和展示订单号可由 API 生成。金额同样使用最小货币单位。`--metadata` 必须是 JSON 对象，不接受数组或普通字符串。币种、状态和支付提供方必须使用 `--help` 展示的枚举。

订单可关联产品、购买者、渠道、负责人和财务结单人。写入 `--product-id`、`--purchaser-id`、`--current-owner-id` 或 `--financial-closer-id` 前，先查询对应资源确认 ID；不要以名称代替 ID。`--product-name` 是名称快照，不证明产品关联。

列表支持订单状态、币种、支付提供方、渠道、产品、购买者、负责人、支付时间、创建时间与软删除筛选。相对日期先转换为带时区的 ISO 8601 时间。用户要求全部时使用 `--all --json`。

更新时可重复使用 `--clear FIELD` 解除可空关联或清空可空值。订单状态的单一变化优先使用 `order status`，产品状态的单一变化优先使用 `product status`，便于匹配权限和审计语义。

## 写操作闭环

1. 创建前用唯一编号或相关 ID 查询，避免重复产品、订单或错误关联。
2. 更新、改状态或删除前运行 `get ID --json`，核对准确 ID 和关键业务字段。
3. 删除先用 `delete ID --dry-run --json` 展示目标；得到明确确认后才使用 `--yes --json`。
4. 创建、更新和改状态后再次 `get ID --json`，核对 ID、状态、金额、关联和被修改字段。
5. 删除后用普通 `get/list --json` 确认目标不再出现；订单的 `--include-deleted` 仅用于明确要求的审计查询。

写请求超时或断网时不要直接重放，先查询目标判断是否已经生效。
