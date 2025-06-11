import { BldrConfig } from '../BldrConfig.js';
import { Biome, Distribution } from "@biomejs/js-api";
import { dashPadFromString, logSuccess, logError } from '../utils/loggers.js';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ProcessAsset, ProcessKey } from '../@types/configTypes.js';
import fs from 'node:fs';
import chalk from 'chalk';

export class BiomeProvider {

  /**
   * @property null|object
   * Chokidar instance
   */
  private bldrConfig!: BldrConfig;

  /**
   * @property null|Class BiomeProvider
   * Singleton instance of BiomeProvider
   */
  public static _instance: BiomeProvider;

  /**
   * @property null | object
   * Biome instance
   */
  private biomeInstance!: Biome;

  /**
   * @property null|string
   */
  public notice!: string;

  /**
   * @property null | string
   */
  private resultMessage!: string;


  /**
   * @property null | string[]
   */
  private biomeAllPaths!: string[];


  private globIgnorePaths!: string[];

  private writeLogfile!: boolean;
  private logFilePath!: string;
  
  private hasErrors: boolean = false;


  constructor() {

    if (BiomeProvider._instance) {
      return BiomeProvider._instance;
    }

    BiomeProvider._instance = this;

  }



  async initialize() {
    this.bldrConfig = BldrConfig._instance;
    this.notice = 'BiomeProvider initialized';

    if ( this.bldrConfig.biomeConfig?.useBiome === false) {
      return false;
    }

    this.biomeInstance = await Biome.create({
      distribution: Distribution.NODE,
    });

    const msg = ' Errors found in ESlint ';
    const count = Math.floor(((process.stdout.columns - 14) - msg.length - 2) / 2);
    const sym = '=';
    this.resultMessage = `${sym.repeat(count)}${msg}${sym.repeat(count)}`;
    
  }



  /**
   * @description Lint all files in the project
   * @returns {Promise<void>}
   * @memberof BiomeProvider
   */
  async lintAll(): Promise<void> {
    // Check if Biome is enabled
    if ( !this.biomeInstance ) {
      return;
    }

    // Check if log should be written
    if ( this.bldrConfig.biomeConfig?.writeLogfile === true && this.bldrConfig.biomeConfig?.logFilePath) {
      this.writeLogfile = true;
      this.logFilePath = path.join(process.cwd(), this.bldrConfig.biomeConfig?.logFilePath);

      if (!fs.existsSync(this.logFilePath)) {
        fs.writeFileSync(this.logFilePath, '', 'utf-8');
      }
    }

    // Reset errors
    this.hasErrors = false;

    // Set paths for linting
    await this.#setBiomePaths();
    
    // If paths are set, run lint
    if (this.biomeAllPaths.length > 0) {
      await this.#runLint(this.biomeAllPaths);
    }

    if (this.hasErrors && this.bldrConfig.biomeConfig?.forceBuildIfError === true) {
      console.log('');
      logError(`biome`, '🚨🚨🚨 Biome errors found 🚨🚨🚨', { throwError: true, exit: true });
    } else if (this.hasErrors) {
      logError(`biome`, 'Biome errors found, forceBuildIfError set to true, continuing on', {});
    } else {
      logSuccess(`biome`, `No Biome errors found`);
    }
    
  }


  /**
   * @description Set the paths for eslint to lint
   * @returns {Promise<void>}
   * @memberof BiomeProvider
   * @private
   */
  async #setBiomePaths(): Promise<void> {

    this.biomeAllPaths = [];
    const pathStore: string[] = [];
    const require = createRequire(import.meta.url);
    const fg = require('fast-glob');

    // Set glob ignore paths
    this.globIgnorePaths = [
      '**/node_modules/**'
    ];

    // Ignore paths from user config
    if ( this.bldrConfig.biomeConfig?.ignorePaths ) {
      this.globIgnorePaths.push(...this.bldrConfig.biomeConfig.ignorePaths);
    }

    // Ignore SDC Paths in globs as
    if (this.bldrConfig.isSDC && this.bldrConfig?.sdcPaths) {
      this.bldrConfig.sdcPaths.forEach((sdcPath) => {
        this.globIgnorePaths.push(`${sdcPath}/**/*`);
      });
    }

    // Ignore dist files
    await Promise.all([
      this.#addUserDestToIgnorePaths('js'),
      this.#addUserDestToIgnorePaths('css')
    ]);

    // Use chokidar watch array
    if ( this.bldrConfig.chokidarWatchArray.length > 0 ) {

      // Loop watch paths and get all js and css files
      this.bldrConfig.chokidarWatchArray.forEach((filepath) => {
        if ( this.bldrConfig.userConfig?.js ) {
          pathStore.push(`${path.join(filepath, `**`, `*.js`)}`);
        }

        if ( this.bldrConfig.userConfig?.css ) {
          pathStore.push(`${path.join(filepath, `**`, `*.css`)}`);
        }
      });

      // Get all the files to lint
      this.biomeAllPaths = fg.sync(pathStore, {
        ignore: this.globIgnorePaths,
      });

      if ( this.bldrConfig.isSDC ) {
        if ( this.bldrConfig.sdcProcessAssetGroups?.js) {
          for (const [key, value] of Object.entries(this.bldrConfig.sdcProcessAssetGroups.js)) {
            this.biomeAllPaths.push(key);
          }
        }

        if ( this.bldrConfig.sdcProcessAssetGroups?.css) {
          for (const [key, value] of Object.entries(this.bldrConfig.sdcProcessAssetGroups.css)) {
            this.biomeAllPaths.push(key);
          }
        }
      }
      
      return;
    }
  }



  /**
   * @description Lint single file in the project
   * @param {string} filepath - Path to the file to lint
   * @returns {Promise<void>}
   * @memberof BiomeProvider
   */
  async lintFile(filepath: string) {

    if ( !this.biomeInstance ) {
      return false;
    }

    await this.#runLint(filepath);
  }



  /**
   * @description Lint all files in the project
   * @returns {Promise<void>}
   * @memberof BiomeProvider
   */
  async #runLint(files: string | string[]): Promise<void> {

    try {

      if ( !this.biomeInstance ) {
        return;
      }

      if (typeof files === 'string') {
        files = [files];
      }

      // If writing to log, clear file first
      if ( this.writeLogfile ) {
        fs.writeFileSync(this.logFilePath, '', 'utf-8');
      }

      const errorArray: string[] = [];

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');

        const result = this.biomeInstance.lintContent(content, {
          filePath: file,
        });

        const html = this.biomeInstance.printDiagnostics(result.diagnostics, {
          filePath: file,
          fileSource: content,
        });

        if ( result.diagnostics.length === 0 ) {
          continue;
        }

        this.hasErrors = true;
        errorArray.push(html);

        if ( this.hasErrors ) {
          fs.appendFileSync(this.logFilePath, html, 'utf-8');
        }
      }

      if ( this.hasErrors && errorArray.length > 0 ) {
        const dashes = dashPadFromString(this.resultMessage);
        logError(`biome`, dashes, {});
        logError(`biome`, this.resultMessage, {});
        logError(`biome`, dashes, {});
        
        errorArray.forEach((html) => {
          console.log(this.#formatHTML(html));
          logError(`biome`, dashes, {});
        });
      }

    } catch (err) {
      if ( this.bldrConfig.isDev || this.bldrConfig.biomeConfig?.forceBuildIfError ) {
        console.log(err);
      } else {
        console.log(err);
        process.exit(1);
      }
    }
  }




  /**
   * @description Add ignore paths from user config to the ignorePaths array
   * @param {ProcessKey} key - The process key to add ignore paths for
   * @return {Promise<void>}
   * @private
   * @memberof BiomeProvider
   */
  async #addUserDestToIgnorePaths(key: ProcessKey): Promise<void> {
    if ( this.bldrConfig.userConfig?.[key] ) {
      this.bldrConfig.userConfig[key].forEach((p: ProcessAsset) => {
        let destPath = p.dest.startsWith('./') ? p.dest.replace('./', '') : p.dest;
        destPath = destPath.endsWith('/') ? destPath : `${destPath}/`;
        this.globIgnorePaths.push(`${destPath}**/*.${key}`);
      });
    }
  }



  /**
   * @description Format HTML output to console
   * @param {string} html - The HTML string to format
   * @returns {string} - The formatted string
   * @memberof BiomeProvider
   */
  #formatHTML(html: string): string {
    let newHTML = html.replace(/<strong>(.*?)<\/strong>/g, chalk.bold(`$1`));
    newHTML = newHTML.replace(/&gt;/g, '>');
    newHTML = newHTML.replace(/<span style="color: Tomato;">(.*?)<\/span>/g, chalk.red(`$1`));
    newHTML = newHTML.replace(/<span style="color: lightgreen;">(.*?)<\/span>/g, chalk.green(`$1`));
    newHTML = newHTML.replace(/<span style="color: MediumSeaGreen;">(.*?)<\/span>/g, chalk.greenBright(`$1`));
    newHTML = newHTML.replace(/<span style="opacity: 0.8;">(.*?)<\/span>/g, chalk.dim(`$1`));
    newHTML = newHTML.replace(/<span style="color: #000; background-color: #ddd;">(.*?)<\/span>/g, chalk.bgGreen.white(`\n\n$1`));
    newHTML = newHTML.replace(/<a href="([^"]+)">([^<]+)<\/a>/g, `${chalk.yellow.bold(`$2`)} ${chalk.yellowBright(`($1)`)}`);

    return newHTML;

  }
}