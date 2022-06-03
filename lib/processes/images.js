const imagemin = require('imagemin');
const mozjpeg  = require('imagemin-mozjpeg');
const webp     = require('imagemin-webp');
const gifsicle = require('imagemin-gifsicle');
const pngcrush = require('imagemin-pngcrush');
const svgo     = require('imagemin-svgo');


async function handleImages(config) {
  await imagemin(config.src, {
    destination: config.dest,
    plugins: [
      imageminJpegtran(),
      imageminPngquant({
        quality: [0.6, 0.8]
      })
    ]
  });
}

async function runImages(configData) {

  if ( !configData?.images ) {
    return;
  }

  if ( Array.isArray(configData.images) ) {
    for (const path in configData.images) {
      runImages({

      })
    }
  } else {

  }




}

module.exports = runImages;