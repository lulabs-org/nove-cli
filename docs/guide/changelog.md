# 发布记录 (Changelog)

## 🚀 v1.3.0

这个版本是 `nove-cli` 的重要功能升级，全面支持了电商资源（商品与订单）和项目管理能力，同时增强了会议转写（结构化与平台级转写）、简化了用户名称参数，并完善了安全删除与命令行文档。

### ✨ Features (新特性)
* **commerce (product & order):** 新增商品（`product`）与订单（`order`）全套管理命令（创建、查询、列表、更新、状态流转、安全删除），并支持 CSV/Excel/JSON 批量与交互式数据录入 (#35)
* **project:** 新增项目（`project`）全套管理命令（创建、详情、列表、更新、状态变更、安全软删除与 Dry-run 演练） (#36)
* **minute:** 接入结构化会议转写接口与平台级用户会议转写命令 (`platform user transcript commands`) (#31, #32)
* **user:** 优化用户姓名参数，使用统一名称 flag 简化用户创建与更新操作 (#30)

### 🐛 Bug Fixes (问题修复)
* **minute:** 修复平台级用户会议转写接口调用的地址问题 (#33)

### ♻️ Code Refactoring (代码重构)
* **minute:** 重构并重命名用户会议转写命令，统一 CLI 命令动词与输出契约 (#34)

### 📝 Documentation (文档更新)
* **docs:** 全面更新各模块（`product`、`order`、`project`、`minute` 等）参考文档、SKILL.md 及 VitePress 站点命令手册

---

## 🚀 v1.3.0-beta.2

这个版本进一步完善了 `minute`（会议记录/转写）相关的命令，并修复了一些已知问题，同时更新了命令行的帮助文档。

### ✨ Features (新特性)
* **minute:** 接入并使用结构化的转写接口 (`structured transcript endpoint`) (#31)
* **minute:** 新增平台级别的用户会议转写命令 (`platform user transcript commands`) (#32)

### 🐛 Bug Fixes (问题修复)
* **minute:** 修复平台级用户会议转写接口调用的地址问题 (#33)

### ♻️ Code Refactoring (代码重构)
* **minute:** 重命名用户会议转写的相关命令，使语义更加清晰准确

### 📝 Documentation (文档更新)
* **docs:** 更新 `nove-cli` 的 `README.md` 文档（同步最新的命令速览和参数使用说明）

---

## 🚀 v1.3.0-beta.1

这个版本主要是针对 `user` 命令中关于用户姓名解析的逻辑进行了优化。

### ✨ Features (新特性)
* **user:** 替换并优化了关于拆分姓名的 flag 选项 (`replace split-name flags`)，简化用户创建和更新的输入操作 (#30)

---

## 🚀 v1.2.0

该版本重点提升了命令行登录体验，引入了更友好的浏览器 OAuth 认证方式。

### ✨ Features (新特性)
* **auth:** 新增浏览器 OAuth 登录支持 (`browser OAuth login`) (#27)

---

## 🚀 v1.1.0

带来了工作报告追踪命令以及认证与调用流程的进一步固化，同时修复了之前的 Bug。

### ✨ Features (新特性)
* **core:** 进一步固化并增强 CLI 认证以及命令执行工作流 (#24)
* **tracking-report:** 新增 `tracking-report` 系列命令，支持管理追踪报告 (#26)

### 🐛 Bug Fixes (问题修复)
* **minute:** 移除不必要的固定状态过滤器，解决无法获取正确纪要的问题 (#25)

---

## 🚀 v1.0.4

### ✨ Features (新特性)
* **minute:** 新增提取发言人总结相关的命令 (`speaker summary commands`) (#22)

---

## 🚀 v1.0.3

### ♻️ Code Refactoring (代码重构)
* **core:** 移除目前不再维护的插件管理支持 (`remove plugin management support`) (#19)

### 📝 Documentation (文档更新)
* **docs:** 更新源码链接配置以匹配 v1.0.3 发布

---

## 🚀 v1.0.2

本次发布扩展了命令行功能矩阵，新增了多项重要命令并进行了项目结构的规范化梳理。

### ✨ Features (新特性)
* **core:** 新增 CLI 自动更新提醒机制 (`automatic update reminder`) (#15)
* **minute:** 新增 `minute` (会议纪要) 相关系列命令支持 (#13)

### ♻️ Code Refactoring (代码重构)
* **docs:** 文档目录架构重组 (#14)
* **config:** 添加了 vercel.json 以为 VitePress 站点做配置准备

### 📝 Documentation (文档更新)
* **docs:** 全面更新 CLI 的说明文档 (#17)

---

## 🚀 v1.0.1

### 📝 Documentation (文档更新)
* **docs:** 更新 README 介绍内容 (#7)

---

## 🎉 v1.0.0

Nove CLI 的首个正式版本发布，奠定了命令行工具的核心能力和文档骨架。

### ✨ Features (新特性)
* **core:** 实现了管理 `user` 和 `meeting` 的核心资源操作命令 (#2)
* **core:** 支持读取系统配置好的 API URL 进行后续请求 (#3)

### 📝 Documentation (文档更新)
* **docs:** 建立并初始化基于 VitePress 的项目文档站点 (#4)
* **docs:** 新增关于认证、会议、录音及用户相关的文档及给 Agent 准备的 SKILL.md (#5)
* **docs:** 完善了 `README.md`，包含新版包名 `@novesuite/cli` 的指引 (#6)
