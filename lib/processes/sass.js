<<<<<<< HEAD
const buildPostCSSFileFromBuffer = require('./postCssFromBuffer');
const globImporter               = require('node-sass-glob-importer');
const sass                       = require('node-sass');
const fg                         = require('fast-glob');
const colors                     = require('colors');
const {handleMessageWarn} = require('../utils/handleMessaging');

function sassErrMessage(err) {
  return `
  ${colors.white(                 `File:   ${err.file}`)}
  ${err?.line ? `${colors.white(  `line:   ${err.line}`)}` : ''}
  ${err?.column ? `${colors.white(`column: ${err.column}`)}` : ''}

  ${colors.red(err.formatted)}
`
}
=======
import colors from 'colors';
>>>>>>> v1/beta-release

import { handleProcessWarn, handleProcessSuccess, handleProcessError, handleProcessAction } from '../utils/reporters.js';
import { postCSSfromBuffer } from './postCssFromBuffer.js';
import { basename } from 'node:path';
import { checkMissingConfigKeys } from "../utils/checkMissingConfigKeys.js";

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const fg      = require('fast-glob');

<<<<<<< HEAD
  const result = sass.render({
    importer: globImporter(),
    file: file,
    outputStyle: 'compact',
    sourceMap: mapOpts,
  }, (error, result) => {
    if ( error ) {
      handleMessageWarn('sass', `${file} cannot be processed due to an error:`);

      console.log(sassErrMessage(error));
      if ( !config?.isWatch ) {
        throw new Error('Sass processing error');
      }
    } else {
      buildPostCSSFileFromBuffer(result.css, file, config, syntax);
    }
  });


=======
const sassSettings = {
  processor: false,
  importer: false,
  importerOpts: {},
};

function sassErrMessage(err, file) {
  return `
  ${colors.white(                 `File:   ${file}`)}
  ${err?.line ? `${colors.white(  `line:   ${err.line}`)}` : ''}
  ${err?.column ? `${colors.white(`column: ${err.column}`)}` : ''}
>>>>>>> v1/beta-release

  ${colors.red(err.formatted)}
`
}


async function handleSassFile(file, configObject, rootConfig) {


  try {
    const processStart  = new Date().getTime();
    const mapOpts    = rootConfig.settings.env === 'dev' ? true : false;
    const sassResult = sassSettings.processor.renderSync({
      importer: sassSettings.importer(sassSettings.importerOpts),
      file: file,
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

  if ( !entries.length ) {
    return handleProcessWarn('sass', `no files found in ${configObject.src}`);
  }

  for (const file of entries) {
    await handleSassFile(file, configObject, rootConfig);
  }
}


// The primary function to call when processing sass
export const processSass = async (config) => {

  // Return if sass is not present
  if ( !config?.processes?.sass ) {
    return { notRan: true };
  }


  sassSettings.processor = config?.processSettings?.sass?.sassProcessor
                             ? config.processSettings.sass.sassProcessor
                             : require('node-sass');

  sassSettings.importer  = config?.processSettings?.sass?.importer
                             ? config.processSettings.sass.importer
                             : require('node-sass-magic-importer');

  sassSettings.importerOpts = config?.processSettings?.sass?.importerOpts
                                ? config.processSettings.sass.importerOpts
                                : {};

  for await (const configObject of config.processes.sass) {

    const missingKeys = checkMissingConfigKeys(configObject);

    if ( missingKeys ) {
      handleProcessWarn('sass', missingKeys);
      return { warn: true };
    }

    await handleConfigObjectGlobs(configObject, config);
  }

  handleProcessAction('sass', `sass complete!`);

  return { success: true };
}