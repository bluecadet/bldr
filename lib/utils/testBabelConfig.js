import { settings } from '../settings/bldrSettings.js';
import { readFileSync, existsSync} from 'node:fs';
import * as path from 'node:path';

export const testBabelConfig = async function() {

  let configExists = false;

  const configFiles = [
    'babel.config.json',
    'babel.config.js',
    'babel.config.cjs',
    'babel.config.mjs',
    '.babelrc.json',
    '.babelrc.js',
    '.babelrc.cjs',
    '.babelrc.mjs',
    '.babelrc',
  ];

  configFiles.forEach(file => {
    const filePath = path.resolve(settings.root, file);

    if ( existsSync(filePath) ) {
      configExists = true;
    }
  });

  if ( configExists ) {
    return true;
  }

  const rawPackage  = readFileSync(path.resolve(settings.root, 'package.json'));
  const jsonPackage = JSON.parse(rawPackage);

  if ( jsonPackage?.babel ) {
    return true;
  }

  return false;
}