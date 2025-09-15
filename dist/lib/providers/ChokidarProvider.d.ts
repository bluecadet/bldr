export declare class ChokidarProvider {
    #private;
    /**
     * @property null|object
     * Chokidar instance
     */
    watcher: any;
    private bldrConfig;
    private EsBuild;
    private Postcss;
    private Sass;
    private Browsersync;
    private EsLint;
    private Stylelint;
    private Biome;
    private isSDCFile;
    constructor();
    /**
     * @method initialize
     * @description Initializes the ChokidarProvider
     * @returns {Promise<void>}
     * @memberof ChokidarProvider
     */
    initialize(): Promise<void>;
}
//# sourceMappingURL=ChokidarProvider.d.ts.map