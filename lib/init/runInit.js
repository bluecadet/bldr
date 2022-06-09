const path = require('path');
const fs = require('fs');
const fsx = require('fs-extra');

function RunInit(args) {

  // Run function
  this.run = async function() {

    const baseDir = process.cwd();
    const configPath = path.join(baseDir, 'bldrConfig.js');
    const localConfigPath = path.join(baseDir, 'bldrConfigLocal.js');
    const dc = `${__dirname}/defaultFiles/bldrConfig.js`;
    const dlc = `${__dirname}/defaultFiles/bldrConfigLocal.js`;

    if (!fs.existsSync(configPath)) {
      fsx.copy(dc, configPath, (err) => {
        if ( err ) {
          console.log(err);
        }
        console.log(`Sample config copied to ${path.basename(baseDir)}`);
      })
    } else {
      console.log(`Attempted to create default config but ${path.basename(baseDir)} already contains a bldrConfig.js file.`);
      console.log(`To create a default file, delete ${path.basename(baseDir)}/bldrConfig.js and try again.`);
    }

    if (!fs.existsSync(localConfigPath)) {
      fsx.copy(dlc, localConfigPath, () => {
        console.log(`Sample config copied to ${path.basename(baseDir)}`);
      })
    } else {
      console.log(`Attempted to create default local config but ${path.basename(baseDir)} already contains a bldrConfigLocal.js file.`);
      console.log(`To create a default file, delete ${path.basename(baseDir)}/bldrConfigLocal.js and try again.`);
    }
  }

}

module.exports = RunInit;
