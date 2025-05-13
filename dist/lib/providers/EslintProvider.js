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
var _EslintProvider_instances, _EslintProvider_setEsLintPaths, _EslintProvider_runLint, _EslintProvider_compileFinalConfig;
import { BldrConfig } from '../BldrConfig.js';
import { ESLint } from 'eslint';
import { logAction, logError } from '../utils/loggers.js';
import path from 'node:path';
import { createRequire } from 'node:module';
import fs from 'node:fs';
export class EslintProvider {
    constructor() {
        _EslintProvider_instances.add(this);
        /**
         * @property null|object
         * ESLint instance
         */
        this.eslint = null;
        if (EslintProvider._instance) {
            return EslintProvider._instance;
        }
        EslintProvider._instance = this;
    }
    /**
     * @description Initialize the EslintProvider
     * @returns {Promise<void>}
     * @memberof EslintProvider
     */
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            this.bldrConfig = BldrConfig._instance;
            this.notice = 'EslintProvider initialized';
            if (((_a = this.bldrConfig.eslintConfig) === null || _a === void 0 ? void 0 : _a.useEslint) === false) {
                return false;
            }
            if (!((_b = this.bldrConfig.processAssetGroups) === null || _b === void 0 ? void 0 : _b.js) && !((_c = this.bldrConfig.sdcProcessAssetGroups) === null || _c === void 0 ? void 0 : _c.js)) {
                return false;
            }
            this.eslint = new ESLint(this.eslintOptions);
            this.formatter = yield this.eslint.loadFormatter('stylish');
            if (this.bldrConfig.isDev || ((_d = this.bldrConfig.eslintConfig) === null || _d === void 0 ? void 0 : _d.forceBuildIfError) === true) {
                this.bailOnError = {};
                if (this.bldrConfig.isDev) {
                    this.resultMessage = `Errors found in Eslint`;
                }
                else {
                    this.resultMessage = `Errors found in Eslint, but build forced in config`;
                }
            }
            else {
                this.bailOnError = { throwError: true, exit: true };
                this.resultMessage = `Errors found in Eslint - process aborted`;
            }
            yield __classPrivateFieldGet(this, _EslintProvider_instances, "m", _EslintProvider_compileFinalConfig).call(this);
        });
    }
    /**
     * @description Lint all files in the project
     * @returns {Promise<void>}
     * @memberof EslintProvider
     */
    lintAll() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.eslint) {
                return false;
            }
            yield __classPrivateFieldGet(this, _EslintProvider_instances, "m", _EslintProvider_setEsLintPaths).call(this);
            if (this.eslintAllPaths.length > 0) {
                yield __classPrivateFieldGet(this, _EslintProvider_instances, "m", _EslintProvider_runLint).call(this, this.eslintAllPaths);
            }
        });
    }
    /**
     * @description Lint single file in the project
     * @param {string} filepath - Path to the file to lint
     * @returns {Promise<void>}
     * @memberof EslintProvider
     */
    lintFile(filepath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.eslint) {
                return false;
            }
            yield __classPrivateFieldGet(this, _EslintProvider_instances, "m", _EslintProvider_runLint).call(this, filepath);
        });
    }
}
_EslintProvider_instances = new WeakSet(), _EslintProvider_setEsLintPaths = function _EslintProvider_setEsLintPaths() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        this.eslintAllPaths = [];
        // Check if eslint.config.js exists in the project root, and use files from config if defined
        const eslintConfigPath = path.join(process.cwd(), `eslint.config.js`);
        if (fs.existsSync(eslintConfigPath)) {
            const configFile = yield import(eslintConfigPath);
            configFile.default.forEach((c) => {
                if (c === null || c === void 0 ? void 0 : c.files) {
                    c.files.forEach((file) => {
                        this.eslintAllPaths.push(path.join(process.cwd(), file));
                    });
                }
            });
            if (this.eslintAllPaths.length > 0) {
                logAction(`eslint`, `Linting files from eslint.config.js`);
                return;
            }
        }
        // Otherwise, Use files from config
        const require = createRequire(import.meta.url);
        const fg = require('fast-glob');
        if ((_a = this.bldrConfig.processSrc) === null || _a === void 0 ? void 0 : _a.js) {
            this.bldrConfig.processSrc.js.forEach((p) => {
                const files = fg.sync([`${path.join(process.cwd(), p.src)}`]);
                if (files && files.length > 0) {
                    for (const file of files) {
                        this.eslintAllPaths.push(path.resolve(file));
                    }
                }
            });
        }
        if ((_b = this.bldrConfig.sdcProcessAssetGroups) === null || _b === void 0 ? void 0 : _b.js) {
            for (const [key, value] of Object.entries(this.bldrConfig.sdcProcessAssetGroups.js)) {
                this.eslintAllPaths.push(path.resolve(value.src));
            }
        }
    });
}, _EslintProvider_runLint = function _EslintProvider_runLint(files) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            if (!this.eslint) {
                return;
            }
            const results = yield this.eslint.lintFiles(files);
            const resultText = this.formatter.format(results);
            results.forEach((res) => {
                if (res.errorCount > 0) {
                    logError(`eslint`, this.resultMessage, {});
                    console.log(resultText);
                    logError(`eslint`, `--------------------------------------------------`, this.bailOnError);
                }
            });
        }
        catch (err) {
            if (this.bldrConfig.isDev || ((_a = this.bldrConfig.eslintConfig) === null || _a === void 0 ? void 0 : _a.forceBuildIfError)) {
                console.log(err);
            }
            else {
                console.log(err);
                process.exit(1);
            }
        }
    });
}, _EslintProvider_compileFinalConfig = function _EslintProvider_compileFinalConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        this.eslintOptions = ((_a = this.bldrConfig.eslintConfig) === null || _a === void 0 ? void 0 : _a.options) || {};
    });
};
//# sourceMappingURL=EslintProvider.js.map