---
outline: deep
---

# Biome

[Biome](https://biomejs.dev/) can be used to lint javascript files during `dev`, `build`, and `lint` commands. When running `dev`, js and css files will be linted when they are saved (before esbuild or postcss processes). When running `build` or `lint`, bldr will load all js and css files from the `watchPaths` and `sdc.directory` paths (excluding any `dest` directories). Additional configuration can be added to the `ignorePaths` option below.

The `biome` key in bldrConfig has the following options:

## Options

### useBiome

`boolean | null` - Default: `true`

Set to `true` to use biome when running `dev`, `build`, and `lint` commands. When set to `true`, bldr sets `eslint.useEslint` to `false` and `stylelint.useStyleLint` to `false` regardless of the contents of `bldr.config.js`

### forceBuildIfError

`boolean | null` - Default: `true`

If set to `false`, an error will be thrown and process will exit if lint encounters an error


### forceBuildIfError

`boolean | null` - Default: `true`

If set to `false`, an error will be thrown and process will exit if lint encounters an error. Error will only be thrown when running `build` or `lint`.

### ignorePaths

`string[] | null` - Default: `[]`

An array of paths (strings) that should be ignored by biome.

### writeLogFile

`boolean | null` - Default: `false`

Set to true to write a log file during `build` and `lint` runs

### logFilePath

`string | null` - Default: `biome.log.html`

File path and name to write biome log to. Biome log output is in html form.



## All Options (with defaults)
```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  biome: {
    useBiome: false,
    forceBuildIfError: true,
    ignorePaths: [],
    writeLogfile: false,
    logFilePath: 'biome.log.html',
  },
})
```

