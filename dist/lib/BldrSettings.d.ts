import type { CommandSettings } from './@types/commandSettings';
export declare class BldrSettings {
    /**
     * @description Singleton instance of BldrSettings
     */
    static _instance: BldrSettings;
    /**
     * @description Version of the bldr package
     */
    version: string;
    /**
     * @description Root directory of the bldr package
     */
    bldrRoot: string;
    /**
     * @description Name of the user config file
     */
    configFileName: string;
    /**
     * @description Path to the user config file
     */
    configFilePath: string;
    /**
     * @description Name of the user local config file
     */
    localConfigFileName: string;
    /**
     * @description Path to the user local config file
     */
    localConfigFilePath: string;
    /**
     * @description Root directory of the project
     */
    root: string;
    /**
     * @description List of allowed process keys
     * @default ['css', 'sass', 'js']
     */
    allowedProcessKeys: string[];
    /**
     * @description Settings for the command line interface
     */
    commandSettings: CommandSettings;
    /**
     * @description Flag indicating if the current environment is development
     */
    isDev: boolean;
    constructor();
}
//# sourceMappingURL=BldrSettings.d.ts.map