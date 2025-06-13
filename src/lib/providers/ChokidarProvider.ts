import chokidar from 'chokidar';
import { BldrConfig } from '../BldrConfig.js';
import path from 'node:path';
import { EsBuildProvider } from './EsBuildProvider.js';
import { PostcssProvider } from './PostcssProvider.js';
import { SassProvider } from './SassProvider.js';
import { BrowsersyncProvider } from './BrowsersyncProvider.js';
import { logAction } from '../utils/loggers.js';
import { EslintProvider } from './EslintProvider.js';
import { BiomeProvider } from './BiomeProvider.js';
import { StylelintProvider } from './StylelintProvider.js';
import { isChildOfDir } from '../utils/isChildOfDir.js';
import { checkIsSDCFile } from '../utils/checkIsSDCFile.js';

export class ChokidarProvider {

  /**
   * @property null|object
   * Chokidar instance
   */
  
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  public  watcher: any = null;
  private bldrConfig: BldrConfig;
  private EsBuild: EsBuildProvider;
  private Postcss: PostcssProvider;
  private Sass: SassProvider;
  private Browsersync: BrowsersyncProvider;
  private EsLint: EslintProvider;
  private Stylelint: StylelintProvider;
  private Biome: BiomeProvider;
  private isSDCFile = false;


  constructor() {
    this.Browsersync = new BrowsersyncProvider();
    this.bldrConfig  = BldrConfig._instance;
    this.Postcss     = PostcssProvider._instance;
    this.Sass        = SassProvider._instance;
    this.EsBuild     = EsBuildProvider._instance;
    this.EsLint      = EslintProvider._instance;
    this.Stylelint   = StylelintProvider._instance;
    this.Biome       = BiomeProvider._instance;
  }


  /**
   * @method initialize
   * @description Initializes the ChokidarProvider
   * @returns {Promise<void>}
   * @memberof ChokidarProvider
   */
  async initialize(): Promise<void> {

    await this.Browsersync.initialize();

    // Initialize the watcher
    this.watcher = chokidar.watch(this.bldrConfig.chokidarWatchArray, {
      ignored: (path) => {
        if ( path.endsWith('.map') || path.includes('node_modules') ) {
          return true;
        }

        // Ignore dest files
        let isDestPath = false;

        for (const destPath of this.bldrConfig.chokidarIgnorePathsArray) {
          if (isChildOfDir(path, destPath)) {
            isDestPath = true;
          }
        }

        return isDestPath;
      },
      ignoreInitial: true,
    });

    this.watcher.on('ready', () => {
      console.log('');
      console.log('-'.repeat(process.stdout.columns));
      logAction('bldr', '💪 Ready and waiting for changes!');
      console.log('-'.repeat(process.stdout.columns));
      console.log('');

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
    this.isSDCFile = checkIsSDCFile(filepath, this.bldrConfig.sdcPaths);

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

      if ( this.bldrConfig.biomeConfig?.useBiome ) {
        await this.Biome.lintFile(filepath);
      } else if ( this.bldrConfig.stylelintConfig?.useStyleLint ) {
        await this.Stylelint.lintFile(filepath);
      }
      

      if ( this.isSDCFile && this.bldrConfig.sdcProcessAssetGroups.css?.[filepath] ) {
        await this.Postcss.buildAssetGroup(this.bldrConfig.sdcProcessAssetGroups.css[filepath]);
      } else if ( this.bldrConfig.processAssetGroups.css?.[filepath] ) {
        await this.Postcss.buildAssetGroup(this.bldrConfig.processAssetGroups.css[filepath]);
      } else {
        await this.Postcss.buildProcessAssetGroupsBundle();
      }

      this.Browsersync.reloadCSS();
      return;
    }

    // Process sass files
    if ( (ext === 'sass' || ext === 'scss') && this.Sass ) {
      await this.Stylelint.lintFile(filepath);
      
      if ( this.isSDCFile && this.bldrConfig.sdcProcessAssetGroups.sass?.[filepath] ) {
        await this.Sass.buildAssetGroup(this.bldrConfig.sdcProcessAssetGroups.sass[filepath]);
      } else if ( this.bldrConfig.processAssetGroups.sass?.[filepath] ) {
        await this.Sass.buildProcessBundle();
      } else {
        await this.Sass.buildProcessAssetGroupsBundle();
      }

      this.Browsersync.reloadCSS();
      return;
    }

    // Process js files
    if ( (ext === 'js' || ext === 'ts') && this.EsBuild ) {

      if ( this.bldrConfig.biomeConfig?.useBiome ) {
        await this.Biome.lintFile(filepath);
      } else if ( this.bldrConfig.eslintConfig?.useEslint ) {
        await this.EsLint.lintFile(filepath);
      }
      

      if ( this.isSDCFile && this.bldrConfig.sdcProcessAssetGroups.js?.[filepath] ) {
        await this.EsBuild.buildAssetGroup(this.bldrConfig.sdcProcessAssetGroups.js[filepath]);
      } else if ( this.bldrConfig.processAssetGroups.js?.[filepath] ) {
        await this.EsBuild.buildProcessBundle();
      } else {
        await this.EsBuild.buildProcessAssetGroupsBundle();
      }

      this.Browsersync.reloadJS();
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

}