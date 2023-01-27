const {setEnv} = require('../lib/utils/configHelpers');
exports.command = 'dev'
exports.desc = 'watch files and run local development tasks'

exports.builder = (yargs) => {
  return yargs
}

exports.handler = function (args) {
  setEnv('dev');
  let RunDev = require('../lib/dev/runDev');
  let runDev = new RunDev(args);
  runDev.run();
}