# Browsersync

Configuration options for [Browsersync](https://browsersync.io/)

The `browsersync` key in bldrConfig has the following options:

## Options

### disable

`boolean | null` - Default: `false`

Set to `true` to prevent a browsersync instance from being created when running `dev`

### instanceName

`boolean | null` - Default: `null`

Name of the instance that gets created when Browsersync instance is created. Useful if you ever need to access the browsersync instance externally. See [browsersync.create](https://browsersync.io/docs/api#api-create)


## All Options (with defaults)
```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  browsersync: {
    disable: false,
    instanceName: null,
  },
})
```