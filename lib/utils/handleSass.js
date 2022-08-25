const runSass = require('../processes/sass');

/**
 * Run PostCSS function
 * @param {object} bsInstance Browsersync Instance
 */
async function handleSass(
  configData,
  production = false,
  bsInstance = false,
) {

  return new Promise((resolve, reject) => {

    if (!('sass' in configData)) {
      resolve();
      // reject(new Error('css key does not exist in config data'));
    }

    const configSrc = configData.sass;

    const options = {
      root:       process.cwd(),
      useMaps:    !production,
      minify:     production,
      isWatch:    configData.isWatch,
    };

    if ( Array.isArray(configSrc) ) {

      for (const group of configSrc) {
        const gOptions       = options;
        gOptions.from        = group.src;
        gOptions.to          = group.dest;
        gOptions.logFullName = true;
        runSass(gOptions);
      }

      // if (bsInstance) {
      //   bsInstance.stream({match: "**/*.css"})
      // }

      resolve();

    } else {
      options.from = configSrc.src;
      options.to   = configSrc.dest;

      runSass(options)
      .then(() => {
        if (bsInstance) {
          bsInstance.stream({match: "**/*.css"})
        }
        resolve();
      });
    }

  })
}


module.exports = handleSass;