import { readFileSync } from 'fs';
import { handleProcessWarn, handleProcessSuccess, handleProcessError, handleProcessAction } from '../utils/reporters.js';
import { postCSSfromBuffer } from './postCssFromBuffer.js';
import { checkMissingConfigKeys } from "../utils/checkMissingConfigKeys.js";

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const fg      = require('fast-glob');


export class ProcessPostcss {
  constructor(config, bsInstance) {
    this.config = config;
    this.bsInstance = bsInstance;
    console.log('hi');
  }

  async #handleConfigObjectGlobs(configObject, rootConfig) {
    // Process Globs
    const entries = fg.sync([configObject.src], { dot: true });

    if ( !entries.length ) {
      return handleProcessWarn('postcss', `no files found in ${configObject.src}`);
    }

    for (const file of entries) {
      const buffer = readFileSync(file);
      await postCSSfromBuffer(buffer, file, configObject, rootConfig);
    }
  }

  async run() {

    // Return if sass is not present
    if ( !this.config?.processes?.css ) {
      return { notRan: true };
    }

    for await (const configObject of this.config.processes.css) {
      const missingKeys = checkMissingConfigKeys(configObject);

      if ( missingKeys ) {
        handleProcessWarn('postcss', missingKeys);
        return { warn: true };

      }

      await this.#handleConfigObjectGlobs(configObject, this.config);
    }


    if (this.bsInstance) {
      this.bsInstance.stream({match: "**/*.css"});
    }

    handleProcessAction('postcss', `postcss complete!`);

    return { success: true };
  }
}


async function handleConfigObjectGlobs(configObject, rootConfig) {
  // Process Globs
  const entries = fg.sync([configObject.src], { dot: true });

  if ( !entries.length ) {
    return handleProcessWarn('postcss', `no files found in ${configObject.src}`);
  }

  for (const file of entries) {
    const buffer = readFileSync(file);
    await postCSSfromBuffer(buffer, file, configObject, rootConfig);
  }
}


export const processPostcss = async (config, bsInstance = false) => {

  // Return if sass is not present
  if ( !config?.processes?.css ) {
    return { notRan: true };
  }

  for await (const configObject of config.processes.css) {
    const missingKeys = checkMissingConfigKeys(configObject);

    if ( missingKeys ) {
      handleProcessWarn('postcss', missingKeys);
      return { warn: true };

    }

    await handleConfigObjectGlobs(configObject, config);
  }


  if (bsInstance) {
    bsInstance.stream({match: "**/*.css"});
  }

  handleProcessAction('postcss', `postcss complete!`);

  return { success: true };
}