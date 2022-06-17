const colors = require('colors');
exports.command = 'import-glob-rewrite';
exports.desc = 'rewrite sass @import glob statements to individual import paths in a file';

exports.builder = (yargs) => {
  return yargs.option('file', {
    alias: 'f',
    describe: 'file location from current directory'
  })
  .demandOption(['file'],
    `${colors.white('[')}${colors.blue('bldr')}${colors.white(']')} ${colors.red(`Error: Please provide the file parameter with a path to the file from the current directory`)}`
  );
}

exports.handler = function (args) {
  const RunImportGlobRewrite = require('../lib/globRewrite/runGlobRetwrite');
  const runImportGlobRewrite = new RunImportGlobRewrite(args);
  runImportGlobRewrite.run();
}