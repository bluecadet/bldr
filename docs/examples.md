# Examples



## All Config Options (with defaults)

`bldr.config.js`:

```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  css: [...],
  js: [...],
  sass: [...],
  esbuild: {
    plugins: [],
    overridePlugins: false,
  },
  sdc: {
    directory: '' // or ['', ''],
    assetSubDirectory: 'assets',
  },
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
  },
  eslint: {
    useEslint: true,
    options: {},
    forceBuildIfError: true,
  },
  stylelint: {
    useStyleLint: true,
    forceBuildIfError: true,
  },
  sassConfig: {
    useLegacy: false
  },
  browsersync: {
    disable: false,
    instanceName: null,
  },
});
```