#! /usr/bin/env node

import { Command } from 'commander';
import { CommandSettings } from './lib/@types/commandSettings.js';
import { Bldr } from './lib/Bldr.js';

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
    new Bldr(cmd.optsWithGlobals(), true);
  });

bldrCLI
  .command('build')
  .description('create a production build')
  .action((options, cmd) => {
    new Bldr(cmd.optsWithGlobals(), false);
  });

bldrCLI
  .command('init')
  .description('create basic bldr config files')
  .action((commandOptions) => {
    handleInit(commandOptions);
  });

bldrCLI.parse(process.argv);

const options = bldrCLI.opts();