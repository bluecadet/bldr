exports.command = 'dev'
exports.desc = 'watch files and run local development tasks'

exports.builder = (yargs) => {
  return yargs
}

exports.handler = function (args) {
  let RunDev = require('../lib/dev/runDev');
  let runDev = new RunDev(args);
  runDev.run();
}