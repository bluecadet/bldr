import { BldrConfig } from '../BldrConfig.js';
import { ESLint } from 'eslint';
import { dashPadFromString, logAction, logError } from '../utils/loggers.js';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ProcessAsset } from '../@types/configTypes.js';
import fs from 'node:fs';

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
   * @property null | object
   */
  private bailOnError!: null | any;


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
    

    if ( this.bldrConfig.isDev || this.bldrConfig.eslintConfig?.forceBuildIfError === true ) {
      this.bailOnError = {};
      if ( this.bldrConfig.isDev ) {
        this.resultMessage = `Errors found in Eslint`;
      } else {
        this.resultMessage = `Errors found in Eslint, but build forced in config`;
      }
      
    } else {
      this.bailOnError = { throwError: true, exit: true };
      this.resultMessage = `Errors found in Eslint - process aborted`;
    }

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

    await this.#setEsLintPaths();
    
    if (this.eslintAllPaths.length > 0) {
      await this.#runLint(this.eslintAllPaths);
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

      results.forEach((res: any) => {

        if ( res.errorCount > 0 ) {
          const dashes = dashPadFromString(this.resultMessage);
          logError(`eslint`, dashes, {});
          logError(`eslint`, this.resultMessage, {});
          logError(`eslint`, dashes, {});
          console.log(resultText);
          logError(`eslint`, dashes, this.bailOnError);
          console.log('');
        }

      });

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