import { ProcessAsset } from '../@types/configTypes.js';
import { BldrConfig } from '../BldrConfig.js';
import path from 'node:path';
import fs from 'node:fs';

import { rollup } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
// import injectProcessEnv from 'rollup-plugin-inject-process-env';
import swc from '@rollup/plugin-swc';
import { babel } from '@rollup/plugin-babel';

import { minify } from "terser";
import { logAction, logError, logSuccess } from '../utils/loggers.js';
import { ensureDirectory } from '../utils/ensureDirectory.js';

export class RollupProvider {

  /**
   * @property null|object
   * Chokidar instance
   */
  private bldrConfig!: BldrConfig;

  /**
   * @property null|Class RollupProvider
   * Singleton instance of RollupProvider
   */
  public static _instance: RollupProvider;


  private rollupFinalConfig!: any;

  public notice!: string;


  constructor() {

    if (RollupProvider._instance) {
      return RollupProvider._instance;
    }

    RollupProvider._instance = this;

  }


  async initialize() {
    this.bldrConfig = BldrConfig._instance;
    this.notice = 'RollupProvider initialized';
  }

  
  async buildProcessBundle() {
    if ( !this.bldrConfig.processAssetGroups?.js || !this.bldrConfig.sdcProcessAssetGroups?.js ) {
      return;
    }

    await this.compileFinalConfig();

    if ( this.bldrConfig.processAssetGroups?.js ) {
      for (const asset of Object.keys(this.bldrConfig.processAssetGroups.js)) {
        await this.buildAssetGroup(this.bldrConfig.processAssetGroups.js[asset]);
      }
    }

    if ( this.bldrConfig.sdcProcessAssetGroups?.js ) {
      for (const asset of Object.keys(this.bldrConfig.sdcProcessAssetGroups.js)) {
        await this.buildAssetGroup(this.bldrConfig.sdcProcessAssetGroups.js[asset], true);
      }
    }
    
  }


  /**
   * @description Build a single asset group
   * @param {ProcessAsset} assetGroup
   * @param {boolean} isSDC
   * @returns {Promise<void>}
   * @memberof RollupProvider
   */
  async buildAssetGroup(assetGroup: ProcessAsset, isSDC: boolean = false): Promise<void> {

    const {src, dest} = assetGroup;
    const filename = path.basename(src);
    const destPath = path.join(dest, filename);

    if ( isSDC && this.bldrConfig.rollupConfig?.sdcOptions?.bundle === false ) {
      logAction('rollup', `rollup.sdcOptions.bundle is set to false in config, copying ${filename}`);
      await ensureDirectory(dest);
      fs.copyFileSync(src, destPath);
      return;      
    }

    const bundleConfig = {
      ...this.rollupFinalConfig,
    };
    
    bundleConfig.inputOptions.input = src;
    bundleConfig.outputOptions.file = destPath;

    if ( isSDC && this.bldrConfig.rollupConfig?.sdcOptions?.format ) {
      bundleConfig.outputOptions.format = this.bldrConfig.rollupConfig.sdcOptions?.format;
    }

    let bundle;
    let buildStart = 0;
    let buildEnd = 0;

    try {

      await ensureDirectory(dest);

      buildStart = new Date().getTime();
      // create a bundle
      bundle = await rollup({...this.rollupFinalConfig.inputOptions, input: src});
      // write the bundle
      await bundle.write({...this.rollupFinalConfig.outputOptions, file: destPath});
  
    } catch (error) {
      console.error(error);
      logError('rollup', `An error occured while creating the bundle for ${src}`, { throwError: true, exit: true });
    }

    // Handle build time
    if (bundle) {

      await bundle.close();
      buildEnd = new Date().getTime();
      logSuccess('rollup', `${filename} processed`, `${(buildEnd - buildStart)/1000}`);

      if ( this.bldrConfig.rollupConfig?.useTerser ) {
        if ( !isSDC || (isSDC && (this.bldrConfig.rollupConfig?.sdcOptions?.minify !== false) ) ) {
          try {
            const terserStart     = new Date().getTime();
            const bundledFileData = fs.readFileSync(destPath, 'utf8');
            const result          = await minify(bundledFileData, this.bldrConfig.rollupConfig?.terserOptions || {});
            fs.writeFileSync(destPath, result.code as string, "utf8");
            const terserStop = new Date().getTime();
            logSuccess('terser', `${filename} minified`, `${(terserStop - terserStart)/1000}`);
          } catch(err) {
            console.log(err);
            logError('terser', 'Build Error', { throwError: true });
          }
        }
      }

    }

  }


  async compileFinalConfig() {
    this.rollupFinalConfig = {
      inputOptions: {},
      outputOptions: {},
    };


    // INPUT OPTIONS
    if ( this.bldrConfig.rollupConfig?.inputOptions) {
      this.rollupFinalConfig.inputOptions = {...this.bldrConfig.rollupConfig.inputOptions};
    }

    // INPUT PLUGINS
    if (this.bldrConfig.rollupConfig?.overrideInputPlugins ) {
      // User overrides all plugins
      this.rollupFinalConfig.inputOptions.plugins = this.bldrConfig.rollupConfig?.inputPlugins || [];

    } else {
      // Default plugins
      const inputPlugins = [];

      // CommonJS
      inputPlugins.push(commonjs());

      // Replace process.env in files with production
      // inputPlugins.push(injectProcessEnv({
      //   NODE_ENV: 'production',
      // }));


      // SWC or Babel
      if ( this.rollupFinalConfig.useSWC ) {
        inputPlugins.push(swc(this.rollupFinalConfig.swcPluginOptions || {}));
      } else if ( this.rollupFinalConfig.useBabel ) {
        inputPlugins.push(babel(this.rollupFinalConfig.babelPluginOptions));
      }

      // Node resolve
      inputPlugins.push(nodeResolve());


      // Set plugins
      if ( this.bldrConfig.rollupConfig?.inputPlugins ) {
        // User added plugins
        this.rollupFinalConfig.inputOptions.plugins = [...inputPlugins, ...this.bldrConfig.rollupConfig.inputPlugins];
      } else {
        this.rollupFinalConfig.inputOptions.plugins = inputPlugins;
      }
    }

    
    
    
    
    
    // OUTPUT OPTIONS
    if ( this.bldrConfig.rollupConfig?.outputOptions) {
      this.rollupFinalConfig.outputOptions = {...this.bldrConfig.rollupConfig.outputOptions};
    }

    // OUTPUT PLUGINS
    if (this.bldrConfig.rollupConfig?.overrideOutputPlugins ) {
      // User overrides all plugins
      this.rollupFinalConfig.outputOptions.plugins = this.bldrConfig.rollupConfig?.outputPlugins || [];

    } else {
      // Default plugins
      this.rollupFinalConfig.outputOptions.plugins = [];
    }

    if ( !this.rollupFinalConfig.outputOptions.format ) {
      this.rollupFinalConfig.outputOptions.format = 'es';
    }

  }
  

}