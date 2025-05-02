/**
 * Create an array based on watch path arrays in config
 * @param {object} configGroup
 * @returns array
 */
export default function createWatchPathArray(configGroup) {

  pathArray = [];

  if ( Array.isArray(configGroup) ) {
    configGroup.map(g => {
      if (g?.watch) {
        g.watch.map(w => pathArray.push(w));
      }
    });
  } else {
    if ( configGroup?.watch) {
      configGroup.watch.map(w => pathArray.push(w));
    }
  }

  return pathArray;
}

