`nove project`
==============

Manage projects in the current organization

* [`nove project create`](#nove-project-create)
* [`nove project delete ID`](#nove-project-delete-id)
* [`nove project get ID`](#nove-project-get-id)
* [`nove project list`](#nove-project-list)
* [`nove project status ID`](#nove-project-status-id)
* [`nove project update ID`](#nove-project-update-id)

## `nove project create`

Create a project in the current organization

```
USAGE
  $ nove project create --title <value> [--category <value>] [--code <value>] [--description <value>] [--duration
    <value>] [--end-date <value>] [--enroll-deadline <value>] [--enrolled-count <value>] [--featured] [--image <value>]
    [--level BEGINNER|INTERMEDIATE|ADVANCED] [--max-students <value>] [--metadata <value>] [--outcome <value>...]
    [--owner-id <value>] [--prerequisite <value>...] [--product-id <value>] [--slug <value>] [--sort-order <value>]
    [--start-date <value>] [--status DRAFT|PUBLISHED|ENROLLING|IN_PROGRESS|COMPLETED|ARCHIVED] [--subtitle <value>]
    [--tag <value>...] [--json]

FLAGS
  --category=<value>         Project category
  --code=<value>             Project code
  --description=<value>      Detailed project description
  --duration=<value>         Project duration, for example 8 weeks
  --end-date=<value>         End ISO 8601 date-time with timezone
  --enroll-deadline=<value>  Enrollment deadline ISO 8601 date-time with timezone
  --enrolled-count=<value>   Current enrollment count
  --[no-]featured            Mark the project as featured
  --image=<value>            Absolute site image path or HTTP(S) URL
  --json                     Output a single JSON value to stdout
  --level=<option>           Project level
                             <options: BEGINNER|INTERMEDIATE|ADVANCED>
  --max-students=<value>     Maximum student count
  --metadata=<value>         Metadata as a JSON object
  --outcome=<value>...       Expected outcome; repeat for multiple values
  --owner-id=<value>         Owner local user ID
  --prerequisite=<value>...  Prerequisite; repeat for multiple values
  --product-id=<value>       Related product ID
  --slug=<value>             Optional URL-safe project slug
  --sort-order=<value>       Display sort order
  --start-date=<value>       Start ISO 8601 date-time with timezone
  --status=<option>          Project status
                             <options: DRAFT|PUBLISHED|ENROLLING|IN_PROGRESS|COMPLETED|ARCHIVED>
  --subtitle=<value>         Project subtitle
  --tag=<value>...           Project tag; repeat for multiple tags
  --title=<value>            (required) Project title

DESCRIPTION
  Create a project in the current organization
```

_See code: [src/commands/project/create.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/project/create.ts)_

## `nove project delete ID`

Soft delete a project after reading the exact target

```
USAGE
  $ nove project delete ID [--dry-run] [-y] [--json]

ARGUMENTS
  ID  Project ID

FLAGS
  -y, --yes      Skip the interactive confirmation
      --dry-run  Show what would be deleted without sending the request
      --json     Output a single JSON value to stdout

DESCRIPTION
  Soft delete a project after reading the exact target
```

_See code: [src/commands/project/delete.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/project/delete.ts)_

## `nove project get ID`

Get a project by ID in the current organization

```
USAGE
  $ nove project get ID [--json]

ARGUMENTS
  ID  Project ID

FLAGS
  --json  Output a single JSON value to stdout

DESCRIPTION
  Get a project by ID in the current organization
```

_See code: [src/commands/project/get.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/project/get.ts)_

## `nove project list`

List projects in the current organization

```
USAGE
  $ nove project list [--all | --page <value>] [--category <value>] [--featured] [--fields <value>] [--json]
    [--keyword <value>] [--level BEGINNER|INTERMEDIATE|ADVANCED] [--limit <value>] [--owner-id <value>] [--product-id
    <value>] [--sort <value>] [--sort-by createdAt|updatedAt|title|sortOrder|startDate|publishedAt|enrolledCount]
    [--sort-order asc|desc] [--status DRAFT|PUBLISHED|ENROLLING|IN_PROGRESS|COMPLETED|ARCHIVED]

FLAGS
  --all                  Fetch every result page
  --category=<value>     Filter by project category
  --[no-]featured        Filter by featured status
  --fields=<value>       Comma-separated fields to show in the table
  --json                 Output a single JSON value to stdout
  --keyword=<value>      Search title, subtitle, code, slug, or description
  --level=<option>       Filter by project level
                         <options: BEGINNER|INTERMEDIATE|ADVANCED>
  --limit=<value>        [default: 10] Items per page
  --owner-id=<value>     Filter by owner local user ID
  --page=<value>         [default: 1] Page number
  --product-id=<value>   Filter by related product ID
  --sort=<value>         Table sort field with optional :asc or :desc suffix
  --sort-by=<option>     [default: sortOrder] Server sort field
                         <options: createdAt|updatedAt|title|sortOrder|startDate|publishedAt|enrolledCount>
  --sort-order=<option>  [default: asc] Server sort order
                         <options: asc|desc>
  --status=<option>      Filter by project status
                         <options: DRAFT|PUBLISHED|ENROLLING|IN_PROGRESS|COMPLETED|ARCHIVED>

DESCRIPTION
  List projects in the current organization
```

_See code: [src/commands/project/list.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/project/list.ts)_

## `nove project status ID`

Update a project status

```
USAGE
  $ nove project status ID --status DRAFT|PUBLISHED|ENROLLING|IN_PROGRESS|COMPLETED|ARCHIVED [--json]

ARGUMENTS
  ID  Project ID

FLAGS
  --json             Output a single JSON value to stdout
  --status=<option>  (required) Project status
                     <options: DRAFT|PUBLISHED|ENROLLING|IN_PROGRESS|COMPLETED|ARCHIVED>

DESCRIPTION
  Update a project status
```

_See code: [src/commands/project/status.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/project/status.ts)_

## `nove project update ID`

Update a project in the current organization

```
USAGE
  $ nove project update ID [--category <value>] [--code <value>] [--description <value>] [--duration <value>]
    [--end-date <value>] [--enroll-deadline <value>] [--enrolled-count <value>] [--featured] [--image <value>] [--level
    BEGINNER|INTERMEDIATE|ADVANCED] [--max-students <value>] [--metadata <value>] [--outcome <value>...] [--owner-id
    <value>] [--prerequisite <value>...] [--product-id <value>] [--slug <value>] [--sort-order <value>] [--start-date
    <value>] [--status DRAFT|PUBLISHED|ENROLLING|IN_PROGRESS|COMPLETED|ARCHIVED] [--subtitle <value>] [--tag <value>...]
    [--title <value>] [--clear subtitle|code|slug|category|image|description|duration|max-students|prerequisites|outcome
    s|tags|owner-id|product-id|start-date|end-date|enroll-deadline...] [--json]

ARGUMENTS
  ID  Project ID

FLAGS
  --category=<value>         Project category
  --clear=<option>...        Clear a nullable field; repeat for multiple fields
                             <options: subtitle|code|slug|category|image|description|duration|max-students|prerequisites
                             |outcomes|tags|owner-id|product-id|start-date|end-date|enroll-deadline>
  --code=<value>             Project code
  --description=<value>      Detailed project description
  --duration=<value>         Project duration, for example 8 weeks
  --end-date=<value>         End ISO 8601 date-time with timezone
  --enroll-deadline=<value>  Enrollment deadline ISO 8601 date-time with timezone
  --enrolled-count=<value>   Current enrollment count
  --[no-]featured            Mark the project as featured
  --image=<value>            Absolute site image path or HTTP(S) URL
  --json                     Output a single JSON value to stdout
  --level=<option>           Project level
                             <options: BEGINNER|INTERMEDIATE|ADVANCED>
  --max-students=<value>     Maximum student count
  --metadata=<value>         Metadata as a JSON object
  --outcome=<value>...       Expected outcome; repeat for multiple values
  --owner-id=<value>         Owner local user ID
  --prerequisite=<value>...  Prerequisite; repeat for multiple values
  --product-id=<value>       Related product ID
  --slug=<value>             Optional URL-safe project slug
  --sort-order=<value>       Display sort order
  --start-date=<value>       Start ISO 8601 date-time with timezone
  --status=<option>          Project status
                             <options: DRAFT|PUBLISHED|ENROLLING|IN_PROGRESS|COMPLETED|ARCHIVED>
  --subtitle=<value>         Project subtitle
  --tag=<value>...           Project tag; repeat for multiple tags
  --title=<value>            Project title

DESCRIPTION
  Update a project in the current organization
```

_See code: [src/commands/project/update.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/project/update.ts)_
