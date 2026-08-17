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
    [--country <value>] [--countryCode <value>] [--dateOfBirth <value>] [--displayName <value>] [--email <value>]
    [--firstName <value>] [--gender <value>] [--lastName <value>] [--phone <value>] [--username <value>] [--website
    <value>] [--zipCode <value>]

FLAGS
  --[no-]active          Active status
  --address=<value>      Detailed address
  --avatar=<value>       Avatar URL
  --bio=<value>          Biography
  --city=<value>         City
  --country=<value>      Country
  --countryCode=<value>  Country code (e.g. +86)
  --dateOfBirth=<value>  Date of birth (YYYY-MM-DD)
  --displayName=<value>  Display name
  --email=<value>        Email address
  --firstName=<value>    First name
  --gender=<value>       Gender (e.g. MALE, FEMALE, OTHER)
  --lastName=<value>     Last name
  --phone=<value>        Phone number without country code
  --username=<value>     Username
  --website=<value>      Personal website URL
  --zipCode=<value>      Zip code

DESCRIPTION
  Create a new user
```

_See code: [src/commands/user/create.ts](https://github.com/nove_project/nove-cli/blob/v0.0.0/src/commands/user/create.ts)_

## `nove user delete ID`

Delete a user by ID

```
USAGE
  $ nove user delete ID

ARGUMENTS
  ID  User ID

DESCRIPTION
  Delete a user by ID
```

_See code: [src/commands/user/delete.ts](https://github.com/nove_project/nove-cli/blob/v0.0.0/src/commands/user/delete.ts)_

## `nove user get ID`

Get user details by ID

```
USAGE
  $ nove user get ID

ARGUMENTS
  ID  User ID

DESCRIPTION
  Get user details by ID
```

_See code: [src/commands/user/get.ts](https://github.com/nove_project/nove-cli/blob/v0.0.0/src/commands/user/get.ts)_

## `nove user import`

Import users from a CSV or XLSX file

```
USAGE
  $ nove user import --file <value>

FLAGS
  --file=<value>  (required) Path to the file to import

DESCRIPTION
  Import users from a CSV or XLSX file
```

_See code: [src/commands/user/import.ts](https://github.com/nove_project/nove-cli/blob/v0.0.0/src/commands/user/import.ts)_

## `nove user list`

List users

```
USAGE
  $ nove user list [--active] [--keyword <value>] [--limit <value>] [--page <value>] [--sortBy <value>]
    [--sortOrder <value>]

FLAGS
  --[no-]active        Filter by active status
  --keyword=<value>    Search keyword (username, email, phone, display name)
  --limit=<value>      [default: 20] Items per page
  --page=<value>       [default: 1] Page number
  --sortBy=<value>     [default: createdAt] Sort field (createdAt, updatedAt, lastLoginAt, username, email)
  --sortOrder=<value>  [default: desc] Sort order (asc, desc)

DESCRIPTION
  List users
```

_See code: [src/commands/user/list.ts](https://github.com/nove_project/nove-cli/blob/v0.0.0/src/commands/user/list.ts)_

## `nove user update ID`

Update an existing user

```
USAGE
  $ nove user update ID [--active] [--address <value>] [--avatar <value>] [--bio <value>] [--city <value>]
    [--country <value>] [--countryCode <value>] [--dateOfBirth <value>] [--displayName <value>] [--email <value>]
    [--firstName <value>] [--gender <value>] [--lastName <value>] [--phone <value>] [--username <value>] [--website
    <value>] [--zipCode <value>]

ARGUMENTS
  ID  User ID

FLAGS
  --[no-]active          Active status
  --address=<value>      Detailed address
  --avatar=<value>       Avatar URL
  --bio=<value>          Biography
  --city=<value>         City
  --country=<value>      Country
  --countryCode=<value>  Country code (e.g. +86)
  --dateOfBirth=<value>  Date of birth (YYYY-MM-DD)
  --displayName=<value>  Display name
  --email=<value>        Email address
  --firstName=<value>    First name
  --gender=<value>       Gender (e.g. MALE, FEMALE, OTHER)
  --lastName=<value>     Last name
  --phone=<value>        Phone number without country code
  --username=<value>     Username
  --website=<value>      Personal website URL
  --zipCode=<value>      Zip code

DESCRIPTION
  Update an existing user
```

_See code: [src/commands/user/update.ts](https://github.com/nove_project/nove-cli/blob/v0.0.0/src/commands/user/update.ts)_
