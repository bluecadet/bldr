import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const fs = require('fs');
const path = require('path');
const { ESLint } = require("eslint");
const colors = require('colors');
const {handleMessageSuccess, handleMessageWarn, handleThrowMessageError} = require('../utils/handleMessaging');

async function handleEsLintFiles(fileArray, config) {
  const eslint = new ESLint();

  try {

    const results    = await eslint.lintFiles(fileArray, {warnIgnored: true});
    const formatter  = await eslint.loadFormatter("stylish");
    const resultText = formatter.format(results);

    results.forEach(res => {
      if ( res.errorCount > 0 ) {
        if ( config?.isWatch || config?.eslint?.forceBuildIfError ) {
          console.log(resultText);
        } else {
          console.log(resultText);
          handleThrowMessageError('eslint', `Errors found in Eslint - process aborted`);
          process.exit(1);
        }
      }
    });


  } catch(err) {
    if ( config?.isWatch || config?.eslint?.forceBuildIfError ) {
      // console.log(err);
    } else {
      console.log(err);
      process.exit(1);
    }
  }
}

async function testAllowRun(config) {

  return new Promise((resolve) => {

    if ( config?.eslint?.omit ) {
      resolve(false);
    }

    let configExists = false;
    const root = process.cwd();

    const configFiles = [
      '.eslintrc',
      '.eslintrc.js',
      '.eslintrc.cjs',
      '.eslintrc.yaml',
      '.eslintrc.yml',
      '.eslintrc.json',
    ];

    configFiles.forEach(file => {
      const filePath = path.resolve(root, file);

      if ( fs.existsSync(filePath) ) {
        configExists = true;
      }
    });

    if ( configExists ) {
      resolve(true);
    }

    const rawPackage = fs.readFileSync(path.resolve(root, 'package.json'));
    const jsonPackage = JSON.parse(rawPackage);

    if ( jsonPackage?.eslintConfig ) {
      resolve(true);
    }

    resolve(false);
  })
}


async function runEsLint(config) {

  return new Promise((resolve, reject) => {
    testAllowRun(config)
      .then(allow => {
        if (!allow) {
          if ( config?.eslint?.omit ) {
            // handleMessageWarn('eslint', 'process not ran: eslint ignored in bldrconfig');
          } else {
            handleMessageSuccess('eslint', 'not ran (missing eslint config in project root)');
          }
          return resolve();
        }

        let fileArray = [];

        if ( config?.js?.watch ) {
          for (let i = 0; i < config.js.watch.length; i++) {
            const element = config.js.watch[i];
            fileArray.push(path.resolve(element));
          }
        } else if ( config?.js?.src ) {
          fileArray.push(path.resolve(config.js.src));
        } else if ( config?.from ) {
          fileArray.push(path.resolve(config.from));
        }

        if (fileArray.length === 0) {
          // handleMessageWarn('eslint', 'process not ran: js files not found in watch or src config');
          resolve();
        }

        handleEsLintFiles(fileArray, config);

        resolve();

      });
  });
}

module.exports = runEsLint;