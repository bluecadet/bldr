import { createRequire } from 'node:module';
import { BldrConfig } from '../BldrConfig.js';
import path from 'node:path';


export async function getAllFiles( 
  types: string[]  = ['js', 'css'],
  ignorePaths: string[] | false = false,
): Promise<false | string[]> {

  const bldrConfig = BldrConfig._instance;
  const pathStore: string[] = [];
  const require = createRequire(import.meta.url);
  const fg = require('fast-glob');

  // Set glob ignore paths
  const globIgnorePaths: string[] = [
    '**/node_modules/**'
  ];

  // Additional ignore paths
  if ( ignorePaths && ignorePaths.length > 0 ) {
    globIgnorePaths.push(...ignorePaths);
  }

  // Ignore SDC Paths in globs as
  if (bldrConfig.isSDC && bldrConfig?.sdcPaths) {
    for (const sdcPath of bldrConfig.sdcPaths) {
      globIgnorePaths.push(`${sdcPath}/**/*`);
    }
  }

  // Ignore dist files for javascript
  if ( types.includes('js') && bldrConfig.userConfig?.js ) {
    for (const p of bldrConfig.userConfig.js) {
      let destPath = p.dest.startsWith('./') ? p.dest.replace('./', '') : p.dest;
      destPath = destPath.endsWith('/') ? destPath : `${destPath}/`;
      globIgnorePaths.push(`${destPath}**/*.js`);
    }
  }

  // Ignore dist files for css
  if ( types.includes('css') && bldrConfig.userConfig?.js ) {
    for (const p of bldrConfig.userConfig.js) {
      let destPath = p.dest.startsWith('./') ? p.dest.replace('./', '') : p.dest;
      destPath = destPath.endsWith('/') ? destPath : `${destPath}/`;
      globIgnorePaths.push(`${destPath}**/*.css`);
    }
  }

  // Use chokidar watch array
  if ( bldrConfig.chokidarWatchArray.length > 0 ) {

    // Loop watch paths and get all js and css files
    for (const filepath of bldrConfig.chokidarWatchArray) {
      if ( types.includes('js') && bldrConfig.userConfig?.js ) {
        pathStore.push(path.join(filepath, '**', '*.js'));
      }

      if ( types.includes('css') && bldrConfig.userConfig?.css ) {
        pathStore.push(path.join(filepath, '**', '*.css'));
      }
    }

    // Get all the files to lint
    const allFiles: string[] = fg.sync(pathStore, {
      ignore: globIgnorePaths,
    });

    if ( bldrConfig.isSDC ) {
      if ( types.includes('js') && bldrConfig.sdcProcessAssetGroups?.js) {
        for (const [key, value] of Object.entries(bldrConfig.sdcProcessAssetGroups.js)) {
          allFiles.push(key);
        }
      }

      if ( types.includes('css') && bldrConfig.sdcProcessAssetGroups?.css) {
        for (const [key, value] of Object.entries(bldrConfig.sdcProcessAssetGroups.css)) {
          allFiles.push(key);
        }
      }
    }
    
    if ( allFiles.length === 0 ) {
      return false;
    }

    return allFiles;
  }

  return false;
}