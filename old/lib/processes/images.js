import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// const compress_images = require("compress-images");
const fs = require('fs');
const fsx = require('fs-extra');
const path = require('path');
const colors = require('colors');

const imagemin = require('imagemin');
const imageminMozJpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');

const {handleMessageWarn, handleMessageSuccess, handleProcessSuccess, handleMessageError} = require('../utils/handleMessaging');

function isDirEmpty(dirname) {
  const files = fs.readdirSync(dirname);
  if (files?.length === 0) {
    return true;
  }

  return false;
}

async function handleImages(config) {

  if ( !fs.existsSync(path.dirname(config.src)) ) {
    handleMessageWarn(`images`, `Image config source directory provided does not exist`);
    return;
  }

  if ( isDirEmpty(path.dirname(config.src)) ) {
    handleMessageWarn(`images`, `Image config source directory provided is empty`);
    return;
  }

  fsx.ensureDirSync(config.dest);

  const files = await imagemin([path.resolve(config.src)], {
    destination: path.resolve(config.dest),
    plugins: [
      imageminMozJpeg(),
      imageminPngquant({
        quality: [0.6, 0.8]
      }),
      imageminSvgo(),
    ]
  });

  if (!files) {
    handleMessageWarn(`images`, `There may have been a problem generating images`);
  } else {
    handleProcessSuccess(`images processed`);
  }
}

async function runImages(configData, bsInstance = false) {

  if ( !configData?.images ) {
    return;
  }

  if ( Array.isArray(configData.images) ) {

    configData?.js.map(group => {
      const gOptions       = {...options};
      gOptions.from        = group.src;
      gOptions.to          = group.dest;

      handleImages(group)
    });

    if (bsInstance) {
      bsInstance.reload();
    }

  } else {
    handleImages(configData.images)

    if (bsInstance) {
      bsInstance.reload();
    }
  }
}

async function runSingleImage(src, dest) {
  handleImages({
    src: src,
    dest: dest
  });
}

module.exports = {
  runImages,
  runSingleImage
};