import { resolve } from 'path';
import { testEslintConfig } from '../utils/testEslintConfig.js';
import { handleProcessError, handleProcessSuccess } from '../utils/reporters.js';

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { ESLint } = require("eslint");
const fg         = require('fast-glob');

async function handleLintFile(testFiles, rootConfig, src) {

  try {

    const eslintOptions = rootConfig?.processSettings?.eslint?.options || {};
    const eslint        = new ESLint(eslintOptions);
    const results       = await eslint.lintFiles(testFiles, {warnIgnored: true});
    const formatter     = await eslint.loadFormatter("stylish");
    const resultText    = formatter.format(results);

    results.forEach(res => {

      if ( res.errorCount > 0 ) {
        if ( rootConfig.settings.isWatch || rootConfig?.processSettings?.eslint?.forceBuildIfError ) {
          console.log(resultText);
          if ( !rootConfig.settings.isWatch && rootConfig?.processSettings?.eslint?.forceBuildIfError ) {
            handleProcessError('eslint', `Errors found in Eslint, but build forced in config`);
          }
        } else {
          console.log(resultText);
          handleProcessError('eslint', `Errors found in Eslint - process aborted`, { throwError: true, exit: true});
        }
      }
    });

  } catch(err) {

    if ( rootConfig.settings.isWatch || rootConfig?.processSettings?.eslint?.forceBuildIfError ) {
      console.log(err);
    } else {
      console.log(err);
      process.exit(1);
    }
  }

}


async function handleConfigObjectGlobs(configObject, rootConfig) {
  // Process Globs
  const entries = fg.sync([configObject.src], { dot: true });

  for await (const file of entries) {
    let testFiles = [file];

    if ( configObject?.watch ) {
      testFiles = [...configObject.watch, file];
    }

    await handleLintFile(testFiles, rootConfig, configObject.src);
  }
}



export const processEsLint = async (config) => {

  const allowLinting = await testEslintConfig(config);

  if ( !allowLinting ) return false;

  for await (const configObject of config.processes.js) {
    await handleConfigObjectGlobs(configObject, config);
  }

}