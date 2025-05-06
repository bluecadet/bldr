import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'node:module';
import { CommandSettings } from './@types/commandSettings';


export class BldrSettings {
  // Define the properties of the BldrSettings class
  public static _instance: BldrSettings;
  public version!: string;
  public bldrRoot!: string;
  public configFileName!: string;
  public localConfigFileName!: string;
  public root!: string;
  public allowedProcessKeys!: string[];
  public commandSettings!: CommandSettings;
  public isDev!: boolean;
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

    this.version = bldrPackageJson.version;
    this.bldrRoot = bldrRoot;
    this.configFileName = 'bldrConfig.js';
    this.localConfigFileName = 'bldrConfigLocal.js';
    this.root = process.cwd();
    this.allowedProcessKeys = ['css', 'sass', 'js'];
    
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