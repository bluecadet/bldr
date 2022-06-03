exports.command = 'watch'
exports.desc = 'watch files and run local development tasks'

exports.builder = (yargs) => {
  return yargs
}

exports.handler = function (args) {
  let RunWatch = require('../lib/watch/runWatch.js');
  let runWatch = new RunWatch(args);
  runWatch.run();
}