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
    _instance: BrowsersyncProvider | null;
    notice: string;
    browsersyncInstance: any;
    constructor();
    initialize(): Promise<void>;
    bootstrap(): void;
    reload(): void;
    reloadJS(): void;
    reloadCSS(): void;
}
//# sourceMappingURL=BrowsersyncProvider.d.ts.map