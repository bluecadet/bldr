import { readFileSync } from 'fs';
import {
  handleProcessWarn,
  handleProcessSuccess,
  handleProcessError,
  handleProcessAction,
} from '../utils/reporters.js';
import { postCSSfromBuffer } from './postCssFromBuffer.js';
import { checkMissingConfigKeys } from '../utils/checkMissingConfigKeys.js';

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const fg = require('fast-glob');

async function handleConfigObjectGlobs(configObject, rootConfig) {
  // Process Globs
  const entries = fg.sync([configObject.src], { dot: true });

  console.log(configObject);

  if (!entries.length) {
    return handleProcessWarn(
      'postcss',
      `no files found in ${configObject.src}`
    );
  }

  for (const file of entries) {
    const buffer = readFileSync(file);
    await postCSSfromBuffer(buffer, file, configObject, rootConfig);
  }
}

export const processPostcss = async (config) => {
  // Return if sass is not present
  if (!config?.processes?.css) {
    return { notRan: true };
  }

  for await (const configObject of config.processes.css) {
    const missingKeys = checkMissingConfigKeys(configObject);

    if (missingKeys) {
      handleProcessWarn('postcss', missingKeys);
      return { warn: true };
    }

    await handleConfigObjectGlobs(configObject, config);
  }

  handleProcessAction('postcss', `postcss complete!`);

  return { success: true };
};
