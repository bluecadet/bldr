import { BldrConfig } from '../BldrConfig.js';

export class EslintProvider {

  /**
   * @property null|object
   * Chokidar instance
   */
  private bldrConfig!: BldrConfig;

  /**
   * @property null|Class EslintProvider
   * Singleton instance of EslintProvider
   */
  public static _instance: EslintProvider;

  public notice!: string;


  constructor() {

    if (EslintProvider._instance) {
      return EslintProvider._instance;
    }

    EslintProvider._instance = this;

  }


  async initialize() {
    this.bldrConfig = BldrConfig._instance;
    this.notice = 'EslintProvider initialized';
  }

}