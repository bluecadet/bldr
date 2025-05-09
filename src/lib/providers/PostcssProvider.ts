import { ProcessAsset } from '../@types/configTypes.js';
import { BldrConfig } from '../BldrConfig.js';

export class PostcssProvider {

  /**
   * @property null|object
   * Chokidar instance
   */
  private bldrConfig!: BldrConfig;

  /**
   * @property null|Class PostcssProvider
   * Singleton instance of PostcssProvider
   */
  public static _instance: PostcssProvider;

  public notice!: string;


  constructor() {

    if (PostcssProvider._instance) {
      return PostcssProvider._instance;
    }

    PostcssProvider._instance = this;

  }


  async initialize() {
    this.bldrConfig = BldrConfig._instance;
    this.notice = 'PostcssProvider initialized';
  }


  async buildFile(filepath: string) {
    if ( this.bldrConfig.processAssetGroups?.css?.[filepath]) {
      console.log(this.bldrConfig.processAssetGroups?.css?.[filepath]);
    } else {
      console.warn(`Postcss`, `No css process found for ${filepath}`);
    }

  }

  async buildAssetGroup(assetGroup: ProcessAsset) {
    console.log(assetGroup);
  }

}