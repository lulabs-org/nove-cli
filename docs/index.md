---
layout: home

hero:
  name: Nove CLI
  text: 在终端中管理 Nove 资源
  tagline: 面向人类与 AI Agent 的命令行工具，支持会议、用户与插件管理。
  actions:
    - theme: brand
      text: 开始使用
      link: /installation-guide
    - theme: alt
      text: 查看命令
      link: /login

features:
  - title: 会议管理
    details: 创建、查询、更新会议，并访问参会者、录制与转写数据。
    link: /meeting
  - title: 用户管理
    details: 创建、查询和维护用户，支持从 CSV 或 XLSX 文件批量导入。
    link: /user
  - title: Agent 友好
    details: 通过结构清晰的命令与参数，让自动化流程和 AI Agent 易于调用。
    link: /installation-guide
---

## 快速开始

```shell
npm install -g @novesuite/cli
nove login
nove meeting list
```

完整的环境要求、API 地址配置和验证步骤请参阅[安装与配置](/guide/installation-guide)。
