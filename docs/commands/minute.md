`nove minute`
=============

Delete a meeting minute

* [`nove minute delete ID`](#nove-minute-delete-id)
* [`nove minute get ID`](#nove-minute-get-id)
* [`nove minute list`](#nove-minute-list)
* [`nove minute transcript MINUTEID`](#nove-minute-transcript-minuteid)

## `nove minute delete ID`

Delete a meeting minute

```
USAGE
  $ nove minute delete ID

ARGUMENTS
  ID  Minute ID

DESCRIPTION
  Delete a meeting minute
```

_See code: [src/commands/minute/delete.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.2/src/commands/minute/delete.ts)_

## `nove minute get ID`

Get details of a meeting minute

```
USAGE
  $ nove minute get ID

ARGUMENTS
  ID  Minute ID

DESCRIPTION
  Get details of a meeting minute
```

_See code: [src/commands/minute/get.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.2/src/commands/minute/get.ts)_

## `nove minute list`

List meeting minutes

```
USAGE
  $ nove minute list [--limit <value>] [--meetingId <value>] [--page <value>] [--source <value>] [--status
    <value>]

FLAGS
  --limit=<value>      [default: 10] Items per page
  --meetingId=<value>  Filter by Meeting ID
  --page=<value>       [default: 1] Page number
  --source=<value>     Minute source (e.g. PLATFORM_AUTO, UPLOAD)
  --status=<value>     Minute status (e.g. PROCESSING, COMPLETED, FAILED)

DESCRIPTION
  List meeting minutes
```

_See code: [src/commands/minute/list.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.2/src/commands/minute/list.ts)_

## `nove minute transcript MINUTEID`

Get transcript for a meeting minute

```
USAGE
  $ nove minute transcript MINUTEID [--format text|json]

ARGUMENTS
  MINUTEID  Minute ID

FLAGS
  --format=<option>  [default: text] Format (text or json)
                     <options: text|json>

DESCRIPTION
  Get transcript for a meeting minute
```

_See code: [src/commands/minute/transcript.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.2/src/commands/minute/transcript.ts)_
