import Module from "node:module";
const require  = Module.createRequire(import.meta.url);
const { prompt } = require('enquirer');
const colors = require('colors');

export const handlePathPrompt = async (processName, ext, config) => {
  const basePromptName = `use${processName}`;

  const basePrompt = await prompt([
    {
      type: 'confirm',
      name: 'use',
      message: `${colors.blue(`Want to process ${ext} files?`)}`,
    },
  ]);

  if ( basePrompt.use ) {
    const pathPrompt = await prompt([
      {
        type: 'input',
        name: `${processName}Src`,
        message: `${colors.cyan(`${processName} source path`)} ${colors.dim('(from root, can end with glob pattern)')}:`,
      },
      {
        type: 'input',
        name: `${processName}Dest`,
        message: `${colors.cyan(`${processName} destination path`)} ${colors.dim('(from root, end in dir name)')}:`,
      },
    ]);

    config[processName] = {
      src: pathPrompt[`${processName}Src`],
      dest: pathPrompt[`${processName}Dest`],
      watch: [
        pathPrompt[`${processName}Src`]
      ]
    };
  }

  return config;
}



export const handleImagePathPrompt = async (config) => {
  const imagePrompt = await prompt([
    {
      type: 'confirm',
      name: 'use',
      message:`${colors.blue(`Want to process jpg/png/svg files?`)}`,
    },
  ]);

  if ( imagePrompt.use ) {

    const imagePathPrompt = await prompt([
      {
        type: 'input',
        name: 'imageSrc',
        message: `${colors.cyan(`images source path`)} ${colors.dim('(from root, can use glob pattern of "*.{jpg,JPG,jpeg,JPEG,gif,png,svg}")')}:`,
        message: `images source path ${colors.yellow('(from root)')}:`,
      },
      {
        type: 'input',
        name: 'imageDest',
        message: `${colors.cyan(`images destination path`)} ${colors.dim('(from root')}:`,
      },
    ]);

    config.images = {
      src: imagePathPrompt.imageSrc,
      dest: imagePathPrompt.imageDest
    };
  }

  return config;
}


export const handleWatchPathPrompt = async (config) => {
  const watchPrompt = await prompt([
    {
      type: 'confirm',
      name: 'use',
      message:`${colors.blue(`Want include watch reload paths?`)}`,
    },
  ]);

  if ( watchPrompt.use ) {

    const watchPathPrompt = await prompt([
      {
        type: 'input',
        name: 'paths',
        message: `${colors.cyan(`watch reload paths`)} ${colors.dim('(comma seperated, can use glob patterns, such as "**/*.html,**/*.php"')}:`,
      }
    ]);

    if ( watchPathPrompt.paths !== '' ) {
      config.watchReload = watchPathPrompt.paths.split(',');
    }
  }



  return config;
}