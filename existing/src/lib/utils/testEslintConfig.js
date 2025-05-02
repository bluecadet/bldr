import { settings } from '../settings/bldrSettings.js';
import { readFileSync, existsSync} from 'node:fs';
import * as path from 'node:path';
import { handleProcessError } from './reporters.js';

export const testEslintConfig = async function(config) {

  if ( config?.processSettings?.eslint?.omit ) {
    return false;
  }

  if ( config?.processSettings?.eslint?.options ) {
    return true;
  }

  let configExists = false;

  const configFiles = [
    'eslint.config.js',
    'eslint.config.mjs',
    'eslint.config.cjs',
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

  const deprecatedConfigFiles = [
    '.eslintrc',
    '.eslintrc.js',
    '.eslintrc.cjs',
    '.eslintrc.yaml',
    '.eslintrc.yml',
    '.eslintrc.json',
  ];

  deprecatedConfigFiles.forEach(file => {
    const filePath = path.resolve(settings.root, file);

    if ( existsSync(filePath) ) {
      configExists = file;
    }
  });

  if ( configExists ) {
    let message = `*************************************************************************************\n`;
    message += `          **                ERROR: eslint no longer supports ${configExists}                **\n`;
    message += `          ** Convert file to 'eslint.config.js','eslint.config.mjs', or 'eslint.config.cjs' **\n`;
    message += `          **      See https://eslint.org/docs/latest/use/configure/configuration-files      **\n`;
    message += `          *************************************************************************************`;
    handleProcessError( 'eslint', message, {throwError: true, exit: true, code: 1} )
  }

  return false;

  // const rawPackage  = readFileSync(path.resolve(settings.root, 'package.json'));
  // const jsonPackage = JSON.parse(rawPackage);

  // if ( jsonPackage?.eslintConfig ) {
  //   return true;
  // }

  // return false;
}