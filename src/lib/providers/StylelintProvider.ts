import { BldrConfig } from '../BldrConfig.js';
import stylelint from 'stylelint';
import stylelintFormatter from 'stylelint-formatter-pretty';
import { dashPadFromString, logError, logSuccess } from '../utils/loggers.js';
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { getAllFiles } from '../utils/getAllFiles.js';


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

  /**
   * @property null | string
   * Notice message
   */
  public notice!: string;

  /**
   * @property null | string[]
   * All paths to lint
   */
  private allStylelintPaths: false | string[] = [];

  /**
   * @property null | boolean
   * Whether to allow stylelint to run
   */
  private allowStylelint = true;

  /**
   * @property null | string
   * Result message for errors
   */
  private resultMessage!: string;

  private hasErrors = false;


  constructor() {

    if (StylelintProvider._instance) {
      // biome-ignore lint/correctness/noConstructorReturn: <explanation>
      return StylelintProvider._instance;
    }

    StylelintProvider._instance = this;

  }


  /**
   * @description Initialize the StylelintProvider
   * @returns {Promise<void>}
   * @memberof StylelintProvider
   */
  async initialize() {
    this.bldrConfig = BldrConfig._instance;
    this.notice = 'Stylelint initialized';
    this.allowStylelint = this.bldrConfig.stylelintConfig?.useStyleLint === true;

    if ( !this.allowStylelint ) {
      return;
    }

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
      logError('stylelint', 'No Stylelint config found in project root. Stylelint will be skipped.', {});
      this.allowStylelint = false;
      return;
    }

    const msg = ' Errors found in Stylelint ';
    const count = Math.floor(((process.stdout.columns - 14) - msg.length - 2) / 2);
    const sym = '=';
    this.resultMessage = `${sym.repeat(count)}${msg}${sym.repeat(count)}`;
  }



  /**
   * @description Lint all files in the project
   * @returns {Promise<void>}
   * @memberof EslintProvider
   */
  async lintAll(): Promise<void> {

    if ( !this.allowStylelint ) {
      return;
    }

    // Reset the hasErrors flag
    this.hasErrors = false;

    // Get paths to lint
    this.allStylelintPaths = await getAllFiles(['css'], this.bldrConfig.stylelintConfig?.ignorePaths || []);
    
    // If we have paths to lint, run the linter
    if (this.allStylelintPaths && this.allStylelintPaths.length > 0) {
      await this.#runLint(this.allStylelintPaths);
    }

    // If we have errors, log them
    if (this.hasErrors && this.bldrConfig.stylelintConfig?.forceBuildIfError === true) {
      console.log('');
      logError('stylelint', '🚨🚨🚨 Stylelint errors found 🚨🚨🚨', { throwError: true, exit: true });
    } else if (this.hasErrors) {
      logError('stylelint', 'Stylelint errors found, forceBuildIfError set to true, continuing on', {});
    } else {
      logSuccess('stylelint', 'No Stylelint errors found');
    }
    
  }


  
  /**
   * @description Set the paths for stylelint
   * @returns {Promise<void>}
   * @memberof EslintProvider
   * @private
   */
  // async #setStyleLintPaths(): Promise<void> {

  //   this.allStylelintPaths = [];

  //   // Otherwise, Use files from config
  //   const require = createRequire(import.meta.url);
  //   const fg      = require('fast-glob');

  //   if ( this.bldrConfig.processSrc?.css ) {
  //     for (const p of this.bldrConfig.processSrc.css) {
  //       const files = fg.sync([`${path.join(process.cwd(), p.src)}`]);
  //       if ( files && files.length > 0 ) {
  //         for (const file of files) {
  //           this.allStylelintPaths.push(path.resolve(file));
  //         }
  //       }
  //     }
  //   }

  //   if ( this.bldrConfig.sdcProcessAssetGroups?.css ) {
  //     for (const [key, value] of Object.entries(this.bldrConfig.sdcProcessAssetGroups.css)) {
  //       this.allStylelintPaths.push(path.resolve((value as { src: string }).src));
  //     }
  //   }
  // }



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
        this.hasErrors = true;
        const dashes = dashPadFromString(this.resultMessage);
        logError('stylelint', dashes, {});
        logError('stylelint', this.resultMessage, {});
        logError('stylelint', dashes, {});
        console.log(result.report);
        logError('stylelint', dashes, {});
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