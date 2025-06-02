import { BldrConfig } from '../BldrConfig.js';
import stylelint from 'stylelint';
import stylelintFormatter from 'stylelint-formatter-pretty';
import { dashPadFromString, logError } from '../utils/loggers.js';
import { ProcessAsset } from '../@types/configTypes.js';
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';


export class StylelintProvider {

  /**
   * @property null|object
   * Chokidar instance
   */
  private bldrConfig!: BldrConfig;

  /**
   * @property null|Class Stylelint
   * Singleton instance of Stylelint
   */
  public static _instance: StylelintProvider;

  public notice!: string;

  private allPaths: string[] = [];

  private allowStylelint: boolean = true;

  private bailOnError!: null | any;

  private resultMessage!: string;


  constructor() {

    if (StylelintProvider._instance) {
      return StylelintProvider._instance;
    }

    StylelintProvider._instance = this;

  }


  async initialize() {
    this.bldrConfig = BldrConfig._instance;
    this.notice = 'Stylelint initialized';
    this.allowStylelint = this.bldrConfig.stylelintConfig?.useStyleLint ? this.bldrConfig.stylelintConfig.useStyleLint : true;

    // let configPaths = path.join(process.cwd(), 'stylelint.config.js');
    const configFiles = [
      'stylelint.config.js',
      'stylelint.config.mjs',
      'stylelint.config.cjs',
      '.stylelintrc.js',
      '.stylelintrc.mjs',
      '.stylelintrc.cjs',
      '.stylelintrc',
      '.stylelintrc.yml',
      '.stylelintrc.yaml',
      '.stylelintrc.json',
    ];

    // Check if any of the config files exist in the project root
    const configExists = configFiles.some((file) => {
      return fs.existsSync(path.join(process.cwd(), file));
    });

    if ( this.allowStylelint && !configExists ) {
      logError(`stylelint`, `No Stylelint config found in project root. Stylelint will be skipped.`, {});
      this.allowStylelint = false;
    }

    if ( this.bldrConfig.isDev || this.bldrConfig.stylelintConfig?.forceBuildIfError === true ) {
      this.bailOnError = {};
      if ( this.bldrConfig.isDev ) {
        this.resultMessage = `Errors found in Stylelint`;
      } else {
        this.resultMessage = `Errors found in Stylelint, but build forced in config`;
      }
      
    } else {
      this.bailOnError = { throwError: true, exit: true };
      this.resultMessage = `Errors found in Stylelint - process aborted`;
    }
  }



  /**
   * @description Lint all files in the project
   * @returns {Promise<void>}
   * @memberof EslintProvider
   */
  async lintAll() {

    if ( !this.allowStylelint ) {
      return;
    }

    await this.#setStyleLintPaths();
    
    if (this.allPaths.length > 0) {
      await this.#runLint(this.allPaths);
    }
    
  }


  
  /**
   * @description Set the paths for stylelint
   * @returns {Promise<void>}
   * @memberof EslintProvider
   * @private
   */
  async #setStyleLintPaths(): Promise<void> {

    this.allPaths = [];

    // Otherwise, Use files from config
    const require = createRequire(import.meta.url);
    const fg      = require('fast-glob');

    if ( this.bldrConfig.processSrc?.css ) {
      this.bldrConfig.processSrc.css.forEach((p: ProcessAsset) => {
        const files = fg.sync([`${path.join(process.cwd(), p.src)}`]);
        if ( files && files.length > 0 ) {
          for (const file of files) {
            this.allPaths.push(path.resolve(file));
          }
        }
      });
    }

    if ( this.bldrConfig.sdcProcessAssetGroups?.css ) {
      for (const [key, value] of Object.entries(this.bldrConfig.sdcProcessAssetGroups.css)) {
        this.allPaths.push(path.resolve((value as { src: string }).src));
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
    if ( !this.allowStylelint ) {
      return;
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

      const result = await stylelint.lint({
        files: files,
        formatter: stylelintFormatter,
      });

      if ( result.errored ) {
        const dashes = dashPadFromString(this.resultMessage);
        console.log('');
        logError(`stylelint`, dashes, {});
        logError(`stylelint`, this.resultMessage, {});
        logError(`stylelint`, dashes, {});
        console.log(result.report);
        logError(`stylelint`, dashes, this.bailOnError);
        console.log('');
      }

    } catch (err) {
      if ( this.bldrConfig.isDev || this.bldrConfig.stylelintConfig?.forceBuildIfError ) {
        console.log(err);
      } else {
        console.log(err);
        process.exit(1);
      }
    }
  }

}