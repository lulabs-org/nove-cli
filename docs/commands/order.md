`nove order`
============

Manage orders

* [`nove order create`](#nove-order-create)
* [`nove order delete ID`](#nove-order-delete-id)
* [`nove order get ID`](#nove-order-get-id)
* [`nove order list`](#nove-order-list)
* [`nove order status ID`](#nove-order-status-id)
* [`nove order update ID`](#nove-order-update-id)

## `nove order create`

Create an order

```
USAGE
  $ nove order create --amount <value> [--amount-cny <value>] [--benefit-end <value>] [--benefit-start <value>]
    [--cancelled-at <value>] [--channel-id <value>] [--completed-at <value>] [--currency
    CNY|USD|EUR|GBP|JPY|HKD|TWD|SGD|AUD|CAD] [--current-owner-id <value>] [--email <value>] [--external-id <value>]
    [--financial-closed-at <value>] [--financial-closer-id <value>] [--fx-locked-at <value>] [--fx-rate-to-cny <value>]
    [--metadata <value>] [--order-code <value>] [--order-number <value>] [--paid-at <value>] [--payment-provider
    STRIPE|PAYPAL|WECHAT|ALIPAY|APPLE_PAY|GOOGLE_PAY|OTHER] [--phone <value>] [--phone-code <value>] [--product-id
    <value>] [--product-name <value>] [--provider-trade-no <value>] [--purchaser-id <value>] [--status
    UNPAID|PAID|CANCELLED|REFUNDED|COMPLETED] [--json]

FLAGS
  --amount=<value>               (required) Order amount in the smallest currency unit
  --amount-cny=<value>           CNY amount in fen
  --benefit-end=<value>          Benefit end ISO 8601 date-time with timezone
  --benefit-start=<value>        Benefit start ISO 8601 date-time with timezone
  --cancelled-at=<value>         Cancellation ISO 8601 date-time with timezone
  --channel-id=<value>           Channel ID
  --completed-at=<value>         Completion ISO 8601 date-time with timezone
  --currency=<option>            Currency
                                 <options: CNY|USD|EUR|GBP|JPY|HKD|TWD|SGD|AUD|CAD>
  --current-owner-id=<value>     Current owner user ID
  --email=<value>                Customer email
  --external-id=<value>          External platform order ID
  --financial-closed-at=<value>  Financial close ISO 8601 date-time with timezone
  --financial-closer-id=<value>  Financial closer user ID
  --fx-locked-at=<value>         FX lock ISO 8601 date-time with timezone
  --fx-rate-to-cny=<value>       Exchange rate to CNY
  --json                         Output a single JSON value to stdout
  --metadata=<value>             Order metadata as a JSON object
  --order-code=<value>           Internal order code
  --order-number=<value>         External-facing order number
  --paid-at=<value>              Payment ISO 8601 date-time with timezone
  --payment-provider=<option>    Payment provider
                                 <options: STRIPE|PAYPAL|WECHAT|ALIPAY|APPLE_PAY|GOOGLE_PAY|OTHER>
  --phone=<value>                Customer phone number
  --phone-code=<value>           Customer phone country code
  --product-id=<value>           Product ID
  --product-name=<value>         Product name snapshot
  --provider-trade-no=<value>    Payment provider transaction number
  --purchaser-id=<value>         Purchaser user ID
  --status=<option>              Order status
                                 <options: UNPAID|PAID|CANCELLED|REFUNDED|COMPLETED>

DESCRIPTION
  Create an order
```

_See code: [src/commands/order/create.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/order/create.ts)_

## `nove order delete ID`

Delete an order

```
USAGE
  $ nove order delete ID [--dry-run] [-y] [--json]

ARGUMENTS
  ID  Order ID

FLAGS
  -y, --yes      Skip the interactive confirmation
      --dry-run  Show what would be deleted without sending the request
      --json     Output a single JSON value to stdout

DESCRIPTION
  Delete an order
```

_See code: [src/commands/order/delete.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/order/delete.ts)_

## `nove order get ID`

Get an order by ID

```
USAGE
  $ nove order get ID [--json]

ARGUMENTS
  ID  Order ID

FLAGS
  --json  Output a single JSON value to stdout

DESCRIPTION
  Get an order by ID
```

_See code: [src/commands/order/get.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/order/get.ts)_

## `nove order list`

List orders

```
USAGE
  $ nove order list [--all | --page <value>] [--channel-id <value>] [--created-from <value>] [--created-to
    <value>] [--currency CNY|USD|EUR|GBP|JPY|HKD|TWD|SGD|AUD|CAD] [--current-owner-id <value>] [--fields <value>]
    [--include-deleted] [--json] [--keyword <value>] [--limit <value>] [--paid-from <value>] [--paid-to <value>]
    [--payment-provider STRIPE|PAYPAL|WECHAT|ALIPAY|APPLE_PAY|GOOGLE_PAY|OTHER] [--product-id <value>] [--purchaser-id
    <value>] [--sort <value>] [--sort-by
    createdAt|updatedAt|paidAt|amount|status|orderCode|orderNumber|financialClosedAt] [--sort-order asc|desc] [--status
    UNPAID|PAID|CANCELLED|REFUNDED|COMPLETED]

FLAGS
  --all                        Fetch every result page
  --channel-id=<value>         Filter by channel ID
  --created-from=<value>       Created from ISO 8601 date-time with timezone
  --created-to=<value>         Created to ISO 8601 date-time with timezone
  --currency=<option>          Filter by currency
                               <options: CNY|USD|EUR|GBP|JPY|HKD|TWD|SGD|AUD|CAD>
  --current-owner-id=<value>   Filter by current owner user ID
  --fields=<value>             Comma-separated fields to show in the table
  --include-deleted            Include soft-deleted orders
  --json                       Output a single JSON value to stdout
  --keyword=<value>            Search order numbers, product, customer, or transaction
  --limit=<value>              [default: 10] Items per page
  --page=<value>               [default: 1] Page number
  --paid-from=<value>          Paid from ISO 8601 date-time with timezone
  --paid-to=<value>            Paid to ISO 8601 date-time with timezone
  --payment-provider=<option>  Filter by payment provider
                               <options: STRIPE|PAYPAL|WECHAT|ALIPAY|APPLE_PAY|GOOGLE_PAY|OTHER>
  --product-id=<value>         Filter by product ID
  --purchaser-id=<value>       Filter by purchaser user ID
  --sort=<value>               Table sort field with optional :asc or :desc suffix
  --sort-by=<option>           [default: createdAt] Server sort field
                               <options:
                               createdAt|updatedAt|paidAt|amount|status|orderCode|orderNumber|financialClosedAt>
  --sort-order=<option>        [default: desc] Server sort order
                               <options: asc|desc>
  --status=<option>            Filter by order status
                               <options: UNPAID|PAID|CANCELLED|REFUNDED|COMPLETED>

DESCRIPTION
  List orders
```

_See code: [src/commands/order/list.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/order/list.ts)_

## `nove order status ID`

Update an order status

```
USAGE
  $ nove order status ID --status UNPAID|PAID|CANCELLED|REFUNDED|COMPLETED [--json]

ARGUMENTS
  ID  Order ID

FLAGS
  --json             Output a single JSON value to stdout
  --status=<option>  (required) Order status
                     <options: UNPAID|PAID|CANCELLED|REFUNDED|COMPLETED>

DESCRIPTION
  Update an order status
```

_See code: [src/commands/order/status.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/order/status.ts)_

## `nove order update ID`

Update an order

```
USAGE
  $ nove order update ID [--amount <value>] [--amount-cny <value>] [--benefit-end <value>] [--benefit-start
    <value>] [--cancelled-at <value>] [--channel-id <value>] [--completed-at <value>] [--currency
    CNY|USD|EUR|GBP|JPY|HKD|TWD|SGD|AUD|CAD] [--current-owner-id <value>] [--email <value>] [--external-id <value>]
    [--financial-closed-at <value>] [--financial-closer-id <value>] [--fx-locked-at <value>] [--fx-rate-to-cny <value>]
    [--metadata <value>] [--order-code <value>] [--order-number <value>] [--paid-at <value>] [--payment-provider
    STRIPE|PAYPAL|WECHAT|ALIPAY|APPLE_PAY|GOOGLE_PAY|OTHER] [--phone <value>] [--phone-code <value>] [--product-id
    <value>] [--product-name <value>] [--provider-trade-no <value>] [--purchaser-id <value>] [--status
    UNPAID|PAID|CANCELLED|REFUNDED|COMPLETED] [--clear external-id|metadata|product-id|product-name|purchaser-id|channel
    -id|email|phone|phone-code|current-owner-id|financial-closer-id|financial-closed-at|fx-locked-at|paid-at|cancelled-a
    t|completed-at|benefit-start|benefit-end|amount-cny|fx-rate-to-cny|payment-provider|provider-trade-no...] [--json]

ARGUMENTS
  ID  Order ID

FLAGS
  --amount=<value>               Order amount in the smallest currency unit
  --amount-cny=<value>           CNY amount in fen
  --benefit-end=<value>          Benefit end ISO 8601 date-time with timezone
  --benefit-start=<value>        Benefit start ISO 8601 date-time with timezone
  --cancelled-at=<value>         Cancellation ISO 8601 date-time with timezone
  --channel-id=<value>           Channel ID
  --clear=<option>...            Clear a nullable field; repeat for multiple fields
                                 <options: external-id|metadata|product-id|product-name|purchaser-id|channel-id|email|ph
                                 one|phone-code|current-owner-id|financial-closer-id|financial-closed-at|fx-locked-at|pa
                                 id-at|cancelled-at|completed-at|benefit-start|benefit-end|amount-cny|fx-rate-to-cny|pay
                                 ment-provider|provider-trade-no>
  --completed-at=<value>         Completion ISO 8601 date-time with timezone
  --currency=<option>            Currency
                                 <options: CNY|USD|EUR|GBP|JPY|HKD|TWD|SGD|AUD|CAD>
  --current-owner-id=<value>     Current owner user ID
  --email=<value>                Customer email
  --external-id=<value>          External platform order ID
  --financial-closed-at=<value>  Financial close ISO 8601 date-time with timezone
  --financial-closer-id=<value>  Financial closer user ID
  --fx-locked-at=<value>         FX lock ISO 8601 date-time with timezone
  --fx-rate-to-cny=<value>       Exchange rate to CNY
  --json                         Output a single JSON value to stdout
  --metadata=<value>             Order metadata as a JSON object
  --order-code=<value>           Internal order code
  --order-number=<value>         External-facing order number
  --paid-at=<value>              Payment ISO 8601 date-time with timezone
  --payment-provider=<option>    Payment provider
                                 <options: STRIPE|PAYPAL|WECHAT|ALIPAY|APPLE_PAY|GOOGLE_PAY|OTHER>
  --phone=<value>                Customer phone number
  --phone-code=<value>           Customer phone country code
  --product-id=<value>           Product ID
  --product-name=<value>         Product name snapshot
  --provider-trade-no=<value>    Payment provider transaction number
  --purchaser-id=<value>         Purchaser user ID
  --status=<option>              Order status
                                 <options: UNPAID|PAID|CANCELLED|REFUNDED|COMPLETED>

DESCRIPTION
  Update an order
```

_See code: [src/commands/order/update.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0/src/commands/order/update.ts)_
