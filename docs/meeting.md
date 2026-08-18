`nove meeting`
==============

Manage meeting records

* [`nove meeting create`](#nove-meeting-create)
* [`nove meeting delete ID`](#nove-meeting-delete-id)
* [`nove meeting get ID`](#nove-meeting-get-id)
* [`nove meeting list`](#nove-meeting-list)
* [`nove meeting participants ID`](#nove-meeting-participants-id)
* [`nove meeting recording delete ID`](#nove-meeting-recording-delete-id)
* [`nove meeting recording get ID`](#nove-meeting-recording-get-id)
* [`nove meeting recording list`](#nove-meeting-recording-list)
* [`nove meeting recording transcript RECORDINGID`](#nove-meeting-recording-transcript-recordingid)
* [`nove meeting stats`](#nove-meeting-stats)
* [`nove meeting update ID`](#nove-meeting-update-id)

## `nove meeting create`

Create a meeting record

```
USAGE
  $ nove meeting create --platformMeetingId <value> --title <value> [--endTime <value>] [--startTime <value>]
    [--status <value>]

FLAGS
  --endTime=<value>            End time (ISO string)
  --platformMeetingId=<value>  (required) Platform Meeting ID (e.g. feishu ID)
  --startTime=<value>          Start time (ISO string)
  --status=<value>             Status (e.g. COMPLETED)
  --title=<value>              (required) Meeting title

DESCRIPTION
  Create a meeting record
```

_See code: [src/commands/meeting/create.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.0/src/commands/meeting/create.ts)_

## `nove meeting delete ID`

Delete a meeting record

```
USAGE
  $ nove meeting delete ID

ARGUMENTS
  ID  Meeting ID

DESCRIPTION
  Delete a meeting record
```

_See code: [src/commands/meeting/delete.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.0/src/commands/meeting/delete.ts)_

## `nove meeting get ID`

Get a meeting by ID

```
USAGE
  $ nove meeting get ID

ARGUMENTS
  ID  Meeting ID

DESCRIPTION
  Get a meeting by ID
```

_See code: [src/commands/meeting/get.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.0/src/commands/meeting/get.ts)_

## `nove meeting list`

List meetings

```
USAGE
  $ nove meeting list [--endDate <value>] [--limit <value>] [--page <value>] [--platform <value>] [--search
    <value>] [--startDate <value>] [--status <value>] [--type <value>]

FLAGS
  --endDate=<value>    End date (ISO string)
  --limit=<value>      [default: 10] Items per page
  --page=<value>       [default: 1] Page number
  --platform=<value>   Platform (e.g. TENCENT_MEETING, FEISHU)
  --search=<value>     Search keyword
  --startDate=<value>  Start date (ISO string)
  --status=<value>     Processing status (e.g. COMPLETED, PENDING)
  --type=<value>       Meeting type (e.g. SCHEDULED, INSTANT)

DESCRIPTION
  List meetings
```

_See code: [src/commands/meeting/list.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.0/src/commands/meeting/list.ts)_

## `nove meeting participants ID`

Get participants for a meeting

```
USAGE
  $ nove meeting participants ID [--keyword <value>] [--limit <value>] [--page <value>]

ARGUMENTS
  ID  Meeting ID

FLAGS
  --keyword=<value>  Search keyword
  --limit=<value>    [default: 20] Items per page
  --page=<value>     [default: 1] Page number

DESCRIPTION
  Get participants for a meeting
```

_See code: [src/commands/meeting/participants.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.0/src/commands/meeting/participants.ts)_

## `nove meeting recording delete ID`

Delete a meeting recording

```
USAGE
  $ nove meeting recording delete ID

ARGUMENTS
  ID  Recording ID

DESCRIPTION
  Delete a meeting recording
```

_See code: [src/commands/meeting/recording/delete.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.0/src/commands/meeting/recording/delete.ts)_

## `nove meeting recording get ID`

Get details of a meeting recording

```
USAGE
  $ nove meeting recording get ID

ARGUMENTS
  ID  Recording ID

DESCRIPTION
  Get details of a meeting recording
```

_See code: [src/commands/meeting/recording/get.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.0/src/commands/meeting/recording/get.ts)_

## `nove meeting recording list`

List meeting recordings

```
USAGE
  $ nove meeting recording list [--limit <value>] [--meetingId <value>] [--page <value>] [--source <value>] [--status
    <value>]

FLAGS
  --limit=<value>      [default: 10] Items per page
  --meetingId=<value>  Filter by Meeting ID
  --page=<value>       [default: 1] Page number
  --source=<value>     Recording source (e.g. PLATFORM_AUTO, UPLOAD)
  --status=<value>     Recording status (e.g. PROCESSING, COMPLETED, FAILED)

DESCRIPTION
  List meeting recordings
```

_See code: [src/commands/meeting/recording/list.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.0/src/commands/meeting/recording/list.ts)_

## `nove meeting recording transcript RECORDINGID`

Get transcript for a meeting recording

```
USAGE
  $ nove meeting recording transcript RECORDINGID [--format text|json]

ARGUMENTS
  RECORDINGID  Recording ID

FLAGS
  --format=<option>  [default: text] Format (text or json)
                     <options: text|json>

DESCRIPTION
  Get transcript for a meeting recording
```

_See code: [src/commands/meeting/recording/transcript.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.0/src/commands/meeting/recording/transcript.ts)_

## `nove meeting stats`

Get meeting statistics

```
USAGE
  $ nove meeting stats [--endDate <value>] [--startDate <value>]

FLAGS
  --endDate=<value>    End date (ISO string)
  --startDate=<value>  Start date (ISO string)

DESCRIPTION
  Get meeting statistics
```

_See code: [src/commands/meeting/stats.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.0/src/commands/meeting/stats.ts)_

## `nove meeting update ID`

Update a meeting record

```
USAGE
  $ nove meeting update ID [--status <value>] [--title <value>]

ARGUMENTS
  ID  Meeting ID

FLAGS
  --status=<value>  New status
  --title=<value>   New meeting title

DESCRIPTION
  Update a meeting record
```

_See code: [src/commands/meeting/update.ts](https://github.com/lulabs-org/nove-cli/blob/v1.0.0/src/commands/meeting/update.ts)_
