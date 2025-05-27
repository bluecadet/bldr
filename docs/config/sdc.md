# Single Directory Component (SDC) Configuration

To process SDC files, add the `sdc` key to the config:

```js
import {bldrConfig} from '@bluecadet/bldr/config';

const themeCSS = [
  {
    src: './path/to/theme/css/**/*.css',
    dest: './path/to/public/css/',
  }
];

export default bldrConfig({
  sdc: {
    directory: './path/to/sdc/folders', // required, (str)
    assetSubDirectory: 'assets'         // optional, (str), default: assets
  }
})
```

- `directory`: _required, (string)_ Path that points to the 'parent' folder of all components.
- `assetSubDirectory`: _optional, (string), default: assets_ Name of a folder within an SDC folder that holds raw assets to be processed. 

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

