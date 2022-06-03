const path = require('path');
const fs = require('fs');
const colors = require('colors');
const { getConfigData } = require('../utils/configHelpers');

const handlePostCss = require('../utils/handlePostCss');
const handleEsBuild = require('../utils/handleEsBuild');

function RunDev(args) {

  const configRootData = getConfigData();
  let configData       = configRootData.dev;

  // Check if there are envs, and if they have data to use
  if ( args.e || args.env ) {
    const envKey = args.e || args.env;

    if ( configData?.env && envKey in configData.env ) {
      configData = configData.env[envKey];
    } else {
      console.log(`The ${envKey} key does not exist in dev. Please add in config and try again.`.red);
      process.exit();
    }
  }


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
  }

}

module.exports = RunDev;