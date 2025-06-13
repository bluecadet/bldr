import Module from "node:module";
import type { ConfigSettings, ProcessKey } from "../@types/configTypes";
const require  = Module.createRequire(import.meta.url);
const { prompt } = require('enquirer');
const colors = require('colors');


/**
 * Handles the path prompts for various processes like sass, js, etc.
 * @param {ProcessKey} processName - The name of the process (e.g., 'sass', 'js').
 * @param {string} ext - The file extension to process (e.g., 'scss', 'js').
 * @param {ConfigSettings} config - The configuration object to update.
 * @returns {Promise<ConfigSettings>} - The updated configuration object.
 */
export const handlePathPrompt = async (processName: ProcessKey, ext: string, config: ConfigSettings): Promise<ConfigSettings> => {
  
  const basePrompt = await prompt([
    {
      type: 'confirm',
      name: 'use',
      message: `${colors.blue(`Want to process ${ext} files?`)}`,
      initial: true,
    },
  ]);

  if ( basePrompt.use ) {
    const pathPrompt = await prompt([
      {
        type: 'input',
        name: `${processName}Src`,
        message: `${colors.cyan(`${processName} source path`)} ${colors.dim('(from root, can end with glob pattern)')}:`,
        initial: true,
      },
      {
        type: 'input',
        name: `${processName}Dest`,
        message: `${colors.cyan(`${processName} destination path`)} ${colors.dim('(from root, end in dir name)')}:`,
        initial: true,
      },
    ]);

    config[processName] = [
      {
        src: pathPrompt[`${processName}Src`],
        dest: pathPrompt[`${processName}Dest`],
      }
    ];

    if ( processName === 'sass' ) {
      const sassPrompt = await prompt([
        {
          type: 'input',
          name: 'sassOpt',
          message: `${colors.cyan('Use legacy api?')}`,
          initial: false,
        }
      ]);

      config.sassConfig = {
        useLegacy: sassPrompt.sassOpt
      };
    }
  }

  return config;
}


/**
 * Handles the watch paths prompt for custom directories.
 * @param {ConfigSettings} config - The configuration object to update.
 * @returns {Promise<ConfigSettings>} - The updated configuration object.
 */
export const handleWatchPaths = async (config: ConfigSettings) => {
  
  const basePrompt = await prompt([
    {
      type: 'confirm',
      name: 'use',
      message: `${colors.blue('Add custom watch paths? (defaults to root directory)')}`,
    },
  ]);

  if ( basePrompt.use ) {
    const pathPrompt = await prompt([
      {
        type: 'input',
        name: 'text',
        message: `${colors.cyan('enter a comma seperated list of directory paths')} ${colors.dim('( from root, can end with glob pattern)')}:`,
      },
    ]);

    config.watchPaths = pathPrompt.text.split(',').map((str: string) => str.trim());
  }

  return config;
}



export const handleReloadExtensions = async (config: ConfigSettings) => {
  
  const basePrompt = await prompt([
    {
      type: 'confirm',
      name: 'use',
      message: `${colors.blue('Add custom reload extensions? (ie html, php, twig etc.)')}`,
    },
  ]);

  if ( basePrompt.use ) {
    const pathPrompt = await prompt([
      {
        type: 'input',
        name: 'text',
        message: `${colors.cyan('enter a comma seperated list of extensions')} ${colors.dim(`(extension name only without a dot, such as 'twig' or 'html')`)}:`,
      },
    ]);

    config.reloadExtensions = pathPrompt.text.split(',').map((str: string) => str.trim());
  }

  return config;
}



export const handleSDC = async (config: ConfigSettings) => {
  
  const basePrompt = await prompt([
    {
      type: 'confirm',
      name: 'use',
      message: `${colors.blue('Configure SDC?')}`,
      initial: false,
    },
  ]);

  if ( basePrompt.use ) {
    const pathPrompt = await prompt([
      {
        type: 'input',
        name: 'directory',
        message: `${colors.cyan('path to SDC components from root')}:`,
      },
      {
        type: 'input',
        name: 'assetSubDirectory',
        message: `${colors.cyan('subdirectory name within an SDC component that contains raw assets')} ${colors.dim(`(defaults to 'assets')`)}:`,
        initial: 'assets',
      },
      {
        type: 'confirm',
        name: 'bundle',
        message: `${colors.blue('Bundle SDC js files with rollup?')}`,
        initial: true,
      },
    ]);

    config.sdc = {
      directory: pathPrompt.directory,
      assetSubDirectory: pathPrompt.assetSubDirectory || 'assets',
    }


    if (pathPrompt.bundle) {
      if ( !config?.rollup ) {
        config.rollup = {}
      }
  
      if ( !config.rollup.sdcOptions ) {
        config.rollup.sdcOptions = {
          bundle: pathPrompt.bundle,
        }
      }

      const rollupPrompt = await prompt([
        {
          type: 'confirm',
          name: 'minify',
          message: `${colors.blue("Minify SDC js files with rollup?")}`,
          initial: true,
        },
        {
          type: 'select',
          name: 'format',
          message: `${colors.blue("Bundle SDC js files with rollup?")}`,
          choices: ['es', 'iife', 'amd', 'cjs', 'umd', 'system'],
          initial: 'es',
        },
      ]);

      config.rollup.sdcOptions.minify = rollupPrompt.minify;
      config.rollup.sdcOptions.format = rollupPrompt.format;
    }
  }

  return config;
}




export const handleRollup = async (config: ConfigSettings) => {
  
  const basePrompt = await prompt([
    {
      type: 'select',
      name: 'compiler',
      message: `${colors.blue('Rollup Transpiler?')}`,
      choices: ['babel', 'swc', 'none'],
      initial: 'babel',
    },
    {
      type: 'confirm',
      name: 'terser',
      message: `${colors.blue('Minify with Terser?')}`,
      initial: true,
    }
  ]);

  if ( !config?.rollup ) {
    config.rollup = {}
  }

  config.rollup.useBabel = basePrompt.compiler  === 'babel';
  config.rollup.useSWC = basePrompt.compiler  === 'swc';

  if ( basePrompt.compiler === 'none' ) {
    config.rollup.useBabel = false;
    config.rollup.useSWC = false;
  }

  config.rollup.useTerser = basePrompt.terser;

  return config
}





export const handleEsLint = async (config: ConfigSettings) => {
  
  const basePrompt = await prompt([
    {
      type: 'confirm',
      name: 'use',
      message: `${colors.blue('Use EsLint?')}`,
      initial: true,
    },
  ]);

  if ( basePrompt.use ) {
    const pathPrompt = await prompt([
      {
        type: 'confirm',
        name: 'forceBuild',
        message: `${colors.cyan('force production build if eslint results in errors?')}`,
        initial: true,
      },
    ]);

    config.eslint = {
      useEslint: true,
      forceBuildIfError: pathPrompt.forceBuild,
    };
  } else {
    config.eslint = {
      useEslint: false,
    };
  }

  return config;
}





export const handleStylelint = async (config: ConfigSettings) => {
  
  const basePrompt = await prompt([
    {
      type: 'confirm',
      name: 'use',
      message: `${colors.blue('Use StyleLint?')}`,
      initial: true,
    },
  ]);

  if ( basePrompt.use ) {
    const pathPrompt = await prompt([
      {
        type: 'confirm',
        name: 'forceBuild',
        message: `${colors.cyan('force production build if eslint results in errors?')}`,
        initial: true,
      },
    ]);

    config.stylelint = {
      useStyleLint: true,
      forceBuildIfError: pathPrompt.forceBuild,
    };
  } else {
    config.stylelint = {
      useStyleLint: false,
    };
  }

  return config;
}





export const handleBrowsersync = async (config: ConfigSettings) => {
  
  const basePrompt = await prompt([
    {
      type: 'confirm',
      name: 'use',
      message: `${colors.blue('Use browsersync?')}`,
      initial: true,
    },
  ]);

  if ( !basePrompt.use ) {
    config.browsersync = {
      disable: true,
    };
  }

  return config;
}