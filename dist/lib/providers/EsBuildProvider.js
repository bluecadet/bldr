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
import * as esBuild from 'esbuild';
import path from 'node:path';
import { logError, logSuccess } from '../utils/loggers.js';
import { ensureDirectory } from '../utils/ensureDirectory.js';
export class EsBuildProvider {
    constructor() {
        if (EsBuildProvider._instance) {
            return EsBuildProvider._instance;
        }
        EsBuildProvider._instance = this;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.bldrConfig = BldrConfig._instance;
            this.notice = 'ESBuildProvider initialized';
        });
    }
    /**
     * @method buildProcessBundle
     * @description Build the process bundle, which includes all asset groups defined in the processAssetGroups config
     * @return {Promise<void>}
     * @memberof EsBuildProvider
     */
    buildProcessBundle() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!((_a = this.bldrConfig.processAssetGroups) === null || _a === void 0 ? void 0 : _a.js)) {
                return;
            }
            yield this.buildProcessAssetGroupsBundle();
            if ((_b = this.bldrConfig.sdcProcessAssetGroups) === null || _b === void 0 ? void 0 : _b.js) {
                for (const asset of Object.keys(this.bldrConfig.sdcProcessAssetGroups.js)) {
                    yield this.buildAssetGroup(this.bldrConfig.sdcProcessAssetGroups.js[asset]);
                }
            }
        });
    }
    /**
     * @method buildProcessAssetGroupsBundle
     * @description Builds the asset groups bundle for esbuild
     * @return {Promise<void>}
     * @memberof EsBuildProvider
     */
    buildProcessAssetGroupsBundle() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if ((_a = this.bldrConfig.processAssetGroups) === null || _a === void 0 ? void 0 : _a.js) {
                for (const asset of Object.keys(this.bldrConfig.processAssetGroups.js)) {
                    yield this.buildAssetGroup(this.bldrConfig.processAssetGroups.js[asset]);
                }
            }
        });
    }
    buildAssetGroup(assetGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const start = Date.now();
            const { src, dest } = assetGroup;
            const fileName = path.basename(src);
            const plugins = ((_c = (_b = (_a = this.bldrConfig) === null || _a === void 0 ? void 0 : _a.esBuildConfig) === null || _b === void 0 ? void 0 : _b.plugins) !== null && _c !== void 0 ? _c : []).map(([name, options]) => (Object.assign({ name }, options)));
            try {
                yield ensureDirectory(dest);
                const result = yield esBuild
                    .build({
                    entryPoints: [src],
                    bundle: true,
                    outfile: path.join(dest, fileName),
                    sourcemap: true,
                    plugins: plugins,
                });
                const stop = Date.now();
                logSuccess('esbuild', `${fileName} processed`, ((stop - start) / 1000));
            }
            catch (error) {
                // General error caught
                const toBailOrNotToBail = this.bldrConfig.isDev ? {} : { throwError: true, exit: true };
                logError(`esbuild`, `General error:`, {});
                logError(`esbuild`, `${error}`, toBailOrNotToBail);
            }
        });
    }
}
//# sourceMappingURL=EsBuildProvider.js.map