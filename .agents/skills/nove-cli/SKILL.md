---
name: nove-cli
description: 使用 nove-cli 工具执行各种项目脚手架、配置和管理任务。当用户要求使用 nove 命令行工具时触发。
---

# Nove CLI 使用指南

你现在可以使用本地安装的 `nove-cli` 工具来协助用户。

## 基础信息
- **执行方式**: 直接在终端运行 `nove <command>`
- **工作环境**: 该 CLI 安装在全局环境或当前项目中，可以直接调用。

## 可用命令

### 1. Hello 测试命令
用于测试 CLI 是否正常工作或演示。
- **用法**: `nove hello [PERSON] -f [FROM]`
- **示例**: `nove hello "世界" -f "AI"`

### 2. 插件管理
查看已安装的插件。
- **用法**: `nove plugins`

## 注意事项
- 在执行命令前，确保命令格式正确。
- 如果用户要求执行新的未知任务，先执行 `nove --help` 或 `nove <command> --help` 查看最新支持的命令和参数列表。
- 随着 `nove-cli` 功能的不断迭代，该 skill 也会逐步补充和完善。
