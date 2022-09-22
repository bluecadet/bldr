const path              = require('path');
const fs                = require('fs');
const colors            = require('colors');
const handlePostCss     = require('../utils/handlePostCss');
const handleSass        = require('../utils/handleSass');
const runRollup         = require('../processes/rollup');
const { getConfigData } = require('../utils/configHelpers');
const { runImages }     = require('../processes/images');
const { config }        = require('yargs');

async function RunBuild() {

  const configRootData = getConfigData();
  const configData     = configRootData?.build || configRootData?.dev || configRootData;

  console.log('Starting build...'.green);

  await handlePostCss(
    configData,
    configRootData?.postCSS,
    true
  );

  await handleSass(
    configData,
    true
  );

  const jsData = configData?.js;

  if ( jsData ) {
    const options = {
      plugins: (configRootData?.rollup?.plugins),
      userSetInputOptions: {},
      userSetOutputOptions: {},
      rollupOverride: (configRootData?.rollup?.rollup),
    }

    if ( configRootData?.rollup?.inputOptions ) {
      options.userSetInputOptions = {...options.userSetInputOptions, ...configRootData.rollup.inputOptions};
    }

    if ( configRootData?.rollup?.outputOptions ) {
      options.userSetOutputOptions = {...options.userSetOutputOptions, ...configRootData.rollup.outputOptions};
    }

    if ( configRootData?.eslint ) {
      options.eslint = configRootData.eslint;
    }

    if ( Array.isArray(jsData) ) {
      await jsData.map(group => {
        const gOptions = {...options};
        gOptions.from  = group.src;
        gOptions.to    = group.dest;
        runRollup(gOptions);
      });

    } else {
      options.from = jsData.src;
      options.to   = jsData.dest;
      await runRollup(options);
    }
  }

  await runImages(configData);
}

module.exports = RunBuild;