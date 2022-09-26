const argv                                      = require('yargs').argv;
const path                                      = require('path');
const fsx                                       = require('fs-extra');
const fs                                        = require('fs');
const chokidar                                  = require('chokidar');
const colors                                    = require('colors');
const { getDevConfigData }                      = require('../utils/configHelpers');
const { runImages }                             = require('../processes/images');
const handlePostCss                             = require('../utils/handlePostCss');
const handleEsBuild                             = require('../utils/handleEsBuild');
const handleSass                                = require('../utils/handleSass');
const {handleMessageSuccess, handleMessageWarn} = require('../utils/handleMessaging');


function RunWatch(args) {
  const {configRootData, configData, envKey} = getDevConfigData(args);
  const localConfigPath                      = path.normalize(`${process.cwd()}/bldrConfigLocal.js`);
  const localConfigData                      = fs.existsSync(localConfigPath) ? require(localConfigPath): false;

  configData.isWatch = true;

  /**
   * Run esbuild
   * @param {object} bsInstance BrowserSync Instance
   */
  this.esBuild = (bsInstance = false) => {
    handleEsBuild(
      configData,
      configRootData?.esbuild,
      bsInstance,
    );
  }

  /**
   * Run PostCSS function
   * @param {object} bsInstance Browsersync Instance
   */
  this.handleWatchPostCSS = (bsInstance = false) => {

    handlePostCss(
      configData,
      configRootData?.postCSS,
      false,
      bsInstance
    )
  }


  /**
   * Run PostCSS function
   * @param {object} bsInstance Browsersync Instance
   */
  this.handleWatchSass = (bsInstance = false) => {

    handleSass(
      configData,
      false,
      bsInstance
    )
  }

  /**
   * Run Images function
   * @param {object} bsInstance Browsersync Instance
   */
  this.handleWatchImages = (bsInstance = false) => {
    runImages(
      configData
    );
  }


  /**
   * Create an array based on watch path arrays in config
   * @param {object} group
   * @returns array
   */
  this.createWatchPathArray = (group) => {
    const pathArray =  [];

    if ( Array.isArray(group) ) {
      group.map(g => {
        if (g?.watch) {
          g.watch.map(w => pathArray.push(w));
        }
      });
    } else {
      if ( group?.watch) {
        group.watch.map(w => pathArray.push(w));
      }
    }

    return pathArray;
  }

  this.sassExts    = ['.scss', '.sass'];
  this.postCssExts = ['.css','.pcss','.postcss','.scss','.sass',];
  this.jsExts      = ['.js','.jsx'];
  this.imageExts   = ['.jpg','.jpeg','.png','.gif','.svg',];
  this.reloadExts  = [];

  if ( configData?.watchReload ) {
    configData.watchReload.forEach(p => {
      this.reloadExts.push(path.extname(p))
    });
  }


  this.handleFileUpdates = ( type, bsInstance, filepath ) => {

    if (this.sassExts.includes(type)) {
      this.handleWatchSass(bsInstance);
    }

    if (this.postCssExts.includes(type)) {
      this.handleWatchPostCSS(bsInstance);
    }

    if (this.jsExts.includes(type)) {
      this.esBuild(bsInstance);
    }

    if (this.imageExts.includes(type)) {
      this.handleWatchImages(bsInstance);
    }

    if (this.reloadExts.includes(type)) {
      bsInstance.reload();
      handleMessageSuccess('bldr', `${path.basename(filepath)} triggered reload`);
    }
  }

  this.handleChokidar = (watchPaths, bs) => {
    const watcher = chokidar.watch(watchPaths.flat(), {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
    });

    watcher
      .on('ready', () => {
        console.log(``);
        console.log(`----------------------------------------`);
        console.log(`[${colors.blue('bldr')}] ${colors.magenta('💪 Ready and waiting for changes!')}`)
        console.log(`----------------------------------------`);
        console.log(``);
      })
      .on('add', filePath => {
        this.handleFileUpdates(path.extname(filePath), bs, filePath);
      })
      .on('change', filePath => {
        this.handleFileUpdates(path.extname(filePath), bs, filePath);
      })
      .on('unlink', filePath => {
        this.handleFileUpdates(path.extname(filePath), bs, filePath);
      })
  }


  this.run = () => {

    if ( envKey ) {
      console.log(`Starting watch using ${envKey} enviornment...`.green);
    } else {
      console.log('Starting watch...'.green);
    }

    if ( !localConfigData?.browserSync ) {
      handleMessageWarn('bldr', 'Local browserSync config not setup. Create a bldrConfigLocal.js.js file in root or run `bldr init`');
    } else if ( !localConfigData?.browserSync?.proxy ) {
      handleMessageWarn('bldr', 'Local browserSync proxy not setup. Add a `proxy` key within `browserSync` with a value for your local domain for dependancy injection.');
    }

    // console.log('LOCAL...'.green);

    const watchPaths = [];

    if (configData?.css) {
      watchPaths.push(this.createWatchPathArray(configData.css));
    }

    if (configData?.sass) {
      watchPaths.push(this.createWatchPathArray(configData.sass));
    }

    if (configData?.js) {
      watchPaths.push(this.createWatchPathArray(configData.js));
    }

    if (configData?.images) {
      watchPaths.push(this.createWatchPathArray(configData.images));
    }

    if (configData?.watchReload) {
      watchPaths.push(configData.watchReload);
    }

    if ( watchPaths.length <= 0 ) {
      throw new Error('Watch paths are not defined in bldrConfig.js.'.red);
    }


    // INIT BROWSERSYNC
    const bsOptions = localConfigData?.browserSync ?? {};
    const bsName    = localConfigData?.browserSync?.instanceName ?? `bldr-${Math.floor(Math.random() * 1000)}`;
    const bs        = require("browser-sync").create(bsName);

    bsOptions.logPrefix = 'bldr';
    bsOptions.logFileChanges= false;

    bs.init(bsOptions, this.handleChokidar(watchPaths, bs));

  }
}

module.exports = RunWatch;