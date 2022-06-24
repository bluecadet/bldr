const runPostCSS = require('../processes/postCss');

/**
 * Run PostCSS function
 * @param {object} bsInstance Browsersync Instance
 */
async function handlePostCss(
  configData,
  userConfig,
  production = false,
  bsInstance = false,
) {

  return new Promise((resolve, reject) => {

    if (!('css' in configData)) {
      resolve();
      // reject(new Error('css key does not exist in config data'));
    }

    const configSrc = configData.css;

    const options = {
      userConfig: userConfig,
      root:       process.cwd(),
      useMaps:    !production,
      minify:     production,
    };

    if ( Array.isArray(configSrc) ) {

      for (const group of configSrc) {
        const gOptions       = options;
        gOptions.from        = group.src;
        gOptions.to          = group.dest;
        gOptions.logFullName = true;
        runPostCSS(gOptions);
      }

      if (bsInstance) {
        bsInstance.stream({match: "**/*.css"})
      }

      resolve();

    } else {
      options.from = configSrc.src;
      options.to   = configSrc.dest;

      runPostCSS(options)
      .then(() => {
        if (bsInstance) {
          bsInstance.stream({match: "**/*.css"})
        }
        resolve();
      });
    }

  })
}


module.exports = handlePostCss;