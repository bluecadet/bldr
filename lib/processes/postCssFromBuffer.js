import { syntax } from '../settings/bldrSettings.js';
import { basename, extname, join } from 'node:path';
import { createRequire } from 'node:module';
import util from 'node:util';

import { handleProcessError, handleProcessSuccess } from '../utils/reporters.js';

const require   = createRequire(import.meta.url);
const postcss   = require('postcss');
const colors    = require('colors');
const fs        = require('fs');
const fsx       = require('fs-extra');
const postcssrc = require('postcss-load-config');

function postCssErrMessage(err) {
  return `${colors.red(`Error proccessing file ./${err.file}`)}
${colors.white('reason:')} ${colors.red(err.reason)}${err?.line ? `
${colors.white('line:')} ${colors.red(err.line)}` : ''}${err?.columns ? `
${colors.white('columns:')} ${colors.red(err.columns)}` : ''}
${colors.white('error:')} ${err}
`
}

export const postCSSfromBuffer = async (buffer, file, configObject, rootConfig) => {

  const fileContent = buffer.toString();
  const fileName    = basename(file);
  const fileBase    = basename(file, extname(file));
  const writeFileName = `${fileBase}.css`;
  const mapOpts     = rootConfig.settings.env === 'dev' ? { inline: false } : false;
  const dest        = configObject.dest;
  const start       = Date.now();
  const result      = {};


  // Pass context to postcss config file
  const ctx = {
    bldrEnv: rootConfig.settings.env,
    isWatch: rootConfig.settings.isWatch,
  };

  const postCSSConfig = await postcssrc(ctx);

  try {
    const postCssResult = await postcss(postCSSConfig.plugins).process(fileContent, {
      syntax: postCSSConfig.options?.syntax ?? syntax,
      from:   file,
      to:     writeFileName,
      map:    postCSSConfig.options?.map ?? mapOpts,
    });

    if ( !postCssResult?.css ) {
      handleProcessError(`postcss`, `${fileName} does not contain css...`);
      return false;
    }

    fsx.ensureDirSync(dest);

    try {
      fs.writeFileSync(join(dest, writeFileName), postCssResult.css);
    } catch (err) {
      console.log(err);
      // Error if can't write file
      const writeFileErrOpts = rootConfig.settings.isWatch ? {} : { throwError: true, exit: true };
      handleProcessError(`postcss`, `error writing ${fileName} to ${dest}`, writeFileErrOpts);
      return {error: true};
    }

    if ( mapOpts ) {
      if (postCssResult.map) {
        try {
          fs.writeFileSync(`${join(dest, writeFileName)}.map`, postCssResult.map.toString())
        } catch (err) {
          // Error if can't write file
          const writeMapsErrOpts = rootConfig.settings.isWatch ? {} : { throwError: true, exit: true };
          handleProcessError(`postcss`, `error writing ${fileName} map file to ${dest}`, writeMapsErrOpts);
          return {error: true};
        }
      }
    }

    const stop = Date.now();

    handleProcessSuccess('postcss', `${fileName} processed`, ((stop - start)/1000));

    return {success: true};

  } catch(err) {
    if ( err?.file ) {
      // Postcss error messaging
      handleMessageError(`postcss`, postCssErrMessage(err), true);
    } else {
      // General error caught
      console.log(err);
    }

    // Allow process to continue if watch is running
    if ( rootConfig.settings.isWatch ) {
      return { error: true, warn: true };
    }

    process.exit(1);

  }
}