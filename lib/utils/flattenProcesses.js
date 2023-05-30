import { settings } from '../settings/bldrSettings.js';
import { extname } from 'node:path';

/**
 * Create process arrays regardless of config values for each process
 * (turn single object or array of objects into an array for each process)
 * @param {object} config root bldrConfig.js data
 * @returns array
 */
export default async function flattenProcesses(config) {
  const { allowedProcessKeys } = settings;
  const watchPathsArray        = [];
  const watch                  = { files: [], reloadExts: [] };
  let   runProcesses           = {};

  allowedProcessKeys.forEach(process => {
    if ( process in config ) {
      const configPaths = config[process];
      const paths = [];

      if ( Array.isArray(configPaths) ) {
        configPaths.forEach(g => {
          paths.push(g)
          if ( g?.watch ) watch.files.push(g.watch);
        });
      } else {
        paths.push(configPaths);
        if ( configPaths?.watch ) watch.files.push(configPaths.watch);
      }

      runProcesses[process] = paths;
    }
  });

  if ( config?.watchReload && Array.isArray(config.watchReload) )  {

    config.watchReload.forEach(path => {
      watch.files.push(path);
      watch.reloadExts.push(extname(path))
    });
  }

  // Flatten out watch files
  if ( watch.files.length > 0 ) {
    watch.files = watch.files.flat();
  }

  runProcesses    = Object.keys(runProcesses).length > 0 ? runProcesses : false;

  return { runProcesses, watch };
}