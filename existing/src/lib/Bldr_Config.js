import { handleProcessError, handleProcessWarn } from './utils/reporters.js';
import { existsSync } from 'node:fs';
import * as path from 'path';
import { Bldr_Settings } from './Bldr_Settings.js';

export class Bldr_Config {

  /**
   * @property null|object
   * Settings from CLI input
   */
  cliSettings = null;

  /**
   * @property null|object
   * Settings for processes
   */
  processSettings = null;

  /**
   * @property null|object
   * Src/Dest/Watch for each process
   */
  processes = null;

  /**
   * @property null|array
   * Files for chokidar to watch
   */
  watch = null;

  /**
   * @property null|object
   * Config from projects bldrConfig.js
   */
  userConfig = null;

  /**
   * @property null|object
   * TBD if this is needed or not...
   */
  envConfig = null;

  /**
   * @property null|object
   * Config from projects bldrConfigLocal.js
   */
  localConfig = null;

  /**
   * @property boolean
   * If Single Directory Component actions should be ran
   */
  isSDC = false;

  /**
   * @property null|object
   * Settings for Single Directory Component actions
   */
  sdcConfig = null;

  /**
   * @property null|object
   * Raw commander args
   */
  bldrCommand = null;

  /**
   * @property null|Class Bldr_Settings
   */
  #bldrSettings = null;

  constructor() {
    if (Bldr_Config._instance) {
      return Bldr_Config._instance;
    }

    Bldr_Config._instance = this;
  }

  async initialize(bldrCommand) {
    this.bldrCommand = bldrCommand;

    // Bail if this has already been ran
    if (this.#bldrSettings !== null) {
      return true;
    }

    // Get bldr settings
    this.#bldrSettings = new Bldr_Settings();
    const bSettings    = this.#bldrSettings.settings;

    // Get config file paths
    const configPath      = path.join(bSettings.root, bSettings.filename);
    const localConfigPath = path.join(bSettings.root, bSettings.localFilename);

    // Bail if bldrConfig.js does not exist
    if (!existsSync(configPath)) {
      handleProcessError(
        'bldr',
        `${bSettings.filename} does not exist.`,
        {
          throwError: true,
          exit: true,
        }
      );
    }

    // Get user config
    const rawConfig = await import(configPath);
    this.userConfig = rawConfig.default;
    this.envConfig = rawConfig?.env;

    // Get local config
    if (existsSync(localConfigPath)) {
      const localConfig = await import(localConfigPath);
      this.localConfig = localConfig.default;
    } else {
      this.localConfig = false;
    }

    // Set cliSettings
    this.cliSettings = {
      env: this.bldrCommand.bldrEnv,
      isWatch: this.bldrCommand.settings?.watch,
      cli: this.bldrCommand,
    };

    // Set processSettings
    this.processSettings = {
      rollup: this.userConfig?.processSettings?.rollup
        ? this.userConfig.processSettings.rollup
        : false,
      esBuild: this.userConfig?.processSettings?.esBuild
        ? this.userConfig.processSettings.esBuild
        : false,
      browsersync: this.userConfig?.processSettings?.browsersync
        ? this.userConfig.processSettings.browsersync
        : false,
      sass: this.userConfig?.processSettings?.sass
        ? this.userConfig.processSettings.sass
        : false,
      eslint: this.userConfig?.processSettings?.eslint
        ? this.userConfig.processSettings.eslint
        : false,
    };

    // Set process data
    await this.#getProcessData();

    return true;
  }


  /**
   * Run logic on config to determine what sources should be used
   * @returns void
   */
  async #getProcessData() {
    let targetProcessConfig = false;

    // Allow backwards config compatability (from initial release)
    const configSrc = this.bldrCommand.bldrEnv === 'dev'
        ? this.userConfig?.dev || this.userConfig
        : this.userConfig?.build || this.userConfig;


    if ( this.bldrCommand.settings?.key ) {
      // Handle running single key in config
      const targetProcessKey = this.bldrCommand.settings.key;

      if (targetProcessKey in configSrc) {
        targetProcessConfig = configSrc[targetProcessKey];
      } else {
        handleProcessError(
          'bldr',
          `${targetProcessKey} is not a configured process key in config.`,
          { throwError: true, exit: true }
        );
      }
    } else if (this.bldrCommand.settings?.env) {
      // Handle a env key form the cli
      const targetEnvKey = this.bldrCommand.settings.env;

      if (configSrc?.env && targetEnvKey in configSrc.env) {
        targetProcessConfig = configSrc.env[targetEnvKey];
      } else {
        handleProcessError(
          'bldr',
          `${targetEnvKey} is not a configured 'env' key in config.`,
          { throwError: true, exit: true }
        );
      }
    } else {
      // No special settings
      targetProcessConfig = configSrc;
    }

    if ( !targetProcessConfig ) {
      // Bail if
      if ( !this.sdcConfig ) {
        handleProcessError(
          'bldr',
          `There seems to be some missing configuration...`,
          { throwError: true, exit: true }
        );
      }

      this.processes = false;
      this.watch = false;

      return false;
    }

    await this.#flattenProcessConfig(targetProcessConfig);

    return true;

  }


  /**
   * Flatten all config sources per process
   * Flatten all watch paths into single array
   * @param {object} config Config object
   */
  async #flattenProcessConfig(config) {
    this.watch = { files: [], reloadExts: [] };
    this.processes = {};

    // Combine processes into single object
    this.#bldrSettings.settings.allowedProcessKeys.forEach((process) => {
      if (process in config) {
        const configPaths = config[process];
        const paths = [];

        if (Array.isArray(configPaths)) {
          configPaths.forEach((g) => {
            paths.push(g);
            if (g?.watch) this.watch.files.push(g.watch);
          });
        } else {
          paths.push(configPaths);
          if (configPaths?.watch) this.watch.files.push(configPaths.watch);
        }

        this.processes[process] = paths;
      }
    });

    // Add watch ext values
    if (config?.watchReload && Array.isArray(config.watchReload)) {
      config.watchReload.forEach((p) => {
        this.watch.files.push(p);
        this.watch.reloadExts.push(path.extname(p));
      });
    }

    // Set singleDirectoryComponent
    if (config?.singleDirectoryComponent?.baseDirectory) {
      this.isSDC = true;

      this.sdcConfig = config.singleDirectoryComponent;

      this.sdcConfig.baseDirectory = this.sdcConfig.baseDirectory.endsWith('/')
        ? this.sdcConfig.baseDirectory.slice(0, -1)
        : this.sdcConfig.baseDirectory;

      this.sdcConfig.basePath = `${this.sdcConfig.baseDirectory}/`;

      this.sdcConfig.filePattern = this.sdcConfig?.prefix
        ? `${this.sdcConfig.prefix}**/*`
        : `**/*${this.sdcConfig?.suffix || '.bldr'}`;

      // Add SDC files to watch
      this.watch.files.push(`${this.sdcConfig.basePath}${this.sdcConfig.filePattern}.css`);
      this.watch.files.push(`${this.sdcConfig.basePath}${this.sdcConfig.filePattern}.js`);
      this.watch.files.push(`${this.sdcConfig.basePath}${this.sdcConfig.filePattern}.sass`);
      this.watch.files.push(`${this.sdcConfig.basePath}${this.sdcConfig.filePattern}.scss`);
    }

    // Flatten out watch files
    if (this.watch.files.length > 0) {
      this.watch.files = this.watch.files.flat();
    }

    this.processes = Object.keys(this.processes).length > 0 ? this.processes : false;

  }
}
