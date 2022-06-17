const path   = require('path');
const fs     = require('fs');
const fsx    = require('fs-extra');
const fg     = require('fast-glob');
const colors = require('colors');

function RunImportGlobRewrite(args) {

  // Run function
  this.run = async function() {

    const basePath     = process.cwd();
    const filePath     = path.join(basePath, args.file);
    const buffer       = fs.readFileSync(filePath);
    let fileContent    = buffer.toString();
    const matches      = fileContent.match(/^[\@import].*\/\*\..*$/gm);

    if (!matches) {
      console.log(`${colors.white('[')}${colors.blue('@import glob rewrite')}${colors.white(']')} ${colors.red(`Error: Unable to find glob patterns containing '*/.' in ${args.file}`)}`);
      process.exit(0);
    }

    matches.map(match => {

      const quotePath = match.match(/(?:'|").*(?:'|")/);
      if (!quotePath) {
        console.log(`${colors.white('[')}${colors.blue('@import glob rewrite')}${colors.white(']')} ${colors.red(`Error: @import statement missing single or double quotes around path' in ${args.file}`)}`);
        process.exit(0);
      }

      const globPath       = path.resolve(quotePath[0].replace(/\"/g, '').replace(/\'/g, ''));
      const files          = fg.sync([globPath], { dot: true });
      let importStatements = '// ' + match + '\n';

      for (const file of files) {
        const relPath = path.relative(basePath, file);
        importStatements += "@import '" + relPath + "';\n";
      }
      fileContent = fileContent.replace(match, importStatements);
    });


    fs.writeFileSync(filePath, fileContent);

    console.log(`${colors.white('[')}${colors.blue('@import glob rewrite')}${colors.white(']')} ${colors.green(`Glob import statements rewritten in ${args.file}`)}`);


  }

}

module.exports = RunImportGlobRewrite;