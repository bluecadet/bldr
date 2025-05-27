<h1 style="text-align: center;">Bldr 💪</h1>
<p style="text-align: center">TL;DR: Bldr is a (very opinionated) configuration based task runner for css, js, and sass with a local development server</p>


## Installation

We recommend installing Bldr as a project dependency:
`npm i @bluecadet/bldr`

You can then add scripts to package.json to run commands:
```js
  scripts: {
    'dev': 'bldr dev',
    'build': 'bldr build',
    'devOnce': 'bldr dev --once'
  }
```
Then run `npm run dev`, which will run `bldr dev`, etc.

If you need to pass parameters to a script, add `--` between the command and the parameter:
`npm run dev -- env=SampleEnv`

You can also install it globally:
`npm i -g @bluecadet/bldr`


## Documentation

- [Command Documentation](#commands)
- [Command Option Documentation](#command-optionss)
- [Configuration Overview](#configuration-overview)
- [Basic Configuration](#basic-onfiguration)
- [Config documentation](#config)
  - [Config Setup](#config-setup)
  - [Environment Config](#environment-config)
  - [PostCSS config](#postcss-config)
  - [Process Settings Configuration](#process-settings-configuration)
  - [Recommended Babel Config](#recommended-babel-config)
  - [Recommended SWC Config](#recommended-swc-config)
  - [Browsersync Config](#browsersync-config)
- [Processing documentation](#processing)
- [Complete Config Example](#complete-config-example)


## Commands

### `init`

```bash
$ bldr init
```

Running `init` will run a simple interactive config setup.


### `lint`

```bash
$ bldr lint
```

Running `lint` will run EsLint and Stylelint, given that each provider should be ran (see config below).


### `dev`

```bash
$ bldr dev
```

Running `dev` will run postcss and esbuild without minification. Additionally:
- files in `watch` and `watchReload` arrays will be observed and appropriate processes will be ran when files are added/removed/updated based on file type
- a browsersync instance will be created. Edit `bldrConfigLocal.js` to add [browsersync options](https://browsersync.io/docs/options) as needed.
  - Set `browsersync.disable` is set to true in the config (see )
- `bldr watch` is an alias for `bldr dev`


### `build`

```bash
$ bldr build
```

Running `build` will run postcss and rollup with minification. Rollup will also run babel.

## Command Options

### `--env=some_key` (or `-e some_key`)

If the `env` object is setup in config, you can run a command with `--env=env_key_name` to run that config setup. See [env config](#env-config) below.


### `--once` (or `-o`)

**For the `dev` command only.**

Running `bldr dev -o` will run a single build of all assets using the `dev` settings.


### `--start` (or `-s`)

**For the `dev` command only.**

Running `bldr dev -s` will run a single build of all assets before starting up browsersync and watch tasks. By default, `bldr dev` does not do this.


## Configuration Overview

Bldr relies on a `bldrConfig.js` file to point to where files should be sourced, distributed to, and watched.

Bldr was created to allow multiple configurations within `bldrConfig.js` based on the need of a project. Config can be setup to either export a single object (see Basic Configuration below), or an object with seperate `dev` and `build` objects (see Advanced Configuration below).

Bldr can handle processing css, js, sass, and image files. Each of these processes is configured in a key, and can be added or removed as required by the project. Each process configuration requires an object (or array of objects) that point to file sources, destinations, and 'watch' sources.



## Basic Configuration

Bldr configuration determines the processes that are ran. 

1. Create a `bldr.config.js` file (or a `bldrConfig.js` file)
2. Import `bldrConfig` from `@bluecadet/bldr` and export the function with your configuration:

```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  // Your Config Here
});
```

### Process Configuration Objects

Bldr can process js (via esbuild/rollup), css (via postcss), and sass (via dart sass):
```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  css: [
    // processes .css files with postcss
  ],
  sass: [
    // processes .sass files with node-sass and then postcss
  ],
  js: [
    // processes .js files with esbuild (bldr dev) or rollup (bldr build)
  ],
});
```

For each filetype, add an array of objects containing `src` and `dest` keys:
```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  css: [
    {
      src: './web/theme/assets/src/css/*.css', 
      dest: './web/theme/assets/dist/css',
    }
    {
      src: './web/admin/assets/src/css/admin.css', 
      dest: './web/admin/assets/dist/css',
    }
  ],
});
```

- `src` config expects a path (string). This path is the 'incoming' path for processing, and should include a file extension as needed for the process. Glob patterns can be used (see [fast-glob](https://github.com/mrmlnc/fast-glob#pattern-syntax) pattern syntax).

- `dest` config expects a path (string). This path is the 'destination' for processing. This is the directory where builds will be created. File names will be copied to the `dest` when writing the file (`assets/src/main.css` will go to `assets/dist/main.css`).

### `watchPaths` config

By default, bldr will watch all files within the directory where `bldr.config.js` is located. To better tune what files should be watched, add a `watchPaths` key with an array of file paths. When added, only files within these paths will trigger reload or processing:

```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  css: [],
  js: [],
  watchPaths: [
    './web/theme',
    './web/admin',
  ]
})
```


### `reloadExtensions` config

When running `bldr dev` you may want additional files or file types to trigger an automatic reload. To do this, add a `reloadExtensions` key as an array of extensions that should trigger a reload. Extension names should be text only (and omit the `.`):

##### Example basic config:
```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  css: [],
  js: [],
  reloadExtensions: [
    'twig',
    'html',
    'php'
  ]
})
```

### `env` config

Projects can have many parts. Some may have just one source for assets, some may have multiple. For example, you may be working on a theme for a CMS, but also need bldr to process assets for a plugin. With `env` configuration, you can setup 'environments' with their own process configurations:

```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  css: [
    {
      src: './path/to/theme/css/**/*.css',
      dest: './path/to/public/css/',
    },
    {
      src: './path/to/plugin/src/css/**/*.css',
      dest: './path/to/plugin/build/css/',
    },
  ],
  js: [
    {
      src: './path/to/theme/js/**/*.js',
      dest: './path/to/public/js/',
    },
    {
      src: './path/to/plugin/src/js/**/*.js',
      dest: './path/to/plugin/build/js/',
    },
  ],
  env: {
    'themeOnly': {
      css: [
        {
          src: './path/to/theme/css/**/*.css',
          dest: './path/to/public/css/',
        }
      ],
      js: [
        {
          src: './path/to/theme/js/**/*.js',
          dest: './path/to/public/js/',
        },
      ]
    },
    'pluginOnly': {
      css: [
        {
          src: './path/to/theme/css/**/*.css',
          dest: './path/to/public/css/',
        }
      ],
      js: [
        {
          src: './path/to/plugin/src/js/**/*.js',
          dest: './path/to/plugin/build/js/',
        },
      ],
    }
  }
})
```

**IMPORTANT NOTE ABOUT ENVIRONMENTS**

Each environment key is treated as its own set of configuration. Configuration for each environment **_is not_** inherited, or other wise read, from the basic configuration. In other words, each environment needs its own processes defined as needed. This allows you to, for example, run _just_ css in an environment if desired.

If similar config is required in both basic and environment, its best to setup config in variables before exporting `bldrConfig`:

```js
import {bldrConfig} from '@bluecadet/bldr/config';

const themeCSS = [
  {
    src: './path/to/theme/css/**/*.css',
    dest: './path/to/public/css/',
  }
];

export default bldrConfig({
  css: [
    themeCSS,
    {
      src: './path/to/plugin/src/css/**/*.css',
      dest: './path/to/plugin/build/css/',
    },
  ],
  js: {
    ...
  },
  env: {
    'themeCssOnly': {
      css: themeCSS,
    }
  }
})
```

#### CLI commands and `env`

To use configuration from an `env` key, add the `env=` (or `-e=`) param with a value equal to the key of the `env` object you want to run.

In command line, to use the `themeCssOnly` env config in the example above, you would run:

```bash
$ bldr dev env=themeCssOnly # or bldr dev -e=themeCssOnly
```

## Single Directory Component (SDC) Config

To process SDC files, add the `sdc` key to the config:

```js
import {bldrConfig} from '@bluecadet/bldr/config';

const themeCSS = [
  {
    src: './path/to/theme/css/**/*.css',
    dest: './path/to/public/css/',
  }
];

export default bldrConfig({
  css: [themeCSS,],
  sdc: {
    directory: '.path/to/sdc/folders',
    assetSubDirectory: 'assets'
  }
})
```

- `directory` key should point to the 'parent' folder of all components.
- `assetSubDirectory` key should be the name of a folder within an SDC directory that holds assets to be processed. A subdirectory is required as SDC auto-loads css and js files at the same directory level as the component.yml file. This value defaults to `assets`.
- Files withing `assetSubDirectory` will be processed and added to the parent component directory.

Example directory stucture:
```
theme
- components
  - child_component_1
    - child_component_1.component.yml
    - child_component_1.twig
    - assets
      - child_component_1.css
      - child_component_1.js
```

When assets are processed, this will compile to:
```
theme
- components
  - child_component_1
    - child_component_1.component.yml
    - child_component_1.twig
    - child_component_1.css
    - child_component_1.js
    - assets
      - child_component_1.css
      - child_component_1.js
```



## PostCSS config

Configure postcss by adding a `postcss.config.js` file to the root of your project. bldr uses [postcss-load-config](https://github.com/postcss/postcss-load-config) under the hood. As such, make sure to add plugins using the object syntax in the `postcss-load-config` documentation [here](https://github.com/postcss/postcss-load-config#examples).

In addition to the default context variables of (`ctx.env` (`process.env.NODE_ENV`) and `ctx.cwd` (`process.cwd()`)), there is an additional `bldrEnv`, which will have the value of the current build command (`dev`, `build`). Other options based on commands are available in the `ctx` object under `settings` (such as `watch` and `once` if applicable)

Again, refer to the `postcss-load-config` documentation [here](https://github.com/postcss/postcss-load-config#examples) for further details.


## Process Settings Configuration

In addition to processes, you can also add config to override or add to the default esBuild and Rollup process.

The following configuration options are available:

### Rollup:

```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  rollup: {
    useBabel: false, // set to true if babel should be ran (default: true)
    babelPluginOptions: {
      // see @rollup/plugin-babel options at https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers)
      // default: { babelHelpers: 'bundled' }
    },
    useSWC: false, // set to true if SWC should not be ran (default: false)
    swcPluginOptions: {
      // see SWC Configuration at https://swc.rs/docs/configuration/swcrc
      // default: {}
    },
    useTerser: true,  // set to false if terser should not be ran (default: true)
    terserOptions: {} // Options to pass to terser
    sdcOptions: {
      bundle: true, // set to false to prevent rollup from processing SDC files
      minify: true, // set to false to prevent js files from minifying (default: value of `useTerser`)
      format: 'es' // customize the format of the processed files
    }
    inputOptions: {
      // see rollups inputOptions object at https://rollupjs.org/guide/en/#inputoptions-object
      // `file` will automatically be added, so no need to add here
      // default: {}
      // if using babel, set to { external: [/@babel\/runtime/] }
    },
    inputPlugins: [
      // array of rollup input plugins.
      // if `rollup.overrideInputPlugins` is set to true, this array will replace the default bldr array.
      // if not, then these will be added after bldrs default input plugin set. See Processing documentation below
    ],
    overrideInputPlugins: false, // set to true to override default bldr plugins
    outputOptions: {
      // see rollups outputOptions object at https://rollupjs.org/guide/en/#outputoptions-object
      // `file` will automatically be added, so no need to add here
    },
    outputPlugins: [
      // array of rollup output plugins.
      // if `rollup.overrideOutputPlugins` is set to true, this array will replace the default bldr array.
      // if not, then these will be added after bldrs default plugin set. See Processing documentation below
    ],
    overrideOutputPlugins: false, // set to true to override default bldr plugins
  }
});
```

### EsBuild:

```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  esBuild: {
    plugins: [
      // Array of esbuild plugins to add (install in your root package.json)
    ],
    overridePlugins: false, // set to true to override default bldr plugins (bldr does not currently use any esbuild plugins)
  },
})
```

### EsLint
```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  eslint: {
    useEslint: true, // whether or not to run eslint
    options: {}, // [eslint options](https://eslint.org/docs/latest/integrate/nodejs-api#-new-eslintoptions)
    forceBuildIfError: true, // if set to false, an error will be thrown and process will exit if lint encounters an error
  },
})
```

**NOTE:** To keep eslint versions inline with bldr, you can create a `eslint.config.js` file and import/export defineConfig from bldr's eslint version:

```js
import { defineConfig } from "@bluecadet/bldr/providers/eslint/config";

export default defineConfig([
  ...
]);
```

### StyleLint
```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  stylelint: {
    useStyleLint: true, // whether or not to run stylelint
    forceBuildIfError: true, // if set to false, an error will be thrown and process will exit if lint encounters an error
  },
})
```

### Sass
```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  sassConfig: {
    useLegacy: false // whether or not to use the legacy api
  },
})
```

### Browsersync
```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  browsersync: {
    disable: false, // set to true to prevent browsersync from instatiating in watch env. Default: true
    instanceName: 'string' // useful if you ever need to access the browsersync access externally
  },
})
```


## Babel (via @rollup/plugin-babel)

If a [valid babel config file](https://babeljs.io/docs/en/config-files) exists in the same root as where bldr was ran, bldr will include `@rollup/plugin-babel` with the default options of `{babelHelpers: 'bundled'}`, and Babel will be ran using your local config file. To override, see the documentation for `rollup.babelPluginOptions` above.

If you do not want Babel to be ran, simply do not include a

**_Note:_ Babel will only conditionally be ran when using the `bldr build` command.**


### Babel Config

While you can setup babel config however you like, here is a working example to get it working.

1. Install the following packages to your projects package.json:
```
npm i --save-dev @babel/preset-env core-js
```

2. Create a `babel.config.json` file containing:

```
{
  "compact" : false,
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "corejs": 3
      }
    ]
  ]
}
```




### Local Config

Create a local config file by running `bldr init` or creating a file in root named `bldr.local.config.js`.

Local config is primarily used to store browsersync settings. As such, it is not a file that needs to be tracked.

Example dev/build config:

```js
module.exports = {
  browserSync: {
    proxy: 'http://site.local'
    // other browsersync options as per https://browsersync.io/docs/options
  }
}
```

## Processing

Default Rollup input plugins:
- @rollup/plugin-commonjs
- @rollup/plugin-babel
- @rollup/plugin-node-resolve
- rollup-plugin-inject-process-env

Default Rollup output plugins:
- none


Default EsBuild Plugins:
- none



## Providers
- rollup
- esbuild
- eslint
- postcss
- sass
- stylelint
- browsersync
