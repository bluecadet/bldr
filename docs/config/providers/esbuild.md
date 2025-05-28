---
outline: deep
---

# esbuild

esbuild is used to process javascript during dev runs (`bldr dev`). 

The `esbuild` key in bldrConfig has the following options:

## Options

### plugins

`array | null` - Default: `[]`

Array of esbuild plugins to add. See https://esbuild.github.io/plugins/#using-plugins

### overridePlugins

`boolean | null` - Default: `false`

Set to `true` to override default bldr plugins for esbuild.


## All Options (with defaults)

```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  esbuild: {
    plugins: [],
    overridePlugins: false,
  },
})
```


## Default esbuild Plugins

As of v2, bldr does not add any esbuild plugins by default.