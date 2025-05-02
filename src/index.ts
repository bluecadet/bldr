#! /usr/bin/env node

import { Command } from 'commander';


const handleDev = async (commandOptions: any) => {
  let run = await import('./commands/dev.js');
  run.default(commandOptions);
}

const handleBuild = async (commandOptions: any) => {
  let run = await import('./commands/build.js');
  run.default(commandOptions);
}

const handleInit = async (commandOptions: any) => {
  let run = await import('./commands/init.js');
  run.default(commandOptions);
}

const bldrCLI = new Command();

bldrCLI
  .description('Configurable build tool for css, sass, js and images')
  .option('-e, --env <name>', 'env key name from config');
// .configureHelp({
//   showGlobalOptions: true,
// });

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
  .action((commandOptions) => {
    handleDev(commandOptions);
  });

bldrCLI
  .command('build')
  .description('create a production build')
  .action((commandOptions) => {
    handleBuild(commandOptions);
  });

bldrCLI
  .command('init')
  .description('create basic bldr config files')
  .action((commandOptions) => {
    handleInit(commandOptions);
  });

bldrCLI.parse(process.argv);

const options = bldrCLI.opts();