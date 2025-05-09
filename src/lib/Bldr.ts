import { CommandSettings } from "./@types/commandSettings";
import { BldrConfig } from "./BldrConfig.js";
import { BldrSettings } from "./BldrSettings.js";
import { ChokidarProvider } from "./providers/ChokidarProvider.js";
import { PostcssProvider } from "./providers/PostcssProvider.js";
import { SassProvider } from "./providers/SassProvider.js";
import { EsBuildProvider } from "./providers/EsBuildProvider.js";
import { RollupProvider } from "./providers/RollupProvider.js";
import { SDCProvider } from "./providers/SDCProvider.js";

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
    this.#isDev = isDev;
    
    this.#settings = new BldrSettings();
    this.#config = new BldrConfig(commandSettings, isDev);
    
    this.SDCProvider = new SDCProvider();
    this.EsBuildProvider = new EsBuildProvider();
    this.RollupProvider = new RollupProvider();
    this.PostcssProvider = new PostcssProvider();
    this.SassProvider = new SassProvider();
    
    this.#initialize();

  }

  async #initialize() {
    await this.#config.initialize();
    await this.SDCProvider.initialize();
    await this.EsBuildProvider.initialize();
    await this.RollupProvider.initialize();
    await this.PostcssProvider.initialize();
    await this.SassProvider.initialize();


    // if ( this.#config.isSDC ) {
    //   const SDC = await import('./providers/SDCProvider.js');
    //   this.SDCProvider = new SDC.SDCProvider();
      
    // }

    // if ( this.#config.processAssetGroups?.js ) {
    //   if ( this.#config.isDev ) {
    //     const EsBuild = await import('./providers/EsBuildProvider.js');
    //     this.EsBuildProvider = new EsBuild.EsBuildProvider();
        
    //   } else {
    //     const Rollup = await import('./providers/RollupProvider.js');
    //     this.RollupProvider = new Rollup.RollupProvider();
    //     await this.RollupProvider.initialize();
    //   }
    // }

    // if ( this.#config.processAssetGroups?.postcss ) {
    //   const Postcss = await import('./providers/PostcssProvider.js');
    //   this.PostcssProvider = new Postcss.PostcssProvider();
    //   await this.PostcssProvider.initialize();
    // }

    // if ( this.#config.processAssetGroups?.sass ) {
    //   const Sass = await import('./providers/SassProvider.js');
    //   this.SassProvider = new Sass.SassProvider();
    //   await this.SassProvider.initialize();
    // }

    // Initialize the Bldr instance with command settings
    console.log('Initializing Bldr');

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