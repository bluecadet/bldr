import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const runEsBuild = require('../processes/esbuild');
const runEsLint = require('../processes/eslint');
const {handleProcessSuccess} = require('../utils/handleMessaging');

async function handleGroupArray(configSrc, options) {
  let anyError = false;

  for (const group of configSrc) {
    const gOptions       = {...options};
    gOptions.from        = group.src;
    gOptions.to          = group.dest;
    gOptions.logFullName = true;
    await runEsBuild(gOptions);
  }

  return anyError;
}


async function handleEsBuildFiles(
  configData,
  userConfig,
  bsInstance = false
) {

  if ( !configData?.js) {
    return false
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

  if ( configData?.eslint ) {
    options.eslint = configData.eslint;
  }

  if ( Array.isArray(configData?.js) ) {
    await handleGroupArray(configData.js, options);

  } else {
    options.from = configData?.js.src;
    options.to   = configData?.js.dest;
    await runEsBuild(options);
  }

  if (bsInstance) {
    bsInstance.reload();
  }

  handleProcessSuccess(`esBuild complete`);

}

function handleEsBuild(configData, userConfig, bsInstance = false) {

  runEsLint(configData)
    .then(() => {
      handleEsBuildFiles(configData, userConfig, bsInstance)
    })

}

module.exports = handleEsBuild;