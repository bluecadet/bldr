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
import { dashPadFromString, logAction, logError, logSuccess } from '../utils/loggers.js';
import path from 'node:path';
import fs from 'node:fs';
import { getAllFiles } from '../utils/getAllFiles.js';
export class EslintProvider {
    constructor() {
        _EslintProvider_instances.add(this);
        /**
         * @property null|object
         * ESLint instance
         */
        this.eslint = null;
        this.hasErrors = false;
        if (EslintProvider._instance) {
            // biome-ignore lint/correctness/noConstructorReturn: <explanation>
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
            var _a, _b, _c;
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
            const msg = ' Errors found in ESlint ';
            const count = Math.floor(((process.stdout.columns - 14) - msg.length - 2) / 2);
            const sym = '=';
            this.resultMessage = `${sym.repeat(count)}${msg}${sym.repeat(count)}`;
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
            var _a;
            if (!this.eslint) {
                return false;
            }
            // Reset the hasErrors flag
            this.hasErrors = false;
            yield __classPrivateFieldGet(this, _EslintProvider_instances, "m", _EslintProvider_setEsLintPaths).call(this);
            if (this.eslintAllPaths && this.eslintAllPaths.length > 0) {
                yield __classPrivateFieldGet(this, _EslintProvider_instances, "m", _EslintProvider_runLint).call(this, this.eslintAllPaths);
            }
            if (this.hasErrors && ((_a = this.bldrConfig.eslintConfig) === null || _a === void 0 ? void 0 : _a.forceBuildIfError) === true) {
                console.log('');
                logError('eslint', '🚨🚨🚨 ESLint errors found 🚨🚨🚨', { throwError: true, exit: true });
            }
            else if (this.hasErrors) {
                logError('eslint', 'ESLint errors found, forceBuildIfError set to true, continuing on', {});
            }
            else {
                logSuccess('eslint', 'No ESLint errors found');
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
                return;
            }
            yield __classPrivateFieldGet(this, _EslintProvider_instances, "m", _EslintProvider_runLint).call(this, filepath);
        });
    }
}
_EslintProvider_instances = new WeakSet(), _EslintProvider_setEsLintPaths = function _EslintProvider_setEsLintPaths() {
    return __awaiter(this, void 0, void 0, function* () {
        this.eslintAllPaths = [];
        // Check if eslint.config.js exists in the project root, and use files from config if defined
        const eslintConfigPath = path.join(process.cwd(), 'eslint.config.js');
        if (fs.existsSync(eslintConfigPath)) {
            const configFile = yield import(eslintConfigPath);
            for (const c of configFile.default) {
                if (c === null || c === void 0 ? void 0 : c.files) {
                    for (const file of c.files) {
                        this.eslintAllPaths.push(path.join(process.cwd(), file));
                    }
                }
            }
            if (this.eslintAllPaths.length > 0) {
                logAction('eslint', 'Linting files from eslint.config.js');
                return;
            }
        }
        this.eslintAllPaths = yield getAllFiles(['js'], []);
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
            let resultErrors = false;
            for (const res of results) {
                if (res.errorCount > 0) {
                    resultErrors = true;
                }
            }
            if (resultErrors) {
                const dashes = dashPadFromString(this.resultMessage);
                logError('eslint', dashes, {});
                logError('eslint', this.resultMessage, {});
                logError('eslint', dashes, {});
                for (const res of results) {
                    if (res.errorCount > 0) {
                        this.hasErrors = true;
                        console.log(resultText);
                        logError('eslint', dashes, {});
                    }
                }
                ;
            }
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