import { ProcessAsset } from '../@types/configTypes.js';
export declare class PostcssProvider {
    /**
     * @property null|object
     * Chokidar instance
     */
    private bldrConfig;
    /**
     * @property null|Class PostcssProvider
     * Singleton instance of PostcssProvider
     */
    static _instance: PostcssProvider;
    /**
     * @property string
     * PostcssProvider notice
     */
    notice: string;
    /**
     * @property null|object
     * Postcss instance
     */
    private postcss;
    /**
     * @property null|object
     * Postcssrc instance
     */
    private postcssrc;
    constructor();
    /**
     * @method initialize
     * @description Initializes the PostcssProvider
     * @returns {Promise<void>}
     * @memberof PostcssProvider
     */
    initialize(): Promise<void>;
    /**
     * @method buildProcessBundle
     * @description Builds the process bundle for postcss
     * @returns {Promise<void>}
     * @memberof PostcssProvider
     */
    buildProcessBundle(): Promise<void>;
    /**
     * @method buildProcessAssetGroupsBundle
     * @description Builds the asset groups bundle for postcss
     * @returns {Promise<void>}
     * @memberof PostcssProvider
     */
    buildProcessAssetGroupsBundle(): Promise<void>;
    /**
     * @method buildAssetGroup
     * @description Builds the asset group for postcss
     * @param {ProcessAsset} assetGroup
     * @returns {Promise<void>}
     * @memberof PostcssProvider
     */
    buildAssetGroup(assetGroup: ProcessAsset): Promise<boolean>;
}
//# sourceMappingURL=PostcssProvider.d.ts.map