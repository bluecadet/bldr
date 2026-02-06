# Single Directory Component (SDC) Configuration

To process SDC files, add the `sdc` key to the config:

```js
import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig({
  sdc: {
    directory: './path/to/sdc/folders', // required, (str | array of strings)
    assetSubDirectory: 'assets'         // optional, (str), default: assets
    assetDependencies: {                // optional, (object)
      css: [
        {
          src: './admin/src/css/admin.css',
          dest: './admin/dist/css',
        }
      ],
      sass: [
        {
          src: './theme/plugin/src/scss/storybook.css',
          dest: './theme/plugin/dist/css',
        },
      ],
      js: [
        {
          src: './theme/assets/src/js/*.js',
          dest: './theme/assets/dist/js',
        },
      ],
    };
  }
})
```

- `directory`: _required, (string | array of strings)_ Path(s) that points to the 'parent' folder of all components. This can be a single string or an array of strings.
- `assetSubDirectory`: _optional, (string), default: assets_ Name of a folder within an SDC folder that holds raw assets to be processed. 
- `assetDependencies`: _optional, (object)_ See Asset Dependencies below.

## Asset Dependencies

Use this configuration if you need additional assets to be built whenever an SDC component is saved when running `bldr dev`. Add `css`, `sass`, or `js` keys, each with an object containing `src` and `dest` keys.

When running `bldr dev` with `sdc.assetDependencies` set:
- Both `css` and `sass` groups will be ran (if applicable) when an `.css`, `.pcss`, `.sass`, or `.scss` file is saved in an SDC component. For example, if both `css` and `sass` are set, saving a `component.pcss` file in an SDC component will build out the `css` and `sass` group files, then build out the `component.pcss` file.
- The `js` group will only be fired when a `.js` or `.ts` file is saved in an SDC component.

Note that the SDC component file is built _after_ the asset dependency files.

## Asset Subdirectory Workflow

Single Directory Components auto-load css and js files at the same directory level as the `*.component.yml` file. As such, in order for bldr to process css and js assets for production, a 'child' or 'subdirectory' is required within a component to store the 'raw' assets.

By default, bldr will assume the assets are within a folder named `assets`, but the `sdc.assetSubDirectory` option can be set to use a custom folder name.

Example directory stucture:

```
theme
- components
  - child_component_1
    - child_component_1.component.yml
    - child_component_1.twig
    - assets
      - child_component_1.css
      - child_component_1.js
```

When assets are processed, this will compile to:
```
theme
- components
  - child_component_1
    - child_component_1.component.yml
    - child_component_1.twig
    - child_component_1.css
    - child_component_1.js
    - assets
      - child_component_1.css
      - child_component_1.js
```


## Additional Configuration

See [Rollup configuration](/config/providers/rollup#sdcoptions) for additional SDC options

