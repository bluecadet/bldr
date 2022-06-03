const esBuild = require('esbuild');
const glob    = require("glob");
const path    = require('path');
const colors  = require('colors');
const fg      = require('fast-glob');
// const { resolve } = require('path');


async function handleEsBuildFile(file, plugins, config) {
  const fileName = path.basename(file);
  const start    = Date.now()

  esBuild
    .build({
      entryPoints: [file],
      bundle: true,
      outfile: path.join(config.to, fileName),
      sourcemap: true,
      plugins: plugins,
    })

  const stop = Date.now();
  console.log(`${colors.white('[')}${colors.blue('esBuild')}${colors.white(']')} ${colors.cyan(`${fileName} processed`)} ${colors.gray(`${(stop - start)/1000}s`)}`);
}

async function handleRun(config) {
  const defaultPlugins = [];

  const plugins = config?.overridePlugins && config?.plugins
        ? [...config.plugins]
        : config?.plugins
          ? [...defaultPlugins, ...config.plugins]
          : defaultPlugins;

  const entries = fg.sync([config.from], { dot: true });

  const promises = entries.map(file => handleEsBuildFile(file, plugins, config));
  await Promise.all(promises);
  console.log(`esBuild complete`.green);
}

/**
 * config = {
 *   plugins        : pluginData,
 *   overridePlugins: configOverridePlugins,
 *   root           : process.cwd(),
 *   minify         : false,
 *   usemaps        : true,
 *   from:          : 'some/path/glob/*.js'
 *   to:            : 'some/path'
 * }
 */
function runEsBuild(config) {

  return new Promise((resolve, reject) => {
    handleRun(config);
    resolve();
  });
}

module.exports = runEsBuild;