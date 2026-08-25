`nove login`
============

Sign in through the browser, or validate an API Key for automation

* [`nove login`](#nove-login)

## `nove login`

Sign in through the browser, or validate an API Key for automation

```
USAGE
  $ nove login [--api-key-stdin] [--json] [--method oauth|api-key] [--no-browser] [--scope <value>...]

FLAGS
  --api-key-stdin     Read the API Key from stdin
  --json              Output a single JSON value to stdout
  --method=<option>   Choose the login method
                      <options: oauth|api-key>
  --no-browser        Print the authorization URL instead of opening a browser
  --scope=<value>...  Limit permissions offered on the consent page (repeatable)

DESCRIPTION
  Sign in through the browser, or validate an API Key for automation
```

_See code: [src/commands/login/index.ts](https://github.com/lulabs-org/nove-cli/blob/v1.3.0-beta.1/src/commands/login/index.ts)_
