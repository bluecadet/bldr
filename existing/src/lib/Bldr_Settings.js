import * as path from 'path';
import { fileURLToPath } from 'url';
import { readJSONSync } from 'fs-extra/esm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

export class Bldr_Settings {
  constructor() {
    if (Bldr_Settings._instance) {
      return Bldr_Settings._instance;
    }

    Bldr_Settings._instance = this;

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const bldrRoot = path.join(__dirname, '..');
    const bldrPackagePath = path.join(bldrRoot, 'package.json');
    const bldrPackageJson = readJSONSync(bldrPackagePath);

    this.settings = {
      version: bldrPackageJson.version,
      bldrRoot: bldrRoot,
      filename: 'bldrConfig.js',
      localFilename: 'bldrConfigLocal.js',
      root: process.cwd(),
      allowedProcessKeys: ['css', 'sass', 'js', 'images'],
    };

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
