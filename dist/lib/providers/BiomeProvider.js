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
export class BiomeProvider {
    constructor() {
        if (BiomeProvider._instance) {
            return;
        }
        BiomeProvider._instance = this;
    }
    initialize() {
        var _a, _b, _c, _d, _e, _f;
        this.bldrConfig = BldrConfig._instance;
        this.throwError = !this.bldrConfig.isDev && ((_a = this.bldrConfig.biomeConfig) === null || _a === void 0 ? void 0 : _a.forceBuildIfError) === true;
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
            var _a, _b, _c, _d;
            if (!((_b = (_a = this.bldrConfig) === null || _a === void 0 ? void 0 : _a.biomeConfig) === null || _b === void 0 ? void 0 : _b.useBiome)) {
                return;
            }
            if (this.bldrConfig.isDev && !((_d = (_c = this.bldrConfig) === null || _c === void 0 ? void 0 : _c.biomeConfig) === null || _d === void 0 ? void 0 : _d.dev)) {
                return;
            }
            logSuccess('biome', `${filepath} linted`);
            const stdout = execSync(`${this.devRunCommand} ${filepath}`).toString();
            console.log(stdout);
        });
    }
}
//# sourceMappingURL=BiomeProvider.js.map