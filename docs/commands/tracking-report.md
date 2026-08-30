`nove tracking-report`
======================

Manage tracking reports

* [`nove tracking-report create`](#nove-tracking-report-create)
* [`nove tracking-report delete ID`](#nove-tracking-report-delete-id)
* [`nove tracking-report get ID`](#nove-tracking-report-get-id)
* [`nove tracking-report list`](#nove-tracking-report-list)
* [`nove tracking-report update ID`](#nove-tracking-report-update-id)

## `nove tracking-report create`

Create a tracking report

```
USAGE
  $ nove tracking-report create --base-date <value> --cadence DAILY|WEEKLY|MONTHLY|QUARTERLY|YEARLY --target-id <value>
    --target-name <value> --target-type USER|PLATFORM_USER|PROJECT|ORGANIZATION --tracking-type
    MEETING_SUMMARY|TRAINING_PLAN|DEVELOPMENT_PLAN|PROJECT_PROGRESS|USER_PROFILE [--ai-model <value>] [--content
    <value>] [--content-file <value>] [--generated-by AI|HYBRID|MANUAL] [--json] [--sources <value>] [--sources-file
    <value>] [--target-metadata <value>] [--target-metadata-file <value>] [--timezone <value>]

FLAGS
  --ai-model=<value>              AI model used to generate the report
  --base-date=<value>             (required) ISO 8601 date-time used to locate the report period
  --cadence=<option>              (required) Report cadence
                                  <options: DAILY|WEEKLY|MONTHLY|QUARTERLY|YEARLY>
  --content=<value>               Report content
  --content-file=<value>          Read report content from a UTF-8 file
  --generated-by=<option>         Generation method
                                  <options: AI|HYBRID|MANUAL>
  --json                          Output a single JSON value to stdout
  --sources=<value>               JSON array of report sources
  --sources-file=<value>          Read report sources from a JSON file
  --target-id=<value>             (required) Business object ID of the tracking target
  --target-metadata=<value>       Tracking target metadata as a JSON object
  --target-metadata-file=<value>  Read tracking target metadata from a JSON file
  --target-name=<value>           (required) Tracking target name snapshot
  --target-type=<option>          (required) Tracking target type
                                  <options: USER|PLATFORM_USER|PROJECT|ORGANIZATION>
  --timezone=<value>              [default: Asia/Shanghai] IANA timezone used to calculate the report period
  --tracking-type=<option>        (required) Tracking report type
                                  <options:
                                  MEETING_SUMMARY|TRAINING_PLAN|DEVELOPMENT_PLAN|PROJECT_PROGRESS|USER_PROFILE>

DESCRIPTION
  Create a tracking report
```

_See code: [src/commands/tracking-report/create.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/tracking-report/create.ts)_

## `nove tracking-report delete ID`

Delete a tracking report

```
USAGE
  $ nove tracking-report delete ID [--dry-run] [-y] [--json]

ARGUMENTS
  ID  Tracking report ID

FLAGS
  -y, --yes      Skip the interactive confirmation
      --dry-run  Show what would be deleted without sending the request
      --json     Output a single JSON value to stdout

DESCRIPTION
  Delete a tracking report
```

_See code: [src/commands/tracking-report/delete.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/tracking-report/delete.ts)_

## `nove tracking-report get ID`

Get a tracking report by ID

```
USAGE
  $ nove tracking-report get ID [--json]

ARGUMENTS
  ID  Tracking report ID

FLAGS
  --json  Output a single JSON value to stdout

DESCRIPTION
  Get a tracking report by ID
```

_See code: [src/commands/tracking-report/get.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/tracking-report/get.ts)_

## `nove tracking-report list`

List tracking reports

```
USAGE
  $ nove tracking-report list [--all | --page <value>] [--cadence DAILY|WEEKLY|MONTHLY|QUARTERLY|YEARLY] [--fields
    <value>] [--json] [--keyword <value>] [--limit <value>] [--period-end <value>] [--period-start <value>] [--sort
    <value>] [--target-id <value>] [--target-type USER|PLATFORM_USER|PROJECT|ORGANIZATION] [--tracking-type
    MEETING_SUMMARY|TRAINING_PLAN|DEVELOPMENT_PLAN|PROJECT_PROGRESS|USER_PROFILE]

FLAGS
  --all                     Fetch every result page
  --cadence=<option>        Report cadence
                            <options: DAILY|WEEKLY|MONTHLY|QUARTERLY|YEARLY>
  --fields=<value>          Comma-separated fields to show in the table
  --json                    Output a single JSON value to stdout
  --keyword=<value>         Search target names
  --limit=<value>           [default: 20] Items per page
  --page=<value>            [default: 1] Page number
  --period-end=<value>      Exclusive ISO period end with timezone
  --period-start=<value>    Inclusive ISO period start with timezone
  --sort=<value>            Table sort field with optional :asc or :desc suffix
  --target-id=<value>       Filter by business object ID
  --target-type=<option>    Filter by tracking target type
                            <options: USER|PLATFORM_USER|PROJECT|ORGANIZATION>
  --tracking-type=<option>  Filter by tracking report type
                            <options: MEETING_SUMMARY|TRAINING_PLAN|DEVELOPMENT_PLAN|PROJECT_PROGRESS|USER_PROFILE>

DESCRIPTION
  List tracking reports
```

_See code: [src/commands/tracking-report/list.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/tracking-report/list.ts)_

## `nove tracking-report update ID`

Update a tracking report

```
USAGE
  $ nove tracking-report update ID [--ai-model <value>] [--clear-ai-model] [--clear-generated-by] [--content <value>]
    [--content-file <value>] [--generated-by AI|HYBRID|MANUAL] [--json] [--sources <value>] [--sources-file <value>]

ARGUMENTS
  ID  Tracking report ID

FLAGS
  --ai-model=<value>       AI model used to generate the report
  --clear-ai-model         Clear the stored AI model
  --clear-generated-by     Clear the stored generation method
  --content=<value>        Report content
  --content-file=<value>   Read report content from a UTF-8 file
  --generated-by=<option>  Generation method
                           <options: AI|HYBRID|MANUAL>
  --json                   Output a single JSON value to stdout
  --sources=<value>        Replacement report sources as a JSON array
  --sources-file=<value>   Read replacement report sources from a JSON file

DESCRIPTION
  Update a tracking report
```

_See code: [src/commands/tracking-report/update.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/tracking-report/update.ts)_
