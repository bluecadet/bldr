# Local Config

When running `dev`, bldr will look for a `bldr.local.config.js`. This file can be used to configure custom settings for your local development workflow. Effectively, you can use this file to overwrite settings in `bldr.config.js`.

All configuration should be created within a `bldr.local.config.js` file that exports the `bldrLocalConfig` method:

```js
import { bldrLocalConfig } from "@bluecadet/bldr/config";

export default bldrLocalConfig({
  // Configuration here
});
```
