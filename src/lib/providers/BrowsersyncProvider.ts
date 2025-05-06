import { BldrConfig } from '../BldrConfig.js';

export class BrowsersyncProvider {

  /**
   * @property null|object
   * Chokidar instance
   */
  private bldrConfig!: BldrConfig;

  /**
   * @property null|Class BrowsersyncProvider
   * Singleton instance of BrowsersyncProvider
   */
  public static _instance: BrowsersyncProvider;

  public notice!: string;


  constructor() {

    if (BrowsersyncProvider._instance) {
      return BrowsersyncProvider._instance;
    }

    BrowsersyncProvider._instance = this;

  }


  async initialize() {
    this.bldrConfig = BldrConfig._instance;
    this.notice = 'BrowsersyncProvider initialized';
  }

}