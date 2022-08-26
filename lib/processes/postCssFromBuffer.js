const postcss   = require('postcss');
const path      = require('path');
const colors    = require('colors');
const fs        = require('fs');
const fsx       = require('fs-extra');
const fg        = require('fast-glob');
const postcssrc = require('postcss-load-config');
const {handleProcessSuccess, handleMessageSuccess, handleMessageError, handleThrowMessageError, handleProcessWarn} = require('../utils/handleMessaging');
const argv = require('yargs').argv;

async function buildPostCSSFileFromBuffer(buffer, file, config, syntax) {
  return new Promise((resolve, reject) => {

    const fileContent = buffer.toString();
    const fileName    = path.basename(file);
    const basename    = path.basename(file, path.extname(file));
    const writeFileName = `${basename}.css`;
    const mapOpts     = config?.useMaps ? { inline: false }: false;
    const start       = Date.now();

    // Pass context to postcss config file
    const ctx = { bldrEnv: argv._[0] };

    // Load postcss config, process css
    postcssrc(ctx).then(({ plugins, options }) => {
      postcss(plugins)
        .process(fileContent, {
          syntax: syntax,
          from:   file,
          to:     writeFileName,
          map:    mapOpts,
        })
        .then(result => {
          // Error if no css is present
          if ( !result?.css ) {
            handleMessageError(`postcss`, `${fileName} does not contain css...`);
          }

          fsx.ensureDirSync(config.to);

          try {
            fs.writeFileSync(path.join(config.to, writeFileName), result.css);
          } catch (err) {
            // Error if can't write file
            handleThrowMessageError(`postcss`, `error writing ${fileName} to ${config.to}`);
          }

          // Write maps if dev or watch
          if ( mapOpts ) {
            if (result.map) {
              try {
                fs.writeFileSync(`${path.join(config.to, writeFileName)}.map`, result.map.toString())
                resolve();
              } catch (err) {
                // Error if can't write file
                handleMessageError(`postcss`, `error writing ${fileName} map file to ${config.to}`);
              }
            }
          }

          const stop = Date.now();

          // All Done, no complaints
          handleMessageSuccess('postcss', `${fileName} processed`, ((stop - start)/1000));
          resolve({error: false});

        })
        .catch(err => {
          if ( err.file ) {
            // Postcss error messaging
            handleMessageError(`postcss`, postCssErrMessage(err), true);
          } else {
            // General error caught
            console.log(err);
          }

          // Allow process to continue if watch is running
          if ( config.isWatch ) {
            resolve({error: true});
          }

          // Otherwise reject and stop process
          reject({error: true});
        })
    })

  });

}

module.exports = buildPostCSSFileFromBuffer;