import type { ProcessAsset } from '../@types/configTypes.js';
import { BldrConfig } from '../BldrConfig.js';
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { logError, logPostCssErrorMessage, logSuccess } from '../utils/loggers.js';
import { ensureDirectory } from '../utils/ensureDirectory.js';


export class PostcssProvider {

  /**
   * @property null|object
   * Chokidar instance
   */
  private bldrConfig!: BldrConfig;

  /**
   * @property null|Class PostcssProvider
   * Singleton instance of PostcssProvider
   */
  public static _instance: PostcssProvider;

  /**
   * @property string
   * PostcssProvider notice
   */
  public notice!: string;

  /**
   * @property null|object
   * Postcss instance
   */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private  postcss: any;

  /**
   * @property null|object
   * Postcssrc instance
   */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private postcssrc: any;


  /**
   * @description Syntax rules for postcss
   */
  private syntax!: {
    rules: { test: RegExp; extract?: string; lang?: string }[];
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    css: any;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    sass: any;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    scss: any;
  };


  constructor() {

    if (PostcssProvider._instance) {
      // biome-ignore lint/correctness/noConstructorReturn: <explanation>
      return PostcssProvider._instance;
    }

    PostcssProvider._instance = this;

  }


  /**
   * @method initialize
   * @description Initializes the PostcssProvider
   * @returns {Promise<void>}
   * @memberof PostcssProvider
   */
  async initialize(): Promise<void> {
    const require = createRequire(import.meta.url);
    this.bldrConfig = BldrConfig._instance;
    this.postcss = require('postcss');
    this.postcssrc = require('postcss-load-config');
    this.notice = 'PostcssProvider initialized';

    this.syntax = require('postcss-syntax')({
      rules: [
        {
          test: /\.(?:[sx]?html?|[sx]ht|vue|ux|php)$/i,
          extract: 'html',
        },
        {
          test: /\.(?:markdown|md)$/i,
          extract: 'markdown',
        },
        {
          test: /\.(?:m?[jt]sx?|es\d*|pac)$/i,
          extract: 'jsx',
        },
        {
          test: /\.(?:postcss|pcss|css)$/i,
          lang: 'scss',
        },
      ],
      css: require('postcss-safe-parser'),
      sass: require('postcss-sass'),
      scss: require('postcss-scss'),
    });
  }


  /**
   * @method buildProcessBundle
   * @description Builds the process bundle for postcss
   * @returns {Promise<void>}
   * @memberof PostcssProvider
   */
  async buildProcessBundle(): Promise<void> {
    await this.buildProcessAssetGroupsBundle();

    if ( this.bldrConfig.sdcProcessAssetGroups?.css ) {
      for (const asset of Object.keys(this.bldrConfig.sdcProcessAssetGroups.css)) {
        await this.buildAssetGroup(this.bldrConfig.sdcProcessAssetGroups.css[asset]);
      }  
    }    
  }


  /**
   * @method buildProcessAssetGroupsBundle
   * @description Builds the asset groups bundle for postcss
   * @returns {Promise<void>}
   * @memberof PostcssProvider
   */
  async buildProcessAssetGroupsBundle(): Promise<void> {
    if ( this.bldrConfig.processAssetGroups?.css ) {
      for (const asset of Object.keys(this.bldrConfig.processAssetGroups.css)) {
        await this.buildAssetGroup(this.bldrConfig.processAssetGroups.css[asset]);
      }
    }
  }


  /**
   * @method buildAssetGroup
   * @description Builds the asset group for postcss
   * @param {ProcessAsset} assetGroup
   * @returns {Promise<void>}
   * @memberof PostcssProvider
   */
  async buildAssetGroup(assetGroup: ProcessAsset): Promise<void> {

    const start             = Date.now();
    const {src, dest}       = assetGroup;
    const buffer            = fs.readFileSync(src);
    const fileContent       = buffer.toString();
    const fileName          = path.basename(src);
    const fileBase          = path.basename(src, path.extname(src));
    const writeFileName     = `${fileBase}.css`;
    const mapOpts           = this.bldrConfig.isDev ? { inline: false }: false;
    const toBailOrNotToBail = this.bldrConfig.isDev ? {} : { throwError: true, exit: true };
    
    const ctx = {
      bldrEnv: this.bldrConfig.isDev ? 'dev' : 'build',
      cli: this.bldrConfig.cliArgs,
    };

    const postCSSConfig = await this.postcssrc(ctx);

    try {

      // Run postcss process
      const postCssResult = await this.postcss(postCSSConfig.plugins).process(fileContent, {
        syntax: postCSSConfig.options?.syntax ?? this.syntax,
        from:   src,
        to:     writeFileName,
        map:    postCSSConfig.options?.map ?? mapOpts,
      });
  
      // Check if postCssResult contains css
      if ( !postCssResult?.css ) {
        logError('postcss', `${fileName} does not contain css, generated blank file`);
      }

      // Check if destination directory exists, make it if not
      await ensureDirectory(dest);
  
      // Write the file to the destination
      try {
        fs.writeFileSync(path.join(dest, writeFileName), postCssResult.css);
      } catch (err) {
        // Error if can't write file
        logError('postcss', `error writing ${fileName} to ${dest}`, {});
        logError('postcss', `${err}`, toBailOrNotToBail);
        return;
      }
  
      // Write maps
      if ( mapOpts ) {
        if (postCssResult.map) {
          try {
            fs.writeFileSync(`${path.join(dest, writeFileName)}.map`, postCssResult.map.toString())
          } catch (err) {
            // Error if can't write file
            logError('postcss', `error writing ${fileName} map file to ${dest}`, {});
            logError('postcss', `${err}`, toBailOrNotToBail);
            return;
          }
        }
      }
  
      // Clock the time it took to process     
      const stop = Date.now();
  
      // Log success message
      logSuccess('postcss', `${fileName} processed`, ((stop - start) / 1000));
  
      // All done
      return;
  
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch(err: any) {

      if ( err?.file ) {
        // Postcss error messaging
        logPostCssErrorMessage(err, {});
      } else {
        // General error caught
        logError('postcss', 'General error:', {});
        logError('postcss', `${err}`, toBailOrNotToBail);
      }
  
      // Allow process to continue if watch is running
      if ( this.bldrConfig.isDev ) {
        return;
      }
  
      process.exit(1);
  
    }
  }
}