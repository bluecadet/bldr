export declare class BiomeProvider {
    #private;
    /**
     * @property null|object
     * Chokidar instance
     */
    private bldrConfig;
    /**
     * @property null|Class BiomeProvider
     * Singleton instance of BiomeProvider
     */
    static _instance: BiomeProvider;
    /**
     * @property null | object
     * Biome instance
     */
    private biomeInstance;
    /**
     * @property null|string
     */
    notice: string;
    /**
     * @property null | string
     */
    private resultMessage;
    /**
     * @property null | string[]
     */
    private biomeAllPaths;
    /**
     * @property boolean
     * Whether to write a log file
     */
    private writeLogfile;
    /**
     * @property null | string
     * Path to the log file
     */
    private logFilePath;
    /**
     * @property boolean
     * Whether or not errors have been found
     */
    private hasErrors;
    constructor();
    initialize(): Promise<false | undefined>;
    /**
     * @description Lint all files in the project
     * @returns {Promise<void>}
     * @memberof BiomeProvider
     */
    lintAll(): Promise<void>;
    /**
     * @description Set the paths for biome to lint
     * @returns {Promise<void>}
     * @memberof BiomeProvider
     * @private
     */
    /**
     * @description Lint single file in the project
     * @param {string} filepath - Path to the file to lint
     * @returns {Promise<void>}
     * @memberof BiomeProvider
     */
    lintFile(filepath: string): Promise<void>;
}
//# sourceMappingURL=BiomeProvider.d.ts.map