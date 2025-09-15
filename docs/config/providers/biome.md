---
outline: deep
---

# Biome

Biome can be used to lint files via the `biomejs` cli. This means bldr will call the version of biome that is used in the project, rather than using a specific version of Biome _within_ bldr. As such, you will need to install biome in order to use it as a linting option.

## Usage

Install biome in the project root (where bldr.config.js lives):

```
npm i -D -E @biomejs/biome
```

Create and [configure](https://biomejs.dev/guides/configure-biome/) a `biome.json` file in the project root.


## Options

The `biome` key in bldrConfig has the following options:

### useBiome

`boolean | null` - Default: `false`

Set to `true` to enable Biome on `dev`, `build`, and `lint` commands.

### dev

`boolean | null` - Default: `true`

If set to `false`, biome will not be ran in the `dev` command. Set this option to false if you would prefer to run the biome watch command outside of bldr.

### write

`boolean | null` - Default: `false`

If set to `true`, biome will write updates to files

(runs `npx @biomejs/biome lint --write`)

### devWrite

`boolean | null` - Default: `false`

If set to `true`, biome will write updates to files in the `dev` command.

(runs `npx @biomejs/biome lint --write [filename]`)

### devFormat

`boolean | null` - Default: `false`

If set to `true`, biome will format and write updates to files in the `dev` command

(runs `npx @biomejs/biome check --write [filename]`)


### forceBuildIfError

`boolean | null` - Default: `true`

If set to `false`, an error will be thrown and process will exit if lint encounters an error


## All Options (with defaults)
```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  biome: {
    useBiome: false;
    dev: true;
    write: false;
    devWrite: false;
    devFormat: false;
    forceBuildIfError: true;
  },
})
```