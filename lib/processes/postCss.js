const postcss   = require('postcss');
const path      = require('path');
const colors    = require('colors');
const fs        = require('fs');
const fsx       = require('fs-extra');
const fg        = require('fast-glob');

const postcssrc = require('postcss-load-config');
const {handleProcessSuccess, handleMessageSuccess, handleMessageError, handleThrowMessageError, handleProcessWarn} = require('../utils/handleMessaging');
const argv = require('yargs').argv;

const buildPostCSSFileFromBuffer = require('./postCssFromBuffer');

function postCssErrMessage(err) {
  return `${colors.red(`Error proccessing file ./${err.file}`)}
${colors.white('reason:')} ${colors.red(err.reason)}${err?.line ? `
${colors.white('line:')} ${colors.red(err.line)}` : ''}${err?.columns ? `
${colors.white('columns:')} ${colors.red(err.columns)}` : ''}
${colors.white('error:')} ${err}
`
}


async function handleBuildPostCSSFile(file, config, syntax) {

  return new Promise((resolve, reject) => {

    const buffer      = fs.readFileSync(file);
    buildPostCSSFileFromBuffer(buffer, file, config, syntax)
      .then(() => {
        resolve();
      });

    // const fileContent = buffer.toString();
    // const fileName    = path.basename(file);
    // const mapOpts     = config?.useMaps ? { inline: false }: false;
    // const start       = Date.now();

    // // Pass context to postcss config file
    // const ctx = { bldrEnv: argv._[0] };

    // // Load postcss config, process css
    // postcssrc(ctx).then(({ plugins, options }) => {
    //   postcss(plugins)
    //     .process(fileContent, {
    //       syntax: syntax,
    //       from:   file,
    //       to:     fileName,
    //       map:    mapOpts,
    //     })
    //     .then(result => {
    //       // Error if no css is present
    //       if ( !result?.css ) {
    //         handleMessageError(`postcss`, `${fileName} does not contain css...`);
    //       }

    //       fsx.ensureDirSync(config.to);

    //       try {
    //         fs.writeFileSync(path.join(config.to, fileName), result.css);
    //       } catch (err) {
    //         // Error if can't write file
    //         handleThrowMessageError(`postcss`, `error writing ${fileName} to ${config.to}`);
    //       }

    //       // Write maps if dev or watch
    //       if ( mapOpts ) {
    //         if (result.map) {
    //           try {
    //             fs.writeFileSync(`${path.join(config.to, fileName)}.map`, result.map.toString())
    //             resolve();
    //           } catch (err) {
    //             // Error if can't write file
    //             handleMessageError(`postcss`, `error writing ${fileName} map file to ${config.to}`);
    //           }
    //         }
    //       }

    //       const stop = Date.now();

    //       // All Done, no complaints
    //       handleMessageSuccess('postcss', `${fileName} processed`, ((stop - start)/1000));
    //       resolve({error: false});

    //     })
    //     .catch(err => {
    //       if ( err.file ) {
    //         // Postcss error messaging
    //         handleMessageError(`postcss`, postCssErrMessage(err), true);
    //       } else {
    //         // General error caught
    //         console.log(err);
    //       }

    //       // Allow process to continue if watch is running
    //       if ( config.isWatch ) {
    //         resolve({error: true});
    //       }

    //       // Otherwise reject and stop process
    //       reject({error: true});
    //     })
    // })

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
  let errorCaught = false;

  for (const file of entries) {
    const processed = await handleBuildPostCSSFile(file, config, syntax);
    if (processed?.error && processed.error === true) {
      errorCaught = true;
    }
  }

  if ( errorCaught ) {
    handleProcessWarn('postCSS error occured, unable to complete. see above.')
  } else {
    handleProcessSuccess(`postCSS complete`);
  }
}


const runPostCSS = function(config) {

  return new Promise((resolve, reject) => {
    handleRun(config);
    resolve();
  })
}

module.exports = {
  buildPostCSSFileFromBuffer,
  runPostCSS
};

