import { settings } from '../settings/bldrSettings.js';
import { readFileSync, existsSync} from 'node:fs';
import * as path from 'node:path';

export const testEslintConfig = async function(config) {

  if ( config?.processSettings?.eslint?.omit ) {
    return false;
  }

  let configExists = false;

  const configFiles = [
    '.eslintrc',
    '.eslintrc.js',
    '.eslintrc.cjs',
    '.eslintrc.yaml',
    '.eslintrc.yml',
    '.eslintrc.json',
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

  if ( jsonPackage?.eslintConfig ) {
    return true;
  }

  return false;
}