import util from 'node:util';
import { handleProcessWarn, handleProcessSuccess } from '../utils/reporters.js';
import postCSSfromBuffer from './postCssFromBuffer.js';
import colors from 'colors';

import { createRequire } from 'node:module';
const require      = createRequire(import.meta.url);
const globImporter = require('node-sass-glob-importer');
const sass         = require('node-sass');
const fg           = require('fast-glob');

let rootConfig;

function sassErrMessage(err) {
  return `
  ${colors.white(                 `File:   ${err.file}`)}
  ${err?.line ? `${colors.white(  `line:   ${err.line}`)}` : ''}
  ${err?.column ? `${colors.white(`column: ${err.column}`)}` : ''}
  ${colors.red(err.formatted)}
`
}

function handleSassFile(file, configObject) {
  const mapOpts  = rootConfig.settings.env === 'dev' ? true : false;

  sass.render({
    importer: globImporter(),
    file: file,
    outputStyle: 'compact',
    sourceMap: mapOpts,
  }, (error, result) => {

    if ( error ) {
      handleProcessWarn('sass', `${file} cannot be processed due to an error:`);
      console.log(sassErrMessage(error));

      if ( !config.settings.isWatch ) {
        throw new Error('Sass processing error');
      }
    } else {
      postCSSfromBuffer(result.css, file, configObject, rootConfig);
    }
  });
}

function handleConfigObjectGlobs(configObject) {

  // Process Globs
  const entries = fg.sync([configObject.src], { dot: true });
  let errorCaught = false;

  for (const file of entries) {
    handleSassFile(file, configObject);
  }
}


export default function handleSass(config, bsInstance) {
  // console.log(util.inspect(config, {showHidden: false, depth: null, colors: true}))

  if ( !config?.processes?.sass ) {
    return;
  }

  rootConfig = config;

  config.processes.sass.forEach(configObject => {
    if ( !configObject?.src || !configObject?.dest ) {
      let msg = '';
      if ( !configObject?.src && !configObject?.dest ) {
        msg = 'src and dest keys ';
      } else if ( !configObject?.src ) {
        msg = 'src key ';
      } else if ( !configObject?.dest ) {
        msg = 'dest key ';
      }
      handleProcessWarn('sass', `${msg} missing in config`);

      return;

    } else {
      handleConfigObjectGlobs(configObject);
    }
  });

  if (bsInstance) {
    bsInstance.stream({match: "**/*.css"});
  }

  handleProcessSuccess('sass', `sass complete!`);
}