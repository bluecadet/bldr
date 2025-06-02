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
    /**
     * @method buildProcessBundle
     * @description Build the process bundle, which includes all asset groups defined in the processAssetGroups config
     * @return {Promise<void>}
     * @memberof EsBuildProvider
     */
    buildProcessBundle(): Promise<void>;
    /**
     * @method buildProcessAssetGroupsBundle
     * @description Builds the asset groups bundle for esbuild
     * @return {Promise<void>}
     * @memberof EsBuildProvider
     */
    buildProcessAssetGroupsBundle(): Promise<void>;
    buildAssetGroup(assetGroup: ProcessAsset): Promise<void>;
}
//# sourceMappingURL=EsBuildProvider.d.ts.map