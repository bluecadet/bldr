import { ProcessAsset } from '../@types/configTypes.js';
export declare class EsBuildProvider {
    /**
     * @property null|object
     * Chokidar instance
     */
    private bldrConfig;
    /**
     * @property null|Class EsBuildProvider
     * Singleton instance of EsBuildProvider
     */
    static _instance: EsBuildProvider;
    notice: string;
    constructor();
    initialize(): Promise<void>;
    buildProcessBundle(): Promise<void>;
    buildAssetGroup(assetGroup: ProcessAsset): Promise<void>;
}
//# sourceMappingURL=EsBuildProvider.d.ts.map