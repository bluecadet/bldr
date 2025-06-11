import { BldrConfig } from '../BldrConfig.js';
import { ESLint } from 'eslint';
import { dashPadFromString, logAction, logError, logSuccess } from '../utils/loggers.js';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ProcessAsset } from '../@types/configTypes.js';
import fs from 'node:fs';
import chalk from 'chalk';

export class EslintProvider {

  /**
   * @property null|object
   * Chokidar instance
   */
  private bldrConfig!: BldrConfig;

  /**
   * @property null|Class EslintProvider
   * Singleton instance of EslintProvider
   */
  public static _instance: EslintProvider;

  /**
   * @property null|string
   */
  public notice!: string;

  /**
   * @property null|object
   * ESLint instance
   */
  private eslint: null | ESLint = null;

  /**
   * @property null|object
   */
  private formatter!: any;


  /**
   * @property null | string
   */
  private resultMessage!: string;

  /**
   * @property null | object
   */
  private eslintOptions!: ESLint.Options;

  /**
   * @property null | string[]
   */
  private eslintAllPaths!: string[];

  private hasErrors: boolean = false;


  constructor() {

    if (EslintProvider._instance) {
      return EslintProvider._instance;
    }

    EslintProvider._instance = this;

  }



  /**
   * @description Initialize the EslintProvider
   * @returns {Promise<void>}
   * @memberof EslintProvider
   */
  async initialize() {
    this.bldrConfig = BldrConfig._instance;
    this.notice = 'EslintProvider initialized';

    if ( this.bldrConfig.eslintConfig?.useEslint === false) {
      return false;
    }

    if ( !this.bldrConfig.processAssetGroups?.js && !this.bldrConfig.sdcProcessAssetGroups?.js) {
      return false;
    }
    
    this.eslint = new ESLint(this.eslintOptions);
    this.formatter = await this.eslint.loadFormatter('stylish');

    const msg = ' Errors found in ESlint ';
    const count = Math.floor(((process.stdout.columns - 14) - msg.length - 2) / 2);
    const sym = '=';
    this.resultMessage = `${sym.repeat(count)}${msg}${sym.repeat(count)}`;

    await this.#compileFinalConfig();
    
  }



  /**
   * @description Lint all files in the project
   * @returns {Promise<void>}
   * @memberof EslintProvider
   */
  async lintAll() {
    if ( !this.eslint ) {
      return false;
    }

    // Reset the hasErrors flag
    this.hasErrors = false;

    await this.#setEsLintPaths();
    
    if (this.eslintAllPaths.length > 0) {
      await this.#runLint(this.eslintAllPaths);
    }

    if (this.hasErrors && this.bldrConfig.eslintConfig?.forceBuildIfError === true) {
      console.log('');
      logError(`eslint`, '🚨🚨🚨 ESLint errors found 🚨🚨🚨', { throwError: true, exit: true });
    } else if (this.hasErrors) {
      logError(`eslint`, 'ESLint errors found, forceBuildIfError set to true, continuing on', {});
    } else {
      logSuccess(`eslint`, `No ESLint errors found`);
    }
    
  }


  /**
   * @description Set the paths for eslint to lint
   * @returns {Promise<void>}
   * @memberof EslintProvider
   * @private
   */
  async #setEsLintPaths(): Promise<void> {

    this.eslintAllPaths = [];

    // Check if eslint.config.js exists in the project root, and use files from config if defined
    const eslintConfigPath = path.join(process.cwd(), `eslint.config.js`);
    if ( fs.existsSync(eslintConfigPath) ) {
      const configFile = await import(eslintConfigPath);

      configFile.default.forEach((c: { files: any[]; }) => {
        if (c?.files) {
          c.files.forEach((file) => {
            this.eslintAllPaths.push(path.join(process.cwd(), file));
          });
        }
      })

      if ( this.eslintAllPaths.length > 0 ) {
        logAction(`eslint`, `Linting files from eslint.config.js`);
        return;
      }
    }

    // Otherwise, Use files from config
    const require = createRequire(import.meta.url);
    const fg      = require('fast-glob');

    if ( this.bldrConfig.processSrc?.js ) {
      this.bldrConfig.processSrc.js.forEach((p: ProcessAsset) => {
        const files = fg.sync([`${path.join(process.cwd(), p.src)}`]);
        if ( files && files.length > 0 ) {
          for (const file of files) {
            this.eslintAllPaths.push(path.resolve(file));
          }
        }
      });
    }

    if ( this.bldrConfig.sdcProcessAssetGroups?.js ) {
      for (const [key, value] of Object.entries(this.bldrConfig.sdcProcessAssetGroups.js)) {
        this.eslintAllPaths.push(path.resolve((value as { src: string }).src));
      }
    }
  }



  /**
   * @description Lint single file in the project
   * @param {string} filepath - Path to the file to lint
   * @returns {Promise<void>}
   * @memberof EslintProvider
   */
  async lintFile(filepath: string) {

    if ( !this.eslint ) {
      return false;
    }

    await this.#runLint(filepath);
  }



  /**
   * @description Lint all files in the project
   * @returns {Promise<void>}
   * @memberof EslintProvider
   */
  async #runLint(files: string | string[]): Promise<void> {
    try {

      if ( !this.eslint )  {
        return;
      }

      const results = await this.eslint.lintFiles(files);
      const resultText = this.formatter.format(results);
      let resultErrors = false;

      results.forEach((res: any) => {
        if (res.errorCount > 0) {
          resultErrors = true;
        }
      });

      if ( resultErrors ) {
        const dashes = dashPadFromString(this.resultMessage);
        logError(`eslint`, dashes, {});
        logError(`eslint`, this.resultMessage, {});
        logError(`eslint`, dashes, {});

        results.forEach((res: any) => {
          if ( res.errorCount > 0 ) {
            this.hasErrors = true;    
            console.log(resultText);
            logError(`eslint`, dashes, {});
          }
        });
      }

      

    } catch (err) {
      if ( this.bldrConfig.isDev || this.bldrConfig.eslintConfig?.forceBuildIfError ) {
        console.log(err);
      } else {
        console.log(err);
        process.exit(1);
      }
    }
  }



  async #compileFinalConfig() {
    this.eslintOptions = this.bldrConfig.eslintConfig?.options || {};
  }

}