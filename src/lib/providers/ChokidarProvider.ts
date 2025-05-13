import chokidar from 'chokidar';
import { BldrConfig } from '../BldrConfig.js';
import path from 'node:path';
import { EsBuildProvider } from './EsBuildProvider.js';
import { PostcssProvider } from './PostcssProvider.js';
import { SassProvider } from './SassProvider.js';
import { BrowsersyncProvider } from './BrowsersyncProvider.js';
import { logAction, logWarn } from '../utils/loggers.js';
import { EslintProvider } from './EslintProvider.js';

export class ChokidarProvider {

  /**
   * @property null|object
   * Chokidar instance
   */
  public watcher: any = null;
  private bldrConfig: BldrConfig;
  private EsBuild: EsBuildProvider;
  private Postcss: PostcssProvider;
  private Sass: SassProvider;
  private Browsersync: BrowsersyncProvider;
  private EsLint: EslintProvider;
  private isSDCFile: boolean = false;


  constructor() {
    this.Browsersync = new BrowsersyncProvider();
    this.bldrConfig  = BldrConfig._instance;
    this.Postcss     = PostcssProvider._instance;
    this.Sass        = SassProvider._instance;
    this.EsBuild     = EsBuildProvider._instance;
    this.EsLint      = EslintProvider._instance;
  }


  /**
   * @method initialize
   * @description Initializes the ChokidarProvider
   * @returns {Promise<void>}
   * @memberof ChokidarProvider
   */
  async initialize() {

    await this.Browsersync.initialize();

    // Initialize the watcher
    this.watcher = chokidar.watch(this.bldrConfig.chokidarWatchArray, {
      ignored: (path) => {
        if ( path.endsWith('.map') || path.includes('node_modules') ) {
          return true;
        }

        // Ignore dest files
        let isDestPath = false;

        this.bldrConfig.chokidarIgnorePathsArray.forEach((destPath) => {
          if (this.#isChildOfDir(path, destPath)) {
            isDestPath = true;
          }
        });

        return isDestPath;
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

    this.watcher.on('unlink', () => {
      this.#unlinkFile();
    });

    this.watcher.on('change', (filepath: string) => {
      this.#changeFile(filepath);
    });
      
  }

  /**
   * @method #changeFile
   * @description Handles file changes in Chokidar
   * @param {string} filepath - The path to the file that changed
   * @returns {Promise<void>}
   * @memberof ChokidarProvider
   */
  async #changeFile(filepath: string) {
    this.#checkIsSDCFile(filepath);

    const ext = path.extname(filepath).replace('.', '');

    // Reload if extension is in the reloadExtensions array
    if ( this.bldrConfig.reloadExtensions.includes(ext) ) {
      this.Browsersync.reload();
      return;
    }

    // Ignore files that are SDC files but are not in the SDC asset subdirectory
    if ( this.isSDCFile && !path.dirname(filepath).endsWith(this.bldrConfig.sdcAssetSubDirectory) ) {
      return;
    }

    // Process css files
    if ( (ext === 'css') || (ext === 'pcss') ) {
      if ( this.isSDCFile && this.bldrConfig.sdcProcessAssetGroups.css?.[filepath] ) {
        await this.Postcss.buildAssetGroup(this.bldrConfig.sdcProcessAssetGroups.css[filepath]);
        this.Browsersync.reloadCSS();
        return;
      } else if ( this.bldrConfig.processAssetGroups.css?.[filepath] ) {
        await this.Postcss.buildProcessBundle();
        this.Browsersync.reloadCSS();
        return;
      }

      logWarn('bldr', `No css file found for ${filepath}`);
      return;
    }

    // Process sass files
    if ( (ext === 'sass' || ext === 'scss') && this.Sass ) {
      if ( this.isSDCFile && this.bldrConfig.sdcProcessAssetGroups.css?.[filepath] ) {
        await this.Sass.buildAssetGroup(this.bldrConfig.sdcProcessAssetGroups.css[filepath]);
        this.Browsersync.reloadCSS();
        return;
      } else if ( this.bldrConfig.processAssetGroups.sass?.[filepath] ) {
        await this.Sass.buildProcessBundle();
        this.Browsersync.reloadCSS();
        return;
      }
      
      logWarn('bldr', `No sass file found for ${filepath}`);
      return;
    }

    // Process js files
    if ( (ext === 'js' || ext === 'ts') && this.EsBuild ) {

      await this.EsLint.lintFile(filepath);

      if ( this.isSDCFile && this.bldrConfig.sdcProcessAssetGroups.js?.[filepath] ) {
        await this.EsBuild.buildAssetGroup(this.bldrConfig.sdcProcessAssetGroups.js[filepath]);
        this.Browsersync.reloadJS();
        return;
      } else if ( this.bldrConfig.processAssetGroups.js?.[filepath] ) {
        await this.EsBuild.buildProcessBundle();
        this.Browsersync.reloadJS();
        return;  
      }
      
      logWarn('bldr', `No js file found for ${filepath}`);
      return;
    }

    return; 
  }


  /**
   * @method #addFile
   * @description Handles file additions in Chokidar
   * @param {string} filepath - The path to the file that was added
   * @returns {Promise<void>}
   * @memberof ChokidarProvider
   */
  async #addFile(filepath: string) {
    await this.bldrConfig.rebuildConfig();
    await this.#changeFile(filepath);
  }


  /**
   * @method #unlinkFile
   * @description Handles file deletions in Chokidar
   * @param {string} filepath - The path to the file that was deleted
   * @returns {Promise<void>}
   * @memberof ChokidarProvider
   */
  async #unlinkFile() {
    await this.bldrConfig.rebuildConfig();
  }


  /**
   * @method #checkIsSDCFile
   * @description Checks if the file is an SDC file
   * @param {string} filepath - The path to the file
   * @returns {boolean}
   * @memberof ChokidarProvider
   */
  #checkIsSDCFile(filepath: string): boolean {
    this.isSDCFile = this.#isChildOfDir(filepath, this.bldrConfig.sdcPath);
    return this.isSDCFile;
  }


  /**
   * @method #isChildOfDir
   * @description Checks if the file is a child of the directory
   * @param {string} filepath - The path to the file
   * @param {string} dir - The directory to check against
   * @returns {boolean}
   * @memberof ChokidarProvider
   */
  #isChildOfDir(filepath: string, dir: string): boolean {
    const relativePath = path.relative(dir, filepath);
    return (relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)) ? true : false;
  }

}