// const { rollup } = require('rollup');
const { babel }  = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const {terser} = require('rollup-plugin-terser');
const {nodeResolve} = require('@rollup/plugin-node-resolve');
// const eslint = require('@rollup/plugin-eslint');
const runEsLint = require('../processes/eslint');
const glob   = require("glob");
const colors = require('colors');
const path = require('path');
const fs = require('fs');
const fg = require('fast-glob');
const rootPath = process.cwd();


async function build(fileName, inputOptions, outputOptions, rollupOverride) {
  let bundle;
  let buildFailed = false;
  const { rollup } = rollupOverride ? rollupOverride : require('rollup');

  try {
    // create a bundle
    const start = Date.now();
    bundle = await rollup(inputOptions);
    await bundle.write(outputOptions);
    const stop = Date.now();

    console.log(
      `${colors.white('[')}${colors.blue('rollup')}${colors.white(']')}  ${colors.cyan(`${fileName} processed`)} ${colors.gray(`${(stop - start)/1000}s`)}`
    );

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

  let inputOptions = {
    input: file,
    plugins: [],
  };

  const inputPlugins = [commonjs()];

  if ( fs.existsSync(path.join(rootPath, '.babelrc.json')) || fs.existsSync(path.join(rootPath, 'babel.config.json')) ) {
    inputPlugins.push(babel({ babelHelpers: 'bundled' }));
  }

  inputPlugins.push(nodeResolve({
    mainFields: ['main', 'module'],
  }));

  inputOptions         = {...inputOptions, ...config.userSetInputOptions};
  inputOptions.plugins = [...inputPlugins, ...inputOptions.plugins];

  let outputOptions = {
    format: 'es',
    file: path.resolve(path.join(config.to, fileName)),
    plugins: [],
  }

  const outputPlugins = [];

  outputOptions         = {...outputOptions, ...config.userSetOutputOptions};
  outputOptions.plugins = [...outputPlugins, ...outputOptions.plugins];

  await build(fileName, inputOptions, outputOptions, config.rollupOverride);
}

async function runRollupFiles(config) {
  const entries = fg.sync([path.resolve(config.from)], { dot: true });

  for (const file of entries) {
    await handleRollupFile(config, file);
  }

  console.log('Rollup complete!'.green);
}


function runRollup(config) {
  runEsLint(config)
    .then(() => {
      runRollupFiles(config)
    })
}

module.exports = runRollup;