# 云盘管理 (Drive)

用于查询或维护 Nove 云盘空间、目录层级、文件元数据、端到端分片上传与下载、回收站及访问授权（ACL）。

云盘支持**个人空间（PERSONAL）**与**组织空间（ORG）**。空间内通过节点（Node）维护目录树结构（文件 FILE 与文件夹 FOLDER）；文件底层由存储版本与对象存储（OSS/S3）支撑，支持安全扫描、业务实体绑定与细粒度访问控制。

完整资源关系见 [identifiers-and-relations.md](identifiers-and-relations.md)。需要分页合并、JSON 解析、破坏性操作或错误恢复时读取 [output-and-errors.md](output-and-errors.md)。

---

## 标识符与核心概念

| 标识符 | 含义 | 从哪里获得 | 可用于 |
| --- | --- | --- | --- |
| `spaceId` | 云盘空间 ID | `drive spaces` 或 `drive space list` | `drive list --space-id`、`drive folder create`、`drive upload`、`drive trash list`、`drive grant * --space-id` |
| `nodeId` | 目录树节点 ID（文件夹或文件挂载点） | `drive list` 的 `id` | `drive node update/move/delete/restore/audit`、`drive trash purge`、`drive grant * --node-id` |
| `fileId` | 底层文件元数据与版本实体 ID | `drive list` 的 `fileId` 或上传结果 | `drive file get/preview-url/download-url/bindings`、`drive download` |
| `grantId` | 访问控制授权规则 ID | `drive grant list` 的 `id` | `drive grant remove <grantId>` |
| `sessionId` | 分片上传会话 ID | 分片创建接口返回 | `drive upload-session abort <sessionId>` |

> [!NOTE]
> `nodeId` 是目录树层级中的节点标识；`fileId` 是节点关联的文件实体标识。浏览目录、移动、重命名和删除节点时使用 `nodeId`；获取下载链接、媒体预览或业务绑定时使用 `fileId`。不要混用这两者。

---

## 命令总览

| 任务类别 | 命令 | 所需权限 | 说明 |
| --- | --- | --- | --- |
| **空间管理** | `nove drive spaces`<br>`nove drive space list` | `drive:read` | 查看当前用户可访问的个人空间和组织空间 |
| **目录浏览** | `nove drive list` | `drive:read` | 浏览指定空间或父目录下的节点，支持游标分页或 `--all` |
| **文件夹维护** | `nove drive folder create` (别名 `mkdir`) | `drive:upload` | 在指定空间/父目录下创建新文件夹 |
| **节点生命周期** | `nove drive node update` (别名 `update`) | `drive:update`<br>`drive:manage-acl` | 重命名文件/文件夹，调整 `--inherit-acl` 继承标志 |
| | `nove drive node move` (别名 `move`) | `drive:update` | 移动节点到目标文件夹，或移至根目录 (`--root`) |
| | `nove drive node delete` (别名 `delete`) | `drive:delete` | 软删除节点移入回收站（支持 `--dry-run` 和 `--yes`） |
| | `nove drive node restore` (别名 `restore`) | `drive:delete` | 从回收站恢复节点及子树 |
| | `nove drive node audit` (别名 `audit`) | `drive:read` | 查看节点的审计日志 |
| **文件与媒体** | `nove drive file get` (别名 `get`) | `drive:read` | 查询文件详情及当前活动版本、校验和、扫描状态 |
| | `nove drive file preview-url` | `drive:read` | 获取图片/视频的临时预览地址（inline，不记审计） |
| | `nove drive file download-url` | `drive:read` | 获取 10 分钟有效的私有下载地址（attachment，记审计） |
| | `nove drive file bindings` | `drive:read` | 查询文件绑定的业务实体（如会议纪要 Minute 等） |
| **上传与下载** | `nove drive upload` | `drive:upload` | 完整端到端分片上传、SHA-256 校验与入库 |
| | `nove drive download` | `drive:read` | 获取下载签名地址并直接流式落盘到本地 |
| | `nove drive upload-session abort` | `drive:upload` | 手动中止未完成的分片上传会话并释放存储 |
| **回收站管理** | `nove drive trash list` | `drive:read` | 查看指定空间的回收站节点列表 |
| | `nove drive trash purge` | `drive:admin` | 永久物理清理回收站节点及存储对象（高风险破坏性） |
| | `nove drive trash restore` | `drive:delete` | 回收站恢复快捷指令 |
| **授权规则 (ACL)** | `nove drive grant list` | `drive:manage-acl` | 查询空间根或节点的授权规则列表 |
| | `nove drive grant set` | `drive:manage-acl` | 配置空间根或节点的权限规则 |
| | `nove drive grant remove` | `drive:manage-acl` | 移除空间根或节点的授权规则（支持 `--dry-run` 和 `--yes`） |

---

## 空间查询与目录浏览

### 1. 查询可访问空间
```bash
nove drive spaces --json
```
返回当前用户拥有的个人云盘空间（`PERSONAL`）以及所在组织的云盘空间（`ORG`）。

### 2. 浏览目录
`drive list` 必须指定 `--space-id`。如果不提供 `--parent-id`，则默认浏览空间根目录：
```bash
# 浏览根目录
nove drive list --space-id <space-id>

# 浏览指定文件夹下前 20 项
nove drive list --space-id <space-id> --parent-id <folder-id> --limit 20

# 递归/全量拉取当前目录下的全部项目（自动处理游标分页）
nove drive list --space-id <space-id> --all --json
```
- 表格输出字段默认为：`id`、`name`、`type`（FILE/FOLDER）、`sizeBytes`、`fileStatus`、`updatedAt`。
- 游标分页模式下，单页响应末尾会输出 `nextCursor`；下次查询可传入 `--cursor <nextCursor>`。全量抓取时传入 `--all`，此时不要传 `--cursor`。

---

## 文件夹与节点生命周期

### 1. 创建文件夹
```bash
# 在空间根目录创建文件夹
nove drive folder create --space-id <space-id> --name "项目文档"

# 在子文件夹下创建文件夹
nove drive folder create --space-id <space-id> --parent-id <folder-id> --name "需求分析"
```
**命名规则**：
- 名称前后会自动去除首尾空白；
- 不能包含 `/`、`\`、`\0`、`\r`、`\n`，不可为 `.` 或 `..`；
- 最大长度 255 字符；
- 同一父目录下不允许存在同名项目（冲突时抛出 409 Conflict）。

### 2. 重命名与修改 ACL 继承
```bash
# 仅重命名
nove drive node update <node-id> --name "2026需求规格.pdf"

# 开启/关闭继承父级 ACL
nove drive node update <node-id> --no-inherit-acl
nove drive node update <node-id> --inherit-acl
```
必须至少提供 `--name` 或 `--inherit-acl` 之一，否则在本地拦截报错。

### 3. 移动文件或文件夹
```bash
# 移动到指定文件夹下
nove drive node move <node-id> --parent-id <target-folder-id>

# 移动到空间根目录
nove drive node move <node-id> --root
```
系统会自动检测循环嵌套（禁止将父文件夹移动到自身或其子目录中）以及同名冲突。

### 4. 移入回收站与恢复
移入回收站为软删除操作：
```bash
# 预检：查看将被影响的目标
nove drive node delete <node-id> --dry-run --json

# 确认移入回收站（交互终端会弹窗确认，非交互环境需加 --yes）
nove drive node delete <node-id> --yes
```
- 如果文件仍被业务实体（如 Minute、Product 等）强绑定引用，服务端会拒绝移入回收站并返回 409 Conflict。
- 从回收站恢复节点：
```bash
nove drive node restore <node-id>
```
恢复时会检查原父目录是否仍然存在，以及同目录下是否已存在同名项目。

### 5. 节点审计记录
```bash
nove drive node audit <node-id>
```
按时间倒序展示该节点的创建、重命名、移动、授权变更、下载与软删除记录。

---

## 文件操作、媒体预览与私有下载

### 1. 查询文件详情
```bash
nove drive file get <file-id> --json
```
返回文件的基本属性、当前活动版本（`version`）、Content-Type、字节大小、SHA-256 哈希值以及安全扫描状态（`ACTIVE`、`VERIFYING`、`REJECTED`）。

### 2. 媒体临时预览链接
```bash
nove drive file preview-url <file-id> --json
```
- 仅支持图片（`image/*`）和视频（`video/*`）文件；
- 响应头设置为 `Content-Disposition: inline`；
- 此操作不会计入文件下载审计日志。

### 3. 私有下载链接
```bash
nove drive file download-url <file-id> --json
```
- 签发有效期为 10 分钟的安全私有下载地址；
- 响应头设置为 `Content-Disposition: attachment; filename="..."`；
- 会自动记录下载审计日志。

### 4. 文件业务绑定
```bash
nove drive file bindings <file-id> --json
```
查看该文件被哪些业务实体绑定引用（例如 `targetType: "MINUTE"`, `targetId: "<minute-id>"`）。系统托管绑定的文件禁止在普通云盘目录中随意改动或删除。

---

## 端到端文件上传与本地下载

### 1. 端到端分片上传 (`drive upload`)
CLI 封装了全套分片上传协议（创建会话 -> 签发分片地址 -> 逐片流式 PUT -> 验证 ETag -> 完成会话入库）：
```bash
# 上传到空间根目录
nove drive upload /path/to/local/video.mp4 --space-id <space-id>

# 上传到指定文件夹，并覆盖文件名与 MIME 类型
nove drive upload ./contract.pdf \
  --space-id <space-id> \
  --parent-id <folder-id> \
  --file-name "2026采购协议_最终版.pdf" \
  --content-type "application/pdf"
```
**底层机制**：
- 自动读取本地文件并流式计算 SHA-256 哈希（恶意代码与完整性检测需要）；
- 向 `/drive/upload-sessions` 声明文件大小、格式与哈希；
- 自动根据服务端建议分片大小（通常为 16MB）切片，逐个直传对象存储；
- 若中途断网或上传失败，CLI 会自动向服务端发送中止请求，清理已分配的 OSS 临时碎片，避免资源泄露。

### 2. 本地文件下载 (`drive download`)
直接将云盘文件流式下载到本地存储：
```bash
# 下载到当前工作目录（以远端文件名命名）
nove drive download <file-id>

# 下载到指定目录
nove drive download <file-id> -o ~/Downloads/

# 下载并重命名保存到本地文件
nove drive download <file-id> -o ./backup_report.xlsx
```

### 3. 中止上传会话
如果存在异常遗留的上传会话，可根据会话 ID 显式清理：
```bash
nove drive upload-session abort <upload-session-id>
```

---

## 回收站管理与彻底物理清理

### 1. 查询回收站
```bash
nove drive trash list --space-id <space-id>
```
列出当前空间下所有处于已删除状态的节点及其删除时间。

### 2. 彻底永久物理清理 (`trash purge`)
> [!CAUTION]
> `drive trash purge` 将从数据库及底层对象存储中**永久抹除**该节点、其所有子文件及二进制数据块，无法恢复。

```bash
# 预检
nove drive trash purge <node-id> --dry-run --json

# 彻底清理
nove drive trash purge <node-id> --yes
```
- 需要当前用户具备 `drive:admin` 管理员权限；
- 若底层文件仍被业务实体引用，系统会拦截物理删除。

---

## 访问控制与授权规则 (ACL)

权限可在**空间根级（Space Root）**或**节点级（Node）**独立配置。

### 1. 参数互斥约束
`drive grant` 系列指令的 `--space-id` 与 `--node-id` 为**严格互斥（二选一）**：
- 针对整个空间配置：使用 `--space-id <space-id>`
- 针对某个文件夹或文件配置：使用 `--node-id <node-id>`

### 2. 授权主体与动作规范
- **`--principal-type`**（主体类型）：
  - `ORG`：整个组织
  - `USER`：特定用户（`principal-id` 为本地用户 ID）
  - `ORG_MEMBER`：组织成员记录 ID
  - `DEPARTMENT`：部门 ID
  - `ROLE`：组织角色 ID
- **`--effect`**（效果）：
  - `ALLOW`：允许
  - `DENY`：拒绝（优先级高于 ALLOW）
- **`--action`**（操作权限，可重复传入）：
  - `VIEW`：浏览与查看元数据
  - `DOWNLOAD`：下载文件内容
  - `UPLOAD`：上传新文件或创建文件夹
  - `RENAME`：重命名
  - `MOVE`：移动位置
  - `SHARE`：共享链接
  - `DELETE`：移入回收站
  - `MANAGE_ACL`：管理权限规则

### 3. 查看授权规则
```bash
# 查看空间根级授权
nove drive grant list --space-id <space-id>

# 查看节点授权
nove drive grant list --node-id <node-id>
```

### 4. 创建或更新授权规则 (`grant set`)
```bash
# 为用户 user-123 授予空间内的查看和下载权限
nove drive grant set \
  --space-id <space-id> \
  --principal-type USER \
  --principal-id "user-123" \
  --effect ALLOW \
  --action VIEW \
  --action DOWNLOAD

# 为特定角色禁止删除指定文件
nove drive grant set \
  --node-id <node-id> \
  --principal-type ROLE \
  --principal-id "role-auditor" \
  --effect DENY \
  --action DELETE
```

### 5. 移除授权规则 (`grant remove`)
```bash
# 预检
nove drive grant remove <grant-id> --space-id <space-id> --dry-run --json

# 执行移除
nove drive grant remove <grant-id> --space-id <space-id> --yes
nove drive grant remove <grant-id> --node-id <node-id> --yes
```

---

## 自动化调用与错误处理

1. **统一 `--json` 参数**：所有读写命令均支持 `--json`。成功时标准输出 (stdout) 严格输出单个 JSON 对象/数组；错误时错误信息输出至 stderr 并返回退出状态码 `1`（业务错误）或 `2`（参数格式错误）。
2. **写操作验证**：写入或更新后，应重新执行 `drive file get`、`drive list` 或 `drive grant list` 核验结果，不要仅凭命令执行成功提示做出判断。
3. **常见状态码对应**：
   - `400 Bad Request`：名称包含非法字符、参数互斥违规、缺少必要字段或非媒体文件请求预览链接。
   - `403 Forbidden`：当前认证主体无权访问该空间、无对应操作权限，或尝试越权访问系统托管文件。
   - `404 Not Found`：空间、节点、文件版本或授权记录不存在。
   - `409 Conflict`：同目录下已存在同名项目、移动导致目录成环、或试图删除仍有业务绑定的文件。
