exports.command = 'build'
exports.desc = 'Build assets for production'

exports.builder = (yargs) => {
  return yargs
}

exports.handler = function (args) {
  const RunBuild = require('../lib/build/runBuild.js');
  RunBuild(args);
}