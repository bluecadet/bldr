import { BldrConfig } from '../BldrConfig.js';
import { execSync } from 'node:child_process';
import { dashPadFromString, logError, logSuccess } from '../utils/loggers.js';
import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

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


  // biome-ignore lint/suspicious/noExplicitAny: Not bringing in biome, so using any for json config (no biome types)
  private biomeConfig: any = {};

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

    if ( existsSync( join(process.cwd(), 'biome.json') ) ) {
      const biomeConfigRaw = readFileSync( join(process.cwd(), 'biome.json'), 'utf-8' );
      this.biomeConfig = JSON.parse(biomeConfigRaw);
    }

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
  async lintFile(filepath: string): Promise<boolean> {

    if ( !this.bldrConfig?.biomeConfig?.useBiome ) {
      return false;
    }

    if ( this.bldrConfig.isDev && !this.bldrConfig?.biomeConfig?.dev ) {
      return false;
    }

    if ( this.biomeConfig?.files?.includes && Array.isArray(this.biomeConfig.files.includes) ) {
      if ( !this.matchesPattern(filepath, this.biomeConfig.files.includes) ) {
        return false;
      }
    }

    logSuccess('biome', `${filepath} linted`);
    const stdout = execSync(`${this.devRunCommand} ${filepath}`).toString();
    console.log(stdout);
    
    return true;
  }


  /**
   * Check if a file matches any pattern in an array of glob patterns
   * Patterns starting with ! are treated as negations
   * @param {string} filePath - The file path to check
   * @param {string[]} patterns - Array of glob patterns (can include negations with !)
   * @returns {boolean} - True if file matches and isn't negated, false otherwise
   */
  matchesPattern(filePath: string, patterns: string[]): boolean {
    if (!patterns || patterns.length === 0) {
      return false;
    }

    const require   = createRequire(import.meta.url);
    const picomatch = require('picomatch');
    let isMatch     = false;
  
    for (const pattern of patterns) {
      const isNegation = pattern.startsWith('!');
      const cleanPattern = isNegation ? pattern.slice(1) : pattern;
  
      // Create a matcher for this pattern
      const isMatchFn = picomatch(cleanPattern, { dot: true });
  
      if (isMatchFn(filePath)) {
        if (isNegation) {
          return false; // Negation pattern matched - file should be excluded
        } else { 
          isMatch = true; // Positive pattern matched
        }
      }
    }
  
    return isMatch;
  }
}