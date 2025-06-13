export declare class BrowsersyncProvider {
    /**
     * @property null|object
     * Chokidar instance
     */
    private bldrConfig;
    /**
     * @property null|Class BrowsersyncProvider
     * Singleton instance of BrowsersyncProvider
     */
    static _instance: BrowsersyncProvider;
    /**
     * @property null|string
     * Notice message
     */
    notice: string;
    /**
     * @property null|object
     * Browsersync instance
     */
    browsersyncInstance: any;
    constructor();
    initialize(): Promise<void>;
    /**
     * @method bootstrap
     * @description Starts the Browsersync server with the provided configuration.
     * @returns {void}
     */
    bootstrap(): void;
    /**
     * @method reload
     * @description Reloads the Browsersync server.
     * @returns {void}
     */
    reload(): void;
    /**
     * @method reloadHTML
     * @description Reloads the Browsersync server for js files.
     * @returns {void}
     */
    reloadJS(): void;
    /**
     * @method reloadCSS
     * @description Reloads the Browsersync server for css files.
     * @returns {void}
     */
    reloadCSS(): void;
}
//# sourceMappingURL=BrowsersyncProvider.d.ts.map