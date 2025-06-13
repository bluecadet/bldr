var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BldrConfig } from '../BldrConfig.js';
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { logError, logPostCssErrorMessage, logSuccess } from '../utils/loggers.js';
import { ensureDirectory } from '../utils/ensureDirectory.js';
export class PostcssProvider {
    constructor() {
        if (PostcssProvider._instance) {
            // biome-ignore lint/correctness/noConstructorReturn: <explanation>
            return PostcssProvider._instance;
        }
        PostcssProvider._instance = this;
    }
    /**
     * @method initialize
     * @description Initializes the PostcssProvider
     * @returns {Promise<void>}
     * @memberof PostcssProvider
     */
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const require = createRequire(import.meta.url);
            this.bldrConfig = BldrConfig._instance;
            this.postcss = require('postcss');
            this.postcssrc = require('postcss-load-config');
            this.notice = 'PostcssProvider initialized';
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
        });
    }
    /**
     * @method buildProcessBundle
     * @description Builds the process bundle for postcss
     * @returns {Promise<void>}
     * @memberof PostcssProvider
     */
    buildProcessBundle() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield this.buildProcessAssetGroupsBundle();
            if ((_a = this.bldrConfig.sdcProcessAssetGroups) === null || _a === void 0 ? void 0 : _a.css) {
                for (const asset of Object.keys(this.bldrConfig.sdcProcessAssetGroups.css)) {
                    yield this.buildAssetGroup(this.bldrConfig.sdcProcessAssetGroups.css[asset]);
                }
            }
        });
    }
    /**
     * @method buildProcessAssetGroupsBundle
     * @description Builds the asset groups bundle for postcss
     * @returns {Promise<void>}
     * @memberof PostcssProvider
     */
    buildProcessAssetGroupsBundle() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if ((_a = this.bldrConfig.processAssetGroups) === null || _a === void 0 ? void 0 : _a.css) {
                for (const asset of Object.keys(this.bldrConfig.processAssetGroups.css)) {
                    yield this.buildAssetGroup(this.bldrConfig.processAssetGroups.css[asset]);
                }
            }
        });
    }
    /**
     * @method buildAssetGroup
     * @description Builds the asset group for postcss
     * @param {ProcessAsset} assetGroup
     * @returns {Promise<void>}
     * @memberof PostcssProvider
     */
    buildAssetGroup(assetGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const start = Date.now();
            const { src, dest } = assetGroup;
            const buffer = fs.readFileSync(src);
            const fileContent = buffer.toString();
            const fileName = path.basename(src);
            const fileBase = path.basename(src, path.extname(src));
            const writeFileName = `${fileBase}.css`;
            const mapOpts = this.bldrConfig.isDev ? { inline: false } : false;
            const toBailOrNotToBail = this.bldrConfig.isDev ? {} : { throwError: true, exit: true };
            const ctx = {
                bldrEnv: this.bldrConfig.isDev ? 'dev' : 'build',
                cli: this.bldrConfig.cliArgs,
            };
            const postCSSConfig = yield this.postcssrc(ctx);
            try {
                // Run postcss process
                const postCssResult = yield this.postcss(postCSSConfig.plugins).process(fileContent, {
                    syntax: (_b = (_a = postCSSConfig.options) === null || _a === void 0 ? void 0 : _a.syntax) !== null && _b !== void 0 ? _b : this.syntax,
                    from: src,
                    to: writeFileName,
                    map: (_d = (_c = postCSSConfig.options) === null || _c === void 0 ? void 0 : _c.map) !== null && _d !== void 0 ? _d : mapOpts,
                });
                // Check if postCssResult contains css
                if (!(postCssResult === null || postCssResult === void 0 ? void 0 : postCssResult.css)) {
                    logError('postcss', `${fileName} does not contain css, generated blank file`);
                }
                // Check if destination directory exists, make it if not
                yield ensureDirectory(dest);
                // Write the file to the destination
                try {
                    fs.writeFileSync(path.join(dest, writeFileName), postCssResult.css);
                }
                catch (err) {
                    // Error if can't write file
                    logError('postcss', `error writing ${fileName} to ${dest}`, {});
                    logError('postcss', `${err}`, toBailOrNotToBail);
                    return;
                }
                // Write maps
                if (mapOpts) {
                    if (postCssResult.map) {
                        try {
                            fs.writeFileSync(`${path.join(dest, writeFileName)}.map`, postCssResult.map.toString());
                        }
                        catch (err) {
                            // Error if can't write file
                            logError('postcss', `error writing ${fileName} map file to ${dest}`, {});
                            logError('postcss', `${err}`, toBailOrNotToBail);
                            return;
                        }
                    }
                }
                // Clock the time it took to process     
                const stop = Date.now();
                // Log success message
                logSuccess('postcss', `${fileName} processed`, ((stop - start) / 1000));
                // All done
                return;
                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            }
            catch (err) {
                if (err === null || err === void 0 ? void 0 : err.file) {
                    // Postcss error messaging
                    logPostCssErrorMessage(err, {});
                }
                else {
                    // General error caught
                    logError('postcss', 'General error:', {});
                    logError('postcss', `${err}`, toBailOrNotToBail);
                }
                // Allow process to continue if watch is running
                if (this.bldrConfig.isDev) {
                    return;
                }
                process.exit(1);
            }
        });
    }
}
//# sourceMappingURL=PostcssProvider.js.map