import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const path = require('path');
const fs = require('fs');

/**
 * Get bldrconfig data
 *
 * @returns object
 */
function getConfigData() {
  const configPath = path.join(process.cwd(), 'bldrConfig.js');

  if (!fs.existsSync(configPath)) {
    throw new Error('bldrConfig.js does not exist.'.red);
  };

  return require(configPath);
}


/**
 * Override existing plugin array or add to existing array.
 *
 * @param {array} defaultPlugins base array
 * @param {array} config config object
 * @returns array
 */
function handleConfigPluginArray(defaultPlugins, config) {
  if (config?.overridePlugins && config?.plugins) {
    return [...config.plugins]
  }

  if ( config?.plugins ) {
    return [...defaultPlugins, ...config.plugins]
  }

  return defaultPlugins;
}

/**
 * Get dev config based on env flag
 *
 * @param {object} args yargs argument object
 * @returns object
 */
function getDevConfigData(args) {
  const configRootData = getConfigData();
  let configData       = configRootData?.dev || configRootData?.build || configRootData;
  let envKey           = false;

  // Check if a `env` flag was ran
  if ( args.e || args.env ) {
    envKey = args.e || args.env;

    // Check if env key is in config
    if ( configData?.env && envKey in configData.env ) {
      // Use the env paths instead of `dev` paths
      configData = configData.env[envKey];
    } else {
      // Key does not exist. Exit process and prompt user to start again.
      console.log(`The ${envKey} key does not exist in dev. Please add in config and try again.`.red);
      process.exit();
    }
  }

  if ( configRootData?.eslint ) {
    configData.eslint = configRootData.eslint;
  }

  return ({configRootData, configData, envKey})
}

module.exports = {
  getConfigData,
  handleConfigPluginArray,
  getDevConfigData,
}