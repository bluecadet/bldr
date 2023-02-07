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

export default function postCSSfromBuffer(buffer, file, configObject, rootConfig) {
  return new Promise((resolve, reject) => {
    const fileContent = buffer.toString();
    const fileName    = basename(file);
    const fileBase    = basename(file, extname(file));
    const writeFileName = `${fileBase}.css`;
    const mapOpts     = rootConfig.settings.env === 'dev' ? { inline: false } : false;
    const dest        = configObject.dest;
    const start       = Date.now();


    // Pass context to postcss config file
    const ctx = {
      bldrEnv: rootConfig.settings.env,
      isWatch: rootConfig.settings.isWatch,
    };

    // Load postcss config, process css
    postcssrc(ctx).then(({ plugins, options }) => {
      postcss(plugins)
        .process(fileContent, {
          syntax: options?.syntax ?? syntax,
          from:   file,
          to:     writeFileName,
          map:    options?.map ?? mapOpts,
        })
        .then(result => {
          // Error if no css is present
          if ( !result?.css ) {
            handleProcessError(`postcss`, `${fileName} does not contain css...`);
          }

          fsx.ensureDirSync(dest);

          try {
            fs.writeFileSync(join(dest, writeFileName), result.css);
          } catch (err) {
            console.log(err);
            // Error if can't write file
            const writeFileErrOpts = rootConfig.settings.isWatch ? {} : { throwError: true, exit: true };
            handleProcessError(`postcss`, `error writing ${fileName} to ${dest}`, writeFileErrOpts);
            reject({error: true});
          }

          // Write maps if dev or watch
          if ( mapOpts ) {
            if (result.map) {
              try {
                fs.writeFileSync(`${join(dest, writeFileName)}.map`, result.map.toString())
              } catch (err) {
                // Error if can't write file
                const writeMapsErrOpts = rootConfig.settings.isWatch ? {} : { throwError: true, exit: true };
                handleProcessError(`postcss`, `error writing ${fileName} map file to ${dest}`, writeMapsErrOpts);
                reject({error: true});
              }
            }
          }

          const stop = Date.now();

          // All Done, no complaints
          handleProcessSuccess('postcss', `${fileName} processed`, ((stop - start)/1000));

          resolve({error: false});

        })
        .catch(err => {
          handleProcessError(`postcss`, postCssErrMessage(err));
          reject({error: true});
        })
    })
  });
}