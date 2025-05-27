import { CommandSettings } from "../lib/@types/commandSettings";
import { BldrSettings } from "../lib/BldrSettings.js";
import { logSuccess, logError } from "../lib/utils/loggers.js";
import { ConfigSettings, LocalConfigSettings } from "../lib/@types/configTypes";
import { handleBrowsersync, handleEsLint, handlePathPrompt, handleReloadExtensions, handleRollup, handleSDC, handleStylelint, handleWatchPaths } from "../lib/utils/createFilePrompts.js";
import path from "node:path";
import fs from "node:fs";
import Module from "node:module";

const require  = Module.createRequire(import.meta.url);
const { prompt } = require('enquirer');
const colors = require('colors');
const settings = new BldrSettings();

export default function init(commandOptions: CommandSettings) {
  console.log('init!');
  maybeCreateFiles();
}


const maybeCreateFiles = async () => {
  const configPath = path.join(settings.root, settings.configFileName);
  const localConfigPath = path.join(settings.root, settings.localConfigFileName);

  if ( fs.existsSync(configPath) ) {
    logSuccess(`bldr init`, `${settings.configFileName} already exists in this project.`);
  } else {
    await createBldrConfig();
  }

  if ( fs.existsSync(localConfigPath) ) {
    logSuccess(`bldr init`, `${settings.localConfigFileName} already exists in this project.`);
  } else {
    await createBldrLocalConfig();
  }

  logSuccess(`bldr init`, `all done!`);
}


/**
 * Creates a bldrConfigLocal.js file in the project root
 */
const createBldrLocalConfig = async () => {

  const askToCreate = await prompt({
    type: 'confirm',
    name: 'local',
    message: `${colors.yellow(`Would you like to create a ${settings.localConfigFileName} file?`)}`
  });

  if ( !askToCreate.local ) {
    logSuccess(`bldr init`, `a ${settings.localConfigFileName} file was not created`);
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

  const config: LocalConfigSettings = {
    browsersync: {}
  };

  if ( localPrompt.port !== '' ) {
    config.browsersync.port = localPrompt.port;
  }

  if ( localPrompt.proxyUrl !== '' ) {
    config.browsersync.proxy = localPrompt.proxyUrl;
  }

  const content = `import { bldrLocalConfig } from "@bluecadet/bldr";

export default bldrLocalConfig(${JSON.stringify(config, null, 2)})`;

  try {
    fs.writeFileSync(`${path.join(process.cwd(), settings.localConfigFileName)}`, content, 'utf8');
    logSuccess(`bldr init`, `${settings.localConfigFileName} file created in project root.`);
  } catch (err) {
    // Error if can't write file
    logError(`bldr init`, `error writing ${settings.localConfigFileName} file to ${process.cwd()}`);
  }
}





/**
 * Creates a bldrConfig.js file in the project root
 */
const createBldrConfig = async () => {

  const askToCreate = await prompt({
    type: 'confirm',
    name: 'local',
    message: `${colors.yellow(`Would you like to create a ${settings.configFileName} file?`)}`
  });

  if ( !askToCreate.local ) {
    logSuccess(`bldr init`, `a ${settings.configFileName} file was not created`);
    return;
  }

  let config: ConfigSettings = {};

  config = await handlePathPrompt('css', 'css', config);
  config = await handlePathPrompt('js', 'js', config);
  config = await handlePathPrompt('sass', 'sass/scss', config);
  config = await handleWatchPaths(config);
  config = await handleReloadExtensions(config);
  config = await handleSDC(config);
  config = await handleRollup(config);
  config = await handleEsLint(config);
  config = await handleStylelint(config);
  config = await handleBrowsersync(config);

  const content = `import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig(${JSON.stringify(config, null, 2)})`;

  try {
    fs.writeFileSync(`${path.join(process.cwd(), settings.configFileName)}`, content, 'utf8');
    logSuccess(`bldr init`, `${settings.configFileName} file created in project root.`);
  } catch (err) {
    // Error if can't write file
    logError(`bldr init`, `error writing ${settings.configFileName} file to ${process.cwd()}`);
  }
  
}