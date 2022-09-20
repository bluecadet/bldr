const path = require('path');

const initBrowserSync = function(
  config,
  localConfig,
  // bsWatchPathArray
) {
  const configName  = config?.dev?.browserSync?.instanceName;
  const name        = configName ? configName: `bldr-${Math.floor(Math.random() * 1000)}`;
  const bs          = require("browser-sync").create(name);
  const userOptions = config?.dev?.browserSync?.options;

  let bsOptions = {};

  if (userOptions ) {
    bsOptions = userOptions;
  }

  if ( localConfig ) {
    bsOptions = { ...bsOptions, ...localConfig };
  }

  bsOptions.watch = false;

  // if (
  //   bsOptions?.watch === undefined ||
  //   (bsOptions?.watch === true && ! bsOptions?.files)
  // ) {

  //   let files = [];

  //   if (config?.dev?.css?.dest) {
  //     files = [...files, path.normalize(`${config.dev.css.dest}/*.css`)];
  //   }

  //   if (config?.dev?.sass?.dest) {
  //     files = [...files, path.normalize(`${config.dev.sass.dest}/*.css`)];
  //   }

  //   if (config?.dev?.js?.dest) {
  //     files = [...files, path.normalize(`${config.dev.js.dest}/*.js`)];
  //   }

  //   bsOptions.watch = true;
  //   bsOptions.files = files;
  // }

  bsOptions.logPrefix = 'bldr';
  // bsOptions.logLevel = "silent";
  bsOptions.logFileChanges= false;

  return {bs, bsOptions};
};

module.exports = initBrowserSync;