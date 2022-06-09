const path = require('path');
const fs = require('fs');

function getConfigData() {
  const configPath = path.join(process.cwd(), 'bldrConfig.js');

  if (!fs.existsSync(configPath)) {
    throw new Error('bldrConfig.js does not exist.'.red);
  };

  return require(configPath);
}

function handleConfigPluginArray(defaultPlugins, config) {
  if (config?.overridePlugins && config?.plugins) {
    return [...config.plugins]
  }

  if ( config?.plugins ) {
    return [...defaultPlugins, ...config.plugins]
  }

  return defaultPlugins;
}


function getPostCssConfig() {
  const configPath = path.join(process.cwd(), 'postcss.config.js');
  let postCssConfig;

  if (fs.existsSync(configPath)) {
    postCssConfig = require(configPath);
  } else {
    postCssConfig = require('./defaultConfig/_postcss.config');
  }

  console.log(postCssConfig);

}

module.exports = {
  getConfigData,
  handleConfigPluginArray,
  getPostCssConfig
}