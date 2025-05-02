import type { InputOptions, OutputOptions } from "rollup";
import { RollupBabelInputPluginOptions } from "@rollup/plugin-babel";


export interface ConfigSettings {
  css?: AssetObjects;
  js?: AssetObjects;
  env?: EnvObject;
  postcss?: PostCSSSettings;
  esBuild?: BldrEsBuildSettings;
  rollup?: BldrRollupSettings;
  eslint?: BldrEsLintSettings;
  sasss?: BldrSassSettings;
}



export interface AssetObject {
  /**
   * Path to source file(s). Can be a glob pattern.
   */
  src: string;

  /**
   * Path for files to be copied to.
   */
  dest: string;

  /**
   * Array of file paths to watch for changes.
   */
  watch?: string[];
}


export interface AssetObjects extends Array<AssetObject> {}


export interface EnvObject {
  /**
   * Key is the environment name.
   */
  [key: string]: EnvObjectConfig;
}


export interface EnvObjectConfig {
  /**
   * CSS Paths
   */
  css?: AssetObjects[];
  /**
   * JS Paths
   */
  js?: AssetObjects[];
}



export interface PostCSSSettings {
  plugins?: [string, any][];
  overridePlugins?: boolean;
}



export interface BldrEsBuildSettings {
  plugins?: [string, any][];
  overridePlugins?: boolean;
  esBuild?: any;
}



export interface BldrRollupSettings {
  
  // set to false if babel should not be ran. Default: true
  useBabel?: boolean; 
  
  /**
   * set to false if terser should not be ran. Default: true
   */
  useTerser?: boolean;

  /**
   * see @rollup/plugin-babel options at https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers)
   * default: { babelHelpers: 'bundled' }
   */
  babelPluginOptions?: RollupBabelInputPluginOptions;

  /**
   * see rollups inputOptions object at https://rollupjs.org/guide/en/#inputoptions-object
   * `file` will automatically be added, so no need to add here
   * default: { external: [/@babel\/runtime/] }
   */
  inputOptions?: InputOptions;
  inputPlugins?: any[],
  overrideInputPlugins?: boolean;
  
  
  outputOptions?: OutputOptions;
  outputPlugins?: any[];
  overrideOutputPlugins?: boolean;
  
  rollup?: any;
}
  




export interface BldrEsLintSettings {
  /**
   * set to false if eslint should not be ran. Default: true
   */
  useEslint?: boolean;
  forceBuildIfError?: boolean;
}


export interface BldrSassSettings {
  sass?: any;
}
