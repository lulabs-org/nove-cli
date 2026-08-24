`nove meeting`
==============

Manage meeting records

* [`nove meeting create`](#nove-meeting-create)
* [`nove meeting delete ID`](#nove-meeting-delete-id)
* [`nove meeting get ID`](#nove-meeting-get-id)
* [`nove meeting list`](#nove-meeting-list)
* [`nove meeting participants ID`](#nove-meeting-participants-id)
* [`nove meeting stats`](#nove-meeting-stats)
* [`nove meeting update ID`](#nove-meeting-update-id)

## `nove meeting create`

Create a meeting record

```
USAGE
  $ nove meeting create --platform TENCENT_MEETING|ZOOM|TEAMS|DINGTALK|FEISHU|WEBEX|VOOV|OTHER --platform-meeting-id
    <value> --title <value> --type ONE_TIME|RECURRING|INSTANT|SCHEDULED|WEBINAR [--actual-start-at <value>]
    [--duration-seconds <value>] [--ended-at <value>] [--json] [--meeting-code <value>]

FLAGS
  --actual-start-at=<value>      Actual start time as ISO 8601 with timezone
  --duration-seconds=<value>     Duration in seconds
  --ended-at=<value>             End time as ISO 8601 with timezone
  --json                         Output a single JSON value to stdout
  --meeting-code=<value>         Meeting code
  --platform=<option>            (required) Meeting platform
                                 <options: TENCENT_MEETING|ZOOM|TEAMS|DINGTALK|FEISHU|WEBEX|VOOV|OTHER>
  --platform-meeting-id=<value>  (required) Platform Meeting ID
  --title=<value>                (required) Meeting title
  --type=<option>                (required) Meeting type
                                 <options: ONE_TIME|RECURRING|INSTANT|SCHEDULED|WEBINAR>

DESCRIPTION
  Create a meeting record
```

_See code: [src/commands/meeting/create.ts](https://github.com/lulabs-org/nove-cli/blob/v1.1.0/src/commands/meeting/create.ts)_

## `nove meeting delete ID`

Delete a meeting record

```
USAGE
  $ nove meeting delete ID [--dry-run] [-y] [--json]

ARGUMENTS
  ID  Meeting ID

FLAGS
  -y, --yes      Skip the interactive confirmation
      --dry-run  Show what would be deleted without sending the request
      --json     Output a single JSON value to stdout

DESCRIPTION
  Delete a meeting record
```

_See code: [src/commands/meeting/delete.ts](https://github.com/lulabs-org/nove-cli/blob/v1.1.0/src/commands/meeting/delete.ts)_

## `nove meeting get ID`

Get a meeting by ID

```
USAGE
  $ nove meeting get ID [--json]

ARGUMENTS
  ID  Meeting ID

FLAGS
  --json  Output a single JSON value to stdout

DESCRIPTION
  Get a meeting by ID
```

_See code: [src/commands/meeting/get.ts](https://github.com/lulabs-org/nove-cli/blob/v1.1.0/src/commands/meeting/get.ts)_

## `nove meeting list`

List meetings

```
USAGE
  $ nove meeting list [--all | --page <value>] [--date <value>] [--end-date <value>] [--fields <value>] [--json]
    [--limit <value>] [--platform TENCENT_MEETING|ZOOM|TEAMS|DINGTALK|FEISHU|WEBEX|VOOV|OTHER] [--search <value>]
    [--sort <value>] [--start-date <value>] [--status PENDING|PROCESSING|COMPLETED|FAILED|SKIPPED] [--timezone <value>]
    [--type ONE_TIME|RECURRING|INSTANT|SCHEDULED|WEBINAR]

FLAGS
  --all                 Fetch every result page
  --date=<value>        Local calendar day (YYYY-MM-DD)
  --end-date=<value>    Exclusive ISO end date with timezone
  --fields=<value>      Comma-separated fields to show in the table
  --json                Output a single JSON value to stdout
  --limit=<value>       [default: 10] Items per page
  --page=<value>        [default: 1] Page number
  --platform=<option>   Meeting platform
                        <options: TENCENT_MEETING|ZOOM|TEAMS|DINGTALK|FEISHU|WEBEX|VOOV|OTHER>
  --search=<value>      Search keyword
  --sort=<value>        Table sort field with optional :asc or :desc suffix
  --start-date=<value>  Inclusive ISO start date with timezone
  --status=<option>     Processing status
                        <options: PENDING|PROCESSING|COMPLETED|FAILED|SKIPPED>
  --timezone=<value>    [default: Asia/Shanghai] IANA timezone used with --date
  --type=<option>       Meeting type
                        <options: ONE_TIME|RECURRING|INSTANT|SCHEDULED|WEBINAR>

DESCRIPTION
  List meetings
```

_See code: [src/commands/meeting/list.ts](https://github.com/lulabs-org/nove-cli/blob/v1.1.0/src/commands/meeting/list.ts)_

## `nove meeting participants ID`

Get participants for a meeting

```
USAGE
  $ nove meeting participants ID [--all | --page <value>] [--fields <value>] [--json] [--limit <value>] [--search <value>]
    [--sort <value>]

ARGUMENTS
  ID  Meeting ID

FLAGS
  --all             Fetch every result page
  --fields=<value>  Comma-separated fields to show in the table
  --json            Output a single JSON value to stdout
  --limit=<value>   [default: 50] Items per page
  --page=<value>    [default: 1] Page number
  --search=<value>  Search name, email, phone, or platform user ID
  --sort=<value>    Table sort field with optional :asc or :desc suffix

DESCRIPTION
  Get participants for a meeting
```

_See code: [src/commands/meeting/participants.ts](https://github.com/lulabs-org/nove-cli/blob/v1.1.0/src/commands/meeting/participants.ts)_

## `nove meeting stats`

Get meeting statistics

```
USAGE
  $ nove meeting stats [--date <value>] [--end-date <value>] [--json] [--start-date <value>] [--timezone <value>]

FLAGS
  --date=<value>        Local calendar day (YYYY-MM-DD)
  --end-date=<value>    Exclusive ISO end date with timezone
  --json                Output a single JSON value to stdout
  --start-date=<value>  Inclusive ISO start date with timezone
  --timezone=<value>    [default: Asia/Shanghai] IANA timezone used with --date

DESCRIPTION
  Get meeting statistics
```

_See code: [src/commands/meeting/stats.ts](https://github.com/lulabs-org/nove-cli/blob/v1.1.0/src/commands/meeting/stats.ts)_

## `nove meeting update ID`

Update a meeting record

```
USAGE
  $ nove meeting update ID [--actual-start-at <value>] [--duration-seconds <value>] [--ended-at <value>] [--json]
    [--meeting-code <value>] [--participant-count <value>] [--title <value>] [--type
    ONE_TIME|RECURRING|INSTANT|SCHEDULED|WEBINAR]

ARGUMENTS
  ID  Meeting ID

FLAGS
  --actual-start-at=<value>    Actual start time as ISO 8601 with timezone
  --duration-seconds=<value>   Duration in seconds
  --ended-at=<value>           End time as ISO 8601 with timezone
  --json                       Output a single JSON value to stdout
  --meeting-code=<value>       Meeting code
  --participant-count=<value>  Participant count
  --title=<value>              New meeting title
  --type=<option>              Meeting type
                               <options: ONE_TIME|RECURRING|INSTANT|SCHEDULED|WEBINAR>

DESCRIPTION
  Update a meeting record
```

_See code: [src/commands/meeting/update.ts](https://github.com/lulabs-org/nove-cli/blob/v1.1.0/src/commands/meeting/update.ts)_
