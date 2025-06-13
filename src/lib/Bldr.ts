import type { CommandSettings } from "./@types/commandSettings";
import { BldrConfig } from "./BldrConfig.js";
import { ChokidarProvider } from "./providers/ChokidarProvider.js";
import { PostcssProvider } from "./providers/PostcssProvider.js";
import { SassProvider } from "./providers/SassProvider.js";
import { EsBuildProvider } from "./providers/EsBuildProvider.js";
import { RollupProvider } from "./providers/RollupProvider.js";
import { logAction, logSuccess } from "./utils/loggers.js";
import { EslintProvider } from "./providers/EslintProvider.js";
import { StylelintProvider } from "./providers/StylelintProvider.js";
import { BiomeProvider } from "./providers/BiomeProvider.js";

export class Bldr {

  public bldrConfig: BldrConfig;
  private commandSettings: CommandSettings;
  private isDev: boolean;

  private EsBuildProvider: EsBuildProvider;
  private RollupProvider: RollupProvider;
  private PostcssProvider: PostcssProvider;
  private SassProvider: SassProvider;
  private EslintProvider: EslintProvider;
  private StylelintProvider: StylelintProvider;
  private BiomeProvider: BiomeProvider;

  constructor(commandSettings: CommandSettings, isDev = false) {
    
    this.commandSettings = commandSettings;
    this.isDev = isDev;
    this.bldrConfig = new BldrConfig(commandSettings, isDev);
    
    this.EsBuildProvider = new EsBuildProvider();
    this.RollupProvider = new RollupProvider();
    this.PostcssProvider = new PostcssProvider();
    this.SassProvider = new SassProvider();
    this.EslintProvider = new EslintProvider();
    this.StylelintProvider = new StylelintProvider();
    this.BiomeProvider = new BiomeProvider();
    
    this.#initialize();

  }


  /**
   * @description Initialize the Bldr instance
   * @returns {Promise<void>}
   */
  async #initialize(): Promise<void> {

    // Initialize the Bldr instance with command settings
    await this.bldrConfig.initialize();

    await Promise.all([
      this.EsBuildProvider.initialize(),
      this.RollupProvider.initialize(),
      this.PostcssProvider.initialize(),
      this.SassProvider.initialize(),
      this.EslintProvider.initialize(),
      this.StylelintProvider.initialize(),
      this.BiomeProvider.initialize(),
    ]);
    
    if ( this.isDev ) {
      await this.#dev();
    } else {
      await this.#production();
    }
  }



  /**
   * @description Build development assets
   * @returns {Promise<void>}
   * @memberof Bldr
   * @private
   */
  async #dev(): Promise<void> {

    if (this.bldrConfig?.envKey) {
      logAction(
        'bldr',
        `🐣 Starting dev using ${this.bldrConfig?.envKey} env configuration...`
      );
    } else {
      logAction('bldr', '🐣 Starting dev...');
    }

    // The once command was sent, run dev build and bail
    if ( this.commandSettings?.once ) {
      const processStart = new Date().getTime();

      logAction('bldr', '💪 Running single dev build...');

      await this.#runOnce();

      const processEnd = new Date().getTime();

      // All Done
      logAction('bldr', '✨ Build complete ✨', `${(processEnd - processStart) / 1000}`);

      return;
    }

    // The start command was sent, run dev build before proceeding
    if ( this.commandSettings?.start ) {
      logAction('bldr', 'Running single dev build before starting server...');
      await this.#runOnce();
    }

    // Fire up chokidar
    const chok = new ChokidarProvider();
    await chok.initialize();

  }


  /**
   * @description Build production assets
   * @returns {Promise<void>}
   * @memberof Bldr
   * @private
   */
  async #production(): Promise<void> {

    const processStart = new Date().getTime();

    console.log('');

    if (this.bldrConfig?.envKey) {
      console.log('-'.repeat(process.stdout.columns));
      logAction(
        'bldr',
        `💪 Starting production build using ${this.bldrConfig?.envKey} env configuration...`
      );
      console.log('-'.repeat(process.stdout.columns));
    } else {
      console.log('-'.repeat(process.stdout.columns));
      logAction('bldr', '💪 Starting production build...');
      console.log('-'.repeat(process.stdout.columns));
    }
    
    console.log('');
    
    await this.#runOnce();
    
    const processEnd = new Date().getTime();

    // All Done
    logAction('bldr', '✨ Build complete ✨', `${(processEnd - processStart) / 1000}`);
  }


  /**
   * @description Run the build process once
   * @returns {Promise<void>}
   * @memberof Bldr
   * @private
   */
  async #runOnce(): Promise<void> {

    // Lint the things
    await Promise.all([
      this.EslintProvider.lintAll(),
    ]);

    // Build the things
    if ( this.isDev ) {

      await Promise.all([
        this.PostcssProvider.buildProcessBundle(),
        this.SassProvider.buildProcessBundle(),
        this.EsBuildProvider.buildProcessBundle(),
      ]);

    } else {
      
      await Promise.all([
        this.PostcssProvider.buildProcessBundle(),
        this.SassProvider.buildProcessBundle(),
        this.RollupProvider.buildProcessBundle(),
      ]);
    }
    
  }

}