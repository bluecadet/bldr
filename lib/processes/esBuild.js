// import util from 'node:util';

import * as esBuild from 'esbuild'

import { join, basename } from 'path';
import { handleProcessWarn, handleProcessSuccess, handleProcessError, handleProcessAction } from '../utils/reporters.js';
import { checkMissingConfigKeys } from "../utils/checkMissingConfigKeys.js";
import { processEsLint } from './esLint.js';

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const fg      = require('fast-glob');


async function handleJsFile(file, configObject, esBuildConfig) {

  try {
    const fileName = basename(file);
    const result   = await esBuild
      .build({
        entryPoints: [file],
        bundle: true,
        outfile: join(configObject.dest, fileName),
        sourcemap: true,
        plugins: esBuildConfig.plugins,
      });


    // const stop = Date.now();
    // handleMessageSuccess('esBuild', `${fileName} processed`, ((stop - start)/1000));
    handleProcessSuccess('esBuild', `${fileName} processed`);

  } catch(err) {
    console.log(err);
  }

}


async function handleConfigObjectGlobs(configObject, esBuildConfig) {
  // Process Globs
  const entries = fg.sync([configObject.src], { dot: true });
  // let errorCaught = false;

  for (const file of entries) {
    await handleJsFile(file, configObject, esBuildConfig);
  }
}


/**
 * Create config for esBuild based on bldrConfig settings
 *
 * @param {object} config bldr config
 * @returns object
 */
async function createEsBuildSettings(config) {
  // console.log(util.inspect(config, {showHidden: false, depth: null, colors: true}));

  const esBuildConfig = {
    plugins: [],
  }

  // Saving in case defaults are needed one day...
  // if ( config.processSettings?.esBuild?.overridePlugins ) {
  //   esBuildConfig.plugins = [];
  // }

  if ( config.processSettings?.esBuild?.plugins && Array.isArray(config.processSettings.esBuild.plugins) ) {
    for await (const plugin of config.processSettings.esBuild.plugins) {
      esBuildConfig.plugins.push(plugin);
    }
  }

  return esBuildConfig;
}


/**
 * Run the esBuild Process
 *
 * @param {object} config bldrConfig
 * @param {object|boolean} bsInstance browsersync instance
 * @returns object|null|error
 */
export const processEsBuild = async (config, bsInstance) => {

  // Return if sass is not present
  if ( !config?.processes?.js ) {
    return { notRan: true };
  }

  await processEsLint(config);

  const esBuildConfig = await createEsBuildSettings(config);

  for await (const configObject of config.processes.js) {
    const missingKeys = checkMissingConfigKeys(configObject);

    if ( missingKeys ) {
      handleProcessWarn('esbuild', missingKeys);
      return { warn: true };

    }

    await handleConfigObjectGlobs(configObject, esBuildConfig, config);
  }


  if (bsInstance) {
    bsInstance.reload();
  }

  handleProcessAction('esBuild', `esBuild complete!`);

  return { success: true };
}