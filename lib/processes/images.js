import imagemin from 'imagemin';

import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminSvgo from 'imagemin-svgo';

import { handleProcessWarn, handleProcessError, handleProcessAction } from '../utils/reporters.js';
import { checkMissingConfigKeys } from "../utils/checkMissingConfigKeys.js";

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const fg      = require('fast-glob');

async function handleConfigObjects(configObject) {



  // Process Globs
  const entries = fg.sync([configObject.src], { dot: true });

  if ( !entries.length ) {
    return handleProcessWarn('images', `no files found in ${configObject.src}`);
  }

  try {
    await imagemin([configObject.src], {
      destination: configObject.dest,
      plugins: [
        imageminMozjpeg(),
        imageminPngquant({
          quality: [0.6, 0.8]
        }),
        imageminSvgo()
      ]
    });

  } catch(err) {
    if ( config.settings.env === 'build' ) {
      console.log(err);
      handleProcessError('images', `Images cannot be processed due to above error`, {throwError: true, exit: true});

    } else {
      handleProcessWarn('images', `Images cannot be processed due to an error:`);
      console.log(err);

    }
  }
}


// The primary function to call when processing sass
export const processImages = async (config, bsInstance) => {

  // Return if images is not present
  if ( !config?.processes?.images ) {
    return { notRan: true };
  }

  for await (const configObject of config.processes.images) {

    const missingKeys = checkMissingConfigKeys(configObject);

    if ( missingKeys ) {
      handleProcessWarn('images', missingKeys);
      return { warn: true };
    }

    await handleConfigObjects(configObject);
  }

  if (bsInstance) {
    bsInstance.reload();
  }

  handleProcessAction('images', `image processing complete!`);

  return { success: true };
}