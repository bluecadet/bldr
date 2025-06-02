import { ProcessAsset } from '../@types/configTypes.js';
import { BldrConfig } from '../BldrConfig.js';
import * as esBuild from 'esbuild';
import path from 'node:path';
import { logError, logSuccess } from '../utils/loggers.js';
import { ensureDirectory } from '../utils/ensureDirectory.js';

export class EsBuildProvider {

  /**
   * @property null|object
   * Chokidar instance
   */
  private bldrConfig!: BldrConfig;

  /**
   * @property null|Class EsBuildProvider
   * Singleton instance of EsBuildProvider
   */
  public static _instance: EsBuildProvider;

  public notice!: string;


  constructor() {

    if (EsBuildProvider._instance) {
      return EsBuildProvider._instance;
    }

    EsBuildProvider._instance = this;

  }


  async initialize() {
    this.bldrConfig = BldrConfig._instance;
    this.notice = 'ESBuildProvider initialized';
  }


  /**
   * @method buildProcessBundle
   * @description Build the process bundle, which includes all asset groups defined in the processAssetGroups config
   * @return {Promise<void>}
   * @memberof EsBuildProvider
   */
  async buildProcessBundle(): Promise<void> {
    if ( !this.bldrConfig.processAssetGroups?.js) {
      return;
    }

    await this.buildProcessAssetGroupsBundle();

    if ( this.bldrConfig.sdcProcessAssetGroups?.js ) {
      for (const asset of Object.keys(this.bldrConfig.sdcProcessAssetGroups.js)) {
        await this.buildAssetGroup(this.bldrConfig.sdcProcessAssetGroups.js[asset]);
      }
    }
  }


  /**
   * @method buildProcessAssetGroupsBundle
   * @description Builds the asset groups bundle for esbuild
   * @return {Promise<void>}
   * @memberof EsBuildProvider
   */
  async buildProcessAssetGroupsBundle(): Promise<void> {
    if ( this.bldrConfig.processAssetGroups?.js ) {
      for (const asset of Object.keys(this.bldrConfig.processAssetGroups.js)) {
        await this.buildAssetGroup(this.bldrConfig.processAssetGroups.js[asset]);
      }
    }
  }

  async buildAssetGroup(assetGroup: ProcessAsset) {
    
    const start = Date.now();
    const { src, dest } = assetGroup;
    const fileName = path.basename(src);
    const plugins  = (this.bldrConfig?.esBuildConfig?.plugins ?? []).map(([name, options]) => ({ name, ...options }));
    

    try {

      await ensureDirectory(dest);

      const result = await esBuild
        .build({
          entryPoints: [src],
          bundle: true,
          outfile: path.join(dest, fileName),
          sourcemap: true,
          plugins: plugins,
        });

      const stop = Date.now();

      logSuccess('esbuild', `${fileName} processed`, ((stop - start) / 1000));

    } catch (error) {
      // General error caught
      const toBailOrNotToBail = this.bldrConfig.isDev ? {} : { throwError: true, exit: true };
      logError(`esbuild`, `General error:`, {});
      logError(`esbuild`, `${error}`, toBailOrNotToBail);
    }
  }

}