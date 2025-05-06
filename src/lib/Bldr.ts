import { CommandSettings } from "./@types/commandSettings";
import { BldrConfig } from "./BldrConfig.js";
import { BldrSettings } from "./BldrSettings.js";
import { ChokidarProvider } from "./providers/ChokidarProvider.js";

export class Bldr {

  #commandSettings: CommandSettings;
  #settings: BldrSettings;
  #config: BldrConfig;
  #isDev: boolean;
  private SDCProvider: any;
  private EsBuildProvider: any;
  private RollupProvider: any;
  private PostcssProvider: any;
  private SassProvider: any;

  constructor(commandSettings: CommandSettings, isDev: boolean = false, isInit: boolean = false) {
    
    this.#commandSettings = commandSettings;
    this.#settings = new BldrSettings();
    this.#config = new BldrConfig(commandSettings, isDev);
    this.#isDev = isDev;

    this.#initialize();

  }

  async #initialize() {
    await this.#config.initialize();

    if ( this.#config.isSDC ) {
      const SDC = await import('./providers/SDCProvider.js');
      this.SDCProvider = new SDC.SDCProvider();
      await this.SDCProvider.initialize();
    }

    if ( this.#config.processAssetGroups?.js ) {
      if ( this.#config.isDev ) {
        const EsBuild = await import('./providers/EsBuildProvider.js');
        this.EsBuildProvider = new EsBuild.EsBuildProvider();
        await this.EsBuildProvider.initialize();
      } else {
        const Rollup = await import('./providers/RollupProvider.js');
        this.RollupProvider = new Rollup.RollupProvider();
        await this.RollupProvider.initialize();
      }
    }

    if ( this.#config.processAssetGroups?.postcss ) {
      const Postcss = await import('./providers/PostcssProvider.js');
      this.PostcssProvider = new Postcss.PostcssProvider();
      await this.PostcssProvider.initialize();
    }

    if ( this.#config.processAssetGroups?.sass ) {
      const Sass = await import('./providers/SassProvider.js');
      this.SassProvider = new Sass.SassProvider();
      await this.SassProvider.initialize();
    }

    // Initialize the Bldr instance with command settings
    console.log('Initializing Bldr');

    // console.log(JSON.stringify(this.#config, null, 4))

    if ( this.#isDev ) {
      this.dev();
    } else {
      this.build();
    }
  }

  async dev() {
    console.log('Running in dev mode');

    const chok = new ChokidarProvider();
    await chok.initialize();
  }


  async build() {
    console.log('Running in build mode');
  }
}