import type { InputOptions, OutputOptions } from "rollup";
import type { RollupBabelInputPluginOptions } from "@rollup/plugin-babel";
import type { Options as SWCOptions } from '@swc/core';
/**
 * @description Bldr configuration settings for bldr.config.js
 */
export interface ConfigSettings {
    css?: AssetObjects;
    js?: AssetObjects;
    sass?: AssetObjects;
    watchPaths?: string[];
    reloadExtensions?: string[];
    env?: EnvObject;
    sdc?: BldrSDCSettings;
    esBuild?: BldrEsBuildSettings;
    rollup?: BldrRollupSettings;
    biome?: BldrBiomeSettings;
    eslint?: BldrEsLintSettings;
    stylelint?: BldrStyleLintSettings;
    sassConfig?: BldrSassSettings;
    browsersync?: browsersyncSettings;
}
/**
 * @description AssetObject for process objects
 */
export interface AssetObject {
    /**
     * @description Path to source file(s). Can be a glob pattern.
     */
    src: string;
    /**
     * @description Path for files to be copied to.
     */
    dest: string;
}
export interface AssetObjects extends Array<AssetObject> {
}
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
    /**
     * @description options for SDC rollup settings
     */
    sdcOptions?: BldrSDCRollupSettings;
    /**
     * @description see rollups inputOptions object at https://rollupjs.org/guide/en/#inputoptions-object
     * `file` will automatically be added, so no need to add here
     * default: { external: [/@babel\/runtime/] }
     */
    inputOptions?: null | InputOptions;
    inputPlugins?: null | any[];
    overrideInputPlugins?: null | boolean;
    /**
     * @description see rollups outputOptions object at https://rollupjs.org/javascript-api/#outputoptions-object
     */
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
    ignorePaths?: string[];
}
export interface BldrBiomeSettings {
    useBiome?: boolean;
    ignorePaths?: string[];
    forceBuildIfError?: boolean;
    writeLogfile?: boolean;
    logFilePath?: string;
}
export interface BldrStyleLintSettings {
    useStyleLint?: boolean;
    ignorePaths?: string[];
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
     * @description Path to single directory components or array of paths
     */
    directory: string | string[];
    assetSubDirectory: string;
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
     * @description browsersync options
     */
    browsersync?: any;
}
export type ProcessKey = 'css' | 'js' | 'sass';
export interface ProcessAssetGroup {
    css?: {
        [key: string]: ProcessAsset;
    };
    js?: {
        [key: string]: ProcessAsset;
    };
    sass?: {
        [key: string]: ProcessAsset;
    };
}
export interface ProcessAsset {
    src: string;
    dest: string;
}
//# sourceMappingURL=configTypes.d.ts.map