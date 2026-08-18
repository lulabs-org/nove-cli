# Nove CLI (@novesuite/cli)

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@novesuite/cli.svg)](https://npmjs.org/package/@novesuite/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@novesuite/cli.svg)](https://npmjs.org/package/@novesuite/cli)

**Nove CLI** 是 [Nove](https://github.com/lulabs-org/nove-api) 的官方命令行工具，旨在帮助开发者、系统管理员以及 AI Agent 快速、高效地管理和交互 Nove 平台的核心业务资源。

借助 Nove CLI，您可以直接在终端或自动化脚本中完成对**会议记录**、**用户账户**、**会议转写与统计**等模块的操作，从而将 Nove 无缝集成到您的日常工作流或 AI 智能体体系中。

## ✨ 核心特性

- 🎙️ **会议与转写管理**：在终端快速检索、创建、更新会议记录，拉取会议转写与总结数据。
- 👥 **用户统一管理**：支持命令行的形式轻松管理用户数据。
- 🤖 **AI Agent 友好型设计**：提供标准化的参数输入与结构化的数据输出，使其极易被大语言模型（LLM）的自动化流程调用。
- ⚙️ **灵活的环境配置**：支持便捷的身份认证登录及本地配置管理。
- 🔌 **高度可扩展**：基于 Oclif 框架构建，支持指令集的持续迭代与插件扩展。

## 🚀 适用场景

- 👨‍💻 **开发者**：在本地开发过程中快速测试与调用 Nove 后端 API（`nove_api`）。
- 🛠 **运维与数据分析师**：批量执行会议信息统计或资源管理。
- 🤖 **AI 智能体研发**：赋予 AI Agent 操作底层业务数据的权限，完成诸如“查询上周例会总结”等自动化任务。

## 🗺️ 长期规划 (Roadmap)

随着 **Nove API** 底层能力的不断演进（如多租户架构、飞书多维表格同步、腾讯会议 Webhook 深度集成等），**Nove CLI** 的长期规划也将紧跟业务发展，进一步丰富功能：

- **🔗 第三方平台深度集成**：
  - 提供对**腾讯会议**、**飞书/钉钉**等平台集成配置的快捷管理命令。
  - 支持一键导出会议数据至**飞书多维表格（Bitable）**或本地 CSV/Excel。
- **🏢 组织与权限高级管理**：
  - 增加针对**多租户架构（Multi-tenant）**及 RBAC 角色权限体系的 CLI 操作支持，方便管理员跨空间管理。
- **🧠 进阶 AI 与自动化能力**：
  - 接入与强化 OpenAI/大模型分析能力，支持通过 CLI 进行本地化的批量 Prompt 测试与转写重处理（Reprocess）。
  - 提供标准化的自动化流水线（CI/CD）集成脚本输出功能。
- **🌐 交互与体验优化**：
  - 引入更丰富的 TUI（终端用户界面）交互。
  - 支持多环境（Dev, Staging, Prod）配置的无缝热切。

---


<!-- toc -->
* [Nove CLI (@novesuite/cli)](#nove-cli-novesuitecli)
* [Usage](#usage)
* [Commands](#commands)
* [Command Topics](#command-topics)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @novesuite/cli
$ nove COMMAND
running command...
$ nove (--version)
@novesuite/cli/1.0.1 darwin-arm64 node-v22.23.1
$ nove --help [COMMAND]
USAGE
  $ nove COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
# Command Topics

* [`nove config`](docs/config.md) - Set a configuration value
* [`nove help`](docs/help.md) - Display help for nove.
* [`nove login`](docs/login.md) - Login to Nove API using an API Key
* [`nove meeting`](docs/meeting.md) - Manage meeting records
* [`nove plugins`](docs/plugins.md) - List installed plugins.
* [`nove user`](docs/user.md) - Manage user accounts

<!-- commandsstop -->
