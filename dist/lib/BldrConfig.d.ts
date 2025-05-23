import { CommandSettings } from "./@types/commandSettings";
import { BldrEsBuildSettings, BldrEsLintSettings, BldrRollupSettings, BldrSassSettings, BldrStyleLintSettings, ConfigSettings, LocalConfigSettings, ProcessAsset, ProcessKey } from "./@types/configTypes";
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
     * Settings from CLI input
     */
    isDev: boolean;
    /**
     * @property object
     * Contents of user configuration file
     */
    userConfig: ConfigSettings;
    /**
     * @property null|object
     * Config from projects bldrConfigLocal.js
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
     * Files for chokidar to watch
     */
    watchAssetArray: string[];
    /**
     * @property null|array
     * Files for chokidar to watch
     */
    reloadExtensions: string[];
    /**
     * @property null|object
     * Src/Dest/Watch for each process
     */
    sdcProcessAssetGroups: any;
    /**
     * @property null|object
     * SDC extension prefix
     */
    /**
     * @property null|string
     * Path to the SDC directory
     */
    sdcPath: string;
    /**
     * @property null|string
     * Path to the SDC directory
     */
    sdcAssetSubDirectory: string;
    /**
     * @property boolean
     * If Single Directory Component actions should be ran
     */
    isSDC: boolean;
    /**
     * @property null|object
     * Settings for Single Directory Component actions
     */
    sdcConfig: any;
    sdcLocalPath: string | null;
    sdcLocalPathTest: string | null;
    envKey: string | null;
    sassConfig: BldrSassSettings | null;
    esBuildConfig: BldrEsBuildSettings | null;
    rollupConfig: BldrRollupSettings | null;
    eslintConfig: BldrEsLintSettings | null;
    stylelintConfig: BldrStyleLintSettings | null;
    /**
     * @param commandSettings {CommandSettings} options from the cli
     * @param isDev {boolean} if the command is run in dev mode
     */
    constructor(commandSettings: CommandSettings, isDev?: boolean);
    getInstance(): BldrConfig;
    /**
     * @description Initialize the config class
     */
    initialize(): Promise<void>;
    /**
     * @method addFileToAssetGroup
     * @description add a file an asset group
     */
    addFileToAssetGroup(file: string, key: ProcessKey, isSDC?: boolean, dest?: string | null): Promise<void>;
    /**
     * @description Create a src/dest object for a file to be processed
     */
    createSrcDestObject(src: string, dest: string): ProcessAsset;
    /**
     * @method addChokidarWatchFile
     * @description add a file to the watch path array
     */
    addChokidarWatchFile(watchPath: string): Promise<void>;
    rebuildConfig(): Promise<void>;
}
//# sourceMappingURL=BldrConfig.d.ts.map