`nove drive`
============

Manage cloud drive spaces, files, folders, and permissions

* [`nove drive abort-upload ID`](#nove-drive-abort-upload-id)
* [`nove drive audit NODEID`](#nove-drive-audit-nodeid)
* [`nove drive bindings FILEID`](#nove-drive-bindings-fileid)
* [`nove drive delete NODEID`](#nove-drive-delete-nodeid)
* [`nove drive download FILEID`](#nove-drive-download-fileid)
* [`nove drive download-url FILEID`](#nove-drive-download-url-fileid)
* [`nove drive file bindings FILEID`](#nove-drive-file-bindings-fileid)
* [`nove drive file download-url FILEID`](#nove-drive-file-download-url-fileid)
* [`nove drive file get FILEID`](#nove-drive-file-get-fileid)
* [`nove drive file preview-url FILEID`](#nove-drive-file-preview-url-fileid)
* [`nove drive folder create`](#nove-drive-folder-create)
* [`nove drive get FILEID`](#nove-drive-get-fileid)
* [`nove drive grant list`](#nove-drive-grant-list)
* [`nove drive grant remove GRANTID`](#nove-drive-grant-remove-grantid)
* [`nove drive grant set`](#nove-drive-grant-set)
* [`nove drive list`](#nove-drive-list)
* [`nove drive mkdir`](#nove-drive-mkdir)
* [`nove drive move NODEID`](#nove-drive-move-nodeid)
* [`nove drive node audit NODEID`](#nove-drive-node-audit-nodeid)
* [`nove drive node delete NODEID`](#nove-drive-node-delete-nodeid)
* [`nove drive node move NODEID`](#nove-drive-node-move-nodeid)
* [`nove drive node restore NODEID`](#nove-drive-node-restore-nodeid)
* [`nove drive node update NODEID`](#nove-drive-node-update-nodeid)
* [`nove drive preview-url FILEID`](#nove-drive-preview-url-fileid)
* [`nove drive restore NODEID`](#nove-drive-restore-nodeid)
* [`nove drive space list`](#nove-drive-space-list)
* [`nove drive spaces`](#nove-drive-spaces)
* [`nove drive trash list`](#nove-drive-trash-list)
* [`nove drive trash purge NODEID`](#nove-drive-trash-purge-nodeid)
* [`nove drive trash restore NODEID`](#nove-drive-trash-restore-nodeid)
* [`nove drive update NODEID`](#nove-drive-update-nodeid)
* [`nove drive upload FILE`](#nove-drive-upload-file)
* [`nove drive upload-session abort ID`](#nove-drive-upload-session-abort-id)

## `nove drive abort-upload ID`

Abort an in-progress upload session

```
USAGE
  $ nove drive abort-upload ID [--json]

ARGUMENTS
  ID  Upload session ID to abort

FLAGS
  --json  Output a single JSON value to stdout

DESCRIPTION
  Abort an in-progress upload session

ALIASES
  $ nove drive abort-upload
  $ nove drive abort-upload
```

## `nove drive audit NODEID`

List audit logs for a cloud drive node

```
USAGE
  $ nove drive audit NODEID [--fields <value>] [--json] [--sort <value>]

ARGUMENTS
  NODEID  Node ID to query audit logs

FLAGS
  --fields=<value>  Comma-separated fields to show in the table
  --json            Output a single JSON value to stdout
  --sort=<value>    Table sort field with optional :asc or :desc suffix

DESCRIPTION
  List audit logs for a cloud drive node

ALIASES
  $ nove drive audit
  $ nove drive audit
```

## `nove drive bindings FILEID`

List business entity bindings for a file

```
USAGE
  $ nove drive bindings FILEID [--fields <value>] [--json] [--sort <value>]

ARGUMENTS
  FILEID  File ID

FLAGS
  --fields=<value>  Comma-separated fields to show in the table
  --json            Output a single JSON value to stdout
  --sort=<value>    Table sort field with optional :asc or :desc suffix

DESCRIPTION
  List business entity bindings for a file

ALIASES
  $ nove drive bindings
  $ nove drive bindings
```

## `nove drive delete NODEID`

Move a file or folder to the trash

```
USAGE
  $ nove drive delete NODEID [--dry-run] [-y] [--json]

ARGUMENTS
  NODEID  Node ID to move to trash

FLAGS
  -y, --yes      Skip the interactive confirmation
      --dry-run  Show what would be deleted without sending the request
      --json     Output a single JSON value to stdout

DESCRIPTION
  Move a file or folder to the trash

ALIASES
  $ nove drive delete
  $ nove drive delete
```

## `nove drive download FILEID`

Download a cloud drive file to local disk

```
USAGE
  $ nove drive download FILEID [--json] [-o <value>]

ARGUMENTS
  FILEID  File ID to download

FLAGS
  -o, --output=<value>  Destination file path or directory (defaults to current directory with original filename)
      --json            Output a single JSON value to stdout

DESCRIPTION
  Download a cloud drive file to local disk
```

_See code: [src/commands/drive/download.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/drive/download.ts)_

## `nove drive download-url FILEID`

Get a temporary download URL for a file

```
USAGE
  $ nove drive download-url FILEID [--json]

ARGUMENTS
  FILEID  File ID

FLAGS
  --json  Output a single JSON value to stdout

DESCRIPTION
  Get a temporary download URL for a file

ALIASES
  $ nove drive download-url
  $ nove drive download-url
```

## `nove drive file bindings FILEID`

List business entity bindings for a file

```
USAGE
  $ nove drive file bindings FILEID [--fields <value>] [--json] [--sort <value>]

ARGUMENTS
  FILEID  File ID

FLAGS
  --fields=<value>  Comma-separated fields to show in the table
  --json            Output a single JSON value to stdout
  --sort=<value>    Table sort field with optional :asc or :desc suffix

DESCRIPTION
  List business entity bindings for a file

ALIASES
  $ nove drive bindings
  $ nove drive bindings
```

_See code: [src/commands/drive/file/bindings.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/drive/file/bindings.ts)_

## `nove drive file download-url FILEID`

Get a temporary download URL for a file

```
USAGE
  $ nove drive file download-url FILEID [--json]

ARGUMENTS
  FILEID  File ID

FLAGS
  --json  Output a single JSON value to stdout

DESCRIPTION
  Get a temporary download URL for a file

ALIASES
  $ nove drive download-url
  $ nove drive download-url
```

_See code: [src/commands/drive/file/download-url.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/drive/file/download-url.ts)_

## `nove drive file get FILEID`

Get file details and active version information

```
USAGE
  $ nove drive file get FILEID [--json]

ARGUMENTS
  FILEID  File ID

FLAGS
  --json  Output a single JSON value to stdout

DESCRIPTION
  Get file details and active version information

ALIASES
  $ nove drive get
  $ nove drive get
```

_See code: [src/commands/drive/file/get.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/drive/file/get.ts)_

## `nove drive file preview-url FILEID`

Get a temporary preview URL for an image or video file

```
USAGE
  $ nove drive file preview-url FILEID [--json]

ARGUMENTS
  FILEID  File ID

FLAGS
  --json  Output a single JSON value to stdout

DESCRIPTION
  Get a temporary preview URL for an image or video file

ALIASES
  $ nove drive preview-url
  $ nove drive preview-url
```

_See code: [src/commands/drive/file/preview-url.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/drive/file/preview-url.ts)_

## `nove drive folder create`

Create a new folder in a cloud drive space

```
USAGE
  $ nove drive folder create --name <value> --space-id <value> [--json] [--parent-id <value>]

FLAGS
  --json               Output a single JSON value to stdout
  --name=<value>       (required) Folder name
  --parent-id=<value>  Parent folder ID
  --space-id=<value>   (required) Drive space ID

DESCRIPTION
  Create a new folder in a cloud drive space

ALIASES
  $ nove drive mkdir
  $ nove drive mkdir
```

_See code: [src/commands/drive/folder/create.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/drive/folder/create.ts)_

## `nove drive get FILEID`

Get file details and active version information

```
USAGE
  $ nove drive get FILEID [--json]

ARGUMENTS
  FILEID  File ID

FLAGS
  --json  Output a single JSON value to stdout

DESCRIPTION
  Get file details and active version information

ALIASES
  $ nove drive get
  $ nove drive get
```

## `nove drive grant list`

List access grants for a drive space root or node

```
USAGE
  $ nove drive grant list [--fields <value>] [--json] [--node-id <value>] [--sort <value>] [--space-id <value>]

FLAGS
  --fields=<value>    Comma-separated fields to show in the table
  --json              Output a single JSON value to stdout
  --node-id=<value>   Node ID
  --sort=<value>      Table sort field with optional :asc or :desc suffix
  --space-id=<value>  Space ID

DESCRIPTION
  List access grants for a drive space root or node
```

_See code: [src/commands/drive/grant/list.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/drive/grant/list.ts)_

## `nove drive grant remove GRANTID`

Remove an access grant from a drive space root or node

```
USAGE
  $ nove drive grant remove GRANTID [--dry-run] [-y] [--json] [--node-id <value>] [--space-id <value>]

ARGUMENTS
  GRANTID  Grant ID to remove

FLAGS
  -y, --yes               Skip the interactive confirmation
      --dry-run           Show what would be deleted without sending the request
      --json              Output a single JSON value to stdout
      --node-id=<value>   Node ID
      --space-id=<value>  Space ID

DESCRIPTION
  Remove an access grant from a drive space root or node
```

_See code: [src/commands/drive/grant/remove.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/drive/grant/remove.ts)_

## `nove drive grant set`

Create or update an access grant on a drive space root or node

```
USAGE
  $ nove drive grant set --action VIEW|DOWNLOAD|UPLOAD|RENAME|MOVE|SHARE|DELETE|MANAGE_ACL... --effect ALLOW|DENY
    --principal-id <value> --principal-type ORG|USER|ORG_MEMBER|DEPARTMENT|ROLE [--json] [--node-id <value>] [--space-id
    <value>]

FLAGS
  --action=<option>...       (required) Allowed or denied actions (specify multiple times for multiple actions)
                             <options: VIEW|DOWNLOAD|UPLOAD|RENAME|MOVE|SHARE|DELETE|MANAGE_ACL>
  --effect=<option>          (required) Grant effect (ALLOW or DENY)
                             <options: ALLOW|DENY>
  --json                     Output a single JSON value to stdout
  --node-id=<value>          Target Node ID
  --principal-id=<value>     (required) Principal ID (user ID, org ID, member ID, etc.)
  --principal-type=<option>  (required) Principal type
                             <options: ORG|USER|ORG_MEMBER|DEPARTMENT|ROLE>
  --space-id=<value>         Target Space ID

DESCRIPTION
  Create or update an access grant on a drive space root or node
```

_See code: [src/commands/drive/grant/set.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/drive/grant/set.ts)_

## `nove drive list`

List files and folders in a cloud drive space

```
USAGE
  $ nove drive list --space-id <value> [--cursor <value> | [--all | ]] [--fields <value>] [--json] [--limit
    <value>] [--parent-id <value>] [--sort <value>]

FLAGS
  --all                Fetch every result page
  --cursor=<value>     Pagination cursor for next page
  --fields=<value>     Comma-separated fields to show in the table
  --json               Output a single JSON value to stdout
  --limit=<value>      [default: 50] Items per page
  --parent-id=<value>  Parent folder ID
  --sort=<value>       Table sort field with optional :asc or :desc suffix
  --space-id=<value>   (required) Drive space ID

DESCRIPTION
  List files and folders in a cloud drive space
```

_See code: [src/commands/drive/list.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/drive/list.ts)_

## `nove drive mkdir`

Create a new folder in a cloud drive space

```
USAGE
  $ nove drive mkdir --name <value> --space-id <value> [--json] [--parent-id <value>]

FLAGS
  --json               Output a single JSON value to stdout
  --name=<value>       (required) Folder name
  --parent-id=<value>  Parent folder ID
  --space-id=<value>   (required) Drive space ID

DESCRIPTION
  Create a new folder in a cloud drive space

ALIASES
  $ nove drive mkdir
  $ nove drive mkdir
```

## `nove drive move NODEID`

Move a file or folder to a different parent directory

```
USAGE
  $ nove drive move NODEID [--json] [--parent-id <value> | --root]

ARGUMENTS
  NODEID  Node ID to move

FLAGS
  --json               Output a single JSON value to stdout
  --parent-id=<value>  Target parent folder ID
  --root               Move to space root directory

DESCRIPTION
  Move a file or folder to a different parent directory

ALIASES
  $ nove drive move
  $ nove drive move
```

## `nove drive node audit NODEID`

List audit logs for a cloud drive node

```
USAGE
  $ nove drive node audit NODEID [--fields <value>] [--json] [--sort <value>]

ARGUMENTS
  NODEID  Node ID to query audit logs

FLAGS
  --fields=<value>  Comma-separated fields to show in the table
  --json            Output a single JSON value to stdout
  --sort=<value>    Table sort field with optional :asc or :desc suffix

DESCRIPTION
  List audit logs for a cloud drive node

ALIASES
  $ nove drive audit
  $ nove drive audit
```

_See code: [src/commands/drive/node/audit.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/drive/node/audit.ts)_

## `nove drive node delete NODEID`

Move a file or folder to the trash

```
USAGE
  $ nove drive node delete NODEID [--dry-run] [-y] [--json]

ARGUMENTS
  NODEID  Node ID to move to trash

FLAGS
  -y, --yes      Skip the interactive confirmation
      --dry-run  Show what would be deleted without sending the request
      --json     Output a single JSON value to stdout

DESCRIPTION
  Move a file or folder to the trash

ALIASES
  $ nove drive delete
  $ nove drive delete
```

_See code: [src/commands/drive/node/delete.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/drive/node/delete.ts)_

## `nove drive node move NODEID`

Move a file or folder to a different parent directory

```
USAGE
  $ nove drive node move NODEID [--json] [--parent-id <value> | --root]

ARGUMENTS
  NODEID  Node ID to move

FLAGS
  --json               Output a single JSON value to stdout
  --parent-id=<value>  Target parent folder ID
  --root               Move to space root directory

DESCRIPTION
  Move a file or folder to a different parent directory

ALIASES
  $ nove drive move
  $ nove drive move
```

_See code: [src/commands/drive/node/move.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/drive/node/move.ts)_

## `nove drive node restore NODEID`

Restore a file or folder from the trash

```
USAGE
  $ nove drive node restore NODEID [--json]

ARGUMENTS
  NODEID  Node ID to restore from trash

FLAGS
  --json  Output a single JSON value to stdout

DESCRIPTION
  Restore a file or folder from the trash

ALIASES
  $ nove drive restore
  $ nove drive restore
```

_See code: [src/commands/drive/node/restore.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/drive/node/restore.ts)_

## `nove drive node update NODEID`

Update a file or folder name or ACL inheritance

```
USAGE
  $ nove drive node update NODEID [--inherit-acl] [--json] [--name <value>]

ARGUMENTS
  NODEID  Node ID

FLAGS
  --[no-]inherit-acl  Inherit ACL from parent folder
  --json              Output a single JSON value to stdout
  --name=<value>      New name for the file or folder

DESCRIPTION
  Update a file or folder name or ACL inheritance

ALIASES
  $ nove drive update
  $ nove drive update
```

_See code: [src/commands/drive/node/update.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/drive/node/update.ts)_

## `nove drive preview-url FILEID`

Get a temporary preview URL for an image or video file

```
USAGE
  $ nove drive preview-url FILEID [--json]

ARGUMENTS
  FILEID  File ID

FLAGS
  --json  Output a single JSON value to stdout

DESCRIPTION
  Get a temporary preview URL for an image or video file

ALIASES
  $ nove drive preview-url
  $ nove drive preview-url
```

## `nove drive restore NODEID`

Restore a file or folder from the trash

```
USAGE
  $ nove drive restore NODEID [--json]

ARGUMENTS
  NODEID  Node ID to restore from trash

FLAGS
  --json  Output a single JSON value to stdout

DESCRIPTION
  Restore a file or folder from the trash

ALIASES
  $ nove drive restore
  $ nove drive restore
```

## `nove drive space list`

List accessible cloud drive spaces

```
USAGE
  $ nove drive space list [--fields <value>] [--json] [--sort <value>]

FLAGS
  --fields=<value>  Comma-separated fields to show in the table
  --json            Output a single JSON value to stdout
  --sort=<value>    Table sort field with optional :asc or :desc suffix

DESCRIPTION
  List accessible cloud drive spaces
```

_See code: [src/commands/drive/space/list.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/drive/space/list.ts)_

## `nove drive spaces`

List accessible cloud drive spaces

```
USAGE
  $ nove drive spaces [--fields <value>] [--json] [--sort <value>]

FLAGS
  --fields=<value>  Comma-separated fields to show in the table
  --json            Output a single JSON value to stdout
  --sort=<value>    Table sort field with optional :asc or :desc suffix

DESCRIPTION
  List accessible cloud drive spaces

ALIASES
  $ nove drive space list
  $ nove drive space list
```

_See code: [src/commands/drive/spaces.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/drive/spaces.ts)_

## `nove drive trash list`

List trashed items in a cloud drive space

```
USAGE
  $ nove drive trash list --space-id <value> [--fields <value>] [--json] [--sort <value>]

FLAGS
  --fields=<value>    Comma-separated fields to show in the table
  --json              Output a single JSON value to stdout
  --sort=<value>      Table sort field with optional :asc or :desc suffix
  --space-id=<value>  (required) Drive space ID

DESCRIPTION
  List trashed items in a cloud drive space
```

_See code: [src/commands/drive/trash/list.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/drive/trash/list.ts)_

## `nove drive trash purge NODEID`

Permanently purge a trashed node and its storage objects

```
USAGE
  $ nove drive trash purge NODEID [--dry-run] [-y] [--json]

ARGUMENTS
  NODEID  Node ID to permanently purge from trash

FLAGS
  -y, --yes      Skip the interactive confirmation
      --dry-run  Show what would be deleted without sending the request
      --json     Output a single JSON value to stdout

DESCRIPTION
  Permanently purge a trashed node and its storage objects
```

_See code: [src/commands/drive/trash/purge.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/drive/trash/purge.ts)_

## `nove drive trash restore NODEID`

Restore a file or folder from trash

```
USAGE
  $ nove drive trash restore NODEID [--json]

ARGUMENTS
  NODEID  Node ID to restore from trash

FLAGS
  --json  Output a single JSON value to stdout

DESCRIPTION
  Restore a file or folder from trash
```

_See code: [src/commands/drive/trash/restore.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/drive/trash/restore.ts)_

## `nove drive update NODEID`

Update a file or folder name or ACL inheritance

```
USAGE
  $ nove drive update NODEID [--inherit-acl] [--json] [--name <value>]

ARGUMENTS
  NODEID  Node ID

FLAGS
  --[no-]inherit-acl  Inherit ACL from parent folder
  --json              Output a single JSON value to stdout
  --name=<value>      New name for the file or folder

DESCRIPTION
  Update a file or folder name or ACL inheritance

ALIASES
  $ nove drive update
  $ nove drive update
```

## `nove drive upload FILE`

Upload a file to cloud drive with multipart chunking and integrity check

```
USAGE
  $ nove drive upload FILE --space-id <value> [--content-type <value>] [--file-name <value>] [--json] [--parent-id
    <value>]

ARGUMENTS
  FILE  Path to local file to upload

FLAGS
  --content-type=<value>  Override MIME content type
  --file-name=<value>     Override file name
  --json                  Output a single JSON value to stdout
  --parent-id=<value>     Target parent folder ID
  --space-id=<value>      (required) Drive space ID

DESCRIPTION
  Upload a file to cloud drive with multipart chunking and integrity check
```

_See code: [src/commands/drive/upload.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/drive/upload.ts)_

## `nove drive upload-session abort ID`

Abort an in-progress upload session

```
USAGE
  $ nove drive upload-session abort ID [--json]

ARGUMENTS
  ID  Upload session ID to abort

FLAGS
  --json  Output a single JSON value to stdout

DESCRIPTION
  Abort an in-progress upload session

ALIASES
  $ nove drive abort-upload
  $ nove drive abort-upload
```

_See code: [src/commands/drive/upload-session/abort.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/drive/upload-session/abort.ts)_
