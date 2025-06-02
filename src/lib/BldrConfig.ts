import { CommandSettings } from "./@types/commandSettings";
import { AssetObject, BldrEsBuildSettings, BldrEsLintSettings, BldrRollupSettings, BldrSassSettings, BldrStyleLintSettings, ConfigSettings, LocalConfigSettings, ProcessAsset, ProcessKey } from "./@types/configTypes";
import { BldrSettings } from "./BldrSettings.js";
import path from "node:path";
import { logAction, logError, logWarn } from "./utils/loggers.js";
import { createRequire } from 'node:module';

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
   * If running in `dev` mode
   */
  public isDev!: boolean;

  /**
   * @property object
   * Contents of user configuration file
   */
  public userConfig!: ConfigSettings;

  /**
   * @property null|object
   * Local config
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
   * File extensions for chokidar to reload
   */
  public reloadExtensions: string[] = [];

  /**
   * @property boolean
   * If Single Directory Component actions should be ran
   */
  public isSDC: boolean = false;

  /**
   * @property null|object
   * Settings for single component directory processes
   */
  public sdcProcessAssetGroups: any = {};

  /**
   * @property null|string
   * Path to the SDC directory
   */
  public sdcPath!: string;

  public sdcPaths!: string[];

  /**
   * @property null|string
   * Path to the SDC subdirectory
   */
  public sdcAssetSubDirectory!: string;
  
  /**
   * @property null|string
   * Environment key from CLI args
   */
  public envKey: string | null = null;

  /**
   * @property null|object
   * User defined config for Sass processing
   */
  public sassConfig: BldrSassSettings | null = null;
  
  /**
   * @property null|object
   * User defined config for EsBuild processing
   */
  public esBuildConfig: BldrEsBuildSettings | null = null;
  
  /**
   * @property null|object
   * User defined config for Rollup processing
   */
  public rollupConfig: BldrRollupSettings | null = null;
  
  /**
   * @property null|object
   * User defined config for EsLint processing
   */
  public eslintConfig: BldrEsLintSettings | null = null;
  
  /**
   * @property null|object
   * User defined config for StyleLint processing
   */
  public stylelintConfig: BldrStyleLintSettings | null = null;

  /**
   * @property null|function
   * Fast-glob function
   */
  #fg: any = null;



  /**
   * @description BldrConfig constructor
   * 
   * This class is a singleton and should only be instantiated once.
   * It is used to load the user config file and create the process asset config.
   * It also builds the provider config based on the user config.
   * 
   * @param commandSettings {CommandSettings} options from the cli
   * @param isDev {boolean} if the command is run in dev mode
   * 
   * @example
   * const bldrConfig = new BldrConfig(commandSettings);
   */
  constructor(commandSettings: CommandSettings, isDev: boolean = false) {
    if (BldrConfig._instance) {
      return BldrConfig._instance;
    }

    BldrConfig._instance = this;

    const require     = createRequire(import.meta.url);

    this.bldrSettings = new BldrSettings();
    this.cliArgs      = commandSettings;
    this.isDev        = isDev;
    this.#fg          = require('fast-glob');
  }


  /**
   * @method initialize
   * @description Initialize the BldrConfig class
   * @returns {Promise<void>}
   */
  async initialize(): Promise<void> {
    // Get local user config
    await this.#loadConfig();

    // Define process & asset config
    await this.#createProcessConfig();

    // Define provider config
    await this.#buildProviderConfig();
  }



  /**
   * @method loadConfig
   * @description Load the user config file and local config file
   * @returns {Promise<void>}
   * @private
   */
  async #loadConfig(): Promise<void> {
    // Load bldr config file
    try {
      const config = await import(this.bldrSettings.configFilePath);  
      this.userConfig = config.default;
    } catch (error) {
      console.log(error);
      logError('bldr', `Missing required ${this.bldrSettings.configFileName} file`, {throwError: true, exit: true});
    }

    // Load Local User Config
    try {
      const localConfig = await import(this.bldrSettings.localConfigFilePath);  
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
   * @return {Promise<void>}
   * @private
   */
  async #createProcessConfig(): Promise<void> {

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
   * @return {Promise<void>}
   * @private
   */
  async #setProcessSrc(): Promise<void> {

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
   * @param key {ProcessKey} process key to handle
   * @return {Promise<void>}
   * @private
   */
  async #handleProcessGroup(key: ProcessKey): Promise<void> {
    
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

    group[key][localFile] = this.#createSrcDestObject(file, dest);
  }



  /**
   * @method createSrcDestObject
   * @description Create a src/dest object for a file to be processed
   * @param src {string} source file path
   * @param dest {string} destination file path
   * @return {ProcessAsset} object with src and dest properties
   * @private
   */
  #createSrcDestObject(src: string, dest: string): ProcessAsset {
    return {
      src: src, //path.join(process.cwd(), src),
      dest: dest, // path.join(process.cwd(), dest),
    };
  }
  


  /**
   * @method handleSDC
   * @description Handle the Single Directory Component process based on the user config
   * @return {Promise<void>}
   * @private
   */
  async #handleSDC(): Promise<void> {
    if ( !this.userConfig.sdc?.directory ) {
      logError('BldrConfig', 'No directory key found for `sdc`', {throwError: true, exit: true});
      return;
    }

    this.sdcPaths             = Array.isArray(this.userConfig.sdc.directory) ? this.userConfig.sdc.directory: [this.userConfig.sdc.directory];
    this.sdcAssetSubDirectory = this.userConfig.sdc?.assetSubDirectory || 'assets';
    this.isSDC                = true;

    console.log(this.sdcPaths);

    // this.sdcPath              = path.join(process.cwd(), this.userConfig.sdc.directory);

    for (const sdcDir of this.sdcPaths) {

      console.log(sdcDir);
      const sdcFilePath = path.join(process.cwd(), sdcDir);

      if ( this.userConfig?.watchPaths ) {
        this.chokidarWatchArray.push(sdcDir);
      }
  
      await Promise.all([
        this.#handleSDCType('css', 'css', sdcFilePath),
        this.#handleSDCType('pcss', 'css', sdcFilePath),
        this.#handleSDCType('sass', 'sass', sdcFilePath),
        this.#handleSDCType('scss', 'sass', sdcFilePath),
        this.#handleSDCType('js', 'js', sdcFilePath),
        this.#handleSDCType('ts', 'js', sdcFilePath),
      ])
      
    }

   
    
    

    
  }



  /**
   * @method handleSDCType
   * @description add sdc file based on given extension key
   * @param ext {string} file extension to look for
   * @param key {ProcessKey} process key to add the file to
   * @return {Promise<void>}
   * @private
   */
  async #handleSDCType(ext: string, key: ProcessKey, sdcDirPath: string): Promise<void> {
    const files = await this.#fg.sync([`${sdcDirPath}/**/**/${this.sdcAssetSubDirectory}/*.${ext}`]);

    console.log(files);
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
   * @param {void}
   * @return {Promise<void>}
   * @private
   */
  async #buildProviderConfig(): Promise<void> {

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


  /**
   * @method setEsBuildConfig
   * @description Set the EsBuild config based on the user config and bldr defaults
   * @return {Promise<void>}
   * @private
   */
  async #setEsBuildConfig(): Promise<void> {
    // EsBuild Config
    this.esBuildConfig = {
      plugins: [],
      overridePlugins: false,
    };

    if ( this.userConfig?.esBuild ) {
      this.esBuildConfig = {...this.esBuildConfig, ...this.userConfig.esBuild};
    }
  }



  /**
   * @method setRollupConfig
   * @description Set the Rollup config based on the user config and bldr defaults
   * @return {Promise<void>}
   * @private
   */
  async #setRollupConfig(): Promise<void> {
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



  /**
   * @method setEslintConfig
   * @description Set the EsLint config based on the user config and bldr defaults
   * @return {Promise<void>}
   * @private
   */
  async #setEslintConfig(): Promise<void> {
    this.eslintConfig = {
      useEslint: true,
      options: {},
      forceBuildIfError: true,
    };

    if ( this.userConfig?.eslint ) {
      this.eslintConfig = {...this.eslintConfig, ...this.userConfig.eslint};
    }
  }



  /**
   * @method setSassConfig
   * @description Set the Sass config based on the user config and bldr defaults
   * @return {Promise<void>}
   * @private
   */
  async #setSassConfig(): Promise<void> {
    this.sassConfig = {
      useLegacy: false,
    };

    if ( this.userConfig?.sassConfig ) {
      this.sassConfig = {...this.sassConfig, ...this.userConfig.sassConfig};
    }
  }



  /**
   * @method setStylelintConfig
   * @description Set the StyleLint config based on the user config and bldr defaults
   * @return {Promise<void>}
   * @private
   */
  async #setStylelintConfig(): Promise<void> {
    this.stylelintConfig = {
      useStyleLint: true,
      forceBuildIfError: true,
    };

    if ( this.userConfig?.sass ) {
      this.stylelintConfig = {...this.stylelintConfig, ...this.userConfig.stylelint};
    }
  }



  /**
   * @method rebuildConfig
   * @description Rebuild the configuration based on the user config file
   * 
   * This method will reset the asset groups, reload the user config,
   * and rebuild the process and provider configurations.
   * 
   * @returns {Promise<void>}
   */
  async rebuildConfig(): Promise<void> {
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