import { BldrConfig } from '../BldrConfig.js';
import { createRequire } from 'node:module';

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

  public browsersyncInstance: any = null;


  constructor() {

    if (BrowsersyncProvider._instance) {
      return BrowsersyncProvider._instance;
    }

    BrowsersyncProvider._instance = this;

  }


  async initialize() {
    this.bldrConfig = BldrConfig._instance;

    if ( this.bldrConfig.userConfig?.browsersync?.disable ) {
      return;
    }


    const require = createRequire(import.meta.url);
    const bsName = this.bldrConfig.userConfig?.browsersync?.instanceName || `bldr-${Math.floor(Math.random() * 1000)}`;
    this.browsersyncInstance = require('browser-sync').create(bsName);
    this.notice = 'BrowsersyncProvider initialized';
  }

  bootstrap() {
    if ( this.bldrConfig.userConfig?.browsersync?.disable ) return;

    let bsOptions = {
      logPrefix: 'bldr',
      logFileChanges: false,
    };

    if ( this.bldrConfig?.localConfig?.browserSync ) {
      bsOptions = {...this.bldrConfig.localConfig.browserSync, ...bsOptions};
    }
    
    this.browsersyncInstance.init(bsOptions);
  }



  reloadJS() {
    if ( this.bldrConfig.userConfig?.browsersync?.disable ) return;
    this.browsersyncInstance.reload(['*.js']);
  }


  reloadCSS() {
    if ( this.bldrConfig.userConfig?.browsersync?.disable ) return;
    this.browsersyncInstance.reload(['*.css']);
  }

}