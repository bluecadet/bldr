exports.command = 'dev';
exports.aliases = ['watch'];
exports.desc = 'watch files and run local development tasks';

exports.builder = (yargs) => {
  return yargs
}

exports.handler = function (args) {
  let RunWatch = require('../lib/watch/runWatch');
  let runWatch = new RunWatch(args);
  runWatch.run();
}