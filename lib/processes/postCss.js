const buildPostCSSFileFromBuffer = require('./postCssFromBuffer');
const fs                         = require('fs');
const fg                         = require('fast-glob');


async function handleBuildPostCSSFile(file, config, syntax) {

  return new Promise((resolve, reject) => {

    const buffer = fs.readFileSync(file);
    buildPostCSSFileFromBuffer(buffer, file, config, syntax)
      .then(() => {
        resolve();
      });

  });
}


async function handleRun(config) {

  // PostCSS syntax per file
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
  let postCssErrorCaught = false;

  for (const file of entries) {
    const processed = await handleBuildPostCSSFile(file, config, syntax);
    if (processed?.error && processed.error === true) {
      postCssErrorCaught = true;
    }
  }

  return postCssErrorCaught

}


const runPostCSS = async function(config) {
  return await handleRun(config);
}

module.exports = {
  // buildPostCSSFileFromBuffer,
  runPostCSS
};

