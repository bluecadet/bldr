const runEsBuild = require('../processes/esbuild');
const runEsLint = require('../processes/eslint');


function handleEsBuildFiles(configData, userConfig, bsInstance = false) {
  return new Promise((resolve, reject) => {
    if ( !configData?.js) {
      resolve();
      // reject(new Error('js key does not exist in config data'));
    }

    const options = {
      plugins        : userConfig?.plugins,
      overridePlugins: userConfig?.overridePlugins,
      root           : process.cwd(),
      minify         : false,
      usemaps        : true,
      overrideEsBuild: userConfig?.esBuild,
      isWatch        : configData.isWatch,
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

function handleEsBuild(
  configData,
  userConfig,
  bsInstance = false
) {

  runEsLint(configData)
    .then(() => {
      handleEsBuildFiles(configData, userConfig, bsInstance = false)
    })

  // return new Promise((resolve, reject) => {
  //   if ( !configData?.js) {
  //     resolve();
  //     // reject(new Error('js key does not exist in config data'));
  //   }

  //   const options = {
  //     plugins        : userConfig?.plugins,
  //     overridePlugins: userConfig?.overridePlugins,
  //     root           : process.cwd(),
  //     minify         : false,
  //     usemaps        : true,
  //     overrideEsBuild: userConfig?.esBuild,
  //     isWatch        : configData.isWatch,
  //   }

  //   if ( Array.isArray(configData?.js) ) {
  //     configData?.js.map(group => {
  //       const gOptions       = options;
  //       gOptions.from        = group.src;
  //       gOptions.to          = group.dest;
  //       gOptions.logFullName = true;

  //       runEsBuild(gOptions);
  //     });

  //     if (bsInstance) {
  //       bsInstance.reload();
  //     }

  //     resolve();

  //   } else {
  //     options.from = configData?.js.src;
  //     options.to   = configData?.js.dest;

  //     runEsBuild(options)
  //       .then(() => {
  //         if (bsInstance) {
  //           bsInstance.reload();
  //         }
  //         resolve();
  //       })
  //   }
  // });

}

module.exports = handleEsBuild;