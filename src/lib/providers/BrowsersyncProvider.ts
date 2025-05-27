import { BldrConfig } from '../BldrConfig.js';
import { createRequire } from 'node:module';
import { logAction } from '../utils/loggers.js';

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

    logAction('bldr', '...starting local server...');

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

    if ( this.bldrConfig?.localConfig?.browsersync ) {
      bsOptions = {...this.bldrConfig.localConfig.browsersync, ...bsOptions};
    }
    
    this.browsersyncInstance.init(bsOptions);
  }


  reload() {
    if ( !this.browsersyncInstance ) return;
    this.browsersyncInstance.reload();
  }


  reloadJS() {
    if ( !this.browsersyncInstance ) return;
    this.browsersyncInstance.reload(['*.js']);
  }


  reloadCSS() {
    if ( !this.browsersyncInstance ) return;
    this.browsersyncInstance.reload(['*.css']);
  }

}