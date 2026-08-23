`nove minute`
=============

Delete a meeting minute

* [`nove minute delete ID`](#nove-minute-delete-id)
* [`nove minute get ID`](#nove-minute-get-id)
* [`nove minute list`](#nove-minute-list)
* [`nove minute speaker-summary create MINUTEID`](#nove-minute-speaker-summary-create-minuteid)
* [`nove minute speaker-summary delete MINUTEID SUMMARYID`](#nove-minute-speaker-summary-delete-minuteid-summaryid)
* [`nove minute speaker-summary get MINUTEID SUMMARYID`](#nove-minute-speaker-summary-get-minuteid-summaryid)
* [`nove minute speaker-summary list MINUTEID`](#nove-minute-speaker-summary-list-minuteid)
* [`nove minute speaker-summary update MINUTEID SUMMARYID`](#nove-minute-speaker-summary-update-minuteid-summaryid)
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

_See code: [src/commands/minute/delete.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.4/src/commands/minute/delete.ts)_

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

_See code: [src/commands/minute/get.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.4/src/commands/minute/get.ts)_

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

_See code: [src/commands/minute/list.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.4/src/commands/minute/list.ts)_

## `nove minute speaker-summary create MINUTEID`

Create a speaker summary

```
USAGE
  $ nove minute speaker-summary create MINUTEID --partSummary <value> --platformUserId <value> [--aiModel <value>] [--generatedBy
    AI|HYBRID|MANUAL] [--keywords <value>...]

ARGUMENTS
  MINUTEID  Minute ID

FLAGS
  --aiModel=<value>         AI model used to generate the summary
  --generatedBy=<option>    Generation method
                            <options: AI|HYBRID|MANUAL>
  --keywords=<value>...     Summary keyword (repeat for multiple)
  --partSummary=<value>     (required) Speaker summary text
  --platformUserId=<value>  (required) Platform user ID

DESCRIPTION
  Create a speaker summary
```

_See code: [src/commands/minute/speaker-summary/create.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.4/src/commands/minute/speaker-summary/create.ts)_

## `nove minute speaker-summary delete MINUTEID SUMMARYID`

Delete a speaker summary

```
USAGE
  $ nove minute speaker-summary delete MINUTEID SUMMARYID

ARGUMENTS
  MINUTEID   Minute ID
  SUMMARYID  Speaker summary ID

DESCRIPTION
  Delete a speaker summary
```

_See code: [src/commands/minute/speaker-summary/delete.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.4/src/commands/minute/speaker-summary/delete.ts)_

## `nove minute speaker-summary get MINUTEID SUMMARYID`

Get a speaker summary

```
USAGE
  $ nove minute speaker-summary get MINUTEID SUMMARYID

ARGUMENTS
  MINUTEID   Minute ID
  SUMMARYID  Speaker summary ID

DESCRIPTION
  Get a speaker summary
```

_See code: [src/commands/minute/speaker-summary/get.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.4/src/commands/minute/speaker-summary/get.ts)_

## `nove minute speaker-summary list MINUTEID`

List speaker summaries for a meeting minute

```
USAGE
  $ nove minute speaker-summary list MINUTEID [--limit <value>] [--page <value>]

ARGUMENTS
  MINUTEID  Minute ID

FLAGS
  --limit=<value>  [default: 20] Items per page
  --page=<value>   [default: 1] Page number

DESCRIPTION
  List speaker summaries for a meeting minute
```

_See code: [src/commands/minute/speaker-summary/list.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.4/src/commands/minute/speaker-summary/list.ts)_

## `nove minute speaker-summary update MINUTEID SUMMARYID`

Update a speaker summary

```
USAGE
  $ nove minute speaker-summary update MINUTEID SUMMARYID [--keywords <value>...] [--partSummary <value>]

ARGUMENTS
  MINUTEID   Minute ID
  SUMMARYID  Speaker summary ID

FLAGS
  --keywords=<value>...  Summary keyword (repeat for multiple)
  --partSummary=<value>  Speaker summary text

DESCRIPTION
  Update a speaker summary
```

_See code: [src/commands/minute/speaker-summary/update.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.4/src/commands/minute/speaker-summary/update.ts)_

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

_See code: [src/commands/minute/transcript.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.4/src/commands/minute/transcript.ts)_
