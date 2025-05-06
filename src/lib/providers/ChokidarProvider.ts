import chokidar from 'chokidar';
import { BldrConfig } from '../BldrConfig.js';
import path from 'node:path';
import { SDCProvider } from './SDCProvider.js';
import { EsBuildProvider } from './EsBuildProvider.js';
import { PostcssProvider } from './PostcssProvider.js';
import { SassProvider } from './SassProvider.js';

export class ChokidarProvider {

  /**
   * @property null|object
   * Chokidar instance
   */
  public watcher: any = null;
  private bldrConfig: BldrConfig;
  private SDC: SDCProvider | null = null;
  private EsBuild: EsBuildProvider | null = null;
  private Postcss: PostcssProvider | null = null;
  private Sass: SassProvider | null = null;


  constructor() {

    this.bldrConfig = BldrConfig._instance;

    if (this.bldrConfig.isSDC) {
      this.SDC = SDCProvider._instance;
    }

    if ( this.bldrConfig.processAssetGroups?.js ) {
      this.EsBuild = EsBuildProvider._instance;
    }

    if ( this.bldrConfig.processAssetGroups?.css ) {
      this.Postcss = PostcssProvider._instance;
    }

    if ( this.bldrConfig.processAssetGroups?.sass ) {
      this.Sass = SassProvider._instance;
    }

  }

  async initialize() {

    // Initialize the watcher
    this.watcher = chokidar.watch(this.bldrConfig.chokidarWatchArray, {
      ignored: (path) => {
        return path.endsWith('.map') || path.includes('node_modules') || path.includes('dist') || path.includes('build') || path.includes('out') || path.includes('coverage');
      }
    });

    this.watcher.on('change', (filepath: string) => {
      let hasRan = false;
      const ext = path.extname(filepath).replace('.', '');

      if ( this.bldrConfig.reloadExtensions.includes(ext) ) {
        console.log('TODO: RELOAD');
        return;
      }

      if ( this.SDC && this.isChildOfDir(filepath, this.bldrConfig.sdcPath)) {
        if ( ['css', 'sass', 'js', 'ts'].includes(ext) ) {
          console.log('TODO: SDC');
          console.log(this.SDC.notice);
          this.SDC.buildFile(filepath, ext as 'css' | 'sass' | 'js');
        }
        return;
      }

      if ( (ext === 'css') && this.Postcss ) {
        console.log(this.Postcss.notice);
        console.log('TODO: CSS');
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
    });
  }



  isChildOfDir(filepath: string, dir: string): boolean {
    const relativePath = path.relative(dir, filepath);
    return (relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)) ? true : false;
  }

}