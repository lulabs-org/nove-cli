`nove minute`
=============

Manage meeting minutes and transcripts

* [`nove minute delete ID`](#nove-minute-delete-id)
* [`nove minute get ID`](#nove-minute-get-id)
* [`nove minute list`](#nove-minute-list)
* [`nove minute speaker-summary create MINUTEID`](#nove-minute-speaker-summary-create-minuteid)
* [`nove minute speaker-summary delete MINUTEID SUMMARYID`](#nove-minute-speaker-summary-delete-minuteid-summaryid)
* [`nove minute speaker-summary get MINUTEID SUMMARYID`](#nove-minute-speaker-summary-get-minuteid-summaryid)
* [`nove minute speaker-summary list MINUTEID`](#nove-minute-speaker-summary-list-minuteid)
* [`nove minute speaker-summary update MINUTEID SUMMARYID`](#nove-minute-speaker-summary-update-minuteid-summaryid)
* [`nove minute transcript MINUTEID`](#nove-minute-transcript-minuteid)
* [`nove minute transcript-context MINUTEID PLATFORMUSERID`](#nove-minute-transcript-context-minuteid-platformuserid)
* [`nove minute user-transcripts PLATFORMUSERID`](#nove-minute-user-transcripts-platformuserid)

## `nove minute delete ID`

Delete a meeting minute

```
USAGE
  $ nove minute delete ID [--dry-run] [-y] [--json]

ARGUMENTS
  ID  Minute ID

FLAGS
  -y, --yes      Skip the interactive confirmation
      --dry-run  Show what would be deleted without sending the request
      --json     Output a single JSON value to stdout

DESCRIPTION
  Delete a meeting minute
```

_See code: [src/commands/minute/delete.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/minute/delete.ts)_

## `nove minute get ID`

Get details of a meeting minute

```
USAGE
  $ nove minute get ID [--json]

ARGUMENTS
  ID  Minute ID

FLAGS
  --json  Output a single JSON value to stdout

DESCRIPTION
  Get details of a meeting minute
```

_See code: [src/commands/minute/get.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/minute/get.ts)_

## `nove minute list`

List meeting minutes

```
USAGE
  $ nove minute list [--all | --page <value>] [--fields <value>] [--json] [--limit <value>] [--meeting-id
    <value>] [--sort <value>] [--source PLATFORM_AUTO|USER_MANUAL|THIRD_PARTY]

FLAGS
  --all                 Fetch every result page
  --fields=<value>      Comma-separated fields to show in the table
  --json                Output a single JSON value to stdout
  --limit=<value>       [default: 10] Items per page
  --meeting-id=<value>  Filter by Meeting ID
  --page=<value>        [default: 1] Page number
  --sort=<value>        Table sort field with optional :asc or :desc suffix
  --source=<option>     Minute source
                        <options: PLATFORM_AUTO|USER_MANUAL|THIRD_PARTY>

DESCRIPTION
  List meeting minutes
```

_See code: [src/commands/minute/list.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/minute/list.ts)_

## `nove minute speaker-summary create MINUTEID`

Create a speaker summary

```
USAGE
  $ nove minute speaker-summary create MINUTEID --part-summary <value> --platform-user-id <value> [--ai-model <value>]
    [--generated-by AI|HYBRID|MANUAL] [--json] [--keywords <value>...]

ARGUMENTS
  MINUTEID  Minute ID

FLAGS
  --ai-model=<value>          AI model used to generate the summary
  --generated-by=<option>     Generation method
                              <options: AI|HYBRID|MANUAL>
  --json                      Output a single JSON value to stdout
  --keywords=<value>...       Summary keyword (repeat for multiple)
  --part-summary=<value>      (required) Speaker summary text
  --platform-user-id=<value>  (required) Platform user ID

DESCRIPTION
  Create a speaker summary
```

_See code: [src/commands/minute/speaker-summary/create.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/minute/speaker-summary/create.ts)_

## `nove minute speaker-summary delete MINUTEID SUMMARYID`

Delete a speaker summary

```
USAGE
  $ nove minute speaker-summary delete MINUTEID SUMMARYID [--dry-run] [-y] [--json]

ARGUMENTS
  MINUTEID   Minute ID
  SUMMARYID  Speaker summary ID

FLAGS
  -y, --yes      Skip the interactive confirmation
      --dry-run  Show what would be deleted without sending the request
      --json     Output a single JSON value to stdout

DESCRIPTION
  Delete a speaker summary
```

_See code: [src/commands/minute/speaker-summary/delete.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/minute/speaker-summary/delete.ts)_

## `nove minute speaker-summary get MINUTEID SUMMARYID`

Get a speaker summary

```
USAGE
  $ nove minute speaker-summary get MINUTEID SUMMARYID [--json]

ARGUMENTS
  MINUTEID   Minute ID
  SUMMARYID  Speaker summary ID

FLAGS
  --json  Output a single JSON value to stdout

DESCRIPTION
  Get a speaker summary
```

_See code: [src/commands/minute/speaker-summary/get.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/minute/speaker-summary/get.ts)_

## `nove minute speaker-summary list MINUTEID`

List speaker summaries for a meeting minute

```
USAGE
  $ nove minute speaker-summary list MINUTEID [--all | --page <value>] [--fields <value>] [--json] [--limit <value>] [--sort
    <value>]

ARGUMENTS
  MINUTEID  Minute ID

FLAGS
  --all             Fetch every result page
  --fields=<value>  Comma-separated fields to show in the table
  --json            Output a single JSON value to stdout
  --limit=<value>   [default: 20] Items per page
  --page=<value>    [default: 1] Page number
  --sort=<value>    Table sort field with optional :asc or :desc suffix

DESCRIPTION
  List speaker summaries for a meeting minute
```

_See code: [src/commands/minute/speaker-summary/list.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/minute/speaker-summary/list.ts)_

## `nove minute speaker-summary update MINUTEID SUMMARYID`

Update a speaker summary

```
USAGE
  $ nove minute speaker-summary update MINUTEID SUMMARYID [--json] [--keywords <value>...] [--part-summary <value>]

ARGUMENTS
  MINUTEID   Minute ID
  SUMMARYID  Speaker summary ID

FLAGS
  --json                  Output a single JSON value to stdout
  --keywords=<value>...   Summary keyword (repeat for multiple)
  --part-summary=<value>  Speaker summary text

DESCRIPTION
  Update a speaker summary
```

_See code: [src/commands/minute/speaker-summary/update.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/minute/speaker-summary/update.ts)_

## `nove minute transcript MINUTEID`

Get transcript for a meeting minute

```
USAGE
  $ nove minute transcript MINUTEID [--include-local-user] [--json]

ARGUMENTS
  MINUTEID  Minute ID

FLAGS
  --include-local-user  Include linked local user details in transcript segments
  --json                Output a single JSON value to stdout

DESCRIPTION
  Get transcript for a meeting minute
```

_See code: [src/commands/minute/transcript.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/minute/transcript.ts)_

## `nove minute transcript-context MINUTEID PLATFORMUSERID`

Get transcript context for a platform user in a meeting minute

```
USAGE
  $ nove minute transcript-context MINUTEID PLATFORMUSERID --depth <value> [--json]

ARGUMENTS
  MINUTEID        Minute ID
  PLATFORMUSERID  Platform user ID

FLAGS
  --depth=<value>  (required) Number of transcript segments before and after each target segment
  --json           Output a single JSON value to stdout

DESCRIPTION
  Get transcript context for a platform user in a meeting minute
```

_See code: [src/commands/minute/transcript-context.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/minute/transcript-context.ts)_

## `nove minute user-transcripts PLATFORMUSERID`

Get minutes where a platform user spoke and their transcript segments

```
USAGE
  $ nove minute user-transcripts PLATFORMUSERID --end-date <value> --start-date <value> [--json]

ARGUMENTS
  PLATFORMUSERID  Platform user ID

FLAGS
  --end-date=<value>    (required) Exclusive ISO 8601 end date with explicit timezone
  --json                Output a single JSON value to stdout
  --start-date=<value>  (required) Inclusive ISO 8601 start date with explicit timezone

DESCRIPTION
  Get minutes where a platform user spoke and their transcript segments
```

_See code: [src/commands/minute/user-transcripts.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/minute/user-transcripts.ts)_
