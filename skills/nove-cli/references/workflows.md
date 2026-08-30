# 跨资源工作流

用户请求需要多个资源或内容分析时读取本文件。只在需要解析跨资源 ID 时读取 [identifiers-and-relations.md](identifiers-and-relations.md)；只在需要分页、机器解析或错误恢复时读取 [output-and-errors.md](output-and-errors.md)。单资源更新、删除和用户导入使用对应领域 reference，不需要本文件。

以下步骤描述决策边界，不意味着自动获得写入、导入或删除权限。

## 查询某天的全部会议

1. 确认用户时区；未指定且语境为中国业务时可明确采用 `Asia/Shanghai`。
2. 把自然日交给 CLI 生成半开区间，不手写 `23:59:59`：

```bash
nove meeting list --date YYYY-MM-DD --timezone Asia/Shanghai --all --json
```

3. 根据 `id`、`title`、`platform`、开始时间区分同名会议。
4. 报告采用的日期、时区和取完的页数/总数。空结果时保留筛选条件，不改用其他日期。

## 从会议读取完整转写并总结

```text
meeting list/get
  -> minute list --meeting-id
  -> minute get
  -> minute transcript --json
  -> 分析完整转写
```

1. 先确认准确 `meetingId`。
2. 使用 `minute list --meeting-id <meeting-id> --all --json`；一场会议可能有多份记录。
3. 根据 minute 的 `id`、`source`、`errorMessage` 和时间选择记录。多份均可用但用户意图不明确时请求选择。
4. `minute get <minute-id> --json` 存在 `errorMessage` 时停止并报告。
5. 用 `minute transcript <minute-id> --json` 获取完整结构；需要关联本地用户信息时增加 `--include-local-user`。不要分析表格截断或普通输出的一小段。
6. 长转写可以分块分析，但最终结论必须覆盖全部分块。区分原文事实、总结、建议和推断；标记疑似 ASR 错误。

## 查询平台用户在时间段内主要讨论的内容

```text
PlatformUser.id + 带时区的时间区间
  -> minute user-transcripts
  -> 从命中结果取得 minuteId
  -> minute transcript-context
  -> 分析目标发言及其必要上下文
```

1. 先确认使用的是 Nove `PlatformUser.id`，不是 participant ID、本地 `User.id` 或第三方平台原始用户 ID。
2. 使用最多 31 天的半开区间定位该用户有发言的录制：

```bash
nove minute user-transcripts <platform-user-id> \
  --start-date '<inclusive-iso-date-time-with-timezone>' \
  --end-date '<exclusive-iso-date-time-with-timezone>' \
  --json
```

3. 第一步按 `Minute.startAt` 查询并只返回目标用户自己的段落，适合定位相关 Minute。
4. 对需要理解上下文的每个 `minuteId`，再运行：

```bash
nove minute transcript-context <minute-id> <platform-user-id> \
  --depth <0-to-20> \
  --json
```

5. 不同 Transcript 独立分析；`isTargetSpeaker` 为 `true` 的段落才是目标用户发言，其余段落只是上下文。无需为了这个目标额外拉取整份转写。
6. 这两个命令都要求 `platform-user:read` 和 `minute:read`。没有命中发言是成功的空结果，不等同于用户未参会；判断参会仍使用 `meeting participants`。

## 确认某人是否参会

1. 定位准确会议。
2. 运行：

```bash
nove meeting participants <meeting-id> --search '<name-or-identifier>' --all --json
```

3. 比较 participant、`platformUser` 和 `user` 三层身份；同名时展示平台身份、本地用户和加入时间供确认。
4. 参会快照是判断参会的依据。转写中出现名字、speaker summary 存在或会议标题提到某人都不能替代参会人查询。

## 创建或维护 speaker summary

```text
minute get
  -> meeting participants（必要时解析 platformUserId）
  -> speaker-summary list/get
  -> 明确写入授权
  -> create/update/delete
  -> speaker-summary get/list 验证
```

- 创建需要准确 `minuteId`、`platformUserId` 和正文。
- 更新需要准确 `summaryId`，不得用 `platformUserId` 代替。
- 删除前展示 minute、summary、平台用户和必要的正文摘要，并获得针对该目标的确认。
- 写入后重新读取；不要仅依据成功提示。

## 从证据创建追踪报告

1. 确认目标类型、目标业务 ID、名称快照、报告类型、周期和 IANA 时区。
2. 逐项查询要引用的来源，按 `sourceType` 记录准确 `sourceId`。
3. 准备正文、target metadata 和 sources；长内容及复杂 JSON 优先使用文件。
4. 向用户复述目标、周期和会写入的证据数量，取得明确创建授权。
5. 执行创建：

```bash
nove tracking-report create \
  --target-type USER \
  --target-id <user-id> \
  --target-name '<name>' \
  --tracking-type USER_PROFILE \
  --cadence MONTHLY \
  --base-date '<iso-date-time-with-timezone>' \
  --timezone Asia/Shanghai \
  --content-file ./report.md \
  --sources-file ./sources.json \
  --json
```

6. 从响应的 `id` 取得 report ID，再 `tracking-report get <report-id> --json` 核对目标、周期、正文和 `sourceCount`。
7. 409 时查询同目标、类型和周期的现有报告；不要改日期或重复创建来绕过冲突。

## 创建关联产品的订单

```text
product list/get
  -> user list/get（如需购买者或负责人）
  -> order list（重复预检）
  -> 明确创建授权
  -> order create
  -> order get 验证
```

1. 用产品编号或关键词运行 `product list --json`，再以 `product get <product-id> --json` 核对产品 ID、名称、状态、价格和币种。
2. 订单涉及购买者、负责人或财务结单人时，分别查询本地 user ID；不要用 participant 或 platform user ID。
3. 有外部订单号时，用 `order list --keyword '<external-id>' --all --json` 检查重复；同时核对渠道 ID，因为外部订单号的唯一性与渠道有关。
4. 向用户复述产品、金额、币种、购买者、渠道和初始状态，取得明确创建授权。
5. 运行 `order create ... --json`，从响应获取 order ID，再以 `order get <order-id> --json` 核对订单号、金额、状态、产品和用户关联。
