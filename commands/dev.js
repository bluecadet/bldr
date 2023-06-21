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
        // bsInstance.stream({match: "**/*.css"});
        bsInstance.reload(["*.css"]);
      }
    }

    if (postCssExts.includes(ext)) {
      await processPostcss(configData);
      if ( bsInstance ) {
        // bsInstance.stream({match: "**/*.css"});
        bsInstance.reload(["*.css"]);
      }
    }

    if (jsExts.includes(ext)) {
      await processEsBuild(configData);
      if ( bsInstance ) {
        bsInstance.reload(["*.js"]);
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