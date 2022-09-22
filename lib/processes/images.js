const compress_images = require("compress-images");
const fs = require('fs');
const fsx = require('fs-extra');
const path = require('path');
const colors = require('colors');

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
    handleMessageWarn(`images`, `Image config source directory provided does not exist.`);
    return;
  }

  if ( isDirEmpty(path.dirname(config.src)) ) {
    handleMessageWarn(`images`, `Image config source directory provided is empty`);
    return;
  }

  fsx.ensureDirSync(config.dest);

  await compress_images(path.resolve(config.src), `${path.resolve(config.dest)}${path.sep}`, { compress_force: false, autoupdate: true }, false,
    { jpg: { engine: "mozjpeg", command: ["-quality", "80"] } },
    { png: { engine: "pngquant", command: ["--quality=20-50", "-o"] } },
    { svg: { engine: "svgo", command: "--multipass" } },
    { gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
    function (error, completed, statistic) {
      if (error) {
        handleMessageError('images', `Error: ${error}`);
      } else if (completed) {
        if ( statistic?.input ) {
          handleMessageSuccess('images', `${path.basename(statistic.input)} processed`);
        } else {
          handleProcessSuccess(`images processed`);
        }
      }
    }
  );
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