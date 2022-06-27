const argv = require('yargs').argv;
const path = require('path');
const fsx   = require('fs-extra');
const fs = require('fs');
const chokidar = require('chokidar');
const colors = require('colors');
const { getDevConfigData } = require('../utils/configHelpers');
const { runImages } = require('../processes/images');

// const runPostCSS = require('../processes/postCss');
const handlePostCss = require('../utils/handlePostCss');
const handleEsBuild = require('../utils/handleEsBuild');
const initBrowserSync = require('../processes/browsersync');

function RunWatch(args) {
  const {configRootData, configData} = getDevConfigData(args);
  const localConfigPath              = path.normalize(`${this.rootDir}/bldrConfigLocal.js`);
  const localConfigData              = fs.existsSync(localConfigPath) ? require(localConfigPath): false;

  configData.isWatch = true;

  /**
   * Run esbuild
   * @param {object} bsInstance BrowserSync Instance
   */
  this.esBuild = (bsInstance = false) => {
    handleEsBuild(
      configData,
      configRootData?.esbuild,
      false,
      bsInstance,
      true
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


  this.handleFileUpdates = ( type, bsInstance ) => {
    switch (type) {
      case '.css':
      case '.pcss':
      case '.postcss':
      case '.scss':
      case '.sass':
        this.handleWatchPostCSS(bsInstance);
        break;

      case '.js':
      case '.jsx':
        this.esBuild(bsInstance);
        break;

      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.gif':
      case '.svg':
        this.handleWatchImages(bsInstance);
        break;

      default:
        break;
    }
  }


  this.run = () => {

    console.log('Starting watch...'.green);

    const watchPaths = [];

    if (configData?.css) {
      watchPaths.push(this.createWatchPathArray(configData.css));
    }

    if (configData?.js) {
      watchPaths.push(this.createWatchPathArray(configData.js));
    }

    if (configData?.images) {
      watchPaths.push(this.createWatchPathArray(configData.images));
    }

    console.log(watchPaths.flat());

    if ( watchPaths.length <= 0 ) {
      throw new Error('Watch paths are not defined in bldrConfig.js.'.red);
    }

    this.handleWatchPostCSS(false);
    this.esBuild();

    const {bs, bsOptions} = initBrowserSync(configData, localConfigData);
    bs.init(bsOptions);


    const watcher = chokidar.watch(watchPaths.flat(), {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
    });

    watcher
      .on('ready', () => console.log(`[${colors.blue('bldr')}] Ready and waiting for changes...`))
      .on('add', filePath => {
        this.handleFileUpdates(path.extname(filePath), bs);
      })
      .on('change', filePath => {
        console.log(filePath);
        this.handleFileUpdates(path.extname(filePath), bs);
      })
      .on('unlink', filePath => {
        this.handleFileUpdates(path.extname(filePath), bs);
      })

  }
}

module.exports = RunWatch;