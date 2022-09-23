var sass                         = require('node-sass');
const path                       = require('path');
const fs                         = require('fs');
const fsx                        = require('fs-extra');
const fg                         = require('fast-glob');
const globImporter               = require('node-sass-glob-importer');
const buildPostCSSFileFromBuffer = require('./postCssFromBuffer');

async function handleSassFile(file, config, syntax) {

  const fileName = path.basename(file);
  const mapOpts  = config?.useMaps || false;

  const result = sass.renderSync({
    importer: globImporter(),
    file: file,
    outputStyle: 'compact',
    sourceMap: mapOpts,
  });

  buildPostCSSFileFromBuffer(result.css, file, config, syntax);

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

  return errorCaught;
}


const runSass = async function(config) {
  return await handleRun(config);
}

module.exports = runSass;