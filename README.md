# Nove CLI (@novesuite/cli)

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@novesuite/cli.svg)](https://npmjs.org/package/@novesuite/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@novesuite/cli.svg)](https://npmjs.org/package/@novesuite/cli)

**Nove CLI** 是 [nove 组织级 Agent 数据基础设施](https://github.com/lulabs-org/nove-api) 的官方命令行数据访问工具。

作为 nove 数据网关的 CLI 访问入口，它不仅方便开发者与系统管理员在终端中快速管理和查询多源汇聚的数据资产，更采用了 **AI Agent 友好型设计**，提供标准化的参数输入与结构化（JSON）的数据输出，使其极易被各种 Agent Harness 和自动化脚本直接集成调用。

所有通过 Nove CLI 的访问操作，均受到 nove 平台统一的“人机权限与审计体系”严格管控，确保组织数据的安全与合规。

## 📖 文档导航

有关 nove 系统的整体架构定位、数据治理原则与路线图，请参阅全局文档：
- **[nove-doc 项目级业务文档仓库](https://github.com/lulabs-org/nove-doc)**

**有关 CLI 所有的具体命令、参数以及详细的使用示例，请直接进入 `docs/` 目录查阅：**
- 👉 **[查看 Nove CLI 命令详情 (docs/)](./docs/README.md)** 👈

---

## 🚀 快速开始 (Usage)

<!-- usage -->
```sh-session
$ npm install -g @novesuite/cli
$ nove COMMAND
running command...
$ nove (--version)
@novesuite/cli/1.3.0 darwin-arm64 node-v22.23.1
$ nove --help [COMMAND]
USAGE
  $ nove COMMAND
...
```
<!-- usagestop -->

## 🛠️ 命令速览 (Command Topics)

*以下为命令一级主题，详细的子命令与参数用法请点击进入对应文档：*

<!-- commands -->
# Command Topics

* [`nove auth`](docs/commands/auth.md) - Inspect local authentication state
* [`nove config`](docs/commands/config.md) - Set a configuration value
* [`nove help`](docs/commands/help.md) - Display help for nove.
* [`nove login`](docs/commands/login.md) - Sign in through the browser, or validate an API Key for automation
* [`nove logout`](docs/commands/logout.md) - Revoke OAuth access and remove the locally stored credential
* [`nove meeting`](docs/commands/meeting.md) - Manage meeting records
* [`nove minute`](docs/commands/minute.md) - Manage meeting minutes and transcripts
* [`nove order`](docs/commands/order.md) - Manage orders
* [`nove product`](docs/commands/product.md) - Manage products
* [`nove project`](docs/commands/project.md) - Manage projects in the current organization
* [`nove tracking-report`](docs/commands/tracking-report.md) - Manage tracking reports
* [`nove user`](docs/commands/user.md) - Manage user accounts

<!-- commandsstop -->
