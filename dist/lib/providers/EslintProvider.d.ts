export declare class EslintProvider {
    #private;
    /**
     * @property null|object
     * Chokidar instance
     */
    private bldrConfig;
    /**
     * @property null|Class EslintProvider
     * Singleton instance of EslintProvider
     */
    static _instance: EslintProvider;
    /**
     * @property null|string
     */
    notice: string;
    /**
     * @property null|object
     * ESLint instance
     */
    private eslint;
    /**
     * @property null|object
     */
    private formatter;
    /**
     * @property null | string
     */
    private resultMessage;
    /**
     * @property null | object
     */
    private eslintOptions;
    /**
     * @property null | string[]
     */
    private eslintAllPaths;
    private hasErrors;
    constructor();
    /**
     * @description Initialize the EslintProvider
     * @returns {Promise<void>}
     * @memberof EslintProvider
     */
    initialize(): Promise<false | undefined>;
    /**
     * @description Lint all files in the project
     * @returns {Promise<void>}
     * @memberof EslintProvider
     */
    lintAll(): Promise<false | undefined>;
    /**
     * @description Lint single file in the project
     * @param {string} filepath - Path to the file to lint
     * @returns {Promise<void>}
     * @memberof EslintProvider
     */
    lintFile(filepath: string): Promise<false | undefined>;
}
//# sourceMappingURL=EslintProvider.d.ts.map