import type { InputOptions, OutputOptions } from "rollup";
import { RollupBabelInputPluginOptions } from "@rollup/plugin-babel";


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
   * @description Override EsBuild native to bldr
   */
  overridePlugins?: boolean;

  /**
   * @description Override the version of EsBuild being used
   */
  esBuild?: any;
}



export interface BldrRollupSettings {
  
  /**
   * @description set to false if babel should not be ran. Default: true
   */
  useBabel?: boolean; 
  
  /**
   * @description set to false if terser should not be ran. Default: true
   */
  useTerser?: boolean;

  /**
   * @description see @rollup/plugin-babel options at https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers)
   * default: { babelHelpers: 'bundled' }
   */
  babelPluginOptions?: RollupBabelInputPluginOptions;

  /**
   * @description see rollups inputOptions object at https://rollupjs.org/guide/en/#inputoptions-object
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


export interface BldrStyleLintSettings {
  useStyleLint?: boolean;
  forceBuildIfError?: boolean;
}


export interface BldrSassSettings {
  sass?: any;
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




// export interface ProcessAssetGroup {
//   css?: ProcessAsset[];
//   js?: ProcessAsset[];
//   sass?: ProcessAsset[];
// }

export interface ProcessAsset {
  src: string;
  dest: string;
}





