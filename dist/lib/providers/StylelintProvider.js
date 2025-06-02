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
var _StylelintProvider_instances, _StylelintProvider_setStyleLintPaths, _StylelintProvider_runLint;
import { BldrConfig } from '../BldrConfig.js';
import stylelint from 'stylelint';
import stylelintFormatter from 'stylelint-formatter-pretty';
import { dashPadFromString, logError } from '../utils/loggers.js';
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
export class StylelintProvider {
    constructor() {
        _StylelintProvider_instances.add(this);
        this.allPaths = [];
        this.allowStylelint = true;
        if (StylelintProvider._instance) {
            return StylelintProvider._instance;
        }
        StylelintProvider._instance = this;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            this.bldrConfig = BldrConfig._instance;
            this.notice = 'Stylelint initialized';
            this.allowStylelint = ((_a = this.bldrConfig.stylelintConfig) === null || _a === void 0 ? void 0 : _a.useStyleLint) ? this.bldrConfig.stylelintConfig.useStyleLint : true;
            // let configPaths = path.join(process.cwd(), 'stylelint.config.js');
            const configFiles = [
                'stylelint.config.js',
                'stylelint.config.mjs',
                'stylelint.config.cjs',
                '.stylelintrc.js',
                '.stylelintrc.mjs',
                '.stylelintrc.cjs',
                '.stylelintrc',
                '.stylelintrc.yml',
                '.stylelintrc.yaml',
                '.stylelintrc.json',
            ];
            // Check if any of the config files exist in the project root
            const configExists = configFiles.some((file) => {
                return fs.existsSync(path.join(process.cwd(), file));
            });
            if (this.allowStylelint && !configExists) {
                logError(`stylelint`, `No Stylelint config found in project root. Stylelint will be skipped.`, {});
                this.allowStylelint = false;
            }
            if (this.bldrConfig.isDev || ((_b = this.bldrConfig.stylelintConfig) === null || _b === void 0 ? void 0 : _b.forceBuildIfError) === true) {
                this.bailOnError = {};
                if (this.bldrConfig.isDev) {
                    this.resultMessage = `Errors found in Stylelint`;
                }
                else {
                    this.resultMessage = `Errors found in Stylelint, but build forced in config`;
                }
            }
            else {
                this.bailOnError = { throwError: true, exit: true };
                this.resultMessage = `Errors found in Stylelint - process aborted`;
            }
        });
    }
    /**
     * @description Lint all files in the project
     * @returns {Promise<void>}
     * @memberof EslintProvider
     */
    lintAll() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.allowStylelint) {
                return;
            }
            yield __classPrivateFieldGet(this, _StylelintProvider_instances, "m", _StylelintProvider_setStyleLintPaths).call(this);
            if (this.allPaths.length > 0) {
                yield __classPrivateFieldGet(this, _StylelintProvider_instances, "m", _StylelintProvider_runLint).call(this, this.allPaths);
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
            if (!this.allowStylelint) {
                return;
            }
            yield __classPrivateFieldGet(this, _StylelintProvider_instances, "m", _StylelintProvider_runLint).call(this, filepath);
        });
    }
}
_StylelintProvider_instances = new WeakSet(), _StylelintProvider_setStyleLintPaths = function _StylelintProvider_setStyleLintPaths() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        this.allPaths = [];
        // Otherwise, Use files from config
        const require = createRequire(import.meta.url);
        const fg = require('fast-glob');
        if ((_a = this.bldrConfig.processSrc) === null || _a === void 0 ? void 0 : _a.css) {
            this.bldrConfig.processSrc.css.forEach((p) => {
                const files = fg.sync([`${path.join(process.cwd(), p.src)}`]);
                if (files && files.length > 0) {
                    for (const file of files) {
                        this.allPaths.push(path.resolve(file));
                    }
                }
            });
        }
        if ((_b = this.bldrConfig.sdcProcessAssetGroups) === null || _b === void 0 ? void 0 : _b.css) {
            for (const [key, value] of Object.entries(this.bldrConfig.sdcProcessAssetGroups.css)) {
                this.allPaths.push(path.resolve(value.src));
            }
        }
    });
}, _StylelintProvider_runLint = function _StylelintProvider_runLint(files) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const result = yield stylelint.lint({
                files: files,
                formatter: stylelintFormatter,
            });
            if (result.errored) {
                const dashes = dashPadFromString(this.resultMessage);
                console.log('');
                logError(`stylelint`, dashes, {});
                logError(`stylelint`, this.resultMessage, {});
                logError(`stylelint`, dashes, {});
                console.log(result.report);
                logError(`stylelint`, dashes, this.bailOnError);
                console.log('');
            }
        }
        catch (err) {
            if (this.bldrConfig.isDev || ((_a = this.bldrConfig.stylelintConfig) === null || _a === void 0 ? void 0 : _a.forceBuildIfError)) {
                console.log(err);
            }
            else {
                console.log(err);
                process.exit(1);
            }
        }
    });
};
//# sourceMappingURL=StylelintProvider.js.map