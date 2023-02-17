// import util from 'node:util';

import { rollup } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';

import { resolve, join, basename } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { handleProcessWarn, handleProcessSuccess, handleProcessError, handleProcessAction } from '../utils/reporters.js';
import { checkMissingConfigKeys } from "../utils/checkMissingConfigKeys.js";
import { processEsLint } from './esLint.js';
import { testBabelConfig } from '../utils/testBabelConfig.js';

import { createRequire } from 'node:module';
const require    = createRequire(import.meta.url);
const fg         = require('fast-glob');
const { minify } = require("terser");


async function handleJsFile(rollupFileConfig) {
  let bundle;
  let buildFailed = false;

  try {
    // create a bundle
    bundle = await rollup(rollupFileConfig.inputOptions);
    await bundle.generate(rollupFileConfig.outputOptions);

  } catch (error) {
    buildFailed = true;
    console.error(error);
    handleProcessError('rollup', `An error occured while creating the bundle for ${rollupFileConfig.fileName}`, { throwError: true });
  }

  if (bundle) {
    await bundle.close();

    handleProcessSuccess('rollup', `${rollupFileConfig.fileName} processed`);

    if ( rollupFileConfig.useTerser ) {
      // Minify with terser
      try {
        const terserStart     = Date.now();
        const bundledFileData = readFileSync(rollupFileConfig.outputOptions.file, 'utf8');
        const result          = await minify(bundledFileData, rollupFileConfig.terserOptions);

        writeFileSync(rollupFileConfig.outputOptions.file, result.code, "utf8");
        const terserStop = Date.now();

        handleProcessSuccess('terser', `${rollupFileConfig.fileName} minified`, `${(terserStop - terserStart)/1000}s`);

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
  // let errorCaught = false;

  for (const file of entries) {
    const fileConfig = {...rollupConfig};
    fileConfig.fileName = basename(file);
    fileConfig.inputOptions.input = file;
    fileConfig.outputOptions.file = resolve(join(configObject.dest, fileConfig.fileName));
    await handleJsFile(fileConfig);
  }
}



/**
 * Create config for esBuild based on bldrConfig settings
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
    rollupConfig.outputOptions.format = 'es';
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



// async function build(fileName, inputOptions, outputOptions, config) {
//   const { rollup } = config?.rollupOverride ? config.rollupOverride : require('rollup');
//   let bundle;
//   let buildFailed = false;

//   try {
//     // create a bundle
//     const start = Date.now();
//     bundle = await rollup(inputOptions);
//     await bundle.write(outputOptions);
//     const stop = Date.now();

//     handleMessageSuccess('rollup', `${fileName} processed`, `${(stop - start)/1000}s`);

//     const useTerser = config?.useTerser ? config.useTerser : true;

//     if (useTerser) {
//       const terserStart = Date.now();
//       const { minify } = require("terser");
//       const terserOptions = config?.terserOptions ? {...config.terserOptions} : {};

//       // fs.writeFileSync(outputOptions.file, await minify(fs.readFileSync(outputOptions.file, "utf8"), terserOptions).code, "utf8");

//       const bundledFileData = fs.readFileSync(outputOptions.file, 'utf8');
//       const result = await minify(bundledFileData, terserOptions);
//       const terserStop = Date.now();
//       try {
//         fs.writeFileSync(outputOptions.file, result.code, "utf8");
//         handleMessageSuccess('terser', `${fileName} minified`, `${(terserStop - terserStart)/1000}s`);
//       } catch(err) {
//         handleThrowMessageError('terser', 'Build Error', err);
//       }

//     }

//   } catch (error) {
//     buildFailed = true;
//     // do some error reporting
//     console.error(error);
//   }

//   if (bundle) {
//     // closes the bundle
//     await bundle.close();
//   }

//   if ( buildFailed ) {
//     throw new Error(`build failed for ${inputOptions.file}`);
//   }

// }


// async function handleRollupFile(config, file) {
//   const fileName = path.basename(file);

//   // Default Input Options
//   let inputOptions = {
//     input: file,
//   };

//   if ( config?.inputOptions ) {
//     inputOptions = {...inputOptions, ...config.inputOptions};
//   }

//   // Input Plugins
//   let inputPlugins = [];
//   const userOverrideInputPlugins = config?.overrideInputPlugins;

//   if (userOverrideInputPlugins) {
//     // Allow override of input plugins
//     inputPlugins = [...config.inputPlugins];

//   } else {
//     // Use Default Plugins
//     inputPlugins.push(commonjs());

//     if ( testAllowBabel(config) ) {
//       // Allow babel plugin options override
//       const babelPluginOptions = config?.babelPluginOptions ? config.babelPluginOptions : { babelHelpers: 'bundled', exclude: [/\/core-js\//], };
//       inputOptions.external = inputOptions?.external ? inputOptions.external : [/@babel\/runtime/];
//       inputPlugins.push(babel(babelPluginOptions));
//     }

//     inputPlugins.push(nodeResolve({
//       mainFields: ['main', 'module'],
//     }));

//     if ( config?.inputPlugins ) {
//       inputPlugins = [...inputPlugins, ...config.inputPlugins];
//     }
//   }

//   // Set input plugins
//   inputOptions.plugins = inputPlugins;


//   // Output Options
//   let outputOptions = {
//     format: 'es',
//     file: path.resolve(path.join(config.to, fileName))
//   }

//   if ( config?.outputOptions ) {
//     outputOptions = {...outputOptions, ...config.outputOptions};
//   }

//   // Output Plugins
//   let outputPlugins = [];
//   const userOverrideOutputPlugins = config?.overrideOutputPlugins;

//   if (userOverrideOutputPlugins) {
//     // Allow override of output plugins
//     outputPlugins = [...config.overrideOutputPlugins];

//   } else {
//     // If default output options, add them here
//   }

//   // Set output plugins
//   outputOptions.plugins = outputPlugins;

//   await build(fileName, inputOptions, outputOptions, config);
// }


// function testAllowBabel(config) {

//   if ( config?.omitBabel ) {
//     return false;
//   }

//   let configExists = false;
//   const root = process.cwd();

//   const configFiles = [
//     'babel.config.json',
//     'babel.config.js',
//     'babel.config.cjs',
//     'babel.config.mjs',
//     '.babelrc.json',
//     '.babelrc.js',
//     '.babelrc.cjs',
//     '.babelrc.mjs',
//     '.babelrc',
//   ];

//   configFiles.forEach(file => {
//     const filePath = path.resolve(root, file);

//     if ( fs.existsSync(filePath) ) {
//       configExists = true;
//     }
//   });

//   if ( configExists ) {
//     return true;
//   }

//   const rawPackage = fs.readFileSync(path.resolve(root, 'package.json'));
//   const jsonPackage = JSON.parse(rawPackage);

//   if ( jsonPackage?.babel ) {
//     return true;
//   }

//   return false;
// }

// async function runRollupFiles(config) {
//   const entries = fg.sync([path.resolve(config.from)], { dot: true });

//   for (const file of entries) {
//     await handleRollupFile(config, file);
//   }

//   handleProcessSuccess('Rollup complete!');
// }


// function runRollup(config) {
//   runEsLint(config)
//     .then(() => {
//       runRollupFiles(config)
//     })
// }

// module.exports = runRollup;