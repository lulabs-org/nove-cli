`nove user`
===========

Manage user accounts

* [`nove user create`](#nove-user-create)
* [`nove user delete ID`](#nove-user-delete-id)
* [`nove user get ID`](#nove-user-get-id)
* [`nove user import`](#nove-user-import)
* [`nove user list`](#nove-user-list)
* [`nove user update ID`](#nove-user-update-id)

## `nove user create`

Create a new user

```
USAGE
  $ nove user create [--active] [--address <value>] [--avatar <value>] [--bio <value>] [--city <value>]
    [--country <value>] [--country-code <value>] [--date-of-birth <value>] [--display-name <value>] [--email <value>]
    [--full-name <value>] [--gender MALE|FEMALE|OTHER] [--phone <value>] [--username <value>] [--website <value>]
    [--zip-code <value>] [--json]

FLAGS
  --[no-]active            Active status
  --address=<value>        Detailed address
  --avatar=<value>         Avatar URL
  --bio=<value>            Biography
  --city=<value>           City
  --country=<value>        Country
  --country-code=<value>   Country code (for example +86)
  --date-of-birth=<value>  Date of birth (YYYY-MM-DD)
  --display-name=<value>   Display name
  --email=<value>          Email address
  --full-name=<value>      Full name supplied by the user (not verified)
  --gender=<option>        Gender
                           <options: MALE|FEMALE|OTHER>
  --json                   Output a single JSON value to stdout
  --phone=<value>          Phone number without country code
  --username=<value>       Username
  --website=<value>        Personal website URL
  --zip-code=<value>       Zip code

DESCRIPTION
  Create a new user
```

_See code: [src/commands/user/create.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0-beta.2/src/commands/user/create.ts)_

## `nove user delete ID`

Delete a user by ID

```
USAGE
  $ nove user delete ID [--dry-run] [-y] [--json]

ARGUMENTS
  ID  User ID

FLAGS
  -y, --yes      Skip the interactive confirmation
      --dry-run  Show what would be deleted without sending the request
      --json     Output a single JSON value to stdout

DESCRIPTION
  Delete a user by ID
```

_See code: [src/commands/user/delete.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0-beta.2/src/commands/user/delete.ts)_

## `nove user get ID`

Get user details by ID

```
USAGE
  $ nove user get ID [--json]

ARGUMENTS
  ID  User ID

FLAGS
  --json  Output a single JSON value to stdout

DESCRIPTION
  Get user details by ID
```

_See code: [src/commands/user/get.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0-beta.2/src/commands/user/get.ts)_

## `nove user import`

Import users from a CSV or XLSX file

```
USAGE
  $ nove user import --file <value> [--json]

FLAGS
  --file=<value>  (required) Path to the file to import
  --json          Output a single JSON value to stdout

DESCRIPTION
  Import users from a CSV or XLSX file
```

_See code: [src/commands/user/import.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0-beta.2/src/commands/user/import.ts)_

## `nove user list`

List users

```
USAGE
  $ nove user list [--active] [--all | --page <value>] [--fields <value>] [--json] [--keyword <value>] [--limit
    <value>] [--sort <value>] [--sort-by createdAt|updatedAt|lastLoginAt|username|email] [--sort-order asc|desc]

FLAGS
  --[no-]active          Filter by active status
  --all                  Fetch every result page
  --fields=<value>       Comma-separated fields to show in the table
  --json                 Output a single JSON value to stdout
  --keyword=<value>      Search username, email, phone, or display name
  --limit=<value>        [default: 20] Items per page
  --page=<value>         [default: 1] Page number
  --sort=<value>         Table sort field with optional :asc or :desc suffix
  --sort-by=<option>     [default: createdAt] Server sort field
                         <options: createdAt|updatedAt|lastLoginAt|username|email>
  --sort-order=<option>  [default: desc] Server sort order
                         <options: asc|desc>

DESCRIPTION
  List users
```

_See code: [src/commands/user/list.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0-beta.2/src/commands/user/list.ts)_

## `nove user update ID`

Update an existing user

```
USAGE
  $ nove user update ID [--active] [--address <value>] [--avatar <value>] [--bio <value>] [--city <value>]
    [--country <value>] [--country-code <value>] [--date-of-birth <value>] [--display-name <value>] [--email <value>]
    [--full-name <value>] [--gender MALE|FEMALE|OTHER] [--phone <value>] [--username <value>] [--website <value>]
    [--zip-code <value>] [--json]

ARGUMENTS
  ID  User ID

FLAGS
  --[no-]active            Active status
  --address=<value>        Detailed address
  --avatar=<value>         Avatar URL
  --bio=<value>            Biography
  --city=<value>           City
  --country=<value>        Country
  --country-code=<value>   Country code (for example +86)
  --date-of-birth=<value>  Date of birth (YYYY-MM-DD)
  --display-name=<value>   Display name
  --email=<value>          Email address
  --full-name=<value>      Full name supplied by the user (not verified)
  --gender=<option>        Gender
                           <options: MALE|FEMALE|OTHER>
  --json                   Output a single JSON value to stdout
  --phone=<value>          Phone number without country code
  --username=<value>       Username
  --website=<value>        Personal website URL
  --zip-code=<value>       Zip code

DESCRIPTION
  Update an existing user
```

_See code: [src/commands/user/update.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0-beta.2/src/commands/user/update.ts)_
