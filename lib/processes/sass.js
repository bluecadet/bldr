import colors from 'colors';

import { handleProcessWarn, handleProcessSuccess, handleProcessError, handleProcessAction } from '../utils/reporters.js';
import { postCSSfromBuffer } from './postCssFromBuffer.js';
import { basename } from 'node:path';
import { checkMissingConfigKeys } from "../utils/checkMissingConfigKeys.js";

import { createRequire } from 'node:module';
const require      = createRequire(import.meta.url);
const globImporter = require('node-sass-glob-importer');
const sass         = require('node-sass');
const fg           = require('fast-glob');

function sassErrMessage(err, file) {
  return `
  ${colors.white(                 `File:   ${file}`)}
  ${err?.line ? `${colors.white(  `line:   ${err.line}`)}` : ''}
  ${err?.column ? `${colors.white(`column: ${err.column}`)}` : ''}

  ${colors.red(err.formatted)}
`
}


async function handleSassFile(file, configObject, rootConfig) {

  try {
    const processStart  = new Date().getTime();
    const mapOpts    = rootConfig.settings.env === 'dev' ? true : false;
    const sassResult = sass.renderSync({
      importer: globImporter(),
      file: file,
      outputStyle: 'compact',
      sourceMap: mapOpts,
    });

    const processEnd  = new Date().getTime();

    handleProcessSuccess('sass', `${basename(file)} compiled`, `${(processEnd - processStart) / 1000}`);

    await postCSSfromBuffer(sassResult.css, file, configObject, rootConfig);

  } catch(err) {

    if ( rootConfig.settings.env === 'build' ) {
      console.log(sassErrMessage(err, file));
      handleProcessError('sass', `${file} cannot be processed due to above error`, {throwError: true, exit: true});

    } else {
      handleProcessWarn('sass', `${file} cannot be processed due to an error:`);
      console.log(sassErrMessage(err, file));

    }
  }
}



async function handleConfigObjectGlobs(configObject, rootConfig) {
  // Process Globs
  const entries = fg.sync([configObject.src], { dot: true });
  // let errorCaught = false;

  for (const file of entries) {
    await handleSassFile(file, configObject, rootConfig);
  }
}


// The primary function to call when processing sass
export const processSass = async (config, bsInstance = false) => {

  // Return if sass is not present
  if ( !config?.processes?.sass ) {
    return { notRan: true };
  }

  for await (const configObject of config.processes.sass) {

    const missingKeys = checkMissingConfigKeys(configObject);

    if ( missingKeys ) {
      handleProcessWarn('sass', missingKeys);
      return { warn: true };
    }

    await handleConfigObjectGlobs(configObject, config);
  }

  if (bsInstance) {
    bsInstance.stream({match: "**/*.css"});
  }

  handleProcessAction('sass', `sass complete!`);

  return { success: true };
}