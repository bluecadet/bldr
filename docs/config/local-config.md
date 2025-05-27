# Local Config

When running `dev`, bldr will look for a `bldr.local.config.js`. This file can be used to configure custom settings for browsersync. You could omit it from git if you wish to let other devs create their own config.

All configuration should be created within a `bldr.local.config.js` file that exports the `bldrLocalConfig` method:

```js
import { bldrLocalConfig } from "@bluecadet/bldr";

export default bldrLocalConfig({
  // Configuration here
});
```

## Options

### browsersync

`object | null` - Default: `null`

The `browsersync` object can contain any of the [options provided by browsersync](https://browsersync.io/docs/options). We recommend including `proxy` and setting its value to your local dev url.