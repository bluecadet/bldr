import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'node:module';
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
        let configFileName = 'bldrConfig.js';
        let configFilePath = path.join(process.cwd(), configFileName);
        if (!fs.existsSync(configFilePath)) {
            configFileName = 'bldr.config.js';
            configFilePath = path.join(process.cwd(), configFileName);
        }
        // Determine User Local Config File
        let localConfigFileName = 'bldrConfigLocal.js';
        let localConfigFilePath = path.join(process.cwd(), localConfigFileName);
        if (!fs.existsSync(localConfigFilePath)) {
            localConfigFileName = 'bldr.local.config.js';
            localConfigFilePath = path.join(process.cwd(), localConfigFileName);
        }
        this.version = bldrPackageJson.version;
        this.bldrRoot = bldrRoot;
        this.configFileName = configFileName;
        this.configFilePath = configFilePath;
        this.localConfigFileName = localConfigFileName;
        this.localConfigFilePath = localConfigFilePath;
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