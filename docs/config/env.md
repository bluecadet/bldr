# Enviornment Configuration

Projects can have many parts. Some may have just one source for assets, some may have multiple. For example, you may be working on a theme for a CMS, but also need bldr to process assets for a plugin. 

## `env`:

Add the `env` object to the configuration. For each environment, add the name of the env as key, and then css/js/sass options as desired. Multiple envs can be setup 'environments' with their own process configurations:

```js{25-55}
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

  // ENV CONFIGURATION
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

## Running Environments

The `--env=key_name` (or `-e key_name`) command option can be added to either the `dev` or `build` commands. When running this command, make sure that the value for the option matches a key eithin the `env` object.


## Considerations

Each environment key is treated as its own 'process' configuration (css, js, and/or sass keys). Configuration for each environment **_is not_** inherited, or other wise read, from the basic process configuration. In other words, each environment needs its own processes defined as needed. This allows you to, for example, run _just_ css in an environment if desired.

::: tip
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
:::

::: warning Provider and SDC Configuration
Provider and SDC configuration cannot be adjusted per env. Configuration for these items will always be applied. 

SDC component processes will always be ran _in addition to_ env configuration.
:::