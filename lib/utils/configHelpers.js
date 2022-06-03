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

module.exports = {
  getConfigData,
  handleConfigPluginArray
}