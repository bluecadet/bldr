import { settings } from '../settings/bldrSettings.js';
import flattenProcesses from './flattenProcesses.js';
import { handleProcessError, handleProcessWarn } from './reporters.js';
import { existsSync } from 'node:fs';
import * as path from 'path';


/**
 * Get bldrconfig data
 *
 * @param {object} bldrCommand bldrCommand object from CLI options
 * @returns object
 */
export async function getConfigData(bldrCommand) {
  const configPath      = path.join(settings.root, settings.filename);
  const localConfigPath = path.join(settings.root, settings.localFilename);

  if (!existsSync(configPath)) {
    handleProcessError('bldr', `${settings.filename} does not exist.`, {throwError: true, exit: true});
  };

  const rawConfig  = await import(configPath);
  const rootConfig = rawConfig.default;

  const config = {
    settings: {
      env: bldrCommand.bldrEnv,
      isWatch: bldrCommand.settings?.watch,
      cli: bldrCommand
    },
    processes: {},
    processSettings: {
      rollup: rootConfig?.processSettings?.rollup ? rootConfig.processSettings.rollup : false,
      esBuild: rootConfig?.processSettings?.esBuild ? rootConfig.processSettings.esBuild : false,
      browsersync: rootConfig?.processSettings?.browsersync ? rootConfig.processSettings.browsersync : false,
      sass: rootConfig?.processSettings?.sass ? rootConfig.processSettings.sass : false,
    }
  };

  let targetProcessConfig = false;

  // bldrEnv Config
  if ( bldrCommand.bldrEnv === 'dev' ) {
    // if dev is set, use it as the base
    const devConfig = rootConfig?.dev || rootConfig;

    if ( bldrCommand.settings?.key ) {
      // Handle a specific key form the cli
      const targetDevProcessKey = bldrCommand.settings.key;
      if ( targetDevProcessKey in devConfig ) {
        targetProcessConfig = devConfig[targetDevProcessKey];
      } else {
        handleProcessError('bldr', `${targetDevProcessKey} is not a configured process key in config.`, {throwError: true, exit: true});
      }


    } else if ( bldrCommand.settings?.env ) {
      // Handle a env key form the cli
      const targetDevEnvKey = bldrCommand.settings.env;
      if ( devConfig?.env && targetDevEnvKey in devConfig.env ) {
        targetProcessConfig = devConfig.env[targetDevEnvKey];
      } else {
        handleProcessError('bldr', `${targetDevEnvKey} is not a configured 'env' key in config.`, {throwError: true, exit: true});
      }

    } else {
      // All of the config
      targetProcessConfig = devConfig;

    }

  } else {
    // if build is set, use it as the base
    const buildConfig = rootConfig?.build || rootConfig;

    if ( bldrCommand.settings?.key ) {
      // Handle a specific key form the cli
      const targetBuildProcessKey = bldrCommand.settings.key;
      if ( targetBuildProcessKey in buildConfig ) {
        targetProcessConfig = buildConfig[targetBuildProcessKey];
      } else {
        handleProcessError('bldr', `${targetBuildProcessKey} is not a configured process key in config.`, {throwError: true, exit: true});
      }

    } else {
      // All of the config
      targetProcessConfig = buildConfig;

    }
  }

  if ( targetProcessConfig ) {
    const {runProcesses, watch} = await flattenProcesses(targetProcessConfig);
    config.processes  = runProcesses;
    config.watch      = watch;
  }

  // Local Config
  if (existsSync(localConfigPath)) {
    const localConfig = await import(localConfigPath);
    config.local = localConfig.default;
  } else {
    config.local = false;
  };

  return config;
}

