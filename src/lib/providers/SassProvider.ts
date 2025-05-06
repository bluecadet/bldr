import { BldrConfig } from '../BldrConfig.js';

export class SassProvider {

  /**
   * @property null|object
   * Chokidar instance
   */
  private bldrConfig!: BldrConfig;

  /**
   * @property null|Class SassProvider
   * Singleton instance of SassProvider
   */
  public static _instance: SassProvider;

  public notice!: string;


  constructor() {

    if (SassProvider._instance) {
      return SassProvider._instance;
    }

    SassProvider._instance = this;

  }


  async initialize() {
    this.bldrConfig = BldrConfig._instance;
    this.notice = 'SassProvider initialized';
  }

}