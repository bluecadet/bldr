# Stylelint

Stylelint is used to lint javascript files during `dev`, `build`, and `lint` commands. 

The `stylelint` key in bldrConfig has the following options:

## Options

### useStyleLint

`boolean | null` - Default: `true`

Set to `false` to prevent Stylelint from running on `dev`, `build`, and `lint` commands.


### forceBuildIfError

`boolean | null` - Default: `true`

If set to `false`, an error will be thrown and process will exit if lint encounters an error


## All Options (with defaults)
```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  stylelint: {
    useStyleLint: true,
    forceBuildIfError: true,
  },
})
```

## Stylelint Config File

See https://stylelint.io/user-guide/configure for information on creating Stylelint config files.