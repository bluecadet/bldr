import * as path from 'path';
import { fileURLToPath } from 'url';
import { readJSONSync } from 'fs-extra/esm';

const __dirname       = path.dirname(fileURLToPath(import.meta.url));
const bldrRoot        = path.join(__dirname, '..', '..');
const bldrPackagePath = path.join(bldrRoot, 'package.json');
const bldrPackageJson = readJSONSync(bldrPackagePath);

export const settings = {
  version: bldrPackageJson.version,
  bldrRoot: bldrRoot,
  filename: 'bldrConfig.js',
  localFilename: 'bldrConfigLocal.js',
  root: process.cwd(),
  allowedProcessKeys: ['css', 'sass', 'js', 'images'],
};