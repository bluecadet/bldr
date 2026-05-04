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
  public _instance: BrowsersyncProvider | null = null;

  public notice!: string;

  public browsersyncInstance: any = null;


  constructor() {

    if (this._instance) {
      throw new Error("You can only create one instance!");
    }

    this._instance = this;

  }


  async initialize() {
    this.bldrConfig = BldrConfig._instance;

    if ( this.bldrConfig?.browsersync?.disable ) {
      return;
    }

    logAction('bldr', '...starting local server...');

    const require = createRequire(import.meta.url);
    const bsName = this.bldrConfig?.browsersync?.instanceName || `bldr-${Math.floor(Math.random() * 1000)}`;
    this.browsersyncInstance = require('browser-sync').create(bsName);
    this.notice = 'BrowsersyncProvider initialized';
  }

  bootstrap() {
    if ( this.bldrConfig?.browsersync?.disable ) return;

    let bsOptions = {
      logPrefix: 'bldr',
      logFileChanges: false,
    };

    if ( this.bldrConfig?.browsersync ) {
      const bsOnlyOptions = {...this.bldrConfig.browsersync};
      delete bsOnlyOptions.disable;
      delete bsOnlyOptions.instanceName;
      bsOptions = {...bsOnlyOptions, ...bsOptions};
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