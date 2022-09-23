const {runPostCSS} = require('../processes/postCss');
const {handleProcessSuccess, handleProcessWarn} = require('../utils/handleMessaging');

async function handleGroupArray(configSrc, options) {
  let anyError = false;

  for (const group of configSrc) {
    const gOptions       = {...options};
    gOptions.from        = group.src;
    gOptions.to          = group.dest;
    gOptions.logFullName = true;
    const postCssErrorCaught = await runPostCSS(gOptions);

    if ( postCssErrorCaught ) {
      anyError = true;
    }
  }

  return anyError;
}

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

  if (!('css' in configData)) {
    return false;
  }

  const configSrc = configData.css;

  const options = {
    userConfig: userConfig,
    root:       process.cwd(),
    useMaps:    !production,
    minify:     production,
    isWatch:    configData.isWatch,
  };

  let postCssError = false;

  if ( Array.isArray(configSrc) ) {
    postCssError = await handleGroupArray(configSrc, options);
  } else {
    options.from = configSrc.src;
    options.to   = configSrc.dest;
    postCssError = await runPostCSS(options);
  }

  if (bsInstance) {
    bsInstance.reload("*.css");
  }

  if ( postCssError ) {
    handleProcessWarn('postCSS error occured, unable to complete. see above.')
  } else {
    handleProcessSuccess(`postCSS complete`);
  }
}


module.exports = handlePostCss;