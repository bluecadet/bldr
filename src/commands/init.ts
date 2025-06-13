import type { CommandSettings } from "../lib/@types/commandSettings";
import { logSuccess, logError } from "../lib/utils/loggers.js";
import type { ConfigSettings, LocalConfigSettings } from "../lib/@types/configTypes";
import { handleBrowsersync, handleEsLint, handlePathPrompt, handleReloadExtensions, handleRollup, handleSDC, handleStylelint, handleWatchPaths } from "../lib/utils/createFilePrompts.js";
import path from "node:path";
import fs from "node:fs";
import Module from "node:module";

const require  = Module.createRequire(import.meta.url);
import { prompt } from 'enquirer';
import colors from 'colors';

export default function init(commandOptions: CommandSettings) {
  maybeCreateFiles();
}


const maybeCreateFiles = async () => {
  const configPath = path.join(process.cwd(), 'bldr.config.js');
  const localConfigPath = path.join(process.cwd(), 'bldr.local.config.js');

  if ( fs.existsSync(configPath) ) {
    logSuccess('bldr init', 'bldr.config.js already exists in this project.');
  } else {
    await createBldrConfig();
  }

  if ( fs.existsSync(localConfigPath) ) {
    logSuccess('bldr init', 'bldr.local.config.js already exists in this project.');
  } else {
    await createBldrLocalConfig();
  }

  logSuccess('bldr init', 'all done!');
}


/**
 * Creates a bldrConfigLocal.js file in the project root
 */
const createBldrLocalConfig = async () => {

  const askToCreate: { local: boolean } = await prompt({
    type: 'confirm',
    name: 'local',
    message: `${colors.yellow('Would you like to create a bldr.local.config.js file?')}`
  });

  if ( !askToCreate.local ) {
    logSuccess('bldr init', 'a bldr.local.config.js file was not created');
    return;
  }

  const localPrompt: { port: string; proxyUrl: string } = await prompt([
    {
      type: 'input',
      name: 'port',
      message: `${colors.cyan('port number:')}`,
    },
    {
      type: 'input',
      name: 'proxyUrl',
      message: `${colors.cyan('proxy')} ${colors.dim('(local dev url)')}:`,
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
    fs.writeFileSync(`${path.join(process.cwd(), 'bldr.local.config.js')}`, content, 'utf8');
    logSuccess('bldr init', 'bldr.local.config.js file created in project root.');
  } catch (err) {
    // Error if can't write file
    logError('bldr init', `error writing bldr.local.config.js file to ${process.cwd()}`);
  }
}





/**
 * Creates a bldrConfig.js file in the project root
 */
const createBldrConfig = async () => {

  const askToCreate: { local: boolean } = await prompt({
    type: 'confirm',
    name: 'local',
    message: `${colors.yellow('Would you like to create a bldr.config.js file?')}`
  });

  if ( !askToCreate.local ) {
    logSuccess('bldr init', 'a bldr.config.js file was not created');
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
    fs.writeFileSync(`${path.join(process.cwd(), 'bldr.config.js')}`, content, 'utf8');
    logSuccess('bldr init', 'bldr.config.js file created in project root.');
  } catch (err) {
    // Error if can't write file
    logError('bldr init', `error writing bldr.config.js file to ${process.cwd()}`);
  }
  
}