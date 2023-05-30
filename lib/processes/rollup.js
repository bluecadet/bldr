// import util from 'node:util';

import { rollup } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import injectProcessEnv from 'rollup-plugin-inject-process-env';

import { resolve, join, basename } from 'node:path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { handleProcessWarn, handleProcessSuccess, handleProcessError, handleProcessAction } from '../utils/reporters.js';
import { checkMissingConfigKeys } from "../utils/checkMissingConfigKeys.js";
import { processEsLint } from './esLint.js';
import { testBabelConfig } from '../utils/testBabelConfig.js';

import { createRequire } from 'node:module';
const require     = createRequire(import.meta.url);
const fg          = require('fast-glob');
const { minify }  = require("terser");


async function handleJsFile(rollupFileConfig) {
  let bundle;
  let buildFailed = false;
  let buildStart = 0;
  let buildEnd = 0;

  try {
    buildStart = new Date().getTime();
    // create a bundle
    bundle = await rollup(rollupFileConfig.inputOptions);
    await bundle.write(rollupFileConfig.outputOptions);

  } catch (error) {
    buildFailed = true;
    console.error(error);
    handleProcessError('rollup', `An error occured while creating the bundle for ${rollupFileConfig.fileName}`, { throwError: true });
  }

  if (bundle) {

    await bundle.close();
    buildEnd = new Date().getTime();

    handleProcessSuccess('rollup', `${rollupFileConfig.fileName} processed`, `${(buildEnd - buildStart)/1000}`);

    if ( rollupFileConfig.useTerser ) {
      // Minify with terser
      try {
        const terserStart     = new Date().getTime();
        const bundledFileData = readFileSync(rollupFileConfig.outputOptions.file, 'utf8');
        const result          = await minify(bundledFileData, rollupFileConfig.terserOptions);

        writeFileSync(rollupFileConfig.outputOptions.file, result.code, "utf8");
        const terserStop = new Date().getTime();

        handleProcessSuccess('terser', `${rollupFileConfig.fileName} minified`, `${(terserStop - terserStart)/1000}`);

      } catch(err) {
        console.log(err);
        handleProcessError('terser', 'Build Error', { throwError: true });
      }
    }
  }

}


async function handleConfigObjectGlobs(configObject, rollupConfig) {
  // Process Globs
  const entries = fg.sync([configObject.src], { dot: true });

  if ( !entries.length ) {
    return handleProcessWarn('rollup', `no files found in ${configObject.src}`);
  }

  for (const file of entries) {
    const fileConfig = {...rollupConfig};
    fileConfig.fileName = basename(file);
    fileConfig.inputOptions.input = file;
    fileConfig.outputOptions.file = resolve(join(configObject.dest, fileConfig.fileName));
    await handleJsFile(fileConfig);
  }
}



/**
 * Create config for rollup based on bldrConfig settings
 *
 * @param {object} config bldr config
 * @returns object
 */
async function createRollupConfig(config) {
  // console.log(util.inspect(config, {showHidden: false, depth: null, colors: true}));

  const defaultConfig = {
    babelPluginOptions: { babelHelpers: 'bundled' },
    useTerser: true,
    terserOptions: {},
    inputOptions: {
      external: [/@babel\/runtime/]
    },
    inputPlugins: false,
    overrideInputPlugins: false,
    outputOptions: {
      format: 'es',
    },
    outputPlugins: false,
    overrideOutputPlugins: false
  }

  const userSettings = config?.processSettings?.rollup;
  const rollupConfig = userSettings ? {...defaultConfig, ...config.processSettings.rollup } : defaultConfig;

  rollupConfig.useBabel = userSettings && 'useBabel' in userSettings ? userSettings.useBabel : await testBabelConfig();


  // Handle Input Plugins
  if ( !rollupConfig.overrideInputPlugins ) {
    const inputPlugins = [];

    inputPlugins.push(commonjs());
    inputPlugins.push(injectProcessEnv({
      NODE_ENV: 'production',
    }));

    if ( rollupConfig.useBabel ) {
      inputPlugins.push(babel(rollupConfig.babelPluginOptions));
    }

    inputPlugins.push(nodeResolve());

    if ( rollupConfig.inputPlugins && Array.isArray(rollupConfig.inputPlugins) ) {
      rollupConfig.inputPlugins.forEach(p => inputPlugins.push(p));
    }

    rollupConfig.inputPlugins = inputPlugins;

  } else if ( !Array.isArray(rollupConfig.inputPlugins) ) {
    rollupConfig.inputPlugins = [];
    handleProcessWarn('rollup', '`inputPlugins` value in config should be an array. Process with empty plugin array.');
  }

  rollupConfig.inputOptions.plugins = rollupConfig.inputPlugins;
  delete rollupConfig.inputPlugins;


  // Handle Output Plugins
  if ( !rollupConfig.overrideOutputPlugins ) {
    const outputPlugins = [];

    if ( rollupConfig.outputPlugins && Array.isArray(rollupConfig.outputPlugins) ) {
      rollupConfig.outputPlugins.forEach(p => outputPlugins.push(p));
    }

    rollupConfig.outputPlugins = outputPlugins;

  } else if ( !Array.isArray(rollupConfig.outputPlugins) ) {
    rollupConfig.outputPlugins = [];
    handleProcessWarn('rollup', '`outputPlugins` value in config should be an array. Process with empty plugin array.');
  }

  rollupConfig.outputOptions.plugins = rollupConfig.outputPlugins;
  delete rollupConfig.outputPlugins;

  if ( !'format' in rollupConfig.outputOptions ) {
    rollupConfig.outputOptions.format = 'iife';
  }

  return rollupConfig;
}


/**
 * Run the rollup Process
 *
 * @param {object} config bldrConfig
 * @param {object|boolean} bsInstance browsersync instance
 * @returns object|null|error
 */
export const processRollup = async (config) => {

  // Return if sass is not present
  if ( !config?.processes?.js ) {
    return { notRan: true };
  }

  await processEsLint(config);

  const rollupConfig = await createRollupConfig(config);

  for await (const configObject of config.processes.js) {
    const missingKeys = checkMissingConfigKeys(configObject);

    if ( missingKeys ) {
      handleProcessError('rollup', missingKeys, { throwError: true });
      return { error: true };
    }

    await handleConfigObjectGlobs(configObject, rollupConfig);
  }

  handleProcessAction('rollup', `rollup complete!`);

  return { success: true };
}