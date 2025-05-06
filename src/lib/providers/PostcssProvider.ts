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

}