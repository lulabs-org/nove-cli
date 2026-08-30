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

在交互式终端运行以下命令后，CLI 会先让你选择“浏览器授权”或“API Key”。浏览器授权为推荐选项，选择后请在 Nove 控制台选择组织和权限并同意授权：

```shell
# 推荐：浏览器授权码 + PKCE 登录
nove login

# 跳过选择，直接使用浏览器授权
nove login --method oauth

# 无法自动打开浏览器时，打印可复制的授权地址
nove login --no-browser

# 只在授权页提供指定权限（参数可重复）
nove login --scope meeting:read --scope minute:read

# 自动化环境继续支持 API Key 标准输入
printf '%s' "$NOVE_API_KEY" | nove login --method api-key --api-key-stdin

# 已由 secret manager 设置 NOVE_API_KEY 时自动使用 API Key 模式
nove login --method api-key
```

非交互式终端和 `--json` 模式不会显示选择菜单。没有其他方式提示时，必须使用 `--method oauth` 或 `--method api-key`；`NOVE_API_KEY`、`--api-key-stdin` 会自动识别为 API Key 模式，`--no-browser`、`--scope` 会自动识别为 OAuth 模式。不要把 API Key 放入命令参数。CLI 会以 `0600` 权限保存本地凭据，并在 OAuth Access Token 过期时自动轮换 Refresh Token。可用 `nove auth status` 查看登录方式、组织、权限和到期时间；用 `nove logout` 撤销 OAuth 授权并删除本地凭据。这些命令都不会输出 API Key 或 Token。

## 第 4 步 验证

运行以下命令验证 CLI 是否配置成功并能正常连接服务端：

```shell
# 获取 CLI 帮助信息
nove help

# 检查认证状态（不会显示 API Key 或 Token）
nove auth status

# 列出会议数据以测试连通性
nove meeting list
```

## 第 5 步 安装 AI Agent 技能（可选）

对于支持安装 Skill 的 AI Agent，建议安装 `nove-cli` 专属技能，以便 Agent 能更准确地理解和调用本工具。

您可以将本项目中的 `skills/nove-cli` 目录链接或复制到 AI Agent 的全局技能配置目录中。以常见的配置目录为例：


更多命令和能力指南，可运行 `nove help`，或查阅[会议命令](/commands/meeting)、[项目命令](/commands/project)、[产品命令](/commands/product)、[订单命令](/commands/order)和[用户命令](/commands/user)。
