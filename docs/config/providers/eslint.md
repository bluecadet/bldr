---
outline: deep
---

# ESLint

[ESLint](https://eslint.org/) is used to lint javascript files during `dev`, `build`, and `lint` commands.

When running `dev`, js files will be linted when they are saved (if `eslint.useEsLint` is true or null). 

When running `build` or `lint`, bldr will attempt to load `files` from a `eslint.config.js` file (in the same directory as `bldr.config.js`). If the `files` key (or the eslint config file) is not present, bldr will load js files from the `watchPaths` and `sdc.directory` paths (excluding any `dest` directories). Additional configuration can be added to the `ignorePaths` option below.

The `eslint` key in bldrConfig has the following options:

## Options

### useEslint

`boolean | null` - Default: `true`

Set to `false` to prevent eslint from running on `dev`, `build`, and `lint` commands.

### options

`object | null` - Default: `{}`

Options for ESLint instance. See https://eslint.org/docs/latest/integrate/nodejs-api#-new-eslintoptions


### forceBuildIfError

`boolean | null` - Default: `true`

If set to `false`, an error will be thrown and process will exit if lint encounters an error. Error will only be thrown when running `build` or `lint`.

### ignorePaths

`string[] | null` - Default: `[]`

An array of paths (strings) that should be ignored by eslint.


## All Options (with defaults)
```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  eslint: {
    useEslint: true,
    options: {},
    forceBuildIfError: true,
  },
})
```


## ESLint Config File

See [Bldr Provided ESLint Config](/config/eslint-bldr-instance) for information on using Bldr's current version of ESLint.

See https://eslint.org/docs/latest/use/configure/configuration-files for information on creating ESLint config files.