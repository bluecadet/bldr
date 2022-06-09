const runEsBuild = require('../processes/esbuild');

function handleEsBuild(
  configData,
  userConfig,
  bsInstance = false
) {

  return new Promise((resolve, reject) => {
    if ( !configData?.js) {
      reject(new Error('js key does not exist in config data'));
    }

    const options = {
      plugins        : userConfig?.plugins,
      overridePlugins: userConfig?.overridePlugins,
      root           : process.cwd(),
      minify         : false,
      usemaps        : true,
      overrideEsBuild: userConfig?.esBuild,
    }

    if ( Array.isArray(configData?.js) ) {
      configData?.js.map(group => {
        const gOptions       = options;
        gOptions.from        = group.src;
        gOptions.to          = group.dest;
        gOptions.logFullName = true;

        runEsBuild(gOptions);
      });

      if (bsInstance) {
        bsInstance.reload();
      }

      resolve();

    } else {
      options.from = configData?.js.src;
      options.to   = configData?.js.dest;

      runEsBuild(options)
        .then(() => {
          if (bsInstance) {
            bsInstance.reload();
          }
          resolve();
        })
    }
  });

}

module.exports = handleEsBuild;