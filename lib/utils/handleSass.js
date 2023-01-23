import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const runSass = require('../processes/sass');
const {handleProcessSuccess, handleProcessWarn} = require('../utils/handleMessaging');

async function handleGroupArray(configSrc, options) {
  let anyError = false;

  for (const group of configSrc) {
    const gOptions       = {...options};
    gOptions.from        = group.src;
    gOptions.to          = group.dest;
    gOptions.logFullName = true;
    const postCssErrorCaught = await runSass(gOptions);

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
async function handleSass(
  configData,
  production = false,
  bsInstance = false,
) {


  if (!('sass' in configData)) {
    return false;
  }

  const configSrc  = configData.sass;
  let postCssError = false;
  const options     = {
    root:       process.cwd(),
    useMaps:    !production,
    minify:     production,
    isWatch:    configData.isWatch,
  };

  if ( Array.isArray(configSrc) ) {
    postCssError = handleGroupArray(configSrc, options);
  } else {
    options.from = configSrc.src;
    options.to   = configSrc.dest;
    postCssError = await runSass(options);
  }

  if (bsInstance) {
    bsInstance.stream({match: "**/*.css"})
  }

  if ( postCssError ) {
    handleProcessWarn('postCSS error occured, unable to complete. see above.')
  } else {
    handleProcessSuccess(`sass complete`);
  }
}


module.exports = handleSass;