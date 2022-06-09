exports.command = 'init'
exports.desc = 'create config file in current directory'

exports.builder = (yargs) => {
  return yargs
}

exports.handler = function (args) {
  const RunInit = require('../lib/init/runInit');
  const runInit = new RunInit(args);
  runInit.run();
}