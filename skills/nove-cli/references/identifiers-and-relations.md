# 标识符与资源关系

当任务跨越会议、记录、参会人、总结、追踪报告或用户，或者用户只给出名称、平台号码等模糊标识时读取本文件。

## 关系概览

```text
Meeting（会议）
├── MeetingParticipant（参会快照）
│   ├── PlatformUser（平台身份，可为空）
│   └── User（Nove 本地用户，可为空）
└── Minute（会议记录，一场会议可有多份）
    ├── Transcript（转写资源）
    └── SpeakerSummary（某个平台用户在该记录中的总结）

TrackingTarget（被追踪业务对象）
└── TrackingReport（按类型和周期生成的报告）
    └── TrackingReportSource（证据引用）
```

用户和追踪目标可能与会议有关，但它们不是会议的子资源。报告的 source 只是引用证据，不会复制或改变原资源。

## ID 对照

| 标识 | 含义 | 从哪里获得 | 可用于 |
| --- | --- | --- | --- |
| `meetingId` | Nove 内部会议 ID | `meeting list/get` 的 `id` | `meeting get/participants/update/delete`、`minute list --meeting-id` |
| `platformMeetingId` | 飞书、腾讯会议等平台侧会议 ID | 会议详情的 `platformMeetingId` | 创建会议记录或识别外部会议；不能代替 `meetingId` |
| participant `id` | 一条参会快照 ID | `meeting participants` | 识别某次参会记录；不是 user ID |
| `platformUserId` | 平台身份 ID | participant 的 `platformUser.id` 或总结的 `platformUserId` | 创建/定位 speaker summary；不能代替本地 user ID |
| `userId` | Nove 本地用户 ID | `user list/get` 的 `id` 或 participant 的 `user.id` | `user get/update/delete`，也可作为 USER 类型的追踪 `target-id` |
| `minuteId` | 一份会议记录 ID | `minute list/get` 的 `id` | `minute get/transcript/delete` 和全部 speaker-summary 命令 |
| `summaryId` | 一条 speaker summary ID | `minute speaker-summary list/get` 的 `id` | 更新或删除该总结 |
| `reportId` | 一份追踪报告 ID | `tracking-report list/get` 的 `id` | `tracking-report get/update/delete` |
| tracking `targetId` | 被追踪对象的业务 ID | 由 `targetType` 决定 | 创建或筛选追踪报告；不是 TrackingTarget 数据库行 ID |
| source `sourceId` | 报告引用的证据 ID | 由 `sourceType` 决定 | 写入 tracking report 的 sources |

## 追踪目标

`target-type` 决定 `target-id` 的命名空间：

| `target-type` | `target-id` 应表示 |
| --- | --- |
| `USER` | Nove 本地用户 ID |
| `PLATFORM_USER` | 外部平台用户 ID |
| `PROJECT` | 项目业务 ID |
| `ORGANIZATION` | 组织或团队业务 ID |

`target-name` 是创建报告时保存的名称快照，不用于替代 ID。名称可重复或后续变化；筛选和写入需要使用准确 ID。

## 报告来源

下表是当前 Nove API 的业务契约。CLI 只校验 source 的 JSON 形状和枚举，不会在本地证明 `sourceId` 存在或与 `sourceType` 匹配；写入前必须查询原资源。

| `sourceType` | `sourceId` 的预期含义 |
| --- | --- |
| `SPEAKER_SUMMARY` | speaker summary ID |
| `TRACKING_REPORT` | 另一份 tracking report ID |
| `DOCUMENT` | Nove 业务所识别的文档/文件 ID；不要默认传本地文件路径 |
| `MEETING` | Nove meeting ID |

metadata 是证据快照的补充信息，不改变 `sourceId` 的含义。写入前先查询原资源，确认 ID、类型和用户想引用的证据一致。

## 解析模糊目标

1. 用户只给名称时，先运行对应 `list --json` 搜索，不猜 ID。
2. 命中多项时，展示最少但足以区分的字段，例如 ID、名称、平台和时间。
3. 用户给出平台会议号时，先定位对应会议，再使用返回的 Nove `id` 执行后续命令。
4. 用户给出会议 ID 但要读取转写时，先 `minute list --meeting-id`；一场会议可能有多份记录。
5. 用户给出姓名但要修改总结时，先从 participants 确认 `platformUserId`，再从该 minute 的总结列表确认 `summaryId`。
6. 无法唯一解析时停止写操作并请求用户选择；不要默认使用列表第一项。

## 常见混淆

- participant `id`、`platformUser.id` 和 `user.id` 是三种不同标识。
- meeting 的 `id` 与 `platformMeetingId` 不同。
- speaker summary 属于 minute，不直接属于 meeting。
- tracking report 的 `id` 与其 `target.targetId` 不同。
- `sourceId` 没有统一命名空间，必须与同一项的 `sourceType` 一起解释。
