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
    private biomeConfig;
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
    lintFile(filepath: string): Promise<boolean>;
    /**
     * Check if a file matches any pattern in an array of glob patterns
     * Patterns starting with ! are treated as negations
     * @param {string} filePath - The file path to check
     * @param {string[]} patterns - Array of glob patterns (can include negations with !)
     * @returns {boolean} - True if file matches and isn't negated, false otherwise
     */
    matchesPattern(filePath: string, patterns: string[]): boolean;
}
//# sourceMappingURL=BiomeProvider.d.ts.map