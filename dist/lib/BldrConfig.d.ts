import type { CommandSettings } from "./@types/commandSettings";
import type { BldrEsBuildSettings, BldrEsLintSettings, BldrRollupSettings, BldrSassSettings, BldrStyleLintSettings, BldrBiomeSettings, ConfigSettings, LocalConfigSettings, ProcessKey } from "./@types/configTypes";
import { BldrSettings } from "./BldrSettings.js";
export declare class BldrConfig {
    #private;
    /**
     * @property null|Class BldrConfig
     * Singleton instance of BldrConfig
     */
    static _instance: BldrConfig;
    /**
     * @property object
     * Settings from CLI input
     */
    cliArgs: CommandSettings;
    /**
     * @property null|Class BldrSettings
     */
    bldrSettings: BldrSettings;
    /**
     * @property boolean
     * If running in `dev` mode
     */
    isDev: boolean;
    /**
     * @property object
     * Contents of user configuration file
     */
    userConfig: ConfigSettings;
    /**
     * @property null|object
     * Local config
     */
    localConfig: null | LocalConfigSettings;
    /**
     * @property object
     * Process data source
     */
    processSrc: any;
    /**
     * @property null|object
     * Settings for processes
     */
    processAssetGroups: any;
    /**
     * @property null|array
     * Files for chokidar to watch
     */
    chokidarWatchArray: string[];
    /**
     * @property null|array
     * Files for chokidar to watch
     */
    chokidarIgnorePathsArray: string[];
    /**
     * @property null|array
     * File extensions for chokidar to reload
     */
    reloadExtensions: string[];
    /**
     * @property boolean
     * If Single Directory Component actions should be ran
     */
    isSDC: boolean;
    /**
     * @property null|object
     * Settings for single component directory processes
     */
    sdcProcessAssetGroups: any;
    /**
     * @property null|string
     * Path to the SDC directory
     */
    sdcPath: string;
    sdcPaths: string[];
    /**
     * @property null|string
     * Path to the SDC subdirectory
     */
    sdcAssetSubDirectory: string;
    /**
     * @property null|string
     * Environment key from CLI args
     */
    envKey: string | null;
    /**
     * @property null|object
     * User defined config for Sass processing
     */
    sassConfig: BldrSassSettings | null;
    /**
     * @property null|object
     * User defined config for EsBuild processing
     */
    esBuildConfig: BldrEsBuildSettings | null;
    /**
     * @property null|object
     * User defined config for Rollup processing
     */
    rollupConfig: BldrRollupSettings | null;
    /**
     * @property null|object
     * User defined config for EsLint processing
     */
    eslintConfig: BldrEsLintSettings | null;
    /**
     * @property null|object
     * User defined config for StyleLint processing
     */
    stylelintConfig: BldrStyleLintSettings | null;
    /**
     * @property null|object
     * User defined config for StyleLint processing
     */
    biomeConfig: BldrBiomeSettings | null;
    /**
     * @description BldrConfig constructor
     *
     * This class is a singleton and should only be instantiated once.
     * It is used to load the user config file and create the process asset config.
     * It also builds the provider config based on the user config.
     *
     * @param commandSettings {CommandSettings} options from the cli
     * @param isDev {boolean} if the command is run in dev mode
     *
     * @example
     * const bldrConfig = new BldrConfig(commandSettings);
     */
    constructor(commandSettings: CommandSettings, isDev?: boolean);
    /**
     * @method initialize
     * @description Initialize the BldrConfig class
     * @returns {Promise<void>}
     */
    initialize(): Promise<void>;
    /**
     * @method addFileToAssetGroup
     * @description add a file an asset group
     */
    addFileToAssetGroup(file: string, key: ProcessKey, isSDC?: boolean, dest?: string | null): Promise<void>;
    /**
     * @method rebuildConfig
     * @description Rebuild the configuration based on the user config file
     *
     * This method will reset the asset groups, reload the user config,
     * and rebuild the process and provider configurations.
     *
     * @returns {Promise<void>}
     */
    rebuildConfig(): Promise<void>;
}
//# sourceMappingURL=BldrConfig.d.ts.map