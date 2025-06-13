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
    /**
     * @property null | string
     * Notice message
     */
    notice: string;
    /**
     * @property null | string[]
     * All paths to lint
     */
    private allStylelintPaths;
    /**
     * @property null | boolean
     * Whether to allow stylelint to run
     */
    private allowStylelint;
    /**
     * @property null | string
     * Result message for errors
     */
    private resultMessage;
    private hasErrors;
    constructor();
    /**
     * @description Initialize the StylelintProvider
     * @returns {Promise<void>}
     * @memberof StylelintProvider
     */
    initialize(): Promise<void>;
    /**
     * @description Lint all files in the project
     * @returns {Promise<void>}
     * @memberof EslintProvider
     */
    lintAll(): Promise<void>;
    /**
     * @description Set the paths for stylelint
     * @returns {Promise<void>}
     * @memberof EslintProvider
     * @private
     */
    /**
     * @description Lint single file in the project
     * @param {string} filepath - Path to the file to lint
     * @returns {Promise<void>}
     * @memberof EslintProvider
     */
    lintFile(filepath: string): Promise<void>;
}
//# sourceMappingURL=StylelintProvider.d.ts.map