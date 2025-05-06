#! /usr/bin/env node

import { Command } from 'commander';
import { CommandSettings } from './lib/@types/commandSettings.js';


const handleDev = async (commandOptions: CommandSettings) => {
  let run = await import('./lib/commands/dev.js');
  run.default(commandOptions);
}

const handleBuild = async (commandOptions: CommandSettings) => {
  let run = await import('./lib/commands/build.js');
  run.default(commandOptions);
}

const handleInit = async (commandOptions: CommandSettings) => {
  let run = await import('./lib/commands/init.js');
  run.default(commandOptions);
}

const bldrCLI = new Command();

bldrCLI
  .description('Configurable build tool for css, sass, js and images')
  .option('-e, --env <name>', 'env key name from config')
  .option('-l, --lintOnly', 'only run linting processes');

bldrCLI
  .command('dev')
  .description('create a local dev environment with live reloading')
  .alias('watch')
  .option(
    '-s, --start',
    'run all `dev` processes before starting local enviornment'
  )
  .option(
    '-o, --once',
    'run all `dev` processes once without starting local enviornment'
  )
  .action((options, cmd) => {
    handleDev(cmd.optsWithGlobals());
  });

bldrCLI
  .command('build')
  .description('create a production build')
  .action((options, cmd) => {
    handleBuild(cmd.optsWithGlobals());
  });

bldrCLI
  .command('init')
  .description('create basic bldr config files')
  .action((commandOptions) => {
    handleInit(commandOptions);
  });

bldrCLI.parse(process.argv);

const options = bldrCLI.opts();