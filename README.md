<h1 style="text-align: center;">Bldr 💪</h1>
<p style="text-align: center">TL;DR: Bldr is a (very opinionated) configuration based task runner for css, js, sass, and image.</p>


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

but you can also install it globally:
`npm i -g @bluecadet/bldr`


Then run `npm run dev`, which will run `bldr dev`, etc.

If you need to pass parameters to a script, add `--` between the command and the parameter:
`npm run dev -- env=SampleEnv`


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
  - [Browsersync Config](#browsersync-config)
- [Processing documentation](#processing)
- [Complete Config Example](#complete-config-example)


## Commands

### `init`

```bash
$ bldr init
```

Running `init` will run a simple interactive config setup.


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

Bldr configuration determines the processes that are ran. At minimum, `bldrConfig.js` should export an object:

```js
module.exports = {
  // file configuration
}
```

The following processes can be added:

```js
module.exports = {
  css: {
    // processes .css files with postcss
  },
  sass: {
    // processes .sass files with node-sass and then postcss
  },
  js: {
    // processes .js files with esbuild (bldr dev) or rollup (bldr build)
  },
  images: {
    // processes image files with imagemin (via imagemin-mozjpeg, imagemin-pngquant, and imagemin-svgo)
  }
}
```

Each process can also accept and array of config object if multiple file locations should be processed:

```js
module.exports = {
  css: [
    {
      // process config
    },
    {
      // process config
    },
  ]
}
```

If an array of config objects is present, each config object will be ran as its own process. In other words, if `css` is an array, two seperate postcss processes will be ran, one for each configuration object.

### Process Configuration Objects

For each process, the following config is required:

```js
{
  src: './path/to/src/files/**/*.[ext]',
  dest: './path/to/destination/directory/',
  watch: [
    './path/to/files/to/watch/**/*.[ext]',
  ]
}
```

### `src`, `dest`, `watch` configuration

- `src` config expects a path (string). This path is the 'incoming' path for processing, and should include a file extension as needed for the process. Glob patterns can be used.

- `dest` config expects a path (string). This path is the 'destination' for processing. This is the directory where builds will be created.

- `watch` config is only used in the `dev` process, and expects an array of paths (array of strings). These paths will be 'watched' by chokidar.

**Example js config:**

```js
module.exports = {
  js: {
    src: './path/to/src/js/**/*.js',
    dest: './path/to/destination/js/',
    watch: [
      '../path/to/other/js/moldules/**/*.js',
    ]
  },
}
```

**Example js config with multiple build locations:**

```js
module.exports = {
  js: [
    {
      src: './path/to/theme/src/js/**/*.js',
      dest: './path/to/theme/dest/js/',
      watch: [
        '../path/to/theme/js/moldules/**/*.js',
      ]
    },
    {
      src: './path/to/child-theme/src/js/*.js',
      dest: './path/to/child-theme/dest/js/',
      watch: [
        '../path/to/child-theme/src/js/moldules/**/*.js',
      ]
    },
  ],
}
```

### `watchReload` config

When running `bldr dev` you may want additional files or file types to trigger an automatic reload. To do this, add a `watchReload` key with a value of an array to config:

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

### `env` config

Projects can have many parts. Some may have just one source for assets, some may have multiple. For example, you may be working on a theme for a CMS, but also need bldr to process assets for a plugin. With `env` configuration, you can setup 'environments' with their own process configurations:

```js
module.exports = {
  css: [
    {
      src: './path/to/theme/css/**/*.css',
      dest: './path/to/public/css/',
      watch: [
        './path/to/theme/css/**/*.css',
        './path/to/other/css/**/*.css'
      ]
    },
    {
      src: './path/to/plugin/src/css/**/*.css',
      dest: './path/to/plugin/build/css/',
      watch: [
        './path/to/plugin/src/css/**/*.css',
        './path/to/plugin/style-guide/css/**/*.css'
      ]
    },
  ],
  js: {
    ...
  },
  env: {
    'themeOnly': {
      css: {
        src: './path/to/theme/css/**/*.css',
        dest: './path/to/public/css/',
        watch: [
          './path/to/theme/css/**/*.css',
          './path/to/other/css/**/*.css'
        ]
      },
      js: {
        ...
      },
    },
    'pluginOnly': {
      css: {
        src: './path/to/plugin/src/css/**/*.css',
        dest: './path/to/plugin/build/css/',
        watch: [
          './path/to/plugin/src/css/**/*.css',
          './path/to/plugin/style-guide/css/**/*.css'
        ]
      },
      js: {
        ...
      },
    }
  }
}
```

**IMPORTANT NOTE ABOUT ENVIRONMENTS**

Each environment key is treated as its own set of configuration. Configuration for each environment **_is not_** inherited, or other wise read, from the basic configuration. In other words, each environment needs its own processes defined as needed. This allows you to, for example, run _just_ css in an environment if desired.

If similar config is required in both basic and environment, its best to setup config in variables before the `module.exports = {}` in the config file:

```js
const themeCSS = {
  src: './path/to/theme/css/**/*.css',
  dest: './path/to/public/css/',
  watch: [
    './path/to/theme/css/**/*.css',
    './path/to/other/css/**/*.css'
  ]
};

module.exports = {
  css: [
    themeCSS,
    {
      src: './path/to/plugin/src/css/**/*.css',
      dest: './path/to/plugin/build/css/',
      watch: [
        './path/to/plugin/src/css/**/*.css',
        './path/to/plugin/style-guide/css/**/*.css'
      ]
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
}
```

### CLI commands and `env`

To use configuration from an `env` key, add the `env=` (or `-e=`) param with a value equal to the key of the `env` object you want to run.

**Example**

```js
// bldrConfig.js
const themeCSS = {
  src: './path/to/theme/css/**/*.css',
  dest: './path/to/public/css/',
  watch: [
    './path/to/theme/css/**/*.css',
    './path/to/other/css/**/*.css'
  ]
};

module.exports = {
  css: [
    themeCSS,
    {
      // some other config
    },
  ],
  env: {
    'themeCssOnly': {
      css: themeCSS,
    },
    'whateverNameYouWant': {
      js: {
        // some other config
      },
    }
  }
}
```

In command line, to use the `themeCssOnly` env config, you would run:

```bash
$ bldr dev env=themeCssOnly # or bldr dev -e=themeCssOnly
```

In command line, to use the `whateverNameYouWant` env config, you would run:

```bash
$ bldr dev env=whateverNameYouWant
```


## Advanced Configuration

Bldr supports `dev` and `build` configuration keys at the root of the config object. Think of them as bldr command environments.

This allows `bldr dev` and `bldr build:dev` to have a seperate set of process configurations (via the `dev` key) from the process configurations used in `bldr build` (via the `build` key):

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
    css: [
      {
        src: './path/to/src/css/**/*.css',
        dest: './path/to/public/css/',
        watch: [
          './path/to/src/css/**/*.css',
          './path/to/other/css/**/*.css'
        ]
      },
      {
        src: './path/to/some-plugin/src/css/**/*.css',
        dest: './path/to/some-plugin/build/css/',
        watch: [
          './path/to/some-plugin/src/css/**/*.css',
          './path/to/some-plugin/style-guide/css/**/*.css'
        ]
      },
    ]
  }
}
```

The `dev` key can take all settings in the Basic Configuration section. The `build` key can as well, but the `watchReload` and `env` keys aren't needed, as they will not be relevant in the `bldr build` processing.




## PostCSS config

Configure postcss by adding a `postcss.config.js` file to the root of your project. bldr uses [postcss-load-config](https://github.com/postcss/postcss-load-config) under the hood. As such, make sure to add plugins using the object syntax in the `postcss-load-config` documentation [here](https://github.com/postcss/postcss-load-config#examples).

In addition to the default context variables of (`ctx.env` (`process.env.NODE_ENV`) and `ctx.cwd` (`process.cwd()`)), there is an additional `bldrEnv`, which will have the value of the current build command (`dev`, `build`). Other options based on commands are available in the `ctx` object under `settings` (such as `watch` and `once` if applicable)

Again, refer to the `postcss-load-config` documentation [here](https://github.com/postcss/postcss-load-config#examples) for further details.


## Process Settings Configuration

In addition to processes, you can also add config to override or add to the default esBuild and Rollup process.

The following configuration options are available:

```js

module.exports = {
  processSettings: {
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
      useBabel: false, // set to true if babel should not be ran
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
}
```

### EsBuild
```js

module.exports = {
  processSettings: {
    esBuild: {
      plugins: [
        // Array of esbuild plugins to add (install in your root package.json)
        // if `esBuild.overridePlugins` is set to true, this array will replace the default bldr array.
        // if not, then these will be added after bldrs default plugin set. See Processing documentation below
      ],
      overridePlugins: false, // set to true to override default bldr plugins
    }
  }
}
```

### Rollup
```js

module.exports = {
  processSettings: {
    rollup: {
      useBabel: true, // set to false if babel should not be ran. Default: true
      useTerser: true,  // set to false if terser should not be ran. Default: true
      babelPluginOptions: {
        // see @rollup/plugin-babel options at https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers)
        // default: { babelHelpers: 'bundled' }
      },
      inputOptions: {
        // see rollups inputOptions object at https://rollupjs.org/guide/en/#inputoptions-object
        // `file` will automatically be added, so no need to add here
        // default: { external: [/@babel\/runtime/] }
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
}
```

### Browsersync
```js

module.exports = {
  processSettings: {
    browsersync: {
      disable: false, // set to true to prevent browsersync from instatiating in watch env. Default: true
    },
  }
}
```

### Sass
```js

module.exports = {
  processSettings: {
    sass: {
      sassProcessor: null, // defaults to node sass. You can require dart-sass here if preferred
      importer: null,      // defaults to node-sass-magic-importer
      importerOpts: {},    // options for the importer, defaults to empty object
    },
  }
}
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


### Browsersync Config

If you would like to run watch mode without browsersync, you can disable broswersync by adding `processSettings: {browsersync: {disable: true}}` to your bldrConfig.js file.


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

## Processing

Default Rollup input plugins:
- @rollup/plugin-commonjs
- @rollup/plugin-babel
- @rollup/plugin-node-resolve
- rollup-plugin-inject-process-env

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

  // -------------------- PROCESS CONFIG -------------------- //
  processSettings: {

    // -------------------- BROWSERSYNC CONFIG -------------------- //
    browsersync: {
      disable: false, // set to true to prevent browsersync from instatiating in watch env. Default: true
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
      useBabel: true, // set to false if babel should not be ran. Default: true
      useTerser: true,  // set to false if terser should not be ran. Default: true
      babelPluginOptions: {
        // see @rollup/plugin-babel options at https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers)
        // default: { babelHelpers: 'bundled' }
      },
      inputOptions: {
        // see rollups inputOptions object at https://rollupjs.org/guide/en/#inputoptions-object
        // `file` will automatically be added, so no need to add here
        // default: { external: [/@babel\/runtime/] }
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
    },

    // ---------------------- ESLint CONFIG --------------------- //
    eslint: {
      omit: null,              // set to true to skip eslint
      forceBuildIfError: null, // set to true to force builds to run if linting errors are found
    },

    // ---------------------- SASS CONFIG --------------------- //
    sass: {
      sassProcessor: null, // defaults to node sass. You can require [dart-sass](https://www.npmjs.com/package/sass) here if preferred
      importer: null,      // defaults to [node-sass-magic-importer](https://www.npmjs.com/package/node-sass-magic-importer)
      importerOpts: {},    // options for the importer, defaults to empty object
    },
  }
}
```