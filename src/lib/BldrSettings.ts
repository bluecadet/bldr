import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'node:module';
import type { CommandSettings } from './@types/commandSettings';


export class BldrSettings {
  /**
   * @description Singleton instance of BldrSettings
   */
  public static _instance: BldrSettings;

  /**
   * @description Version of the bldr package
   */
  public version!: string;

  /**
   * @description Root directory of the bldr package
   */
  public bldrRoot!: string;

  /**
   * @description Name of the user config file
   */
  public configFileName!: string;

  /**
   * @description Path to the user config file
   */
  public configFilePath!: string;

  /**
   * @description Name of the user local config file
   */
  public localConfigFileName!: string;

  /**
   * @description Path to the user local config file
   */
  public localConfigFilePath!: string;

  /**
   * @description Root directory of the project
   */
  public root!: string;

  /**
   * @description List of allowed process keys
   * @default ['css', 'sass', 'js']
   */
  public allowedProcessKeys!: string[];
  
  /**
   * @description Settings for the command line interface
   */
  public commandSettings!: CommandSettings;
  
  /**
   * @description Flag indicating if the current environment is development
   */
  public isDev!: boolean;
  
  /**
   * @description Syntax rules for postcss
   */
  public syntax!: {
    rules: { test: RegExp; extract?: string; lang?: string }[];
    css: any;
    sass: any;
    scss: any;
  };

  constructor() {
    if (BldrSettings._instance) {
      return BldrSettings._instance;
    }

    BldrSettings._instance = this;

    const require         = createRequire(import.meta.url);
    const __dirname       = path.dirname(fileURLToPath(import.meta.url));
    const bldrRoot        = path.join(__dirname, '../..');
    const bldrPackagePath = path.join(bldrRoot, 'package.json');
    const bldrPackageJson = require(bldrPackagePath);

    // Determine User Config File
    let configFileName = 'bldrConfig.js';
    let configFilePath = path.join(process.cwd(), configFileName);

    if ( !fs.existsSync(configFilePath) ) {
      configFileName = 'bldr.config.js';
      configFilePath = path.join(process.cwd(), configFileName);
    }

    // Determine User Local Config File
    let localConfigFileName = 'bldrConfigLocal.js';
    let localConfigFilePath = path.join(process.cwd(), localConfigFileName);

    if ( !fs.existsSync(localConfigFilePath) ) {
      localConfigFileName = 'bldr.local.config.js';
      localConfigFilePath = path.join(process.cwd(), localConfigFileName);
    }

    this.version             = bldrPackageJson.version;
    this.bldrRoot            = bldrRoot;
    this.configFileName      = configFileName;
    this.configFilePath      = configFilePath;
    this.localConfigFileName = localConfigFileName;
    this.localConfigFilePath = localConfigFilePath;
    this.root                = process.cwd();
    this.allowedProcessKeys  = ['css', 'sass', 'js'];
    
    this.syntax = require('postcss-syntax')({
      rules: [
        {
          test: /\.(?:[sx]?html?|[sx]ht|vue|ux|php)$/i,
          extract: 'html',
        },
        {
          test: /\.(?:markdown|md)$/i,
          extract: 'markdown',
        },
        {
          test: /\.(?:m?[jt]sx?|es\d*|pac)$/i,
          extract: 'jsx',
        },
        {
          test: /\.(?:postcss|pcss|css)$/i,
          lang: 'scss',
        },
      ],
      css: require('postcss-safe-parser'),
      sass: require('postcss-sass'),
      scss: require('postcss-scss'),
    });
  }
}