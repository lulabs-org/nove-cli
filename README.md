nove-cli
=================

A new CLI generated with oclif


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/nove-cli.svg)](https://npmjs.org/package/nove-cli)
[![Downloads/week](https://img.shields.io/npm/dw/nove-cli.svg)](https://npmjs.org/package/nove-cli)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g nove-cli
$ nove COMMAND
running command...
$ nove (--version)
nove-cli/0.0.0 darwin-arm64 node-v22.23.1
$ nove --help [COMMAND]
USAGE
  $ nove COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`nove hello PERSON`](#nove-hello-person)
* [`nove hello world`](#nove-hello-world)
* [`nove help [COMMAND]`](#nove-help-command)
* [`nove plugins`](#nove-plugins)
* [`nove plugins add PLUGIN`](#nove-plugins-add-plugin)
* [`nove plugins:inspect PLUGIN...`](#nove-pluginsinspect-plugin)
* [`nove plugins install PLUGIN`](#nove-plugins-install-plugin)
* [`nove plugins link PATH`](#nove-plugins-link-path)
* [`nove plugins remove [PLUGIN]`](#nove-plugins-remove-plugin)
* [`nove plugins reset`](#nove-plugins-reset)
* [`nove plugins uninstall [PLUGIN]`](#nove-plugins-uninstall-plugin)
* [`nove plugins unlink [PLUGIN]`](#nove-plugins-unlink-plugin)
* [`nove plugins update`](#nove-plugins-update)

## `nove hello PERSON`

Say hello

```
USAGE
  $ nove hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ nove hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/nove_project/nove-cli/blob/v0.0.0/src/commands/hello/index.ts)_

## `nove hello world`

Say hello world

```
USAGE
  $ nove hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ nove hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/nove_project/nove-cli/blob/v0.0.0/src/commands/hello/world.ts)_

## `nove help [COMMAND]`

Display help for nove.

```
USAGE
  $ nove help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for nove.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/6.2.56/src/commands/help.ts)_

## `nove plugins`

List installed plugins.

```
USAGE
  $ nove plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ nove plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.86/src/commands/plugins/index.ts)_

## `nove plugins add PLUGIN`

Installs a plugin into nove.

```
USAGE
  $ nove plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into nove.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the NOVE_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the NOVE_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ nove plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ nove plugins add myplugin

  Install a plugin from a github url.

    $ nove plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ nove plugins add someuser/someplugin
```

## `nove plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ nove plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ nove plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.86/src/commands/plugins/inspect.ts)_

## `nove plugins install PLUGIN`

Installs a plugin into nove.

```
USAGE
  $ nove plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into nove.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the NOVE_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the NOVE_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ nove plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ nove plugins install myplugin

  Install a plugin from a github url.

    $ nove plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ nove plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.86/src/commands/plugins/install.ts)_

## `nove plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ nove plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ nove plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.86/src/commands/plugins/link.ts)_

## `nove plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ nove plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ nove plugins unlink
  $ nove plugins remove

EXAMPLES
  $ nove plugins remove myplugin
```

## `nove plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ nove plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.86/src/commands/plugins/reset.ts)_

## `nove plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ nove plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ nove plugins unlink
  $ nove plugins remove

EXAMPLES
  $ nove plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.86/src/commands/plugins/uninstall.ts)_

## `nove plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ nove plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ nove plugins unlink
  $ nove plugins remove

EXAMPLES
  $ nove plugins unlink myplugin
```

## `nove plugins update`

Update installed plugins.

```
USAGE
  $ nove plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.86/src/commands/plugins/update.ts)_
<!-- commandsstop -->
