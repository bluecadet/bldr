import { CommandSettings } from "./@types/commandSettings";
import { AssetObject, BldrEsBuildSettings, BldrEsLintSettings, BldrRollupSettings, BldrSassSettings, BldrStyleLintSettings, ConfigSettings, LocalConfigSettings, ProcessAsset, ProcessKey } from "./@types/configTypes";
import { BldrSettings } from "./BldrSettings.js";
import * as path from "path"
import { logAction, logError, logWarn } from "./utils/loggers.js";

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
  public localConfig: null | LocalConfigSettings = null;

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
  public chokidarIgnorePathsArray: string[] = [];

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
  // public extPrefix!: string;

  /**
   * @property null|string
   * Path to the SDC directory
   */
  public sdcPath!: string;


  /**
   * @property null|string
   * Path to the SDC directory
   */
  public sdcAssetSubDirectory!: string;
  

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


  public sdcLocalPath: string | null = null;
  public sdcLocalPathTest: string | null = null;
  public envKey: string | null = null;


  public sassConfig: BldrSassSettings | null = null;
  public esBuildConfig: BldrEsBuildSettings | null = null;
  public rollupConfig: BldrRollupSettings | null = null;
  public eslintConfig: BldrEsLintSettings | null = null;
  public stylelintConfig: BldrStyleLintSettings | null = null;

  /**
   * @property null|function
   * Fast-glob function
   */
  #fg: any = null;


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
    await this.#createProcessConfig();

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
      logError('bldr', `Missing required ${this.bldrSettings.configFileName} file`, {throwError: true, exit: true});
    }

    // Load Local User Config
    const localConfigFile = path.join(process.cwd(), this.bldrSettings.localConfigFileName);
    try {
      const localConfig = await import(localConfigFile);  
      this.localConfig = localConfig.default;
    } catch (error) {
      if ( this.isDev && !this.userConfig.browsersync?.disable ) {
        logWarn('bldr', `Missing ${this.bldrSettings.localConfigFileName} file, using defaults`);
      }
      this.localConfig = null;
    }
  }



  /**
   * @method createProcessConfig
   * @description Build the process asset config based on the user config
   */
  async #createProcessConfig() {

    await this.#setProcessSrc();
    
    await Promise.all([
      this.#handleProcessGroup('css'),
      this.#handleProcessGroup('js'),
      this.#handleProcessGroup('sass'),
    ]);

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

    // Dedupe chokidar watch array
    this.chokidarWatchArray = this.chokidarWatchArray.filter((elem, pos) => this.chokidarWatchArray.indexOf(elem) == pos);

  }




  /**
   * @method setProcessSrc
   * @description Set the process source based on the CLI args
   */
  async #setProcessSrc() {

    if ( this.cliArgs?.env ) {
      if ( this.userConfig?.env?.[this.cliArgs.env] ) {
        this.envKey = this.cliArgs.env;
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
  async #handleProcessGroup(key: ProcessKey) {
    
    if ( !this.processSrc?.[key] ) {
      return;
    }

    this.processSrc[key].forEach((p: AssetObject) => {
      const files = this.#fg.sync([`${path.join(process.cwd(), p.src)}`]);

      if ( files && files.length > 0 ) {
        for (const file of files) {
          this.chokidarIgnorePathsArray.push(path.resolve(p.dest));
          this.addFileToAssetGroup(file, key as ProcessKey, false, p.dest);
        }
      }
    });
  }



  /**
   * @method addFileToAssetGroup
   * @description add a file an asset group
   */
  async addFileToAssetGroup(file: string, key: ProcessKey, isSDC: boolean = false, dest: string | null = null) {
    const group = isSDC ? this.sdcProcessAssetGroups : this.processAssetGroups;
    const localFile = file.replace(process.cwd() + '/', '');

    if ( !group?.[key] ) {
      group[key] = {};
    }
    
    if ( !dest ) {
      dest = path.dirname(file);
    }

    group[key][localFile] = this.createSrcDestObject(file, dest);
  }



  /**
   * @description Create a src/dest object for a file to be processed
   */
  createSrcDestObject(src: string, dest: string): ProcessAsset {
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

    this.sdcPath              = path.join(process.cwd(), this.userConfig.sdc.directory);
    this.sdcLocalPath         = this.userConfig.sdc.directory;
    this.sdcLocalPathTest     = this.userConfig.sdc.directory.startsWith('./') ? this.userConfig.sdc.directory.replace('./', '') : this.userConfig.sdc.directory;
    this.sdcAssetSubDirectory = this.userConfig.sdc?.assetSubDirectory || 'assets';
    this.isSDC                = true;

    if ( this.userConfig?.watchPaths ) {
      this.chokidarWatchArray.push(this.userConfig.sdc.directory);
    }

    await Promise.all([
      this.#handleSDCType('css', 'css'),
      this.#handleSDCType('pcss', 'css'),
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
  async #handleSDCType(ext: string, key: ProcessKey) {
    const files = await this.#fg.sync([`${this.sdcPath}/**/**/${this.sdcAssetSubDirectory}/*.${ext}`]);
    if ( files && files.length > 0 ) {
      for (const file of files) {
        let dest = path.normalize(path.join(path.dirname(file), '..'));
        this.addFileToAssetGroup(file, key, true, dest);
      }
    }
  }



  /**
   * @method buildProviderConfig
   * @description Build the provider config based on the user config
   */
  async #buildProviderConfig() {

    if ( this.processAssetGroups?.js || this.sdcProcessAssetGroups?.js ) {
      if ( this.isDev ) {
        await this.#setEsBuildConfig();
      } else {
        await this.#setRollupConfig();
      }

      await this.#setEslintConfig();
    }

    if ( this.processAssetGroups?.sass || this.sdcProcessAssetGroups?.sass ) {
      await this.#setSassConfig();
    }

    if ( this.processAssetGroups?.css || this.sdcProcessAssetGroups?.css || this.processAssetGroups?.sass || this.sdcProcessAssetGroups?.sass ) {
      await this.#setStylelintConfig(); 
    }
  }


  async #setEsBuildConfig() {
    // EsBuild Config
    this.esBuildConfig = {
      plugins: [],
      overridePlugins: false,
    };

    if ( this.userConfig?.esBuild ) {
      this.esBuildConfig = {...this.esBuildConfig, ...this.userConfig.esBuild};
    }
  }


  async #setRollupConfig() {
    this.rollupConfig = {
      useBabel: true,
      babelPluginOptions: { babelHelpers: 'bundled' },
      useSWC: false,
      swcPluginOptions: null,
      useTerser: true,
      terserOptions: {},
      inputOptions: null,
      inputPlugins: null,
      overrideInputPlugins: false,
      outputOptions: { format: 'iife',},
      outputPlugins: null,
      overrideOutputPlugins: false,
      sdcOptions: {
        minify: true,
        bundle: true,
        format: 'es',
      },     
    };

    if ( this.userConfig?.rollup ) {
      this.rollupConfig = {...this.rollupConfig, ...this.userConfig.rollup};
    }
  }


  async #setEslintConfig() {
    this.eslintConfig = {
      useEslint: true,
      options: {},
      forceBuildIfError: true,
    };

    if ( this.userConfig?.eslint ) {
      this.eslintConfig = {...this.eslintConfig, ...this.userConfig.eslint};
    }
  }


  async #setSassConfig() {
    this.sassConfig = {
      useLegacy: false,
    };

    if ( this.userConfig?.sass ) {
      this.sassConfig = {...this.sassConfig, ...this.userConfig.sass};
    }
  }


  async #setStylelintConfig() {
    this.stylelintConfig = {
      useStyleLint: true,
      forceBuildIfError: true,
    };

    if ( this.userConfig?.sass ) {
      this.stylelintConfig = {...this.stylelintConfig, ...this.userConfig.stylelint};
    }
  }


  async rebuildConfig() {
    const start = Date.now();
    logAction('bldr', '...rebuilding configuration...');
    
    // Reset asset group config
    this.processAssetGroups = {};
    this.sdcProcessAssetGroups = {};

    // Get local user config
    await this.#loadConfig();

    // Define process & asset config
    await this.#createProcessConfig();
    const stop = Date.now();

    logAction('bldr', 'Configuration rebuild complete', ((stop - start) / 1000));
  }



}