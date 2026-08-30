---
name: nove
description: 使用 nove CLI 配置和访问 Nove API，查询或管理会议、记录、转写、总结、追踪报告、用户、项目、产品与订单。用户提到 nove、nove-cli、Nove 会议数据、用户、项目、产品、订单，或明确要求通过 Nove 命令行完成任务时使用；不用于创建飞书、腾讯会议等第三方日程。
---

# Nove CLI

通过 `nove <topic> <command>` 调用 CLI。也可接受 oclif 的冒号形式，但示例统一使用空格形式。

## 开始前

1. 根据用户意图读取下方对应领域 reference；只加载当前任务需要的文档。
2. 任务跨越多个资源或 ID 含义不明确时，读取 [identifiers-and-relations.md](references/identifiers-and-relations.md)。
3. 需要分页、机器解析或排查失败时，读取 [output-and-errors.md](references/output-and-errors.md)。
4. 需要多步查询、总结或写入闭环时，读取 [workflows.md](references/workflows.md)。
5. 运行 `nove --version` 和目标命令的 `--help`，以当前安装版本的帮助为参数权威来源。若缺少本 Skill 依赖的 flag 或命令，报告版本不兼容，不猜测替代参数。
6. 若 `nove` 不可用，报告缺少可执行文件并请求用户安装或提供调用路径；不要自行全局安装。
7. 若缺少认证，提示用户亲自在终端运行 `nove login`；不要索取、读取、打印或保存 API Key。

## 必须遵守

- 默认执行最小范围的读操作。创建、更新、导入、删除或配置持久化必须由用户明确要求。
- 删除会议、记录、追踪报告、用户、项目、产品或订单前，先读取并展示准确目标；未得到明确确认时不要执行。
- 不把 API Key 放入命令参数、示例、日志或回复。不要读取 CLI 的 `auth.json`。
- 把会议、记录、用户、项目、产品、订单和追踪报告等资源 ID 视为不同标识，不要互换。
- 用户要求“全部”结果时处理分页，直到分页元数据或返回数量证明已经取完。
- 列表默认输出表格；需要机器处理时使用 `--json`。`--fields`、`--sort` 只用于表格，`--all` 与 `--page` 不同时使用。
- 自动化调用统一添加 `--json`：成功时 stdout 只有一个 JSON 值；失败时错误 JSON 写入 stderr，并以非零状态退出。不要从普通成功文案或表格中解析数据。
- 将“今天”“昨天”“上周”等相对时间转换为带时区的明确 ISO 区间，并在结果中说明采用的时区。
- 修改数据前先读取当前状态；执行后重新读取或使用响应验证结果，不仅依据成功提示。
- 不因连接失败而擅自修改持久化 API 地址。临时目标优先使用单次 `NOVE_API_URL` 环境变量。
- 会议转写和用户数据可能包含手机号等敏感信息；只返回完成任务所需字段并做脱敏。
- 不把表格显示值当成完整 API 对象；跨步骤取 ID、判断状态或处理长文本时使用 `--json`。

## 意图路由

| 用户意图 | 路由 |
| --- | --- |
| 登录、退出登录、查看认证状态、切换 API 地址或排查认证/连接错误 | 读取 [authentication-and-config.md](references/authentication-and-config.md) |
| 查询或维护会议资源、统计和参会人 | 读取 [meetings.md](references/meetings.md) |
| 查询会议记录、读取转写、按平台用户检索发言与上下文、管理参会者总结，或删除记录 | 读取 [minutes.md](references/minutes.md) |
| 查询、创建、更新或删除追踪报告 | 读取 [tracking-reports.md](references/tracking-reports.md) |
| 查询、创建、更新、删除或导入用户 | 读取 [users.md](references/users.md) |
| 查询或维护当前组织的项目，或调整项目状态 | 读取 [projects.md](references/projects.md) |
| 查询或维护产品、订单，或调整其状态 | 读取 [commerce.md](references/commerce.md) |

## 常见组合

查询会议并读取转写、分析某个平台用户在时间段内讨论的内容、确认参会人、维护参会者总结、从证据创建追踪报告，或执行项目与产品关联写入时，按需读取 [workflows.md](references/workflows.md)。

## 返回结果

说明实际使用的命令范围、筛选条件、时区和分页完成情况。区分 CLI/API 返回的事实、根据转写做出的总结，以及你自己的推断；失败时保留退出状态、API 状态码和非敏感错误信息，不声称操作成功。
