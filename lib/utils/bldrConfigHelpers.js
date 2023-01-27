import { settings } from '../settings/bldrSettings.js';
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

  const config = {
    rootConfig: rootConfig.default, // All of the config
    processes: {}                   // Target process config
  };

  // bldrEnv Config
  if ( bldrCommand.bldrEnv === 'dev' ) {
    // if dev is set, use it as the base
    const devConfig = config.rootConfig?.dev || config.rootConfig;

    if ( bldrCommand.settings?.key ) {
      // Handle a specific key form the cli
      config.processes[bldrCommand.settings.key] = devConfig[bldrCommand.settings.key];

    } else if ( bldrCommand.settings?.env ) {
      if ( devConfig?.env && bldrCommand.settings.env in devConfig.env ) {
        // Handle a env key form the cli
        config.processes = { ...devConfig.env[bldrCommand.settings.env] };
      } else {
        handleErrorMessage('bldr', `${bldrCommand.settings.env} is not a configured 'env' key in config.`, {throwError: true, exit: true});
      }


    } else {
      // All of the config
      config.processes = {...devConfig};
    }

  } else {
    // if build is set, use it as the base
    const buildConfig = config.rootConfig?.build || config.rootConfig;

    if ( bldrCommand.settings?.key ) {
      // Handle a specific key form the cli
      config.processes[bldrCommand.settings.key] = buildConfig[bldrCommand.settings.key];
    } else {
      // All of the config
      config.processes = {...buildConfig};
    }
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