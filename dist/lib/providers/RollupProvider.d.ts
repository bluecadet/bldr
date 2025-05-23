import { ProcessAsset } from '../@types/configTypes.js';
export declare class RollupProvider {
    /**
     * @property null|object
     * Chokidar instance
     */
    private bldrConfig;
    /**
     * @property null|Class RollupProvider
     * Singleton instance of RollupProvider
     */
    static _instance: RollupProvider;
    private rollupFinalConfig;
    notice: string;
    constructor();
    initialize(): Promise<void>;
    buildProcessBundle(): Promise<void>;
    /**
     * @description Build a single asset group
     * @param {ProcessAsset} assetGroup
     * @param {boolean} isSDC
     * @returns {Promise<void>}
     * @memberof RollupProvider
     */
    buildAssetGroup(assetGroup: ProcessAsset, isSDC?: boolean): Promise<void>;
    compileFinalConfig(): Promise<void>;
}
//# sourceMappingURL=RollupProvider.d.ts.map