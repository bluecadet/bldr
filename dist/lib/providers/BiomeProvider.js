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
import { execSync } from 'node:child_process';
import { dashPadFromString, logError, logSuccess } from '../utils/loggers.js';
import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
export class BiomeProvider {
    constructor() {
        // biome-ignore lint/suspicious/noExplicitAny: Not bringing in biome, so using any for json config (no biome types)
        this.biomeConfig = {};
        if (BiomeProvider._instance) {
            return;
        }
        BiomeProvider._instance = this;
    }
    initialize() {
        var _a, _b, _c, _d, _e, _f;
        this.bldrConfig = BldrConfig._instance;
        this.throwError = !this.bldrConfig.isDev && ((_a = this.bldrConfig.biomeConfig) === null || _a === void 0 ? void 0 : _a.forceBuildIfError) === true;
        if (existsSync(join(process.cwd(), 'biome.json'))) {
            const biomeConfigRaw = readFileSync(join(process.cwd(), 'biome.json'), 'utf-8');
            this.biomeConfig = JSON.parse(biomeConfigRaw);
        }
        if (this.bldrConfig.isDev || ((_b = this.bldrConfig.biomeConfig) === null || _b === void 0 ? void 0 : _b.forceBuildIfError) === true) {
            this.bailOnError = {};
            if (this.bldrConfig.isDev) {
                this.errorsFoundMessage = 'Errors found in Biome';
            }
            else {
                this.errorsFoundMessage = 'Errors found in Biome, but build forced in config';
            }
        }
        else {
            this.bailOnError = { throwError: true, exit: true };
            this.errorsFoundMessage = 'Errors found in Biome - process aborted';
        }
        if (this.bldrConfig.isDev) {
            this.devLintCommand = 'npx @biomejs/biome lint';
            this.devFormatCommand = 'npx @biomejs/biome check';
            if ((_d = (_c = this.bldrConfig) === null || _c === void 0 ? void 0 : _c.biomeConfig) === null || _d === void 0 ? void 0 : _d.devWrite) {
                this.devLintCommand += ' --write';
                this.devFormatCommand += ' --write';
            }
            this.devRunCommand = ((_f = (_e = this.bldrConfig) === null || _e === void 0 ? void 0 : _e.biomeConfig) === null || _f === void 0 ? void 0 : _f.devFormat) ? this.devFormatCommand : this.devLintCommand;
        }
    }
    lintAll() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!((_b = (_a = this.bldrConfig) === null || _a === void 0 ? void 0 : _a.biomeConfig) === null || _b === void 0 ? void 0 : _b.useBiome)) {
                return;
            }
            try {
                const stdout = execSync('npx @biomejs/biome lint --reporter=summary --error-on-warnings').toString();
                console.log(stdout);
            }
            catch (error) {
                const msg = 'Run npx `@biomejs/biome lint` for full report.';
                const longestString = this.errorsFoundMessage.length > msg.length ? this.errorsFoundMessage : msg;
                const dashes = dashPadFromString(longestString);
                logError('biome', dashes, {});
                logError('biome', this.errorsFoundMessage, {});
                logError('biome', 'Run npx `@biomejs/biome lint` for full report.', {});
                logError("biome", dashes, this.bailOnError);
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
            var _a, _b, _c, _d, _e, _f;
            if (!((_b = (_a = this.bldrConfig) === null || _a === void 0 ? void 0 : _a.biomeConfig) === null || _b === void 0 ? void 0 : _b.useBiome)) {
                return false;
            }
            if (this.bldrConfig.isDev && !((_d = (_c = this.bldrConfig) === null || _c === void 0 ? void 0 : _c.biomeConfig) === null || _d === void 0 ? void 0 : _d.dev)) {
                return false;
            }
            if (((_f = (_e = this.biomeConfig) === null || _e === void 0 ? void 0 : _e.files) === null || _f === void 0 ? void 0 : _f.includes) && Array.isArray(this.biomeConfig.files.includes)) {
                if (!this.matchesPattern(filepath, this.biomeConfig.files.includes)) {
                    return false;
                }
            }
            logSuccess('biome', `${filepath} linted`);
            const stdout = execSync(`${this.devRunCommand} ${filepath}`).toString();
            console.log(stdout);
            return true;
        });
    }
    /**
     * Check if a file matches any pattern in an array of glob patterns
     * Patterns starting with ! are treated as negations
     * @param {string} filePath - The file path to check
     * @param {string[]} patterns - Array of glob patterns (can include negations with !)
     * @returns {boolean} - True if file matches and isn't negated, false otherwise
     */
    matchesPattern(filePath, patterns) {
        if (!patterns || patterns.length === 0) {
            return false;
        }
        const require = createRequire(import.meta.url);
        const picomatch = require('picomatch');
        let isMatch = false;
        for (const pattern of patterns) {
            const isNegation = pattern.startsWith('!');
            const cleanPattern = isNegation ? pattern.slice(1) : pattern;
            // Create a matcher for this pattern
            const isMatchFn = picomatch(cleanPattern, { dot: true });
            if (isMatchFn(filePath)) {
                if (isNegation) {
                    return false; // Negation pattern matched - file should be excluded
                }
                else {
                    isMatch = true; // Positive pattern matched
                }
            }
        }
        return isMatch;
    }
}
//# sourceMappingURL=BiomeProvider.js.map