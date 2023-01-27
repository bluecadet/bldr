import { settings } from '../settings/bldrSettings.js';
import flattenProcesses from './flattenProcesses.js';
import { handleErrorMessage, handleErrorWarn } from './reporters.js';
import { existsSync } from 'node:fs';
import * as path from 'path';


/**
 * Get bldrconfig data
 *
 * @param {object} bldrCommand bldrCommand object from CLI options
 * @returns object
 */
export async function getConfigData(bldrCommand) {
  const configPath = path.join(settings.root, settings.filename);

  if (!existsSync(configPath)) {
    handleErrorMessage('bldr', `${settings.filename} does not exist.`, {throwError: true, exit: true});
  };

  const rootConfig = await import(configPath);
  const config     = {
    rootConfig: rootConfig.default, // All of the config
    processes: {},                  // Target process config
    settings: {
      env: bldrCommand.bldrEnv,
      isWatch: bldrCommand.settings?.watch
    }
  };

  let targetProcessConfig = false;

  // bldrEnv Config
  if ( bldrCommand.bldrEnv === 'dev' ) {
    // if dev is set, use it as the base
    const devConfig = config.rootConfig?.dev || config.rootConfig;

    if ( bldrCommand.settings?.key ) {
      // Handle a specific key form the cli
      const targetDevProcessKey = bldrCommand.settings.key;
      if ( targetDevProcessKey in devConfig ) {
        targetProcessConfig = devConfig[targetDevProcessKey];
      } else {
        handleErrorMessage('bldr', `${targetDevProcessKey} is not a configured process key in config.`, {throwError: true, exit: true});
      }


    } else if ( bldrCommand.settings?.env ) {
      // Handle a env key form the cli
      const targetDevEnvKey = bldrCommand.settings.env;
      if ( devConfig?.env && targetDevEnvKey in devConfig.env ) {
        targetProcessConfig = devConfig.env[targetDevEnvKey];
      } else {
        handleErrorMessage('bldr', `${targetDevEnvKey} is not a configured 'env' key in config.`, {throwError: true, exit: true});
      }

    } else {
      // All of the config
      targetProcessConfig = devConfig;

    }

  } else {
    // if build is set, use it as the base
    const buildConfig = config.rootConfig?.build || config.rootConfig;

    if ( bldrCommand.settings?.key ) {
      // Handle a specific key form the cli
      const targetBuildProcessKey = bldrCommand.settings.key;
      if ( targetBuildProcessKey in buildConfig ) {
        targetProcessConfig = buildConfig[targetBuildProcessKey];
      } else {
        handleErrorMessage('bldr', `${targetBuildProcessKey} is not a configured process key in config.`, {throwError: true, exit: true});
      }

    } else {
      // All of the config
      targetProcessConfig = buildConfig;

    }
  }

  if ( targetProcessConfig ) {
    const processData = await flattenProcesses(targetProcessConfig);
    config.processes  = processData.flatProcesses;
    config.watchPaths = processData.watchPaths;
  }

  return config;
}


/**
 * Get local config file
 *
 * @param {object} bldrCommand bldrCommand object from CLI options
 * @returns false|object
 */
export async function getLocalConfigData(bldrCommand) {
  const configPath = path.join(settings.root, settings.localFilename);

  if (existsSync(configPath)) {
    const localConfig = await import(configPath);
    return localConfig.default;

  } else {

    let msg = `${settings.localFilename} does not exist.`;

    // if ( bldrCommand.settings?.watch ) {
    //   msg = msg + ' Browsersync cannot be intialized.';
    // }

    handleErrorWarn('bldr', msg);

    return false;
  };
}