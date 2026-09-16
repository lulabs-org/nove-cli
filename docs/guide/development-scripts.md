# 开发工作流与项目脚本

本文档介绍 `nove-cli` 项目在 `package.json` 中配置的各个 npm 脚本（`scripts`），说明其底层执行逻辑、生命周期触发机制以及在本地开发与发布流程中的标准用法。

---

## 脚本速查表

在项目根目录下，可通过 `pnpm run <script>`（或 `npm run <script>`）执行以下命令：

| 脚本名称 | 命令内容 | 触发方式 | 功能作用 |
| --- | --- | --- | --- |
| **`build`** | `shx rm -rf dist && tsc -b --force` | 手动执行 / 钩子调用 | 清理历史产物并全量强制编译 TypeScript 源码到 `dist/` |
| **`lint`** | `eslint bin src test eslint.config.mjs` | 手动执行 / 钩子调用 | 静态代码规范与类型风格检查（ESLint 9 扁平配置） |
| **`pretest`** | `pnpm run build` | `pnpm test` 前自动触发 | 测试前强制重新编译，确保测试针对最新产物运行 |
| **`test`** | `mocha --forbid-only "test/**/*.test.ts"` | 手动执行 / CI 流水线 | 运行全部 Mocha 单元测试、命令矩阵测试与安全合约测试 |
| **`posttest`** | `pnpm run lint` | `pnpm test` 成功后自动触发 | 测试全绿后自动执行代码规范检查，形成完整质量门禁 |
| **`prepack`** | `pnpm run build && oclif manifest && oclif readme --multi --output-dir=docs/commands` | `npm pack` / 发布前触发 | 编译代码、生成 `oclif.manifest.json` 静态清单并自动同步生成文档 |
| **`postpack`** | `shx rm -f oclif.manifest.json` | `npm pack` 完成后自动触发 | 清理打包阶段生成的静态清单文件，避免开发环境缓存干扰 |
| **`version`** | `oclif readme --multi --output-dir=docs/commands && git add README.md docs` | `npm version` 变更版本号时自动触发 | 重新同步最新命令文档，并自动加入 Git 暂存区以便随版本提交 |

---

## 各命令详细用法与原理解析

### 1. `build` —— 源码清理与构建
```bash
pnpm run build
```
- **执行内容**：`shx rm -rf dist && tsc -b --force`
- **实现细节**：
  - `shx` 是一个轻量级跨平台 Unix 命令行工具封装包，在 Windows、macOS 和 Linux 上均能可靠执行 `rm -rf dist`，无需依赖系统原生 shell。
  - `tsc -b --force` 采用 TypeScript 方案构建（Project References），`--force` 参数会忽略历史构建缓存增量标记（`tsconfig.tsbuildinfo`），强制重新编译 `src/` 下的全部 TypeScript 文件，输出至 `dist/` 目录。
- **使用时机**：修改了 CLI 指令、通用工具函数或验证规则后，需要生成可执行 JavaScript 产物时。

---

### 2. `lint` —— 代码质量与风格检查
```bash
pnpm run lint
```
- **执行内容**：`eslint bin src test eslint.config.mjs`
- **实现细节**：
  - 基于 ESLint 9+ 扁平化配置（Flat Config），加载了 `eslint-config-oclif`、`eslint-config-prettier` 以及针对 Node.js 现代规范的规则校验。
  - 覆盖范围包括命令行入口脚本 `bin`、全部源代码 `src`、测试套件 `test` 及配置文件本身。
  - 严格检查语法规范、异步循环（`no-await-in-loop`）、模块导入排序（`perfectionist/sort-imports`）、联合类型排序（`perfectionist/sort-union-types`）以及无用返回值等潜在质量隐患。
- **使用时机**：本地开发过程中、提交 Git Commit 之前或进行代码审查时。

---

### 3. `test` 及其生命周期流水线 (`pretest` -> `test` -> `posttest`)
在终端执行测试指令时，npm / pnpm 的内置生命周期机制会自动级联触发三个步骤：

```
pnpm test
  └── 1. pretest (pnpm run build)
  └── 2. test    (mocha --forbid-only "test/**/*.test.ts")
  └── 3. posttest (pnpm run lint)
```

#### ① `pretest` —— 预编译
- **执行内容**：`pnpm run build`
- **作用**：自动在每次测试启动前重新全量构建，避免因忘记手动 `build` 而导致测试运行在陈旧代码之上的隐蔽 Bug。

#### ② `test` —— 自动化测试执行
```bash
pnpm test
# 支持透传 Mocha 参数，例如仅运行与 drive 相关的测试：
pnpm test -- --grep drive
```
- **执行内容**：`mocha --forbid-only "test/**/*.test.ts"`
- **实现细节**：
  - 使用 Mocha 测试运行器，并发启动本地 Mock HTTP Server，全面验证 API 请求路径、请求方法、Query 参数、Header 认证、请求体结构与状态码返回。
  - 包含对所有命令族的 `--json` 规范测试、破坏性删除命令的 `--dry-run` 预检与 `--yes` 安全拦截测试。
  - **`--forbid-only` 参数极其关键**：如果代码中不小心遗留了 `describe.only` 或 `it.only`，Mocha 会主动报错退出，防止因本地排错遗漏导致大部分测试被跳过而造成伪通过。

#### ③ `posttest` —— 测试后规范质检
- **执行内容**：`pnpm run lint`
- **作用**：只有当所有功能测试用例全部 100% 通过后，才会自动触发此步骤对代码风格进行最后校验。一旦发现任何语法告警或格式违规，退出状态码将置为非零，确保提交的代码同时满足**功能正确**与**规范合格**。

---

### 4. `prepack` 与 `postpack` —— 打包与分发自动化

这两个脚本由 `npm pack` 或 `npm publish` 流程自动触发，也可根据需要手动执行：

#### ① `prepack` —— 打包前自动化准备
```bash
pnpm run prepack
```
- **执行内容**：`pnpm run build && oclif manifest && oclif readme --multi --output-dir=docs/commands`
- **分步执行逻辑**：
  1. **重新编译**：生成最新的 `dist/` 运行时文件。
  2. **生成命令清单 (`oclif manifest`)**：Oclif 会扫描所有编译后的指令类，提取其参数、选项描述与别名，生成 `oclif.manifest.json`。拥有此文件后，CLI 在用户终端执行时**无需耗费时间动态扫描磁盘文件**，极大降低启动延迟。
  3. **同步最新文档 (`oclif readme`)**：根据源码中的静态属性（`description`、`flags`、`args`），自动更新根目录的 `README.md`，并在 `docs/commands/` 目录下为各指令族生成完整的 Markdown 参考文档（例如 `drive.md`、`meeting.md` 等）。
- **使用时机**：发布新版本前，或者在新增/修改了 CLI 命令后需要重新同步官方文档时。

#### ② `postpack` —— 打包后临时文件清理
```bash
pnpm run postpack
```
- **执行内容**：`shx rm -f oclif.manifest.json`
- **作用**：当 `npm pack` 完成打包归档文件（tarball）后，立即从本地工作区删除 `oclif.manifest.json`。
- **为什么需要清理**：在日常开发过程中，如果本地仓库根目录残留有静态 `oclif.manifest.json`，Oclif 会优先读取该清单中的记录。如果此时开发者在 `src/commands/` 中新增或删除了命令，由于没有重新执行 manifest 命令，CLI 会提示命令不存在。因此打包结束后自动移除清单，能保证本地开发时始终以文件系统的实时代码为准。

---

### 5. `version` —— 版本发布前置钩子
```bash
# 例如提升一个小版本（minor）：
npm version minor
```
- **执行内容**：`oclif readme --multi --output-dir=docs/commands && git add README.md docs`
- **作用与时序**：
  - 当运行 `npm version <newversion>` 时，npm 会在修改 `package.json` 中的版本号之后、但在创建版本 Git Commit 和 Git Tag **之前**，自动执行 `version` 脚本。
  - 该脚本会自动根据最新版本号与命令定义重新刷新 `README.md` 与 `docs/` 下的文档，随后将文档通过 `git add README.md docs` 纳入暂存区。
  - 最终生成的版本提交（Version Commit）和 Git Tag 会完整包含对应版本的全套最新文档，保证文档与发布代码的版本严格对齐。

---

## 常见本地开发流程规范

### 场景 A：日常开发与新功能自测
1. 修改 TypeScript 源代码；
2. 运行 `pnpm run build` 编译；
3. 执行 `node ./bin/run.js <topic> <command>` 直接本地执行验证；
4. 运行 `pnpm test -- --grep <keyword>` 针对性运行新增测试用例。

### 场景 B：提交代码前全量质检
在发起 Pull Request 或提交前，只需执行一条命令：
```bash
pnpm test
```
该命令会自动完成：`编译源码 (build)` -> `运行 50+ 个用例 (test)` -> `ESLint 规范检查 (lint)`，全绿即证明符合项目门禁标准。

### 场景 C：新增命令后同步官方文档
若新增或调整了命令的 Flag 或描述：
```bash
pnpm run prepack
```
执行后，`docs/commands/*.md` 和 `README.md` 会自动更新，可立即在 VitePress 文档站中查看效果。
