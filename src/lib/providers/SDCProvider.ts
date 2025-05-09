import { BldrConfig } from '../BldrConfig.js';
import { logWarn } from '../utils/loggers.js';

export class SDCProvider {

  /**
   * @property null|object
   * Chokidar instance
   */
  private bldrConfig!: BldrConfig;

  /**
   * @property null|Class SDCProvider
   * Singleton instance of SDCProvider
   */
  public static _instance: SDCProvider;

  public notice!: string;


  constructor() {

    if (SDCProvider._instance) {
      return SDCProvider._instance;
    }

    SDCProvider._instance = this;

  }


  async initialize() {
    this.bldrConfig = BldrConfig._instance;
    this.notice = 'SDCProvider initialized';
  }


  async buildFile(filepath: string, type: 'css' | 'sass' | 'js') {
    if ( this.bldrConfig.sdcProcessAssetGroups?.[type]?.[filepath]) {
      console.log(this.bldrConfig.sdcProcessAssetGroups[type][filepath]);
    } else {
      logWarn(`SDC`, `No file found for ${filepath}`);
    }
  }

}