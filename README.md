<center>
<h1>🚨 🚨 🚨 <br>This jawn is in active development.<br>🚨 🚨 🚨</h1>
<p>Use at your own risk.</p>
</center>



<center>
<h1>Bldr</h1>
</center>

## Installation

`npm i -g @bluecadet/bldr`

## Documentation

- [Config documentation](#config)
  - [Config Setup](#config-setup)
  - [Environment Config](#environment-config)
  - [PostCSS config](#postcss-config)
  - [Esbuild and Rollup Config](#esbuildrollup-override-config)
    - [Recommended Babel Config](#recommended-babel-config)
  - [Browsersync Config](#browsersync-config)
- [Command documentation](#commands)
- [Processing documentation](#processing)

## Config

Bldr relies on a `bldrConfig.js` file to point to where files should be sourced, distributed to, and watched.

Bldr supports 2 main processes: `dev` and `build`, where `dev` is meant to run locally, and `build` is meant for production. The main difference: JS files in `dev` are processed with [esBuild](https://esbuild.github.io/), while JS files in `build` are processed with [Rollup](https://rollupjs.org). CSS is always processed by [PostCss](https://postcss.org/). This keeps development builds fast, and production builds more thorough.

### Config Setup

#### Base config

Config can be setup to either export a single object, or an object with `dev` and `build` objects.

If path values for the `dev` and `build` processes are identical, you can use export a single object:

```js
module.exports = {
  // file configuration
}
```

If you need to support different path structures for `dev` and `build` commands, use the following configuration:

```js
module.exports = {
  dev: {
    // file configuration
  },
  build: {
    // file configuration
  }
}
```

Both the single config object and the `dev` and `build` keyed object support the following file configuration objects (described below):

```js
{
  css: {
    // src/dest/watch config for processing files with postcss
  },
  js: {
    // src/dest/watch config for processing files with esbuild (dev) or rollup (build)
  },
  images: {
    // src/dest/watch config for processing files with postcss
  }
}
```

Each of these keys can support a single object (`css: {}`) OR and array of objects:

```js
{
  css: [
    {
      // src/dest/watch config
    },
    {
      // src/dest/watch config
    },
  ],
  js: {
    // src/dest/watch config
  },
  images: {
    // src/dest/watch config
  }
}
```

This is useful if there are multiple directories in one project to run processes on.


#### `src`, `dest`, `watch` config

`src` config expects a path (string). This path is the 'incoming' path for processing. Glob patterns can be used.

Example:

```js
css: {
  src: './path/to/src/css/**/*.css'
}
```

`dest` config expects a path (string). This path is the 'destination' for processing. This is the directory where builds will be created.

Example:

```js
css: {
  dest: './path/to/public/css/'
}
```

`watch` config is only used in the `dev` process, and expects an array of paths (array of strings). These paths will be 'watched' by chokidar.

Example:

```js
css: {
  watch: [
    './path/to/src/css/**/*.css',
    './path/to/other/css/**/*.css'
  ]
}
```

##### Example basic config:
```js
module.exports = {
  css: {
    src: './path/to/src/css/**/*.css',
    dest: './path/to/public/css/',
    watch: [
      './path/to/src/css/**/*.css',
      './path/to/other/css/**/*.css'
    ]
  }
}
```

##### Example dev/build config:

```js
module.exports = {
  dev: {
    css: {
      src: './path/to/src/css/**/*.css',
      dest: './path/to/public/css/',
      watch: [
        './path/to/src/css/**/*.css',
        './path/to/other/css/**/*.css'
      ]
    }
  },
  build: {
    css: {
      src: './path/to/src/css/**/*.css',
      dest: './path/to/public/css/',
      watch: [
        './path/to/src/css/**/*.css',
        './path/to/other/css/**/*.css'
      ]
    }
  }
}
```

#### `watchReload` config

When running `bldr watch` you may need other files to trigger an automatic reload. To do this, add a `watchReload` key with a value of an array to config:

##### Example basic config:
```js
module.exports = {
  css: {
    ...
  },
  js: {
    ...
  },
  watchReload: [
    './**/*.twig',
    './**/*.html',
    './**/*.php'
  ]
}
```

##### Example dev/build config:
In practice, the `watchReload` key only applies to the `watch` process, which will only ever honor basic and `dev` config, so its not needed in `build`.

```js
module.exports = {
  dev: {
    css: {...},
    js: {...},
    watchReload: [
      './**/*.twig',
      './**/*.html',
      './**/*.php'
    ]
  },
  build: {
    css: {...}
  }
}
```


#### Environment config

Within the basic config object or the `dev` key, an `env` object can be added to define seperate build environments. This allows you to create specific config for a specific set of files (such as 'cms' or 'theme'). Consider it to be multiple `dev` configurations.

Once an env config object is created, they can be ran using the flag `env=ENV_KEY_NAME`.

Example basic config:

```js
module.exports = {
  css: [
    {
      src: './theme/src/css/**/*.css',
      dest: './theme/public/css/',
      watch: ['./theme/src/css/**/*.css',]
    },
    {
      src: './cms/src/css/**/*.css',
      dest: './cms/public/css/',
      watch: ['./cms/src/css/**/*.css',]
    },
  ],
  env: {
    themeOnly: {
      css: {
        src: './theme/src/css/**/*.css',
        dest: './theme/public/css/',
        watch: ['./theme/src/css/**/*.css',]
      },
    }
  }
}
```

Example dev/build config:

```js
module.exports = {
  dev: {
    css: [
      {
        src: './theme/src/css/**/*.css',
        dest: './theme/public/css/',
        watch: ['./theme/src/css/**/*.css',]
      },
      {
        src: './cms/src/css/**/*.css',
        dest: './cms/public/css/',
        watch: ['./cms/src/css/**/*.css',]
      },
    ],
    env: {
      themeOnly: {
        css: {
          src: './theme/src/css/**/*.css',
          dest: './theme/public/css/',
          watch: ['./theme/src/css/**/*.css',]
        },
      }
    }
  }
}
```

In this example, `bldr dev` will watch and process css in both the `theme` and `cms` directories, but running

```bash
$ bldr dev env=themeOnly
```

will only watch the `theme` directory. Multiple `env` objects can be configured.

Each object in the `env` config has the same options as the `dev` and `build` config.


### PostCSS config

Configure postcss by adding a `postcss.config.js` file to the root of your project. bldr uses [postcss-load-config](https://github.com/postcss/postcss-load-config) under the hood. As such, make sure to add plugins using the object syntax in the `postcss-load-config` documentation [here](https://github.com/postcss/postcss-load-config#examples).

In addition to the default context variables of (`ctx.env` (`process.env.NODE_ENV`) and `ctx.cwd` (`process.cwd()`)), there is an additional `bldrEnv`, which will have the value of the current build command (`dev`, `build`, or `watch`). Again, refer to the `postcss-load-config` documentation [here](https://github.com/postcss/postcss-load-config#examples).

### EsBuild/Rollup override config

Both esBuild and rollup options can be changed/overwritten in the config. The following config is available:

```js
// Some plugin you would like to add

module.exports = {
  dev: ...,
  build: ...,
  esBuild: {
    plugins: [
      // Array of esbuild plugins to add (install in your root package.json)
      // if `esBuild.overridePlugins` is set to true, this array will replace the default bldr array.
      // if not, then these will be added after bldrs default plugin set. See Processing documentation below
    ],
    overridePlugins: false, // set to true to override default bldr plugins
    esBuild: require('esbuild'), // overrides bldr version of esbuild. Default: null
  },
  rollup: {
    omitBabel: false, // set to true if babel should not be ran
    useTerser: true,  // set to false if terser should not be ran
    babelPluginOptions: {
      // see @rollup/plugin-babel options at https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers)
      // default: { babelHelpers: 'bundled' }
    },
    inputOptions: {
      // see rollups inputOptions object at https://rollupjs.org/guide/en/#inputoptions-object
      // `file` will automatically be added, so no need to add here
      // default additions: { external: [/@babel\/runtime/] }
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
    rollup: require('rollup') // if you wish to use a specific version of rollup, you can require it here. Default: null
  }
}
```


#### Recommended Babel Config

By default, if a babel config file exists, bldr will use the `@rollup/plugin-babel` with the options of `{babelHelpers: 'bundled'}`. You can override this config by setting an object in the rollup section of `bldrConfig.js`:

```
{
  ...,
  rollup: {
    babelPluginOptions: {
      babelHelpers: 'bundled',
    }
  }
```

More options [here](https://github.com/rollup/plugins/tree/master/packages/babel#options).

##### Babel Config

While you can setup babel as you like, the following is recommended (particularly with the default setting `babelHelpers` to runtime):

Install the following packages to your projects package.json:
```
npm i --save-dev @babel/preset-env core-js
```

then create a `babel.config.json` file containing:

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


#### Browsersync Config

If you would like to run watch mode without browsersync, you can disable broswersync by adding `disableBrowsersync: true` to your bldrConfig.js file.

### Local Config

Create a local config file by running `bldr init` or creating a file in root named `bldrConfigLocal.js`.

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

## Commands

### `init`

```bash
$ bldr init
```

Running `init` will attempt to create boilerplate config files in the project root.


### `dev`

```bash
$ bldr dev
```

Running `dev` will run postcss and esbuild without minification.

### `watch`

```bash
$ bldr watch
```

Running `watch` will run postcss and esbuild without minification (same as `dev`). Additionally:
- a chokidar instance will initialize to watch files and run appropriate processes when files are added/removed/updated based on file type
- a browsersync instance will be created if it does not exist. Edit `bldrConfigLocal.js` to add [browsersync options](https://browsersync.io/docs/options) as needed.


### `build`

```bash
$ bldr build
```

Running `build` will run postcss and rollup with minification. Rollup will also run babel.


## Processing

Default Rollup input plugins:
- @rollup/plugin-commonjs
- @rollup/plugin-babel
- @rollup/plugin-node-resolve

Default Rollup output plugins:
- none


## Complete Config Example:

```js


module.exports = {
  // ----------------------- BASIC CONFIG ----------------------- //
  css: {
    src: 'path/to/css/files/**/*.css',
    dist: 'path/to/css/destination',
    watch: ['paths/to/watch/css/files/**/*.css'],
  },
  // !-- OR IF MULTIPLE SOURCES
  // css: [
  //   {
  //     src: 'path/to/css/files/**/*.css',
  //     dist: 'path/to/css/destination',
  //     watch: ['paths/to/watch/css/files/**/*.css'],
  //   },
  //   {
  //     src: 'path/to/css/files/2/**/*.css',
  //     dist: 'path/to/css/destination/2',
  //     watch: ['paths/to/watch/css/files/2/**/*.css'],
  //   }
  // ],
  // --!
  sass: {
    src: 'path/to/sass/files/**/*.scss',
    dist: 'path/to/sass/destination',
    watch: ['paths/to/watch/sass/files/**/*.scss'],
  },
  // !-- OR IF MULTIPLE SOURCES
  // sass: [
  //   {
  //     src: 'path/to/sass/files/**/*.scss',
  //     dist: 'path/to/sass/destination',
  //     watch: ['paths/to/watch/sass/files/**/*.scss'],
  //   },
  //   {
  //     src: 'path/to/sass/files/2/**/*.scss',
  //     dist: 'path/to/sass/destination/2',
  //     watch: ['paths/to/watch/sass/files/2/**/*.scss'],
  //   }
  // ],
  // --!
  js: {
    src: 'path/to/js/files/**/*.js',
    dist: 'path/to/js/destination',
    watch: ['paths/to/watch/js/files/**/*.js'],
  },
  // !-- OR IF MULTIPLE SOURCES
  // js: [
  //   {
  //     src: 'path/to/js/files/**/*.js',
  //     dist: 'path/to/js/destination',
  //     watch: ['paths/to/watch/js/files/**/*.js'],
  //   },
  //   {
  //     src: 'path/to/js/files/2',
  //     dist: 'path/to/js/destination/2',
  //     watch: ['paths/to/watch/js/files/2/**/*.js'],
  //   }
  // ],
  // --!
  images: {
    src: 'path/to/image/files/*.{jpg,JPG,jpeg,JPEG,gif,png,svg}',
    dist: 'path/to/image/files/destination',
    watch: ['paths/to/watch/image/files/**/*'],
  },
  // !-- OR IF MULTIPLE SOURCES
  // images: [
  //   {
  //     src: 'path/to/image/files/*.{jpg,JPG,jpeg,JPEG,gif,png,svg}',
  //     dist: 'path/to/image/files/destination',
  //     watch: ['paths/to/watch/image/files/**/*'],
  //   },
  //   {
  //     src: 'path/to/image/files/2/*.{jpg,JPG,jpeg,JPEG,gif,png,svg}',
  //     dist: 'path/to/image/files/destination/2',
  //     watch: ['paths/to/watch/image/files/2/**/*'],
  //   },
  // ],
  // --!
  watchReload: [
    'some/path/to/watch/**/*.php',
    'some/path/to/watch/**/*.cjs',
    'some/path/to/watch/**/*.twig',
    'some/path/to/watch/**/*.html',
  ],
  env: { // Optional - add custom enviornments (run with `-e=SampleEnv` or `env=SampleEnv)
    SampleEnv: { // name of env in cli `env=` parameter
      css: { ... },    // Can also be array. Same as basic css config above.
      js: { ... },     // Can also be array. Same as basic js config above.
      images: { ... }, // Can also be array. Same as basic image config above.
      watchReload: []  // Same as basic watchReload config above.
    }
  },
  // --------------------- END BASIC CONFIG --------------------- //


  // ---------- SEPERATE DEV/BUILD ENVIRORNMENT CONFIG ---------- //
  // ---- IF USING DEV/BUILD CONFIG, DO NOT USE BASIC CONFIG ---- //
  dev: {
    // see basic config above
  },
  build: {
    // see basic config above
  },
  // -------- END SEPERATE DEV/BUILD ENVIRORNMENT CONFIG -------- //


  // -------------------- BROWSERSYNC CONFIG -------------------- //
  browsersync: {
    disable: false, // set to true to prevent browsersync from instatiating in watch env.
  },


  // ---------------------- ESBUILD CONFIG --------------------- //
  esBuild: {
    plugins: [
      // Array of esbuild plugins to add (install in your root package.json)
      // if `esBuild.overridePlugins` is set to true, this array will replace the default bldr array.
      // if not, then these will be added after bldrs default plugin set. See Processing documentation below
    ],
    overridePlugins: false, // set to true to override default bldr plugins
    esBuild: require('esbuild'), // overrides bldr version of esbuild. Default: null
  },


  // ---------------------- ROLLUP CONFIG --------------------- //
  rollup: {
    omitBabel: false, // set to true if babel should not be ran
    useTerser: true,  // set to false if terser should not be ran
    babelPluginOptions: {
      // see @rollup/plugin-babel options at https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers)
      // default: { babelHelpers: 'bundled' }
    },
    inputOptions: {
      // see rollups inputOptions object at https://rollupjs.org/guide/en/#inputoptions-object
      // `file` will automatically be added, so no need to add here
      // default additions: { external: [/@babel\/runtime/] }
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
    rollup: require('rollup') // if you wish to use a specific version of rollup, you can require it here. Default: null
  }
}
```