import { BldrConfig } from '../BldrConfig.js';

export class RollupProvider {

  /**
   * @property null|object
   * Chokidar instance
   */
  private bldrConfig!: BldrConfig;

  /**
   * @property null|Class RollupProvider
   * Singleton instance of RollupProvider
   */
  public static _instance: RollupProvider;

  public notice!: string;


  constructor() {

    if (RollupProvider._instance) {
      return RollupProvider._instance;
    }

    RollupProvider._instance = this;

  }


  async initialize() {
    this.bldrConfig = BldrConfig._instance;
    this.notice = 'RollupProvider initialized';
  }

}