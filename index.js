#!/usr/bin/env node

import { Command } from 'commander';
import { RunBldrDev } from './commands/dev.js';
import { RunBldrBuild } from './commands/build.js';
import { RunInit } from './commands/init.js';

const bldrCLI = new Command();

const commandSettings = {
  bldrEnv: '',
  settings: {}
}

const handleDev = async (commandSettings) => {
  await RunBldrDev(commandSettings);
}

const handleBuild = async (commandSettings) => {
  await RunBldrBuild(commandSettings);
}

const handleInit = async () => {
  await RunInit();
}

const handleCommands = async () => {

  bldrCLI
    .description('Configurable build tool for css, sass, js and images')
    .option('-e, --env <name>', 'env key name from config')
    .configureHelp({
      showGlobalOptions: true,
    });

  bldrCLI.command('dev')
    .description('create a local dev environment with live reloading')
    .alias('watch')
    .option('-s, --start', 'run all `dev` processes before starting local enviornment')
    .option('-o, --once', 'run all `dev` processes once without starting local enviornment')
    .action((options) => {
      commandSettings.bldrEnv  = 'dev';
      commandSettings.settings = { ...{watch: true}, ...options, ...bldrCLI.opts() };
      handleDev(commandSettings);
    });

  bldrCLI.command('build')
    .description('create a production build')
    .action((options) => {
      commandSettings.bldrEnv  = 'build';
      commandSettings.settings = { ...{watch: false}, ...options, ...bldrCLI.opts() };
      handleBuild(commandSettings);
    });

  bldrCLI.command('init')
    .description('create basic bldr config files')
    .action(() => {
      handleInit();
    });

  bldrCLI.parse(process.argv);
};

await handleCommands();