exports.command = 'build:dev';
exports.desc = 'run a single build using postcss and esbuild';

exports.builder = (yargs) => {
  return yargs
}

exports.handler = function (args) {
  let RunBuildDev = require('../lib/build_dev/runBuildDev');
  let runBuildDev = new RunBuildDev(args);
  runBuildDev.run();
}