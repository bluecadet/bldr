const compress_images = require("compress-images");
const fs = require('fs');
const fsx = require('fs-extra');
const path = require('path');
const colors = require('colors');

function isDirEmpty(dirname) {
  return fs.promises.readdir(dirname).then(files => {
    return files.length === 0;
  });
}

async function handleImages(config) {

  const afterLastSlash = config.src.substring(config.src.lastIndexOf('/') + 1);
  if ( isDirEmpty(config.src.replace(afterLastSlash, '')) ) {
    return false;
  }

  fsx.ensureDirSync(config.dest);

  await compress_images(path.resolve(config.src), `${path.resolve(config.dest)}${path.sep}`, { compress_force: false, statistic: false, autoupdate: true }, false,
    { jpg: { engine: "mozjpeg", command: ["-quality", "80"] } },
    { png: { engine: "pngquant", command: ["--quality=20-50", "-o"] } },
    { svg: { engine: "svgo", command: "--multipass" } },
    { gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
    function (error, completed, statistic) {
      if (error) {
        console.log(`${colors.white('[')}${colors.blue('images')}${colors.white(']')} ${colors.red(`Error: ${error}`)}`);
      } else if (completed) {
        if ( statistic?.input ) {
          console.log(`${colors.white('[')}${colors.blue('images')}${colors.white(']')} ${colors.cyan(`${path.basename(statistic.input)} processed`)}`);
        } else {
          console.log(`${colors.white('[')}${colors.blue('images')}${colors.white(']')} ${colors.cyan(`images processed`)}`);
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
      const gOptions       = options;
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