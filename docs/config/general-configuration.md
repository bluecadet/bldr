# General Configuration

All configuration should be created within a `bldr.config.js` file that exports a `bldrConfig` method:

```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  // Configuration here
});
```

## Processes

Bldr processes css, js, and sass files depending on the contents of the `bldr.config.js` file. The `css`, `js`, and `sass` keys are all optional and only need to be added as required by a project.

```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  css: [
    {
      src: './theme/assets/src/css/*.css',
      dest: './theme/assets/dist/css',
    }
  ]
});
```

The `css`, `js`, and `sass` configuration keys accept an array of objects. Each object requires a `src` and `dest` key. 


```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  css: [
    {
      src: './theme/assets/src/css/*.css',
      dest: './theme/assets/dist/css',
    },
    {
      src: './admin/src/css/admin.css',
      dest: './admin/dist/css',
    }
  ],
  sass: [
    {
      src: './theme/plugin/src/scss/.{sass,scss}',
      dest: './theme/plugin/dist/css',
    },
  ],
  js: [
    {
      src: './theme/assets/src/js/*.js',
      dest: './theme/assets/dist/js',
    },
  ],
});
```

## `src` key

The `src` key should be a path (string) to where a file(s) of that type lives. The value can be a single file or a glob (see [fast-glob](https://github.com/mrmlnc/fast-glob#pattern-syntax) pattern syntax):

```js
{
  src: './admin/src/css/admin.css',
}
```

or

```js
{
  src: './theme/assets/src/css/*.css',
}
```

## `dest` key

The `dest` key should be a path (string) that will be the 'destination' for the processed file. File names will be copied to the `dest` when writing the file.

```js
{
  src: './admin/src/css/admin.css',
  dest: './admin/dist/css' // results in /admin/dist/css/admin.css on build
}
```