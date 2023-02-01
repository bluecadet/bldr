import { settings } from '../settings/bldrSettings.js';

/**
 * Create process arrays regardless of config values for each process
 * (turn single object or array of objects into an array for each process)
 * @param {object} config root bldrConfig.js data
 * @returns array
 */
export default async function flattenProcesses(config) {
  const { allowedProcessKeys } = settings;
  let   runProcesses   = {};
  let   watchPaths      = [];

  allowedProcessKeys.forEach(process => {
    if ( process in config ) {
      const configPaths = config[process];
      const paths = [];

      if ( Array.isArray(configPaths) ) {
        configPaths.forEach(g => {
          paths.push(g)
          if ( g?.watch ) watchPaths.push(g.watch);
        });
      } else {
        paths.push(configPaths);
        if ( configPaths?.watch ) watchPaths.push(configPaths.watch);
      }

      runProcesses[process] = {
        process: process,
        paths: paths,
      };
    }
  });

  if ( config?.watchReload && Array.isArray(config.watchReload) )  {
    watchPaths.push(config.watchReload);
  }

  watchPaths    = watchPaths.length > 0 ? watchPaths.flat() : false;
  runProcesses = Object.keys(runProcesses).length > 0 ? runProcesses : false;

  return { runProcesses, watchPaths };
}