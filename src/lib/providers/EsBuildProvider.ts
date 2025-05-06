import { BldrConfig } from '../BldrConfig.js';

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

}