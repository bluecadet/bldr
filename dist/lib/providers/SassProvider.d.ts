import { ProcessAsset } from '../@types/configTypes.js';
export declare class SassProvider {
    #private;
    /**
     * @property null|object
     * Chokidar instance
     */
    private bldrConfig;
    /**
     * @property null|Class SassProvider
     * Singleton instance of SassProvider
     */
    static _instance: SassProvider;
    /**
     * @property string
     * SassProvider notice
     */
    notice: string;
    /**
     * @property null|object
     * Dart Sass instance
     */
    private sass;
    constructor();
    /**
     * @method initialize
     * @description Initializes the SassProvider
     * @returns {Promise<void>}
     * @memberof SassProvider
     */
    initialize(): Promise<void>;
    buildProcessBundle(): Promise<void>;
    buildProcessAssetGroupsBundle(): Promise<void>;
    /**
     * @method buildAssetGroup
     * @description Builds the process bundle for sass
     * @param {ProcessAsset} assetGroup - The asset group to build
     * @returns {Promise<void>}
     * @memberof SassProvider
     */
    buildAssetGroup(assetGroup: ProcessAsset): Promise<void>;
}
//# sourceMappingURL=SassProvider.d.ts.map