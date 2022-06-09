const postcss = require('postcss');
const path    = require('path');
const colors  = require('colors');
const fs      = require('fs');
const fsx     = require('fs-extra');
const fg      = require('fast-glob');
const { getPostCssConfig } = require('../utils/configHelpers');

const postcssrc = require('postcss-load-config')


// async function handleBuildPostCSSFile(file, plugins, syntax, config) {
async function handleBuildPostCSSFile(file, config) {

  return new Promise((resolve, reject) => {

    const buffer      = fs.readFileSync(file);
    const fileContent = buffer.toString();
    const fileName    = path.basename(file);
    const mapOpts     = config?.useMaps ? { inline: false }: false;
    const start       = Date.now();

    const ctx = { parser: true, map: 'inline' }

    postcssrc(ctx).then(({ plugins, options }) => {
      postcss(plugins)
        .process(fileContent, {
          // syntax: syntax,
          from:   file,
          to:     fileName,
          map:    mapOpts,
        })
        .then(result => {

          if ( !result?.css ) {
            throw new Error(`css value does not exist in response`);
          }

          fsx.ensureDirSync(config.to);

          try {
            fs.writeFileSync(path.join(config.to, fileName), result.css);
          } catch (err) {
            // console.log(err);
            throw new Error(`error writing ${fileName} to ${config.to}`.red);
          }

          const stop = Date.now();
          console.log(
            `${colors.white('[')}${colors.blue('postCSS')}${colors.white(']')} ${colors.cyan(`${fileName} processed`)} ${colors.gray(`${(stop - start)/1000}s`)}`
          );


          if ( mapOpts ) {
            if (result.map) {
              try {
                fs.writeFileSync(`${path.join(config.to, fileName)}.map`, result.map.toString())
                resolve();
              } catch (err) {
                console.log(err);
                throw new Error(`error writing ${fileName} map file to ${config.to}`.red);
              }
            }
          }

          resolve();
        })
    })

    // postcss(
    //   // plugins
    // )
    //   .process(fileContent, {
    //     // syntax: syntax,
    //     from:   file,
    //     to:     fileName,
    //     map:    mapOpts,
    //   })
    //   .then(result => {

    //     if ( !result?.css ) {
    //       throw new Error(`css value does not exist in response`);
    //     }

    //     fsx.ensureDirSync(config.to);

    //     try {
    //       fs.writeFileSync(path.join(config.to, fileName), result.css);
    //     } catch (err) {
    //       // console.log(err);
    //       throw new Error(`error writing ${fileName} to ${config.to}`.red);
    //     }

    //     const stop = Date.now();
    //     console.log(
    //       `${colors.white('[')}${colors.blue('postCSS')}${colors.white(']')} ${colors.cyan(`${fileName} processed`)} ${colors.gray(`${(stop - start)/1000}s`)}`
    //     );


    //     if ( mapOpts ) {
    //       if (result.map) {
    //         try {
    //           fs.writeFileSync(`${path.join(config.to, fileName)}.map`, result.map.toString())
    //           resolve();
    //         } catch (err) {
    //           console.log(err);
    //           throw new Error(`error writing ${fileName} map file to ${config.to}`.red);
    //         }
    //       }
    //     }

    //     resolve();
    //   })

  });
}


async function handleRun(config) {

  // let defaultPlugins = [
  //   require('postcss-strip-inline-comments'),
  //   require('postcss-import-ext-glob'),
  //   require("postcss-import")({base: [config.root]}),
  //   require('postcss-mixins'),
  //   require('postcss-extend-rule'),
  //   require('postcss-simple-vars'),
  //   require('postcss-define-function'),
  //   require('postcss-map-get'),
  //   require('postcss-advanced-variables'),
  //   require('postcss-nested'),
  //   require('postcss-conditionals'),
  //   require("postcss-calc"),
  // ];

  // if (fs.existsSync( `${process.cwd()}/.stylelintrc` )) {
  //   defaultPlugins.push(require("stylelint")({
  //     configBasedir: process.cwd(),
  //     reporters: [{ formatter: 'string', console: true }],
  //     failAfterError: false,
  //     debug: true,
  //   }));
  //   defaultPlugins.push(require("postcss-reporter")({ clearReportedMessages: true }));
  // }

  // if ( config?.minify ) {
  //   defaultPlugins.push(require('cssnano')({}));
  //   defaultPlugins.push(require('autoprefixer'));
  // }

  // // Define plugins to use based on user config
  // const plugins = handleConfigPluginArray(defaultPlugins, config?.userConfig);

  // // PostCSS syntax per file
  // const syntax = require('postcss-syntax')({
  //   rules: [
  //     {
  //       test: /\.(?:[sx]?html?|[sx]ht|vue|ux|php)$/i,
  //       extract: 'html',
  //     },
  //     {
  //       test: /\.(?:markdown|md)$/i,
  //       extract: 'markdown',
  //     },
  //     {
  //       test: /\.(?:m?[jt]sx?|es\d*|pac)$/i,
  //       extract: 'jsx',
  //     },
  //     {
  //       test: /\.(?:postcss|pcss|css)$/i,
  //       lang: 'scss'
  //     },
  //   ],
  //   css:  require('postcss-safe-parser'),
  //   sass: require('postcss-sass'),
  //   scss: require('postcss-scss'),
  // });

  // getPostCssConfig();

  // Process Globs
  const entries = fg.sync([config.from], { dot: true });

  for (const file of entries) {
    // await handleBuildPostCSSFile(file, plugins, syntax, config);
    await handleBuildPostCSSFile(file, config);
  }

  console.log(`postCSS complete`.green);
}


const runPostCSS = function(config) {

  return new Promise((resolve, reject) => {
    handleRun(config);
    resolve();
  })
}

module.exports = runPostCSS;

