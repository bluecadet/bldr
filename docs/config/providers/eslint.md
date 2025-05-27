# ESLint

ESLint is used to lint javascript files during `dev`, `build`, and `lint` commands. 

The `eslint` key in bldrConfig has the following options:

## Options

### useEslint

`boolean | null` - Default: `true`

Set to `false` to prevent eslint from running on `dev`, `build`, and `lint` commands.

### options

`object | null` - Default: `{}`

Options for ESLint instance. See https://eslint.org/docs/latest/integrate/nodejs-api#-new-eslintoptions


### forceBuildIfError

`boolean | null` - Default: `true`

If set to `false`, an error will be thrown and process will exit if lint encounters an error


## All Options (with defaults)
```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  eslint: {
    useEslint: true,
    options: {},
    forceBuildIfError: true,
  },
})
```


## ESLint Config File

See [Bldr Provided ESLint Config](/config/eslint-bldr-instance) for information on using Bldr's current version of ESLint.

See https://eslint.org/docs/latest/use/configure/configuration-files for information on creating ESLint config files.