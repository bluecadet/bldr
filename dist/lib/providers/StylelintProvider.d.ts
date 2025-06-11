export declare class StylelintProvider {
    #private;
    /**
     * @property null|object
     * Chokidar instance
     */
    private bldrConfig;
    /**
     * @property null|Class Stylelint
     * Singleton instance of Stylelint
     */
    static _instance: StylelintProvider;
    notice: string;
    private allPaths;
    private allowStylelint;
    private bailOnError;
    private resultMessage;
    private hasErrors;
    constructor();
    initialize(): Promise<void>;
    /**
     * @description Lint all files in the project
     * @returns {Promise<void>}
     * @memberof EslintProvider
     */
    lintAll(): Promise<void>;
    /**
     * @description Lint single file in the project
     * @param {string} filepath - Path to the file to lint
     * @returns {Promise<void>}
     * @memberof EslintProvider
     */
    lintFile(filepath: string): Promise<void>;
}
//# sourceMappingURL=StylelintProvider.d.ts.map