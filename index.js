#!/usr/bin/env node

import { Command } from 'commander';
import { RunBldrDev } from './commands/dev.js';

const bldr = new Command();

const commandSettings = {
  bldrEnv: '',
  settings: {}
}

const handleDev = async (commandSettings) => {
  await RunBldrDev(commandSettings);
}

const handleCommands = async () => {
  bldr.command('dev')
    .option('-e, --env <name>', 'env key name from config')
    .description('create a local dev environment with live reloading')
    .action((options) => {
      commandSettings.bldrEnv  = 'dev';
      commandSettings.settings = { ...{watch: true}, ...options };
      handleDev(commandSettings);
    });

  bldr.command('build')
    .description('create production ready assets')
    .option('-k, --key <key>', 'env key name from config (ie "css")')
    .action(() => {
      commandSettings.bldrEnv  = 'build';
      // RunBldrDev(commandSettings);
    });


  bldr.command('dev:once')
    .description('run all `dev` processes once')
    .option('-k, --key <key>', 'env key name from config (ie "css")')
    .action((options) => {
      commandSettings.bldrEnv  = 'dev';
      commandSettings.settings = { ...{watch: false, once: true}, ...options };
      RunBldrDev(commandSettings);
    });


  bldr.parse(process.argv);
};

handleCommands();