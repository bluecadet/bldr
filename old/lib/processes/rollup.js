import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const { babel }       = require('@rollup/plugin-babel');
const commonjs        = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const runEsLint       = require('./eslint');
const colors          = require('colors');
const path            = require('path');
const fs              = require('fs');
const fg              = require('fast-glob');
const rootPath        = process.cwd();

const {handleProcessSuccess, handleMessageSuccess, handleMessageError, handleThrowMessageError, handleProcessWarn} = require('../utils/handleMessaging');


async function build(fileName, inputOptions, outputOptions, config) {
  const { rollup } = config?.rollupOverride ? config.rollupOverride : require('rollup');
  let bundle;
  let buildFailed = false;

  try {
    // create a bundle
    const start = Date.now();
    bundle = await rollup(inputOptions);
    await bundle.write(outputOptions);
    const stop = Date.now();

    handleMessageSuccess('rollup', `${fileName} processed`, `${(stop - start)/1000}s`);

    const useTerser = config?.useTerser ? config.useTerser : true;

    if (useTerser) {
      const terserStart = Date.now();
      const { minify } = require("terser");
      const terserOptions = config?.terserOptions ? {...config.terserOptions} : {};

      // fs.writeFileSync(outputOptions.file, await minify(fs.readFileSync(outputOptions.file, "utf8"), terserOptions).code, "utf8");

      const bundledFileData = fs.readFileSync(outputOptions.file, 'utf8');
      const result = await minify(bundledFileData, terserOptions);
      const terserStop = Date.now();
      try {
        fs.writeFileSync(outputOptions.file, result.code, "utf8");
        handleMessageSuccess('terser', `${fileName} minified`, `${(terserStop - terserStart)/1000}s`);
      } catch(err) {
        handleThrowMessageError('terser', 'Build Error', err);
      }

    }

  } catch (error) {
    buildFailed = true;
    // do some error reporting
    console.error(error);
  }

  if (bundle) {
    // closes the bundle
    await bundle.close();
  }

  if ( buildFailed ) {
    throw new Error(`build failed for ${inputOptions.file}`);
  }

}


async function handleRollupFile(config, file) {
  const fileName = path.basename(file);

  // Default Input Options
  let inputOptions = {
    input: file,
  };

  if ( config?.inputOptions ) {
    inputOptions = {...inputOptions, ...config.inputOptions};
  }

  // Input Plugins
  let inputPlugins = [];
  const userOverrideInputPlugins = config?.overrideInputPlugins;

  if (userOverrideInputPlugins) {
    // Allow override of input plugins
    inputPlugins = [...config.inputPlugins];

  } else {
    // Use Default Plugins
    inputPlugins.push(commonjs());

    if ( testAllowBabel(config) ) {
      // Allow babel plugin options override
      const babelPluginOptions = config?.babelPluginOptions ? config.babelPluginOptions : { babelHelpers: 'bundled', exclude: [/\/core-js\//], };
      inputOptions.external = inputOptions?.external ? inputOptions.external : [/@babel\/runtime/];
      inputPlugins.push(babel(babelPluginOptions));
    }

    inputPlugins.push(nodeResolve({
      mainFields: ['main', 'module'],
    }));

    if ( config?.inputPlugins ) {
      inputPlugins = [...inputPlugins, ...config.inputPlugins];
    }
  }

  // Set input plugins
  inputOptions.plugins = inputPlugins;


  // Output Options
  let outputOptions = {
    format: 'es',
    file: path.resolve(path.join(config.to, fileName))
  }

  if ( config?.outputOptions ) {
    outputOptions = {...outputOptions, ...config.outputOptions};
  }

  // Output Plugins
  let outputPlugins = [];
  const userOverrideOutputPlugins = config?.overrideOutputPlugins;

  if (userOverrideOutputPlugins) {
    // Allow override of output plugins
    outputPlugins = [...config.overrideOutputPlugins];

  } else {
    // If default output options, add them here
  }

  // Set output plugins
  outputOptions.plugins = outputPlugins;

  await build(fileName, inputOptions, outputOptions, config);
}


function testAllowBabel(config) {

  if ( config?.omitBabel ) {
    return false;
  }

  let configExists = false;
  const root = process.cwd();

  const configFiles = [
    'babel.config.json',
    'babel.config.js',
    'babel.config.cjs',
    'babel.config.mjs',
    '.babelrc.json',
    '.babelrc.js',
    '.babelrc.cjs',
    '.babelrc.mjs',
    '.babelrc',
  ];

  configFiles.forEach(file => {
    const filePath = path.resolve(root, file);

    if ( fs.existsSync(filePath) ) {
      configExists = true;
    }
  });

  if ( configExists ) {
    return true;
  }

  const rawPackage = fs.readFileSync(path.resolve(root, 'package.json'));
  const jsonPackage = JSON.parse(rawPackage);

  if ( jsonPackage?.babel ) {
    return true;
  }

  return false;
}

async function runRollupFiles(config) {
  const entries = fg.sync([path.resolve(config.from)], { dot: true });

  for (const file of entries) {
    await handleRollupFile(config, file);
  }

  handleProcessSuccess('Rollup complete!');
}


function runRollup(config) {
  runEsLint(config)
    .then(() => {
      runRollupFiles(config)
    })
}

module.exports = runRollup;