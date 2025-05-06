import * as path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'node:module';
export class BldrSettings {
    constructor(commandSettings, isDev = false) {
        if (BldrSettings._instance) {
            return BldrSettings._instance;
        }
        BldrSettings._instance = this;
        const require = createRequire(import.meta.url);
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const bldrRoot = path.join(__dirname, '../../..');
        const bldrPackagePath = path.join(bldrRoot, 'package.json');
        const bldrPackageJson = require(bldrPackagePath);
        this.version = bldrPackageJson.version;
        this.bldrRoot = bldrRoot;
        this.configFileName = 'bldrConfig.js';
        this.localConfigFileName = 'bldrConfigLocal.js';
        this.root = process.cwd();
        this.allowedProcessKeys = ['css', 'sass', 'js', 'images'];
        this.commandSettings = commandSettings;
        this.isDev = isDev;
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
//# sourceMappingURL=BldrSettings.js.map