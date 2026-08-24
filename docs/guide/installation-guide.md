# Nove CLI 安装指南

以下步骤面向 AI Agent 和人类开发者，部分步骤需要用户在终端中配合完成。

## 环境要求

开始安装之前，请确保环境中已安装：

- Node.js (v22.0.0 或以上版本)
- npm / pnpm / yarn

## 第 1 步 安装

```shell
# 全局安装 CLI（如已发布到 npm）
npm install -g @novesuite/cli

# 如果是本地开发环境，可进入项目目录执行以下命令进行本地链接：
# npm install
# npm run build
# npm link
```

## 第 2 步 配置 API 地址

配置 Nove API 的后端服务地址：

```shell
nove config set base-url <YOUR_API_URL>
```
*默认值为：`https://noveapi.proflu.cn`，本地测试或私有化部署可修改，例如：`nove config set base-url http://localhost:3000`*

## 第 3 步 登录

运行以下命令并输入您的 API Key 完成认证授权：

```shell
# 交互式安全输入 API Key
nove login

# 或从标准输入读取（适合由密码管理器或 CI secret 注入）
printf '%s' "$NOVE_API_KEY" | nove login --api-key-stdin

# 已由 secret manager 设置 NOVE_API_KEY 时也可直接登录
nove login
```

不要把 API Key 放入命令参数。CLI 会以 `0600` 权限保存本地凭据。可用 `nove auth status` 查看认证状态，用 `nove logout` 删除本地凭据；这些命令都不会输出 API Key。

## 第 4 步 验证

运行以下命令验证 CLI 是否配置成功并能正常连接服务端：

```shell
# 获取 CLI 帮助信息
nove help

# 检查认证状态（不会显示 API Key）
nove auth status

# 列出会议数据以测试连通性
nove meeting list
```

## 第 5 步 安装 AI Agent 技能（可选）

对于支持安装 Skill 的 AI Agent，建议安装 `nove-cli` 专属技能，以便 Agent 能更准确地理解和调用本工具。

您可以将本项目中的 `skills/nove-cli` 目录链接或复制到 AI Agent 的全局技能配置目录中。以常见的配置目录为例：


更多命令和能力指南，可运行 `nove help`，或查阅[会议命令](/commands/meeting)和[用户命令](/commands/user)。
