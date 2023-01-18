const path    = require('path');
const colors  = require('colors');
const fg      = require('fast-glob');
const {handleProcessSuccess, handleMessageSuccess, handleThrowMessageError} = require('../utils/handleMessaging');

async function handleEsBuildFile(file, plugins, config) {
  const esBuild = config?.overrideEsBuild ? config.overrideEsBuild : require('esbuild');
  const fileName = path.basename(file);

  esBuild
    .build({
      entryPoints: [file],
      bundle: true,
      outfile: path.join(config.to, fileName),
      sourcemap: true,
      plugins: plugins,
    })

  // const stop = Date.now();
  // handleMessageSuccess('esBuild', `${fileName} processed`, ((stop - start)/1000));
  handleMessageSuccess('esBuild', `${fileName} processed`);
}

async function handleRun(config) {

  const defaultPlugins = [];

  const plugins = config?.overridePlugins && config?.plugins
        ? [...config.plugins]
        : config?.plugins
          ? [...defaultPlugins, ...config.plugins]
          : defaultPlugins;

  const entries  = fg.sync([config.from], { dot: true });
  const promises = entries.map(file => handleEsBuildFile(file, plugins, config));
  await Promise.all(promises);
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
const runEsBuild = async function(config) {
  return await handleRun(config);
}

module.exports = runEsBuild;