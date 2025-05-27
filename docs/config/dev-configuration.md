# Dev Configuration

The configuration options only apply when running `dev` and are all optional.


## `watchPaths`

By default, bldr will watch all files within the directory where `bldr.config.js` is located. To better tune what files should be watched, add a `watchPaths` key with an array of file paths. When added, *only* files _within_ these paths will trigger reload or processing:

```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  watchPaths: [
    './web/theme',
    './web/admin',
  ]
})
```


## `reloadExtensions`

When running `bldr dev` you may want additional files or file types to trigger an automatic reload. To do this, add a `reloadExtensions` key as an array of extensions that should trigger a reload. Extension names should be text only, without a dot before the name ('twig', not '.twig').

```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  reloadExtensions: [
    'twig', // note: twig not .twig
    'html',
    'php'
  ]
})
```