#!/usr/bin/env node

let args = require('yargs')
  .commandDir('cmds')
  .demandCommand()
  .help()
  .epilog('copyright 2023')
  .argv