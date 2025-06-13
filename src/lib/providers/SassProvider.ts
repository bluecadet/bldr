import type { ProcessAsset } from '../@types/configTypes.js';
import { BldrConfig } from '../BldrConfig.js';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { logSuccess, logError } from '../utils/loggers.js';
import { ensureDirectory } from '../utils/ensureDirectory.js';

export class SassProvider {

  /**
   * @property null|object
   * Chokidar instance
   */
  private bldrConfig!: BldrConfig;

  /**
   * @property null|Class SassProvider
   * Singleton instance of SassProvider
   */
  public static _instance: SassProvider;

  /**
   * @property string
   * SassProvider notice
   */
  public notice!: string;

  /**
   * @property null|object
   * Dart Sass instance
   */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private sass: any;

  constructor() {

    if (SassProvider._instance) {
      // biome-ignore lint/correctness/noConstructorReturn: <explanation>
      return SassProvider._instance;
    }

    SassProvider._instance = this;

  }


  /**
   * @method initialize
   * @description Initializes the SassProvider
   * @returns {Promise<void>}
   * @memberof SassProvider
   */
  async initialize(): Promise<void> {
    const require = createRequire(import.meta.url);
    this.bldrConfig = BldrConfig._instance;
    this.sass = require('sass');
    this.notice = 'SassProvider initialized';
  }

  async buildProcessBundle() {
    if ( !this.bldrConfig.processAssetGroups?.sass) {
      return;
    }

    await this.buildProcessAssetGroupsBundle();

    if ( this.bldrConfig.sdcProcessAssetGroups?.sass ) {
      for (const asset of Object.keys(this.bldrConfig.sdcProcessAssetGroups.sass)) {
        await this.buildAssetGroup(this.bldrConfig.sdcProcessAssetGroups.sass[asset]);
      }  
    }
  }



  /**
   * @method buildProcessAssetGroupsBundle
   * @description Builds the process bundle for sass
   * @returns {Promise<void>}
   * @memberof SassProvider
   */
  async buildProcessAssetGroupsBundle(): Promise<void> {
    if ( this.bldrConfig.sdcProcessAssetGroups?.sass ) {
      for (const asset of Object.keys(this.bldrConfig.sdcProcessAssetGroups.sass)) {
        await this.buildAssetGroup(this.bldrConfig.sdcProcessAssetGroups.sass[asset]);
      }  
    }
  }


  /**
   * @method buildAssetGroup
   * @description Builds the process bundle for sass
   * @param {ProcessAsset} assetGroup - The asset group to build
   * @returns {Promise<void>}
   * @memberof SassProvider
   */
  async buildAssetGroup(assetGroup: ProcessAsset): Promise<void> {

    const start       = Date.now();
    const {src, dest} = assetGroup;
    const filename    = path.basename(src);
    const ext         = path.extname(src);
    const cleanName   = filename.replace(ext, '');


    try {
    
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let result: any;

      await ensureDirectory(dest);
      
      if ( this.bldrConfig?.sassConfig?.useLegacy ) {
        result = await this.#legacy(src, dest);
      } else {
        result = await this.#build(src, dest);
      }

      if ( !result?.css || !result.css.toString() ) {
        logError('sass', `no css found in ${src}`);
        return;
      }

      let cssString = result.css.toString();

      if ( result?.sourceMap ) {
        cssString += `\n\n/*# sourceMappingURL=${cleanName}.css.map */`;
        fs.writeFileSync(path.join(dest, `${cleanName}.css.map`), JSON.stringify(result.sourceMap));
      }

      fs.writeFileSync(path.join(dest, `${cleanName}.css`), cssString);

      // Clock the time it took to process     
      const stop = Date.now();

      // Log success message
      logSuccess('sass', `${filename} processed`, ((stop - start) / 1000));

    } catch (error) {
      // General error caught
      const toBailOrNotToBail = this.bldrConfig.isDev ? {} : { throwError: true, exit: true };
      logError('sass', 'General error:', {});
      logError('sass', `${error}`, toBailOrNotToBail);
    }
    
  }


  /**
   * @method #legacy
   * @description Builds the process bundle for sass using the legacy method
   * @param {string} src - The source file
   * @param {string} dest - The destination directory
   * @returns {Promise<void>}
   * @memberof SassProvider
   */
  async #legacy(src: string, dest: string): Promise<void> {
    return this.sass.renderSync({
      file: src,
      sourceMap: this.bldrConfig.isDev,
      sourceMapContents: true,
      style: this.bldrConfig.isDev ? 'expanded' : 'compressed',
    });
  }


  /**
   * @method #build
   * @description Builds the process bundle for sass using the new method
   * @param {string} src - The source file
   * @param {string} dest - The destination directory
   * @returns {Promise<void>}
   * @memberof SassProvider
   */
  async #build(src: string, dest: string): Promise<void> {
    return this.sass.compile(src, {
      sourceMap: this.bldrConfig.isDev,
      sourceMapContents: true,
      style: this.bldrConfig.isDev ? 'expanded' : 'compressed',
    });
  }


}