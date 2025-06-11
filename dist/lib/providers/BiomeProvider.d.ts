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
    private globIgnorePaths;
    private writeLogfile;
    private logFilePath;
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
     * @description Lint single file in the project
     * @param {string} filepath - Path to the file to lint
     * @returns {Promise<void>}
     * @memberof BiomeProvider
     */
    lintFile(filepath: string): Promise<false | undefined>;
}
//# sourceMappingURL=BiomeProvider.d.ts.map