---
outline: deep
---

# Commands

## Interactive Config Setup

```bash
$ bldr init
```

Running `init` will run a simple interactive config setup.


## Lint Only

```bash
$ bldr lint
```

Running `lint` will run EsLint and Stylelint, given that each provider should be ran (see config below).


## Dev Mode

```bash
$ bldr dev
```

Running `dev` will run postcss and esbuild without minification. Additionally:
- a browsersync instance will be created. Edit `bldr.local.config.js` to add [browsersync options](https://browsersync.io/docs/options) as needed.
  - Setting `browsersync.disable` to true in the config will prevent browsersync from starting
- css changes will be auto-injected
- js changes will reload the page, in addition to files with extensions set in the `reloadExtensions` config key array

### Dev Mode Command Options

#### env

```bash
$ bldr dev --env=some_key  # or -e some_key
```

If the `env` object is setup in config, you can run a command with `--env=env_key_name` to run that config setup. See [env config](/config/env) for more info


#### once

```bash
$ bldr dev --once  # or -o
```

Running the `once` flag will run a single build of all assets using the `dev` settings.


#### start

```bash
$ bldr dev --start  # or -s
```

Running `bldr dev -s` will run a single build of all assets before starting up browsersync and watch tasks. By default, `bldr dev` does not do this.


## Build Mode

```bash
$ bldr build
```

Running `build` will run postcss and rollup with minification. Rollup will also run babel.

### Build Mode Command Options

#### env

```bash
$ bldr dev --env=some_key  # or -e some_key
```

If the `env` object is setup in config, you can run a command with `--env=env_key_name` to run that config setup. See [env config](#env-config) below.
