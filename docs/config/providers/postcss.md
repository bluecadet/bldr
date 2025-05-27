# PostCSS Configuration

Configure postcss by adding a `postcss.config.js` file to the root of your project. bldr uses [postcss-load-config](https://github.com/postcss/postcss-load-config) under the hood. As such, make sure to add plugins using the object syntax in the `postcss-load-config` documentation [here](https://github.com/postcss/postcss-load-config#examples).

In addition to the default context variables of `ctx.env` (`process.env.NODE_ENV`) and `ctx.cwd` (`process.cwd()`), there is an additional `bldrEnv`, which will have the value of the current build command (`dev`, `build`). Other options based on commands are available in the `ctx` object under `cli` (such as `env`, `start` and `once` if applicable)

Again, refer to the `postcss-load-config` documentation [here](https://github.com/postcss/postcss-load-config#examples) for further details.

Example `postcss.config.js`:

```js
function buildPluginArray(ctx) {

  const plugins = {
    'postcss-strip-inline-comments': {},
    'postcss-easy-import': {
      prefix: false,
      skipDuplicates: false,
      warnOnEmpty: false,
    },
    'postcss-preset-env': {},
    'postcss-simple-vars': {},
    'postcss-nested': {},
  };

  if (ctx.bldrEnv === 'build') {
    plugins.cssnano = {};
    plugins.autoprefixer = {};
  }

  return plugins
}

export default (ctx) => ({
  plugins: buildPluginArray(ctx)
})
```