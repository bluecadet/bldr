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

  /**
   * @property null|string
   * Notice message
   */
  public notice!: string;

  /**
   * @property null|object
   * Browsersync instance
   */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  public  browsersyncInstance: any = null;


  constructor() {

    if (BrowsersyncProvider._instance) {
      // biome-ignore lint/correctness/noConstructorReturn: <explanation>
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

  /**
   * @method bootstrap
   * @description Starts the Browsersync server with the provided configuration.
   * @returns {void}
   */
  bootstrap(): void {
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


  /**
   * @method reload
   * @description Reloads the Browsersync server.
   * @returns {void}
   */
  reload(): void {
    if ( !this.browsersyncInstance ) return;
    this.browsersyncInstance.reload();
  }


  /**
   * @method reloadHTML
   * @description Reloads the Browsersync server for js files.
   * @returns {void}
   */
  reloadJS(): void {
    if ( !this.browsersyncInstance ) return;
    this.browsersyncInstance.reload(['*.js']);
  }

  /**
   * @method reloadCSS
   * @description Reloads the Browsersync server for css files.
   * @returns {void}
   */
  reloadCSS(): void {
    if ( !this.browsersyncInstance ) return;
    this.browsersyncInstance.reload(['*.css']);
  }

}