const buildPostCSSFileFromBuffer = require('./postCssFromBuffer');
const globImporter               = require('node-sass-glob-importer');
const sass                       = require('node-sass');
const fg                         = require('fast-glob');
const colors                     = require('colors');
const {handleMessageWarn} = require('../utils/handleMessaging');

function sassErrMessage(err) {
  return `
  ${colors.white(                 `File:   ${err.file}`)}
  ${err?.line ? `${colors.white(  `line:   ${err.line}`)}` : ''}
  ${err?.column ? `${colors.white(`column: ${err.column}`)}` : ''}

  ${colors.red(err.formatted)}
`
}

async function handleSassFile(file, config, syntax) {

  const mapOpts  = config?.useMaps || false;

  const result = sass.render({
    importer: globImporter(),
    file: file,
    outputStyle: 'compact',
    sourceMap: mapOpts,
  }, (error, result) => {
    if ( error ) {
      handleMessageWarn('sass', `${file} cannot be processed due to an error:`);

      console.log(sassErrMessage(error));
      if ( !config?.isWatch ) {
        throw new Error('Sass processing error');
      }
    } else {
      buildPostCSSFileFromBuffer(result.css, file, config, syntax);
    }
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

  return errorCaught;
}


const runSass = async function(config) {
  return await handleRun(config);
}

module.exports = runSass;