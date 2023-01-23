#!/usr/bin/env node

// let args = require('yargs')
//   .commandDir('cmds')
//   .demandCommand()
//   .help()
//   .epilog('copyright 2023')
//   .argv

import yargs from 'yargs';
import RunBldrDev from './commands/dev.js';

yargs(process.argv.slice(2))
  .command(
    ['dev [env]', 'watch'],
    'create a local dev environment with live reloading',
    (argv) => RunBldrDev(argv)
  )
  .command(
    'build',
    'create production ready assets',
    (argv) => RunBldrDev(argv)
  )
  .command(
    'build:dev',
    'create a development build of assets',
    (argv) => RunBldrDev(argv)
  )
  .demandCommand()
  .help()
  .epilog('copyright 2023')
  .argv;