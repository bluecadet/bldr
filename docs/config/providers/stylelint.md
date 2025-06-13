---
outline: deep
---

# Stylelint

Stylelint is used to lint javascript files during `dev`, `build`, and `lint` commands. 

When running `dev`, css files will be linted when they are saved (if `stylelint.useStyleLint` is true or null). When running `build` or `lint`, bldr will load all css files from the `watchPaths` and `sdc.directory` paths (excluding any `dest` directories). Additional configuration can be added to the `ignorePaths` option below.

The `stylelint` key in bldrConfig has the following options:

## Options

### useStyleLint

`boolean | null` - Default: `true`

Set to `false` to prevent Stylelint from running on `dev`, `build`, and `lint` commands.


### forceBuildIfError

`boolean | null` - Default: `true`

If set to `false`, an error will be thrown and process will exit if lint encounters an error. Error will only be thrown when running `build` or `lint`.

### ignorePaths

`string[] | null` - Default: `[]`

An array of paths (strings) that should be ignored by stylelint.


## All Options (with defaults)
```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  stylelint: {
    useStyleLint: true,
    forceBuildIfError: true,
  },
})
```

## Stylelint Config File

See https://stylelint.io/user-guide/configure for information on creating Stylelint config files.