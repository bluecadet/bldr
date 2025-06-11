var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _BiomeProvider_instances, _BiomeProvider_setBiomePaths, _BiomeProvider_runLint, _BiomeProvider_addUserDestToIgnorePaths, _BiomeProvider_formatHTML;
import { BldrConfig } from '../BldrConfig.js';
import { Biome, Distribution } from "@biomejs/js-api";
import { dashPadFromString, logSuccess, logError } from '../utils/loggers.js';
import path from 'node:path';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import chalk from 'chalk';
export class BiomeProvider {
    constructor() {
        _BiomeProvider_instances.add(this);
        this.hasErrors = false;
        if (BiomeProvider._instance) {
            return BiomeProvider._instance;
        }
        BiomeProvider._instance = this;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.bldrConfig = BldrConfig._instance;
            this.notice = 'BiomeProvider initialized';
            if (((_a = this.bldrConfig.biomeConfig) === null || _a === void 0 ? void 0 : _a.useBiome) === false) {
                return false;
            }
            this.biomeInstance = yield Biome.create({
                distribution: Distribution.NODE,
            });
            const msg = ' Errors found in ESlint ';
            const count = Math.floor(((process.stdout.columns - 14) - msg.length - 2) / 2);
            const sym = '=';
            this.resultMessage = `${sym.repeat(count)}${msg}${sym.repeat(count)}`;
        });
    }
    /**
     * @description Lint all files in the project
     * @returns {Promise<void>}
     * @memberof BiomeProvider
     */
    lintAll() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            // Check if Biome is enabled
            if (!this.biomeInstance) {
                return;
            }
            // Check if log should be written
            if (((_a = this.bldrConfig.biomeConfig) === null || _a === void 0 ? void 0 : _a.writeLogfile) === true && ((_b = this.bldrConfig.biomeConfig) === null || _b === void 0 ? void 0 : _b.logFilePath)) {
                this.writeLogfile = true;
                this.logFilePath = path.join(process.cwd(), (_c = this.bldrConfig.biomeConfig) === null || _c === void 0 ? void 0 : _c.logFilePath);
                if (!fs.existsSync(this.logFilePath)) {
                    fs.writeFileSync(this.logFilePath, '', 'utf-8');
                }
            }
            // Reset errors
            this.hasErrors = false;
            // Set paths for linting
            yield __classPrivateFieldGet(this, _BiomeProvider_instances, "m", _BiomeProvider_setBiomePaths).call(this);
            // If paths are set, run lint
            if (this.biomeAllPaths.length > 0) {
                yield __classPrivateFieldGet(this, _BiomeProvider_instances, "m", _BiomeProvider_runLint).call(this, this.biomeAllPaths);
            }
            if (this.hasErrors && ((_d = this.bldrConfig.biomeConfig) === null || _d === void 0 ? void 0 : _d.forceBuildIfError) === true) {
                console.log('');
                logError(`biome`, '🚨🚨🚨 Biome errors found 🚨🚨🚨', { throwError: true, exit: true });
            }
            else if (this.hasErrors) {
                logError(`biome`, 'Biome errors found, forceBuildIfError set to true, continuing on', {});
            }
            else {
                logSuccess(`biome`, `No Biome errors found`);
            }
        });
    }
    /**
     * @description Lint single file in the project
     * @param {string} filepath - Path to the file to lint
     * @returns {Promise<void>}
     * @memberof BiomeProvider
     */
    lintFile(filepath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.biomeInstance) {
                return false;
            }
            yield __classPrivateFieldGet(this, _BiomeProvider_instances, "m", _BiomeProvider_runLint).call(this, filepath);
        });
    }
}
_BiomeProvider_instances = new WeakSet(), _BiomeProvider_setBiomePaths = function _BiomeProvider_setBiomePaths() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        this.biomeAllPaths = [];
        const pathStore = [];
        const require = createRequire(import.meta.url);
        const fg = require('fast-glob');
        // Set glob ignore paths
        this.globIgnorePaths = [
            '**/node_modules/**'
        ];
        // Ignore paths from user config
        if ((_a = this.bldrConfig.biomeConfig) === null || _a === void 0 ? void 0 : _a.ignorePaths) {
            this.globIgnorePaths.push(...this.bldrConfig.biomeConfig.ignorePaths);
        }
        // Ignore SDC Paths in globs as
        if (this.bldrConfig.isSDC && ((_b = this.bldrConfig) === null || _b === void 0 ? void 0 : _b.sdcPaths)) {
            this.bldrConfig.sdcPaths.forEach((sdcPath) => {
                this.globIgnorePaths.push(`${sdcPath}/**/*`);
            });
        }
        // Ignore dist files
        yield Promise.all([
            __classPrivateFieldGet(this, _BiomeProvider_instances, "m", _BiomeProvider_addUserDestToIgnorePaths).call(this, 'js'),
            __classPrivateFieldGet(this, _BiomeProvider_instances, "m", _BiomeProvider_addUserDestToIgnorePaths).call(this, 'css')
        ]);
        // Use chokidar watch array
        if (this.bldrConfig.chokidarWatchArray.length > 0) {
            // Loop watch paths and get all js and css files
            this.bldrConfig.chokidarWatchArray.forEach((filepath) => {
                var _a, _b;
                if ((_a = this.bldrConfig.userConfig) === null || _a === void 0 ? void 0 : _a.js) {
                    pathStore.push(`${path.join(filepath, `**`, `*.js`)}`);
                }
                if ((_b = this.bldrConfig.userConfig) === null || _b === void 0 ? void 0 : _b.css) {
                    pathStore.push(`${path.join(filepath, `**`, `*.css`)}`);
                }
            });
            // Get all the files to lint
            this.biomeAllPaths = fg.sync(pathStore, {
                ignore: this.globIgnorePaths,
            });
            if (this.bldrConfig.isSDC) {
                if ((_c = this.bldrConfig.sdcProcessAssetGroups) === null || _c === void 0 ? void 0 : _c.js) {
                    for (const [key, value] of Object.entries(this.bldrConfig.sdcProcessAssetGroups.js)) {
                        this.biomeAllPaths.push(key);
                    }
                }
                if ((_d = this.bldrConfig.sdcProcessAssetGroups) === null || _d === void 0 ? void 0 : _d.css) {
                    for (const [key, value] of Object.entries(this.bldrConfig.sdcProcessAssetGroups.css)) {
                        this.biomeAllPaths.push(key);
                    }
                }
            }
            return;
        }
    });
}, _BiomeProvider_runLint = function _BiomeProvider_runLint(files) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            if (!this.biomeInstance) {
                return;
            }
            if (typeof files === 'string') {
                files = [files];
            }
            // If writing to log, clear file first
            if (this.writeLogfile) {
                fs.writeFileSync(this.logFilePath, '', 'utf-8');
            }
            const errorArray = [];
            for (const file of files) {
                const content = fs.readFileSync(file, 'utf-8');
                const result = this.biomeInstance.lintContent(content, {
                    filePath: file,
                });
                const html = this.biomeInstance.printDiagnostics(result.diagnostics, {
                    filePath: file,
                    fileSource: content,
                });
                if (result.diagnostics.length === 0) {
                    continue;
                }
                this.hasErrors = true;
                errorArray.push(html);
                if (this.hasErrors) {
                    fs.appendFileSync(this.logFilePath, html, 'utf-8');
                }
            }
            if (this.hasErrors && errorArray.length > 0) {
                const dashes = dashPadFromString(this.resultMessage);
                logError(`biome`, dashes, {});
                logError(`biome`, this.resultMessage, {});
                logError(`biome`, dashes, {});
                errorArray.forEach((html) => {
                    console.log(__classPrivateFieldGet(this, _BiomeProvider_instances, "m", _BiomeProvider_formatHTML).call(this, html));
                    logError(`biome`, dashes, {});
                });
            }
        }
        catch (err) {
            if (this.bldrConfig.isDev || ((_a = this.bldrConfig.biomeConfig) === null || _a === void 0 ? void 0 : _a.forceBuildIfError)) {
                console.log(err);
            }
            else {
                console.log(err);
                process.exit(1);
            }
        }
    });
}, _BiomeProvider_addUserDestToIgnorePaths = function _BiomeProvider_addUserDestToIgnorePaths(key) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if ((_a = this.bldrConfig.userConfig) === null || _a === void 0 ? void 0 : _a[key]) {
            this.bldrConfig.userConfig[key].forEach((p) => {
                let destPath = p.dest.startsWith('./') ? p.dest.replace('./', '') : p.dest;
                destPath = destPath.endsWith('/') ? destPath : `${destPath}/`;
                this.globIgnorePaths.push(`${destPath}**/*.${key}`);
            });
        }
    });
}, _BiomeProvider_formatHTML = function _BiomeProvider_formatHTML(html) {
    let newHTML = html.replace(/<strong>(.*?)<\/strong>/g, chalk.bold(`$1`));
    newHTML = newHTML.replace(/&gt;/g, '>');
    newHTML = newHTML.replace(/<span style="color: Tomato;">(.*?)<\/span>/g, chalk.red(`$1`));
    newHTML = newHTML.replace(/<span style="color: lightgreen;">(.*?)<\/span>/g, chalk.green(`$1`));
    newHTML = newHTML.replace(/<span style="color: MediumSeaGreen;">(.*?)<\/span>/g, chalk.greenBright(`$1`));
    newHTML = newHTML.replace(/<span style="opacity: 0.8;">(.*?)<\/span>/g, chalk.dim(`$1`));
    newHTML = newHTML.replace(/<span style="color: #000; background-color: #ddd;">(.*?)<\/span>/g, chalk.bgGreen.white(`\n\n$1`));
    newHTML = newHTML.replace(/<a href="([^"]+)">([^<]+)<\/a>/g, `${chalk.yellow.bold(`$2`)} ${chalk.yellowBright(`($1)`)}`);
    return newHTML;
};
//# sourceMappingURL=BiomeProvider.js.map