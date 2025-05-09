import chokidar from 'chokidar';
import { BldrConfig } from '../BldrConfig.js';
import path from 'node:path';
import { SDCProvider } from './SDCProvider.js';
import { EsBuildProvider } from './EsBuildProvider.js';
import { PostcssProvider } from './PostcssProvider.js';
import { SassProvider } from './SassProvider.js';
import { BrowsersyncProvider } from './BrowsersyncProvider.js';
import { logAction, logWarn } from '../utils/loggers.js';
import { ProcessAsset } from '../@types/configTypes.js';

export class ChokidarProvider {

  /**
   * @property null|object
   * Chokidar instance
   */
  public watcher: any = null;
  private bldrConfig: BldrConfig;
  private SDC: SDCProvider;
  private EsBuild: EsBuildProvider;
  private Postcss: PostcssProvider;
  private Sass: SassProvider;
  private Browsersync: BrowsersyncProvider;


  constructor() {

    this.Browsersync = new BrowsersyncProvider();
    this.bldrConfig = BldrConfig._instance;
    this.SDC = SDCProvider._instance;
    this.Postcss = PostcssProvider._instance;
    this.Sass = SassProvider._instance;
    this.EsBuild = EsBuildProvider._instance;

  }

  async initialize() {

    await this.Browsersync.initialize();

    // Initialize the watcher
    this.watcher = chokidar.watch(this.bldrConfig.chokidarWatchArray, {
      ignored: (path) => {
        return path.endsWith('.map') || path.includes('node_modules') || path.includes('dist') || path.includes('build') || path.includes('out') || path.includes('coverage');
      },
      ignoreInitial: true,
    });

    this.watcher.on('ready', () => {
      console.log(``);
      console.log(`-------------------------------------------`);
      logAction('bldr', '💪 Ready and waiting for changes!');
      console.log(`-------------------------------------------`);
      console.log(``);

      this.Browsersync.bootstrap();
    });

    this.watcher.on('add', (filepath: string) => {
      this.#addFile(filepath);
    });

    this.watcher.on('unlink', (filepath: string) => {
      this.#unlinkFile(filepath);
    });

    this.watcher.on('change', (filepath: string) => {
      this.#changeFile(filepath);
    });
      
  }


  #changeFile(filepath: string) {
    const ext = path.extname(filepath).replace('.', '');

    console.log(ext);

    if ( this.bldrConfig.reloadExtensions.includes(ext) ) {
      console.log('TODO: RELOAD');
      return;
    }

    // if ( this.SDC && this.#isChildOfDir(filepath, this.bldrConfig.sdcPath)) {
    //   if ( ['css', 'sass', 'js', 'ts'].includes(ext) ) {
    //     console.log('TODO: SDC');
    //     console.log(this.SDC.notice);
    //     this.SDC.buildFile(filepath, ext as 'css' | 'sass' | 'js');
    //   }
    //   return;
    // }

    if ( (ext === 'css') ) {
      console.log(this.Postcss.notice);
      console.log('TODO: CSS');
      
      const fileAsset = this.#getFileAsset(filepath, ext);
      if (fileAsset) {
        this.Postcss.buildAssetGroup(fileAsset);
        return;
      }

      logWarn('bldr', `No file found for ${filepath}`);
      return;
    }

    if ( (ext === 'sass' || ext === 'scss') && this.Sass ) {
      console.log(this.Sass.notice);
      console.log('TODO: SASS');
      return;
    }

    if ( (ext === 'js' || ext === 'ts') && this.EsBuild ) {
      console.log(this.EsBuild.notice);
      console.log('TODO: JS');
      return;
    }

    return; 
  }


  #addFile(filepath: string) {
    if (this.bldrConfig.isSDC && filepath.includes(this.bldrConfig.sdcLocalPathTest as any)) {
      console.log('TODO: ADD SDC FILE');
    } else {
      console.log('TODO: ADD SOME OTHER FILE');
    }
  }


  #unlinkFile(filepath: string) {
    if (this.bldrConfig.isSDC && filepath.includes(this.bldrConfig.sdcLocalPathTest as any)) {
      console.log('TODO: UNLINK SDC FILE');
    } else {
      console.log('TODO: UNLINK SOME OTHER FILE');
    }
  }


  #getFileAsset(filepath: string, key: string): ProcessAsset | null {
    let assetGroup = this.bldrConfig.processAssetGroups;

    if ( this.SDC && this.#isChildOfDir(filepath, this.bldrConfig.sdcPath)) {
      assetGroup = this.bldrConfig.sdcProcessAssetGroups;
    }

    if (assetGroup?.[key]?.[filepath]) {
      return assetGroup[key][filepath];
    }

    return null;
  }



  #isChildOfDir(filepath: string, dir: string): boolean {
    const relativePath = path.relative(dir, filepath);
    return (relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)) ? true : false;
  }

}