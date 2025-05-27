# Rollup:

Rollup is used to process javascript during production runs (`bldr build`). 

The `rollup` key in bldrConfig has the following options:

## Options

### useBabel

`boolean | null` - Default: `true`

Whether or not bldr should inject the `@rollup/plugin-babel` plugin

### babelPluginOptions

`object | null` - Default: `{ babelHelpers: 'bundled' }`

Applicable only if `useBabel` is null or set to true. See @rollup/plugin-babel options at https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers

### useSWC

`boolean | null` - Default: `false`

Whether or not bldr should inject the `@rollup/plugin-swc` plugin. If `useBabel` is set to `true`, `useSWC` will have no effect. If `useBabel` is `null` (or not included) and `useSWC` is set to `true`, SWC will be used in place of babel.

### swcPluginOptions: 

`object | null` - Default: `{}`

See SWC Configuration at https://swc.rs/docs/configuration/swcrc. Only applied if `useSWC` is set to true.

### useTerser: 

`boolean | null` - Default: `true`

If true or null, Terser will be used to minify javascript. Set to false to skip Terser minification.

### terserOptions

`object | null` - Default: `{}`

Options to pass to terser. See https://terser.org/docs/options/

### sdcOptions

The following options are only applied if the `sdc` config key exists, and only applies to files that are processed within the `sdc.directory` path:

::: info Options

#### bundle

`boolean | null` - Default: `true`

Set to false to prevent rollup from processing SDC files

#### minify

`boolean | null` - Default: `true`

Set to false to prevent js files from minifying (default: value of `useTerser`)

#### format

`null | 'amd' | 'cjs' | 'es' | 'iife' | 'umd' | 'system'` - Default: `es`

Customize the format of the processed files

:::


### inputOptions: 

`object | null` - Default: `{}`

See rollups inputOptions object at https://rollupjs.org/guide/en/#inputoptions-object

If using babel, set to { external: [/@babel\/runtime/] }


### inputPlugins:

`array | null` - Default: `[]`

Array of rollup input plugins. If `rollup.overrideInputPlugins` is set to true, this array will replace the default bldr array. If not, then these will be added after bldrs default input plugin set. See Default Input Plugins below.


### overrideInputPlugins

`boolean | null` - Default: `false`

Set to true to override default bldr plugins. Only plugins added to `rollup.inputPlugins` will be added.

### outputOptions

`object | null` - Default: `{}`

See rollups outputOptions object at https://rollupjs.org/guide/en/#outputoptions-object

::: info
`file` will automatically be added, so no need to add here
:::


### outputPlugins

`array | null` - Default: `[]`

Array of rollup output plugins. If `rollup.overrideOutputPlugins` is set to true, this array will replace the default bldr array. If not, then these will be added after bldrs default plugin set. See Default Output Plugins below.

### overrideOutputPlugins

`boolean | null` - Default: `false`

Set to true to override default bldr plugins


## All Options (with defaults)

```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  rollup: {
    useBabel: false,
    babelPluginOptions: {babelHelpers: 'bundled' },
    useSWC: false,
    swcPluginOptions: {},
    useTerser: true,
    terserOptions: {}
    sdcOptions: {
      bundle: true,
      minify: true,
      format: 'es'
    }
    inputOptions: {},
    inputPlugins: [],
    overrideInputPlugins: false,
    outputOptions: {},
    outputPlugins: [],
    overrideOutputPlugins: false,
  }
});
```


## Default Input Plugins

By default, Bldr supplies the following plugins to Rollup (in order):

- `@rollup/plugin-commonjs`
- if `useBabel`, `@rollup/plugin-babel`
- if `useSWC`, `@rollup/plugin-swc`
- `@rollup/plugin-node-resolve`

Additional plugins from `rollup.inputPlugins` are added after `@rollup/plugin-node-resolve`, unless `rollup.overrideInputPlugins` is set to true.


## Default Output Plugins

Bldr does not add any output plugins by default as of v2.