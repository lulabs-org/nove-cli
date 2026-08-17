---
name: nove-cli
description: 使用 nove-cli 工具执行各种项目配置和管理任务。当用户要求使用 nove 命令行工具时触发。
---

# Nove CLI 使用指南

你现在可以使用本地安装的 `nove-cli` 工具来协助用户。

## 基础信息
- **执行方式**: 直接在终端运行 `nove <topic> <command>` 或 `nove <topic>:<command>`
- **工作环境**: 该 CLI 安装在全局环境或当前项目中，可以直接调用。

## 可用命令

### 1. 基础配置
- **登录授权**: `nove login [--api-key <key>]` 或 `nove login -k <key>`
  - 示例: `nove login -k sk_test_123`。如果不带参数，会交互式提示输入。
- **插件管理**: `nove plugins [--core]`
  - 查看已安装的插件。

### 2. 会议管理 (Meeting)
对会议记录进行 CRUD、获取转写记录和查看统计信息等。
- **列出会议**: `nove meeting list [--page <value>] [--limit <value>] [--platform <TENCENT_MEETING|FEISHU>] [--status <COMPLETED|PENDING>] [--type <SCHEDULED|INSTANT>] [--startDate <iso>] [--endDate <iso>] [--search <keyword>]`
- **获取详情**: `nove meeting get <id>`
- **创建会议**: `nove meeting create --platformMeetingId <id> --title <title> [--startTime <iso>] [--endTime <iso>] [--status <status>]`
- **更新会议**: `nove meeting update <id> [--title <title>] [--status <status>]`
- **删除会议**: `nove meeting delete <id>`
- **查看统计**: `nove meeting stats [--startDate <iso>] [--endDate <iso>]`
- **获取参会人**: `nove meeting participants <id> [--keyword <keyword>] [--page <value>] [--limit <value>]`
- **删除录像**: `nove meeting recording delete <id>`

### 3. 用户管理 (User)
对用户进行 CRUD、导入等操作。
- **列出用户**: `nove user list [--active] [--keyword <keyword>] [--page <value>] [--limit <value>] [--sortBy <field>] [--sortOrder <asc|desc>]`
- **获取用户**: `nove user get <id>`
- **创建用户**: `nove user create [--username <value>] [--email <value>] [--phone <value>] [--displayName <value>] [--active] ...` (支持更多字段如 address, avatar, city, country 等)
- **更新用户**: `nove user update <id> [--username <value>] [--email <value>] [--active] ...`
- **删除用户**: `nove user delete <id>`
- **批量导入**: `nove user import --file <path/to/file.csv|xlsx>`

## 注意事项
- 在执行命令前，确保命令格式正确。在某些环境下，可能需要使用冒号（例如 `nove meeting:list`）来代替空格。
- 如果用户要求执行新的未知任务，先执行 `nove --help` 或 `nove <command> --help` 查看最新支持的命令和参数列表。
- 随着 `nove-cli` 功能的不断迭代，该 skill 也会逐步补充和完善。
