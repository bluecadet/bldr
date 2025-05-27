# Sass Config

Configuration options for [dart sass](https://sass-lang.com/dart-sass/)

The `sassConfig` key in bldrConfig has the following options:

## Options

### useLegacy

`boolean | null` - Default: `false`

Set to `true` to use the [Dart Sass Legacy API](https://sass-lang.com/documentation/breaking-changes/legacy-js-api/)


## All Options (with defaults)
```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  sassConfig: {
    useLegacy: false
  },
})
```
