export declare class BiomeProvider {
    /**
     * @property null|object
     * Chokidar instance
     */
    private bldrConfig;
    /**
     * @property null | object
     */
    private throwError;
    /**
     * @property null | object
     */
    private bailOnError;
    /**
     * @property null | string
     */
    private errorsFoundMessage;
    /**
     * @property null | string
     */
    private devLintCommand;
    /**
     * @property null | string
     */
    private devFormatCommand;
    /**
     * @property null | string
     */
    private devRunCommand;
    /**
     * @property null|Class BiomeProvider
     * Singleton instance of BiomeProvider
     */
    static _instance: BiomeProvider;
    constructor();
    initialize(): void;
    lintAll(): Promise<void>;
    /**
     * @description Lint single file in the project
     * @param {string} filepath - Path to the file to lint
     * @returns {Promise<void>}
     * @memberof BiomeProvider
     */
    lintFile(filepath: string): Promise<void>;
}
//# sourceMappingURL=BiomeProvider.d.ts.map