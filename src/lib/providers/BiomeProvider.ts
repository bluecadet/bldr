import { BldrConfig } from '../BldrConfig.js';
import { execSync } from 'node:child_process';
import { dashPadFromString, logAction, logError, logSuccess } from '../utils/loggers.js';
export class BiomeProvider {

  /**
   * @property null|object
   * Chokidar instance
   */
  private bldrConfig!: BldrConfig;


  /**
   * @property null | object
   */
  private throwError!: false | boolean;


  /**
   * @property null | object
   */
  private bailOnError!: null | any;


  /**
   * @property null | string
   */
  private errorsFoundMessage!: string;

  /**
   * @property null | string
   */
  private devLintCommand!: string;

  /**
   * @property null | string
   */
  private devFormatCommand!: string;

  /**
   * @property null | string
   */
  private devRunCommand!: string;

  /**
   * @property null|Class BiomeProvider
   * Singleton instance of BiomeProvider
   */
  public static _instance: BiomeProvider;

  constructor() {

    if (BiomeProvider._instance) {
      return;
    }

    BiomeProvider._instance = this;
  }


  initialize() {

    this.bldrConfig = BldrConfig._instance;
    this.throwError = !this.bldrConfig.isDev && this.bldrConfig.biomeConfig?.forceBuildIfError === true;

    if ( this.bldrConfig.isDev || this.bldrConfig.biomeConfig?.forceBuildIfError === true ) {
      this.bailOnError = {};
      if ( this.bldrConfig.isDev ) {
        this.errorsFoundMessage = 'Errors found in Biome';
      } else {
        this.errorsFoundMessage = 'Errors found in Biome, but build forced in config';
      }
      
    } else {
      this.bailOnError = { throwError: true, exit: true };
      this.errorsFoundMessage = 'Errors found in Biome - process aborted';
    }

    if (this.bldrConfig.isDev) {
      this.devLintCommand = 'npx @biomejs/biome lint';
      this.devFormatCommand = 'npx @biomejs/biome check';
    
      if (this.bldrConfig?.biomeConfig?.devWrite) {
        this.devLintCommand += ' --write';
        this.devFormatCommand += ' --write';
      }

      this.devRunCommand = this.bldrConfig?.biomeConfig?.devFormat ? this.devFormatCommand : this.devLintCommand;
    }
  }


  async lintAll() {

    if ( !this.bldrConfig?.biomeConfig?.useBiome ) {
      return;
    }

    try {
      const stdout = execSync('npx @biomejs/biome lint --reporter=summary --error-on-warnings').toString();  
      console.log(stdout);
    } catch (error) {
      const msg = 'Run npx `@biomejs/biome lint` for full report.';
      const longestString = this.errorsFoundMessage.length > msg.length ? this.errorsFoundMessage : msg;
      const dashes = dashPadFromString(longestString);
      logError('biome', dashes, {});
      logError('biome', this.errorsFoundMessage, {});
      logError('biome', 'Run npx `@biomejs/biome lint` for full report.', {});
      logError("biome", dashes, this.bailOnError);
    }
  }


  /**
   * @description Lint single file in the project
   * @param {string} filepath - Path to the file to lint
   * @returns {Promise<void>}
   * @memberof BiomeProvider
   */
  async lintFile(filepath: string) {

    if ( !this.bldrConfig?.biomeConfig?.useBiome ) {
      return;
    }

    if ( this.bldrConfig.isDev && !this.bldrConfig?.biomeConfig?.dev ) {
      return;
    }

    logSuccess('biome', `${filepath} linted`);
    const stdout = execSync(`${this.devRunCommand} ${filepath}`).toString();
    console.log(stdout);
  }
}