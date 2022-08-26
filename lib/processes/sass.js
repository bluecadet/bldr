var sass = require('node-sass');
const path = require('path');
const fs        = require('fs');
const fsx       = require('fs-extra');
const fg        = require('fast-glob');
const {handleProcessSuccess, handleMessageSuccess, handleMessageError, handleThrowMessageError, handleProcessWarn} = require('../utils/handleMessaging');

const globImporter = require('node-sass-glob-importer');
const buildPostCSSFileFromBuffer = require('./postCssFromBuffer');

async function handleSassFile(file, config, syntax) {

  return new Promise((resolve, reject) => {

    const fileName    = path.basename(file);
    const mapOpts     = config?.useMaps || false;
    // const minify      = config?.minify || false;
    const basename    = path.basename(file, path.extname(file));

    console.log({
      file,
      fileName
    })

    const result = sass.renderSync({
      importer: globImporter(),
      file: file,
      outputStyle: 'compact',
      // outFile: path.join(config.to, `${basename}.css`),
      sourceMap: mapOpts,
    });

    // console.log(result);

    buildPostCSSFileFromBuffer(result.css, file, config, syntax)
      .then(() => resolve());

  });

}


async function handleRun(config) {

  const syntax = require('postcss-syntax')({
    rules: [
      {
        test: /\.(?:[sx]?html?|[sx]ht|vue|ux|php)$/i,
        extract: 'html',
      },
      {
        test: /\.(?:markdown|md)$/i,
        extract: 'markdown',
      },
      {
        test: /\.(?:m?[jt]sx?|es\d*|pac)$/i,
        extract: 'jsx',
      },
      {
        test: /\.(?:postcss|pcss|css)$/i,
        lang: 'scss'
      },
    ],
    css:  require('postcss-safe-parser'),
    sass: require('postcss-sass'),
    scss: require('postcss-scss'),
  });

  // Process Globs
  const entries = fg.sync([config.from], { dot: true });
  let errorCaught = false;

  for (const file of entries) {
    const processed = await handleSassFile(file, config, syntax);

    if (processed?.error && processed.error === true) {
      errorCaught = true;
    }
  }

  if ( errorCaught ) {
    handleProcessWarn('scss error occured, unable to complete. see above.')
  } else {
    handleProcessSuccess(`scss complete`);
  }
}


const runSass = function(config) {

  return new Promise((resolve, reject) => {
    console.log(config);
    handleRun(config);
    resolve();
  })
}

module.exports = runSass;