import { BldrConfig } from '../BldrConfig.js';

export class Stylelint {

  /**
   * @property null|object
   * Chokidar instance
   */
  private bldrConfig!: BldrConfig;

  /**
   * @property null|Class Stylelint
   * Singleton instance of Stylelint
   */
  public static _instance: Stylelint;

  public notice!: string;


  constructor() {

    if (Stylelint._instance) {
      return Stylelint._instance;
    }

    Stylelint._instance = this;

  }


  async initialize() {
    this.bldrConfig = BldrConfig._instance;
    this.notice = 'Stylelint initialized';
  }

}