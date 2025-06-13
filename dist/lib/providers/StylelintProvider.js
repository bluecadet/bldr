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
var _StylelintProvider_instances, _StylelintProvider_runLint;
import { BldrConfig } from '../BldrConfig.js';
import stylelint from 'stylelint';
import stylelintFormatter from 'stylelint-formatter-pretty';
import { dashPadFromString, logError, logSuccess } from '../utils/loggers.js';
import path from 'node:path';
import fs from 'node:fs';
import { getAllFiles } from '../utils/getAllFiles.js';
export class StylelintProvider {
    constructor() {
        _StylelintProvider_instances.add(this);
        /**
         * @property null | string[]
         * All paths to lint
         */
        this.allStylelintPaths = [];
        /**
         * @property null | boolean
         * Whether to allow stylelint to run
         */
        this.allowStylelint = true;
        this.hasErrors = false;
        if (StylelintProvider._instance) {
            // biome-ignore lint/correctness/noConstructorReturn: <explanation>
            return StylelintProvider._instance;
        }
        StylelintProvider._instance = this;
    }
    /**
     * @description Initialize the StylelintProvider
     * @returns {Promise<void>}
     * @memberof StylelintProvider
     */
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.bldrConfig = BldrConfig._instance;
            this.notice = 'Stylelint initialized';
            this.allowStylelint = ((_a = this.bldrConfig.stylelintConfig) === null || _a === void 0 ? void 0 : _a.useStyleLint) === true;
            if (!this.allowStylelint) {
                return;
            }
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
                logError('stylelint', 'No Stylelint config found in project root. Stylelint will be skipped.', {});
                this.allowStylelint = false;
                return;
            }
            const msg = ' Errors found in Stylelint ';
            const count = Math.floor(((process.stdout.columns - 14) - msg.length - 2) / 2);
            const sym = '=';
            this.resultMessage = `${sym.repeat(count)}${msg}${sym.repeat(count)}`;
        });
    }
    /**
     * @description Lint all files in the project
     * @returns {Promise<void>}
     * @memberof EslintProvider
     */
    lintAll() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!this.allowStylelint) {
                return;
            }
            // Reset the hasErrors flag
            this.hasErrors = false;
            // Get paths to lint
            this.allStylelintPaths = yield getAllFiles(['css'], ((_a = this.bldrConfig.stylelintConfig) === null || _a === void 0 ? void 0 : _a.ignorePaths) || []);
            // If we have paths to lint, run the linter
            if (this.allStylelintPaths && this.allStylelintPaths.length > 0) {
                yield __classPrivateFieldGet(this, _StylelintProvider_instances, "m", _StylelintProvider_runLint).call(this, this.allStylelintPaths);
            }
            // If we have errors, log them
            if (this.hasErrors && ((_b = this.bldrConfig.stylelintConfig) === null || _b === void 0 ? void 0 : _b.forceBuildIfError) === true) {
                console.log('');
                logError('stylelint', '🚨🚨🚨 Stylelint errors found 🚨🚨🚨', { throwError: true, exit: true });
            }
            else if (this.hasErrors) {
                logError('stylelint', 'Stylelint errors found, forceBuildIfError set to true, continuing on', {});
            }
            else {
                logSuccess('stylelint', 'No Stylelint errors found');
            }
        });
    }
    /**
     * @description Set the paths for stylelint
     * @returns {Promise<void>}
     * @memberof EslintProvider
     * @private
     */
    // async #setStyleLintPaths(): Promise<void> {
    //   this.allStylelintPaths = [];
    //   // Otherwise, Use files from config
    //   const require = createRequire(import.meta.url);
    //   const fg      = require('fast-glob');
    //   if ( this.bldrConfig.processSrc?.css ) {
    //     for (const p of this.bldrConfig.processSrc.css) {
    //       const files = fg.sync([`${path.join(process.cwd(), p.src)}`]);
    //       if ( files && files.length > 0 ) {
    //         for (const file of files) {
    //           this.allStylelintPaths.push(path.resolve(file));
    //         }
    //       }
    //     }
    //   }
    //   if ( this.bldrConfig.sdcProcessAssetGroups?.css ) {
    //     for (const [key, value] of Object.entries(this.bldrConfig.sdcProcessAssetGroups.css)) {
    //       this.allStylelintPaths.push(path.resolve((value as { src: string }).src));
    //     }
    //   }
    // }
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
_StylelintProvider_instances = new WeakSet(), _StylelintProvider_runLint = function _StylelintProvider_runLint(files) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const result = yield stylelint.lint({
                files: files,
                formatter: stylelintFormatter,
            });
            if (result.errored) {
                this.hasErrors = true;
                const dashes = dashPadFromString(this.resultMessage);
                logError('stylelint', dashes, {});
                logError('stylelint', this.resultMessage, {});
                logError('stylelint', dashes, {});
                console.log(result.report);
                logError('stylelint', dashes, {});
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