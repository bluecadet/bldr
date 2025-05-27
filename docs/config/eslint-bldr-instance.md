# Bldr Provided ESLint Config

To keep eslint versions inline with bldr, you can create a `eslint.config.js` file and import/export defineConfig from bldr's eslint version:

```js
import { defineConfig } from "@bluecadet/bldr/providers/eslint/config";

export default defineConfig([
  ...
]);
```