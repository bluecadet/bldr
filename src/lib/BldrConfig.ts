import { CommandSettings } from "./@types/commandSettings";
import { AssetObject, ConfigSettings } from "./@types/configTypes";
import { BldrSettings } from "./BldrSettings.js";
import * as path from "path"
import { logError, logWarn } from "./utils/loggers.js";
import { minimatch } from "minimatch";

import { createRequire } from 'node:module';
import { unglobPath } from "./utils/unglobPath.js";

export class BldrConfig {
  
  /**
   * @property null|Class BldrConfig
   * Singleton instance of BldrConfig
   */
  public static _instance: BldrConfig;

  /**
   * @property object
   * Settings from CLI input
   */
  public cliArgs!: CommandSettings;

  /**
   * @property null|Class BldrSettings
   */
  public bldrSettings!: BldrSettings;

  /**
   * @property boolean
   * Settings from CLI input
   */
  public isDev!: boolean;

  /**
   * @property object
   * Contents of user configuration file
   */
  public userConfig!: ConfigSettings;

  /**
   * @property null|object
   * Config from projects bldrConfigLocal.js
   */
  public localConfig = null;

  /**
   * @property object
   * Process data source
   */
  public processSrc!: any;

  /**
   * @property null|object
   * Settings for processes
   */
  public processAssetGroups:any = {};


  /**
   * @property null|array
   * Files for chokidar to watch
   */
  public chokidarWatchArray: string[] = [];

  /**
   * @property null|array
   * Files for chokidar to watch
   */
  public watchAssetArray: string[] = [];

  /**
   * @property null|array
   * Files for chokidar to watch
   */
  public reloadExtensions: string[] = [];

  /**
   * @property null|object
   * Src/Dest/Watch for each process
   */
  public sdcProcessAssetGroups: any = {};

  /**
   * @property null|object
   * SDC extension prefix
   */
  public extPrefix!: string;

  /**
   * @property null|string
   * Path to the SDC directory
   */
  public sdcPath!: string;


  /**
   * @property null|string
   * Path to the SDC directory
   */
  public sdcLocalPath!: string;

  /**
   * @property null|function
   * Fast-glob function
   */
  #fg: any = null;

  

  /**
   * @property boolean
   * If Single Directory Component actions should be ran
   */
  public isSDC: boolean = false;

  /**
   * @property null|object
   * Settings for Single Directory Component actions
   */
  public sdcConfig: any = null;


  /**
   * @param commandSettings {CommandSettings} options from the cli
   * @param isDev {boolean} if the command is run in dev mode
   */
  constructor(commandSettings: CommandSettings, isDev: boolean = false) {
    if (BldrConfig._instance) {
      return BldrConfig._instance;
    }

    BldrConfig._instance = this;

    this.bldrSettings = new BldrSettings();
    this.cliArgs = commandSettings;
    this.isDev = isDev;

    const require = createRequire(import.meta.url);
    this.#fg      = require('fast-glob');
  }


  getInstance() {
    if (BldrConfig._instance) {
      return BldrConfig._instance;
    } else {
      throw new Error("BldrConfig instance not initialized");
    }
  }



  /**
   * @description Initialize the config class
   */
  async initialize() {
    // Get local user config
    await this.#loadConfig();

    // Define process & asset config
    await this.#buildProcessConfig();

    // Define provider config
    await this.#buildProviderConfig();
  }



  /**
   * @description Load the user config file and local config file
   */
  async #loadConfig() {

    // Load User Config
    const configFile = path.join(process.cwd(), this.bldrSettings.configFileName);
    try {
      const config = await import(configFile);  
      this.userConfig = config.default;
    } catch (error) {
      console.log(error);
      process.exit(1);
    }

    // Load Local User Config
    const localConfigFile = path.join(process.cwd(), this.bldrSettings.localConfigFileName);
    try {
      const config = await import(localConfigFile);  
      this.localConfig = config.default;
    } catch (error) {
      if ( this.isDev && !this.userConfig.browsersync?.disable ) {
        logWarn('browsersync', `Missing ${this.bldrSettings.configFileName} file, using defaults`);
      }
      this.localConfig = null;
    }
  }



  /**
   * @method buildProcessConfig
   * @description Build the process asset config based on the user config
   */
  async #buildProcessConfig() {

    await this.#setProcessSrc();

      await this.#handleProcessGroup('css');
      await this.#handleProcessGroup('js');
      await this.#handleProcessGroup('sass');

    if ( this.userConfig?.sdc ) {
      await this.#handleSDC();
    }

    if ( this.userConfig?.reloadExtensions ) {
      this.reloadExtensions = this.userConfig.reloadExtensions;
    }

    if ( this.userConfig?.watchPaths ) {
      this.chokidarWatchArray = [...this.chokidarWatchArray, ...this.userConfig.watchPaths];
    } else {
      this.chokidarWatchArray.push('.');
    }

    // Dedup chokidar watch array
    this.chokidarWatchArray = this.chokidarWatchArray.filter((elem, pos) => this.chokidarWatchArray.indexOf(elem) == pos);

    
  }




  /**
   * @method setProcessSrc
   * @description Set the process source based on the CLI args
   */
  async #setProcessSrc() {

    if ( this.cliArgs?.env ) {
      if ( this.userConfig?.env?.[this.cliArgs.env] ) {
        this.processSrc = this.userConfig.env[this.cliArgs.env];
      } else {
        logError('BldrConfig', `No env found for ${this.cliArgs.env}`, {throwError: true, exit: true});
      }
    } else {  
      this.processSrc = this.userConfig;
    }

  }



  /**
   * @method handleProcessGroup
   * @description Handle the process group based on the user config
   */
  async #handleProcessGroup(key: string) {
    
    if ( !this.processSrc?.[key] ) {
      return;
    }

    this.processSrc[key].forEach((p: AssetObject) => {

      const files = this.#fg.sync([`${path.join(process.cwd(), p.src)}`]);

      if ( files && files.length > 0 ) {
        for (const file of files) {
          this.addProcessAsset(file, p.dest, key);
        }
      }
      
      // if ( p.watch ) {
      //   p.watch.forEach((w: string) => {
      //     this.addChokidarWatchFile(w);
      //   });
      // }
    });
  }

  

  /**
   * @method addProcessAsset
   * @description Add a file to the process asset groups
   */
  async addProcessAsset(file: string, dest: string, key: string) {
    if ( !this.processAssetGroups?.[key] ) {
      this.processAssetGroups[key] = {};
    }
    const localFile = file.replace(process.cwd() + '/', '');
    this.processAssetGroups[key][localFile] = this.createSrcDestObject(localFile, dest);
  }



  /**
   * @description Create a src/dest object for a file to be processed
   */
  createSrcDestObject(src: string, dest: string) {
    return {
      src: src, //path.join(process.cwd(), src),
      dest: dest, // path.join(process.cwd(), dest),
    };
  }



  /**
   * @method addChokidarWatchFile
   * @description add a file to the watch path array
   */
  async addChokidarWatchFile(watchPath: string) {
    const unglobbedPath = unglobPath(watchPath);
    if ( !this.chokidarWatchArray.includes(unglobbedPath) ) {
      this.chokidarWatchArray.push(unglobbedPath);
    }
  }
  


  /**
   * @method handleSDC
   * @description Handle the Single Directory Component process based on the user config
   */
  async #handleSDC() {
    if ( !this.userConfig.sdc?.directory ) {
      logError('BldrConfig', 'No directory key found for `sdc`', {throwError: true, exit: true});
      return;
    }

    this.extPrefix    = this.userConfig.sdc?.fileExtensionPrefix || '.bldr';
    this.sdcPath      = path.join(process.cwd(), this.userConfig.sdc.directory);
    this.sdcLocalPath = this.userConfig.sdc.directory;
    this.isSDC        = true;

    if ( this.userConfig?.watchPaths ) {
      this.chokidarWatchArray.push(this.sdcLocalPath);
    }

    Promise.all([
      this.#handleSDCType('css', 'css'),
      this.#handleSDCType('sass', 'sass'),
      this.#handleSDCType('scss', 'sass'),
      this.#handleSDCType('js', 'js'),
      this.#handleSDCType('ts', 'js'),
    ])
  }



  /**
   * @method handleSDCType
   * @description add sdc file based on given extension key
   */
  async #handleSDCType(ext: string, key: string) {
    const files = await this.#fg.sync([`${this.sdcPath}/**/*${this.extPrefix}.${ext}`]);
    if ( files && files.length > 0 ) {
      for (const file of files) {
        await this.addSDCAsset(file, key);
      }
    }
  }


  /**
   * @method addSDCAsset
   * @description Add a file to the sdc process asset groups
   */
  async addSDCAsset(file: string, key: string) {
    if ( !this.sdcProcessAssetGroups[key] ) {
      this.sdcProcessAssetGroups[key] = {};
    }
    const localFile = file.replace(process.cwd() + '/', '');
    const dest = path.dirname(localFile);
    this.sdcProcessAssetGroups[key][localFile] = this.createSrcDestObject(localFile, dest);
  }



  /**
   * @method buildProviderConfig
   * @description Build the provider config based on the user config
   */
  async #buildProviderConfig() {
    if ( this.processAssetGroups?.css || this.sdcProcessAssetGroups?.css ) {
      console.log('TODO: postcss');
    }

    if ( this.processAssetGroups?.js || this.sdcProcessAssetGroups?.js ) {
      if ( this.isDev ) {
        console.log('TODO: esBuild');
      } else {
        console.log('TODO: rollup');
      }
    }

    if ( this.processAssetGroups?.sass || this.sdcProcessAssetGroups?.sass ) {
      console.log('TODO: sass');
    }

    // if ( this.userConfig?.env?.[this.cliArgs.env]?.sdc ) {
    //   this.sdcConfig = this.userConfig.env[this.cliArgs.env].sdc;
    // }
  }



}