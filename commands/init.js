import { settings } from '../lib/settings/bldrSettings.js';
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { handleProcessSuccess, handleProcessWarn, handleProcessError } from '../lib/utils/reporters.js';
import { handlePathPrompt, handleImagePathPrompt, handleWatchPathPrompt } from '../lib/utils/initFunctions.js';

import Module from "node:module";
const require  = Module.createRequire(import.meta.url);
const { prompt } = require('enquirer');
const colors = require('colors');


const createBldrConfig = async () => {
  const askToCreate = await prompt({
    type: 'confirm',
    name: 'local',
    message: `${colors.yellow(`Would you like to create a ${settings.filename} file?`)}`
  });

  if ( !askToCreate.local ) {
    handleProcessSuccess(`bldr init`, `a ${settings.filename} file was not created`);
    return;
  }

  let config = {};

  config = await handlePathPrompt('css', '.css', config);
  config = await handlePathPrompt('sass', '.sass/.scss', config);
  config = await handlePathPrompt('js', '.js', config);
  config = await handleImagePathPrompt(config);
  config = await handleWatchPathPrompt(config);

  const content = `module.exports = ${JSON.stringify(config, null, 2)}`;

  try {
    writeFileSync(`${join(settings.root, settings.filename)}`, content, 'utf8');
    handleProcessSuccess(`bldr init`, `${settings.filename} file created in project root.`);
  } catch (err) {
    // Error if can't write file
    handleProcessError(`bldr init`, `error writing ${settings.filename} file to ${settings.root}`);
  }

};

const createBldrLocalConfig = async () => {
  const askToCreate = await prompt({
    type: 'confirm',
    name: 'local',
    message: `${colors.yellow(`Would you like to create a ${settings.localFilename} config file?`)}`
  });

  if ( !askToCreate.local ) {
    handleProcessSuccess(`bldr init`, `a ${settings.localFilename} file was not created`);
    return;
  }

  const localPrompt = await prompt([
    {
      type: 'input',
      name: 'port',
      message: `${colors.cyan('port number:')}`,
    },
    {
      type: 'input',
      name: 'proxyUrl',
      message: `${colors.cyan(`proxy`)} ${colors.dim('(local dev url)')}:`,
    }
  ]);

  const config = {
    browserSync: {}
  };

  if ( localPrompt.port !== '' ) {
    config.browserSync.port = localPrompt.port;
  }

  if ( localPrompt.proxyUrl !== '' ) {
    config.browserSync.proxy = localPrompt.proxyUrl;
  }

  const content = `module.exports = ${JSON.stringify(config, null, 2)}`;

  try {
    writeFileSync(`${join(settings.root, settings.localFilename)}`, content, 'utf8');
    handleProcessSuccess(`bldr init`, `${settings.localFilename} file created in project root.`);
  } catch (err) {
    // Error if can't write file
    handleProcessError(`bldr init`, `error writing ${settings.localFilename} file to ${settings.root}`);
  }

};


export const RunInit = async () => {
  const configPath = join(settings.root, settings.filename);
  const localConfigPath = join(settings.root, settings.localFilename);

  if ( existsSync(configPath) ) {
    handleProcessSuccess(`bldr init`, `${settings.filename} already exists in this project.`);
  } else {
    await createBldrConfig();
  }

  if ( existsSync(localConfigPath) ) {
    handleProcessSuccess(`bldr init`, `${settings.localFilename} already exists in this project.`);
  } else {
    await createBldrLocalConfig();
  }

  handleProcessSuccess(`bldr init`, `all done!`);

}