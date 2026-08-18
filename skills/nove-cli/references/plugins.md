# CLI 插件管理

用于查看或改变 nove 的 oclif 插件环境。插件命令来自 `@oclif/plugin-plugins`，其参数可能随安装版本变化，始终先读取实时帮助。

## 路由

| 任务 | 命令 |
| --- | --- |
| 查看插件 | `nove plugins` |
| 查看核心插件 | `nove plugins --core` |
| 查看插件详情 | `nove plugins inspect <plugin>` |
| 安装插件 | `nove plugins install <plugin>` |
| 链接本地插件 | `nove plugins link <path>` |
| 更新插件 | `nove plugins update` |
| 移除插件 | `nove plugins remove <plugin>` |
| 取消本地链接 | `nove plugins unlink <plugin>` |
| 重置插件 | `nove plugins reset` |

`add`/`install`、`remove`/`uninstall` 可能是别名；以 `nove plugins --help` 和子命令帮助为准。

列出和检查属于读操作。安装、更新、链接、移除、取消链接和重置都会改变本地 CLI 环境，只在用户明确要求时执行，并在操作前展示目标插件或路径。不要从未经用户指定或不可信的 URL 安装插件。

操作后重新运行 `nove plugins` 验证最终状态；命令退出成功但插件未出现在列表中时，不声称已经完成。
