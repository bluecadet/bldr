import { readFileSync, writeFileSync } from 'fs';
import {
  handleProcessWarn,
  handleProcessSuccess,
  handleProcessError,
  handleProcessAction,
} from './utils/reporters.js';
import { Bldr_Config } from './Bldr_Config.js';
import { Bldr_Settings } from './Bldr_Settings.js';
import { ensureDirSync } from 'fs-extra';
import { basename, extname, join } from 'node:path';
import { checkMissingConfigKeys } from './utils/checkMissingConfigKeys.js';
import { globSync } from 'glob';

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const postcss = require('postcss');
const colors = require('colors');
const postcssrc = require('postcss-load-config');

// import util from 'node:util';

export class Processor__PostCss {
  #BldrConfig;
  #BldrSettings;

  constructor() {
    this.#BldrConfig = new Bldr_Config();
    this.#BldrSettings = new Bldr_Settings();
  }

  /**
   * Process primary config objects
   */
  async processPrimaryConfig() {

    // Return if sass is not present
    if (!this.#BldrConfig?.processes?.css) {
      return { notRan: true };
    }

    // Handle globs for each config set
    for await (const configObject of this.#BldrConfig.processes.css) {
      const missingKeys = checkMissingConfigKeys(configObject);

      if (missingKeys) {
        handleProcessWarn('postcss', missingKeys);
        return { warn: true };
      }

      await this.handleConfigObjectGlobs(configObject);
    }

    handleProcessAction('postcss', `postcss complete!`);

    return { success: true };
  }

  /**
   * Process Globs
   *
   * @param {object} configObject src/dest
   */
  async handleConfigObjectGlobs(configObject) {
    const entries = globSync([configObject.src], { dot: true });

    if (!entries.length) {
      return handleProcessWarn(
        'postcss',
        `no files found in ${configObject.src}`
      );
    }

    for (const file of entries) {
      const buffer = readFileSync(file);
      await this.postCSSfromBuffer(buffer, file, configObject.dest);
    }
  }


  /**
   * Process Globs
   *
   * @param {object} configObject src/dest
   */
  async processSingleFile(src, dest, destFilename) {
    const buffer = readFileSync(src);
    await this.postCSSfromBuffer(buffer, src, dest, destFilename);
  }


  /**
   * Format postcss error string
   *
   * @param {object} err Postcss error object
   * @returns string
   */
  #postCssErrMessage(err) {
    return `${colors.red(`Error proccessing file ./${err.file}`)}
${colors.white('reason:')} ${colors.red(err.reason)}${err?.line ? `
${colors.white('line:')} ${colors.red(err.line)}` : ''}${err?.columns ? `
${colors.white('columns:')} ${colors.red(err.columns)}` : ''}
${colors.white('error:')} ${err}`
  }


  /**
   * Handle CSS File Buffer, Run PostCSS
   *
   * @param {buffer} buffer file buffer
   * @param {string} file file path
   * @param {string} destDirectory file destination directory
   * @param {false|string} destFilename formatted destination file name
   * @returns object
   */
  async postCSSfromBuffer(buffer, file, destDirectory, destFilename = false) {

    const fileContent = buffer.toString();
    const fileName    = basename(file);
    const mapOpts     = this.#BldrConfig.settings.env === 'dev' ? { inline: false } : false;
    let writeFileName = '';

    if ( destFilename ) {
      writeFileName = destFilename;
    } else {
      const fileBase = basename(file, extname(file));
      writeFileName  = `${fileBase}.css`;
    }

    const start = Date.now();


    // Pass context to postcss config file
    const ctx = {
      ...this.#BldrConfig.cliSettings
    };

    const postCSSConfig = await postcssrc(ctx);

    try {
      const postCssResult = await postcss(postCSSConfig.plugins).process(fileContent, {
        syntax: postCSSConfig.options?.syntax ?? this.#BldrSettings.syntax,
        from:   file,
        to:     writeFileName,
        map:    postCSSConfig.options?.map ?? mapOpts,
      });

      if ( !postCssResult?.css ) {
        handleProcessError(`postcss`, `${fileName} does not contain css...`);
        return false;
      }

      ensureDirSync(destDirectory);

      try {
        writeFileSync(join(destDirectory, writeFileName), postCssResult.css);
      } catch (err) {
        console.log(err);
        // Error if can't write file
        const writeFileErrOpts = this.#BldrConfig.cliSettings.isWatch ? {} : { throwError: true, exit: true };
        handleProcessError(`postcss`, `error writing ${fileName} to ${destDirectory}`, writeFileErrOpts);
        return {error: true};
      }

      if ( mapOpts ) {
        if (postCssResult.map) {
          try {
            writeFileSync(`${join(destDirectory, writeFileName)}.map`, postCssResult.map.toString())
          } catch (err) {
            // Error if can't write file
            const writeMapsErrOpts = this.#BldrConfig.cliSettings.isWatch ? {} : { throwError: true, exit: true };
            handleProcessError(`postcss`, `error writing ${fileName} map file to ${destDirectory}`, writeMapsErrOpts);
            return {error: true};
          }
        }
      }

      const stop = Date.now();

      handleProcessSuccess('postcss', `${fileName} processed`, ((stop - start)/1000));

      return {success: true};

    } catch(err) {
      if ( err?.file ) {
        // Postcss error messaging
        const writeMapsErrOpts = this.#BldrConfig.cliSettings.isWatch ? {} : { throwError: true, exit: true };
        handleProcessError(`postcss`, this.#postCssErrMessage(err), writeMapsErrOpts);
      } else {
        // General error caught
        console.log(err);
      }

      // Allow process to continue if watch is running
      if ( this.#BldrConfig.cliSettings.isWatch ) {
        return { error: true, warn: true };
      }

      process.exit(1);

    }
  }
}
