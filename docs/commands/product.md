`nove product`
==============

Manage products

* [`nove product create`](#nove-product-create)
* [`nove product delete ID`](#nove-product-delete-id)
* [`nove product get ID`](#nove-product-get-id)
* [`nove product list`](#nove-product-list)
* [`nove product status ID`](#nove-product-status-id)
* [`nove product update ID`](#nove-product-update-id)

## `nove product create`

Create a product

```
USAGE
  $ nove product create --category COURSE|MEMBERSHIP|CONSULTATION|MATERIAL|OTHER --name <value> --product-code
    <value> [--currency CNY|USD|EUR|GBP|JPY|HKD|TWD|SGD|AUD|CAD] [--description <value>] [--download-url <value>]
    [--duration-days <value>] [--external-url <value>] [--featured] [--image-url <value>] [--max-users <value>]
    [--original-price <value>] [--price <value>] [--published-at <value>] [--rating <value>] [--recommended]
    [--short-description <value>] [--sort-order <value>] [--status ACTIVE|INACTIVE|DRAFT|ARCHIVED] [--tag <value>...]
    [--video-url <value>] [--json]

FLAGS
  --category=<option>          (required) Product category
                               <options: COURSE|MEMBERSHIP|CONSULTATION|MATERIAL|OTHER>
  --currency=<option>          Currency
                               <options: CNY|USD|EUR|GBP|JPY|HKD|TWD|SGD|AUD|CAD>
  --description=<value>        Detailed product description
  --download-url=<value>       Download URL
  --duration-days=<value>      Validity period in days
  --external-url=<value>       External product URL
  --[no-]featured              Mark the product as featured
  --image-url=<value>          Image URL
  --json                       Output a single JSON value to stdout
  --max-users=<value>          Maximum number of users
  --name=<value>               (required) Product name
  --original-price=<value>     Original price in the smallest currency unit
  --price=<value>              Price in the smallest currency unit
  --product-code=<value>       (required) Unique product code
  --published-at=<value>       Published ISO 8601 date-time with timezone
  --rating=<value>             Rating from 0 to 5
  --[no-]recommended           Mark the product as recommended
  --short-description=<value>  Short product description
  --sort-order=<value>         Display sort order
  --status=<option>            Product status
                               <options: ACTIVE|INACTIVE|DRAFT|ARCHIVED>
  --tag=<value>...             Product tag; repeat for multiple tags
  --video-url=<value>          Video URL

DESCRIPTION
  Create a product
```

_See code: [src/commands/product/create.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/product/create.ts)_

## `nove product delete ID`

Delete a product

```
USAGE
  $ nove product delete ID [--dry-run] [-y] [--json]

ARGUMENTS
  ID  Product ID

FLAGS
  -y, --yes      Skip the interactive confirmation
      --dry-run  Show what would be deleted without sending the request
      --json     Output a single JSON value to stdout

DESCRIPTION
  Delete a product
```

_See code: [src/commands/product/delete.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/product/delete.ts)_

## `nove product get ID`

Get a product by ID

```
USAGE
  $ nove product get ID [--json]

ARGUMENTS
  ID  Product ID

FLAGS
  --json  Output a single JSON value to stdout

DESCRIPTION
  Get a product by ID
```

_See code: [src/commands/product/get.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/product/get.ts)_

## `nove product list`

List products

```
USAGE
  $ nove product list [--all | --page <value>] [--category COURSE|MEMBERSHIP|CONSULTATION|MATERIAL|OTHER]
    [--currency CNY|USD|EUR|GBP|JPY|HKD|TWD|SGD|AUD|CAD] [--featured] [--fields <value>] [--json] [--keyword <value>]
    [--limit <value>] [--recommended] [--sort <value>] [--sort-by createdAt|updatedAt|name|price|sortOrder|salesCount]
    [--sort-order asc|desc] [--status ACTIVE|INACTIVE|DRAFT|ARCHIVED]

FLAGS
  --all                  Fetch every result page
  --category=<option>    Filter by product category
                         <options: COURSE|MEMBERSHIP|CONSULTATION|MATERIAL|OTHER>
  --currency=<option>    Filter by currency
                         <options: CNY|USD|EUR|GBP|JPY|HKD|TWD|SGD|AUD|CAD>
  --[no-]featured        Filter by featured status
  --fields=<value>       Comma-separated fields to show in the table
  --json                 Output a single JSON value to stdout
  --keyword=<value>      Search product code, name, or description
  --limit=<value>        [default: 10] Items per page
  --page=<value>         [default: 1] Page number
  --[no-]recommended     Filter by recommended status
  --sort=<value>         Table sort field with optional :asc or :desc suffix
  --sort-by=<option>     [default: sortOrder] Server sort field
                         <options: createdAt|updatedAt|name|price|sortOrder|salesCount>
  --sort-order=<option>  [default: asc] Server sort order
                         <options: asc|desc>
  --status=<option>      Filter by product status
                         <options: ACTIVE|INACTIVE|DRAFT|ARCHIVED>

DESCRIPTION
  List products
```

_See code: [src/commands/product/list.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/product/list.ts)_

## `nove product status ID`

Update a product status

```
USAGE
  $ nove product status ID --status ACTIVE|INACTIVE|DRAFT|ARCHIVED [--json]

ARGUMENTS
  ID  Product ID

FLAGS
  --json             Output a single JSON value to stdout
  --status=<option>  (required) Product status
                     <options: ACTIVE|INACTIVE|DRAFT|ARCHIVED>

DESCRIPTION
  Update a product status
```

_See code: [src/commands/product/status.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/product/status.ts)_

## `nove product update ID`

Update a product

```
USAGE
  $ nove product update ID [--category COURSE|MEMBERSHIP|CONSULTATION|MATERIAL|OTHER] [--currency
    CNY|USD|EUR|GBP|JPY|HKD|TWD|SGD|AUD|CAD] [--description <value>] [--download-url <value>] [--duration-days <value>]
    [--external-url <value>] [--featured] [--image-url <value>] [--max-users <value>] [--name <value>] [--original-price
    <value>] [--price <value>] [--product-code <value>] [--published-at <value>] [--rating <value>] [--recommended]
    [--short-description <value>] [--sort-order <value>] [--status ACTIVE|INACTIVE|DRAFT|ARCHIVED] [--tag <value>...]
    [--video-url <value>] [--clear description|short-description|price|original-price|duration-days|max-users|tags|image
    -url|video-url|download-url|external-url|rating|published-at...] [--json]

ARGUMENTS
  ID  Product ID

FLAGS
  --category=<option>          Product category
                               <options: COURSE|MEMBERSHIP|CONSULTATION|MATERIAL|OTHER>
  --clear=<option>...          Clear a nullable field; repeat for multiple fields
                               <options: description|short-description|price|original-price|duration-days|max-users|tags
                               |image-url|video-url|download-url|external-url|rating|published-at>
  --currency=<option>          Currency
                               <options: CNY|USD|EUR|GBP|JPY|HKD|TWD|SGD|AUD|CAD>
  --description=<value>        Detailed product description
  --download-url=<value>       Download URL
  --duration-days=<value>      Validity period in days
  --external-url=<value>       External product URL
  --[no-]featured              Mark the product as featured
  --image-url=<value>          Image URL
  --json                       Output a single JSON value to stdout
  --max-users=<value>          Maximum number of users
  --name=<value>               Product name
  --original-price=<value>     Original price in the smallest currency unit
  --price=<value>              Price in the smallest currency unit
  --product-code=<value>       Unique product code
  --published-at=<value>       Published ISO 8601 date-time with timezone
  --rating=<value>             Rating from 0 to 5
  --[no-]recommended           Mark the product as recommended
  --short-description=<value>  Short product description
  --sort-order=<value>         Display sort order
  --status=<option>            Product status
                               <options: ACTIVE|INACTIVE|DRAFT|ARCHIVED>
  --tag=<value>...             Product tag; repeat for multiple tags
  --video-url=<value>          Video URL

DESCRIPTION
  Update a product
```

_See code: [src/commands/product/update.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/product/update.ts)_
