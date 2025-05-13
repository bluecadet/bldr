import type { InputOptions, OutputOptions } from "rollup";
import { RollupBabelInputPluginOptions } from "@rollup/plugin-babel";
import type { Options as SWCOptions } from '@swc/core';

export interface ConfigSettings {
  css?: AssetObjects;
  js?: AssetObjects;
  watchPaths?: string[];
  reloadExtensions?: string[];
  env?: EnvObject;
  postcss?: PostCSSSettings;
  esBuild?: BldrEsBuildSettings;
  rollup?: BldrRollupSettings;
  eslint?: BldrEsLintSettings;
  styleLint?: BldrStyleLintSettings;
  sass?: BldrSassSettings;
  sdc?: BldrSDCSettings;
  browsersync?: browsersyncSettings;
}



export interface AssetObject {
  /**
   * @description Path to source file(s). Can be a glob pattern.
   */
  src: string;

  /**
   * @description Path for files to be copied to.
   */
  dest: string;

  /**
   * @description Array of file paths to watch for changes.
   */
  watch?: string[];
}


export interface AssetObjects extends Array<AssetObject> {}


export interface EnvObject {
  /**
   * @description key is the environment name that is called in cli.
   */
  [key: string]: EnvObjectConfig;
}


export interface EnvObjectConfig {
  /**
   * @description CSS Paths
   */
  css?: AssetObjects[];
  /**
   * @description JS Paths
   */
  js?: AssetObjects[];
}



export interface PostCSSSettings {
  /**
   * @description PostCssPlugins
   */
  plugins?: [string, any][];

  /**
   * @description Override PostCssPlugins native to bldr
   */
  overridePlugins?: boolean;
}



export interface BldrEsBuildSettings {
  /**
   * @description EsBuild native to bldr
   */
  plugins?: [string, any][];

  /**
   * @description Override EsBuild plugins native to bldr
   */
  overridePlugins?: boolean;
}



export interface BldrRollupSettings {
  
  /**
   * @description set to true if babel should be used. Default: true unless `useSWC` is set to true
   */
  useBabel?: null | boolean; 
  

  /**
   * @description see @rollup/plugin-babel options at https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers)
   * default: { babelHelpers: 'bundled' }
   */
  babelPluginOptions?: null | RollupBabelInputPluginOptions;


  /**
   * @description set to true if SWC should be used. Default: false
   */
  useSWC?: null | boolean;

  /**
   * @description override bldr SWC options
   */
  swcPluginOptions?: null | SWCOptions;

  /**
   * @description set to false if terser should not be ran. Default: true
   */
  useTerser?: null | boolean;

  /**
   * @description set to false if terser should not be ran. Default: true
   */
  terserOptions?: null | any;

  sdcOptions?: BldrSDCRollupSettings

  /**
   * @description see rollups inputOptions object at https://rollupjs.org/guide/en/#inputoptions-object
   * `file` will automatically be added, so no need to add here
   * default: { external: [/@babel\/runtime/] }
   */
  inputOptions?: null | InputOptions;
  inputPlugins?: null | any[],
  overrideInputPlugins?: null | boolean;
  
  
  outputOptions?: null | OutputOptions;
  outputPlugins?: null | any[];
  overrideOutputPlugins?: null | boolean;
}


export interface BldrSDCRollupSettings {
  /**
   * @description set to false if SDC files should not be bundled. Default: true
   */
  bundle?: null | boolean;

  /**
   * @description set to false if SDC files should not be minified. Default: true
   */
  minify?: null | boolean;

  /**
   * @description set to false if SDC files should not be transpiled. Default: true
   */
  format?: null | 'amd' | 'cjs' | 'es' | 'iife' | 'umd' | 'system';
}
  




export interface BldrEsLintSettings {
  /**
   * set to false if eslint should not be ran. Default: true
   */
  useEslint?: boolean;
  options?: any;
  forceBuildIfError?: boolean;
  lintPathOverrides?: null | string[];
}


export interface BldrStyleLintSettings {
  useStyleLint?: boolean;
  forceBuildIfError?: boolean;
}


export interface BldrSassSettings {

  /**
   * @description set to true if dart sass should use legacy api. Default: false
   */
  useLegacy?: boolean;

}



export interface BldrSDCSettings {
  /**
   * @description Path to single directory components
   */
  directory: string;

  assetSubDirectory: string;

  /**
   * @description File prefix for SDC files. Default is `.bldr`, which, for example will process `file.bldr.css` to `file.css`
   */
  // fileExtensionPrefix?: string;


}


export interface browsersyncSettings {
  /**
   * @description set to false if browsersync should not be ran. Default: true
   */
  disable?: boolean;

  /**
   * @description browsersync instance name
   */
  instanceName?: string;
}



export interface LocalConfigSettings {
  /**
   * @description browserSync options
   */
  browserSync?: any;
}


export type ProcessKey = 'css' | 'js' | 'sass';




export interface ProcessAssetGroup {
  css?: {[key: string]:ProcessAsset};
  js?: {[key: string]:ProcessAsset};
  sass?: {[key: string]:ProcessAsset};
}

export interface ProcessAsset {
  src: string;
  dest: string;
}





