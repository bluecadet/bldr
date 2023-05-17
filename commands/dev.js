import { getConfigData } from '../lib/utils/getConfigData.js';
import { handleProcessAction, handleProcessWarn, handleProcessSuccess } from '../lib/utils/reporters.js';
import { settings } from '../lib/settings/bldrSettings.js';
import { processSass } from '../lib/processes/sass.js';
import { processPostcss } from '../lib/processes/postcss.js';
import { processEsBuild } from '../lib/processes/esBuild.js';
import { processImages } from '../lib/processes/images.js';
import { basename, extname } from 'node:path';

// import util from 'node:util';
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url);
const chokidar = require('chokidar');


export const RunBldrDev = async (commandOptions) => {

  const configData  = await getConfigData(commandOptions);
  const envKey      = commandOptions.settings?.key;
  const sassExts    = ['.scss', '.sass'];
  const postCssExts = ['.css','.pcss','.postcss'];
  const jsExts      = ['.js','.jsx', '.cjs', '.mjs'];
  const imageExts   = ['.jpg','.jpeg','.png','.gif','.svg', 'webp'];
  let   bsInstance  = false;
  let   bsInstanceName = false;

  if ( commandOptions.settings?.once ) {

    if ( envKey ) {
      handleProcessAction('bldr', `Running single dev build using ${envKey} env configuration...`);
    } else {
      handleProcessAction('bldr', 'Running single dev build...');
    }

    const processStart = new Date().getTime();

    await processSass(configData);
    await processPostcss(configData);
    await processEsBuild(configData);
    await processImages(configData);

    const processEnd = new Date().getTime();

    handleProcessAction('bldr', '✨ Dev processes complete ✨', `${(processEnd - processStart)/1000}`);

    return;
  }


  if ( envKey ) {
    handleProcessAction('bldr', `Starting dev using ${envKey} env configuration...`);
  } else {
    handleProcessAction('bldr', 'Starting dev...');
  }

  // Run processes before starting local build
  if ( commandOptions.settings?.start ) {
    handleProcessAction('bldr', 'Running initial processes...');
    await processSass(configData, bsInstance);
    await processPostcss(configData, bsInstance);
    await processEsBuild(configData, bsInstance);
    await processImages(configData, bsInstance);
  }


  // Handle a single file from Chokidar event
  const handleFile = async (ext, file) => {

    if (sassExts.includes(ext)) {
      await processSass(configData);
      if ( bsInstance ) {
        bsInstance.stream({match: "**/*.css"});
        bsInstance.reload("*.css");
      }
    }

    if (postCssExts.includes(ext)) {
      await processPostcss(configData);
      if ( bsInstance ) {
        bsInstance.stream({match: "**/*.css"});
        bsInstance.reload("*.css");
      }
    }

    if (jsExts.includes(ext)) {
      await processEsBuild(configData);
      if ( bsInstance ) {
        bsInstance.reload();
      }
    }

    if (imageExts.includes(ext)) {
      await processImages(configData);
      if ( bsInstance ) {
        bsInstance.reload();
      }
    }

    if (configData.watch.reloadExts.includes(ext) && bsInstance ) {
      bsInstance.reload();
      handleProcessSuccess('bldr', `${basename(file)} triggered reload`);
    }
  };

  const handleChokidar = () => {

    // Chokidar watcher
    const watcher = chokidar.watch(configData.watch.files, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
    });

    watcher
      .on('ready', () => {
        console.log(``);
        console.log(`-------------------------------------------`);
        handleProcessAction('bldr', '💪 Ready and waiting for changes!');
        console.log(`-------------------------------------------`);
        console.log(``);
      })
      .on('add', filePath => {
        handleFile(extname(filePath), filePath);
      })
      .on('change', filePath => {
        handleFile(extname(filePath), filePath);
      })
      .on('unlink', filePath => {
        handleFile(extname(filePath), filePath);
      });
  }



  // Create browsersync instance if appropriate
  if ( !configData?.processSettings?.browsersync?.disable ) {
    if ( !configData?.local ) {
      handleProcessWarn('bldr', `Create a ${settings.localFilename} file in project root to configure browsersync`);
    }

    const bsLocalOpts = configData.local || {};
    const bsOptions   = bsLocalOpts?.browserSync ? {...bsLocalOpts.browserSync} : {};
    bsInstanceName    = bsLocalOpts?.browserSync?.instanceName ?? `bldr-${Math.floor(Math.random() * 1000)}`;
    bsInstance        = await require("browser-sync").create(bsInstanceName);

    // Bldr enforced options
    bsOptions.logPrefix = 'bldr';
    bsOptions.logFileChanges = false;

    bsInstance.init(bsOptions, () => {
      handleChokidar();
    });

  } else {

    if ( configData?.processSettings?.browsersync?.disable ) {
      handleProcessWarn('bldr', 'Browsersync is disabled in config');
    }

    handleChokidar();
  }

}





  /**
   * Run esbuild
   * @param {object} bsInstance BrowserSync Instance
   */
  // this.esBuild = (bsInstance = false) => {
  //   handleEsBuild(
  //     configData,
  //     configRootData?.esbuild,
  //     bsInstance,
  //   );
  // }

  // /**
  //  * Run PostCSS function
  //  * @param {object} bsInstance Browsersync Instance
  //  */
  // this.handleWatchPostCSS = (bsInstance = false) => {

  //   handlePostCss(
  //     configData,
  //     configRootData?.postCSS,
  //     false,
  //     bsInstance
  //   )
  // }


  // /**
  //  * Run PostCSS function
  //  * @param {object} bsInstance Browsersync Instance
  //  */
  // this.handleWatchSass = (bsInstance = false) => {

  //   handleSass(
  //     configData,
  //     false,
  //     bsInstance
  //   )
  // }

  // /**
  //  * Run Images function
  //  * @param {object} bsInstance Browsersync Instance
  //  */
  // this.handleWatchImages = (bsInstance = false) => {
  //   runImages(
  //     configData
  //   );
  // }

  // this.esBuild = (bsInstance = false) => {
  //   handleEsBuild(
  //     configData,
  //     configRootData?.esbuild,
  //     bsInstance,
  //   );
  // }





  // if ( configData?.watchReload ) {
  //   configData.watchReload.forEach(p => {
  //     this.reloadExts.push(path.extname(p))
  //   });
  // }


  // this.handleFileUpdates = ( type, bsInstance, filepath ) => {

  //   if (this.sassExts.includes(type)) {
  //     this.handleWatchSass(bsInstance);
  //   }

  //   if (this.postCssExts.includes(type)) {
  //     this.handleWatchPostCSS(bsInstance);
  //   }

  //   if (this.jsExts.includes(type)) {
  //     this.esBuild(bsInstance);
  //   }

  //   if (this.imageExts.includes(type)) {
  //     this.handleWatchImages(bsInstance);
  //   }

  //   if (this.reloadExts.includes(type)) {
  //     bsInstance.reload();
  //     handleMessageSuccess('bldr', `${path.basename(filepath)} triggered reload`);
  //   }
  // }

  // this.handleChokidar = (watchPaths, bs) => {
  //   const watcher = chokidar.watch(watchPaths.flat(), {
  //     ignored: /(^|[\/\\])\../, // ignore dotfiles
  //     persistent: true,
  //     ignoreInitial: true,
  //   });

  //   watcher
  //     .on('ready', () => {
  //       console.log(``);
  //       console.log(`----------------------------------------`);
  //       console.log(`[${colors.blue('bldr')}] ${colors.magenta('💪 Ready and waiting for changes!')}`)
  //       console.log(`----------------------------------------`);
  //       console.log(``);
  //     })
  //     .on('add', filePath => {
  //       this.handleFileUpdates(path.extname(filePath), bs, filePath);
  //     })
  //     .on('change', filePath => {
  //       this.handleFileUpdates(path.extname(filePath), bs, filePath);
  //     })
  //     .on('unlink', filePath => {
  //       this.handleFileUpdates(path.extname(filePath), bs, filePath);
  //     })
  // }


  // this.run = () => {

  //   if ( envKey ) {
  //     console.log(`Starting dev using ${envKey} enviornment...`.green);
  //   } else {
  //     console.log('Starting dev...'.green);
  //   }

  //   if ( !configData?.disableBrowsersync ) {
  //     if ( !localConfigData?.browserSync ) {
  //       handleMessageWarn('bldr', 'Local browserSync config not setup. Create a bldrConfigLocal.js.js file in root or run `bldr init`');
  //     } else if ( !localConfigData?.browserSync?.proxy ) {
  //       handleMessageWarn('bldr', 'Local browserSync proxy not setup. Add a `proxy` key within `browserSync` with a value for your local domain for dependancy injection.');
  //     }
  //   }

  //   const watchPaths = [];

  //   if (configData?.css) {
  //     watchPaths.push(this.createWatchPathArray(configData.css));
  //   }

  //   if (configData?.sass) {
  //     watchPaths.push(this.createWatchPathArray(configData.sass));
  //   }

  //   if (configData?.js) {
  //     watchPaths.push(this.createWatchPathArray(configData.js));
  //   }

  //   if (configData?.images) {
  //     watchPaths.push(this.createWatchPathArray(configData.images));
  //   }

  //   if (configData?.watchReload) {
  //     watchPaths.push(configData.watchReload);
  //   }

  //   if ( watchPaths.length <= 0 ) {
  //     throw new Error('Watch paths are not defined in bldrConfig.js.'.red);
  //   }


  //   // INIT BROWSERSYNC
  //   const bsDisable = configData?.browsersync?.disable ? configData.browsersync.disable : false;

  //   if ( bsDisable ) {
  //     this.handleChokidar(watchPaths, false);
  //   } else {
  //     const bsOptions = localConfigData?.browserSync ?? {};
  //     const bsName    = localConfigData?.browserSync?.instanceName ?? `bldr-${Math.floor(Math.random() * 1000)}`;
  //     const bs        = require("browser-sync").create(bsName);

  //     bsOptions.logPrefix      = 'bldr';
  //     bsOptions.logFileChanges = false;

  //     bs.init(bsOptions, this.handleChokidar(watchPaths, bs));
  //   }


  // }
// }