import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'node:module';
import { logWarn } from './utils/loggers.js';
export class BldrSettings {
    constructor() {
        if (BldrSettings._instance) {
            return BldrSettings._instance;
        }
        BldrSettings._instance = this;
        const require = createRequire(import.meta.url);
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const bldrRoot = path.join(__dirname, '../..');
        const bldrPackagePath = path.join(bldrRoot, 'package.json');
        const bldrPackageJson = require(bldrPackagePath);
        // Determine User Config File
        // Check for old deprecated file name
        let configFileName = 'bldrConfig.js';
        let configFilePath = path.join(process.cwd(), configFileName);
        if (fs.existsSync(configFilePath)) {
            logWarn('bldr', `The config file name "bldrConfig.js" is deprecated. Please rename it to "bldr.config.js".`);
        }
        else {
            configFileName = 'bldr.config.js';
            configFilePath = path.join(process.cwd(), configFileName);
        }
        // Determine User Local Config File
        this.localConfigFileName = 'bldrConfigLocal.js';
        this.localConfigFilePath = path.join(process.cwd(), this.localConfigFileName);
        if (fs.existsSync(this.localConfigFilePath)) {
            logWarn('bldr', `The local config file name "bldrConfigLocal.js" is deprecated. Please rename it to "bldr.local.config.js".`);
        }
        else {
            this.localConfigFileName = 'bldr.local.config.js';
            this.localConfigFilePath = path.join(process.cwd(), this.localConfigFileName);
        }
        this.version = bldrPackageJson.version;
        this.bldrRoot = bldrRoot;
        this.configFileName = configFileName;
        this.configFilePath = configFilePath;
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
//# sourceMappingURL=BldrSettings.js.map