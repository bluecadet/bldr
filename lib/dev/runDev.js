const path = require('path');
const fs = require('fs');
const colors = require('colors');
const { getDevConfigData } = require('../utils/configHelpers');

const handlePostCss = require('../utils/handlePostCss');
const handleEsBuild = require('../utils/handleEsBuild');
const { runImages } = require('../processes/images');

function RunDev(args) {

  const {configRootData, configData, envKey} = getDevConfigData(args);

  // Run function
  this.run = async function() {

    if ( args.e || args.env ) {
      console.log(`Starting dev:${envKey} build...`.green);
    } else {
      console.log(`Starting dev build...`.green);
    }

    await handlePostCss(
      configData,
      configRootData?.postCSS,
      false
    );

    await handleEsBuild(
      configData,
      configRootData?.esBuild
    );

    await runImages(configData);
  }

}

module.exports = RunDev;