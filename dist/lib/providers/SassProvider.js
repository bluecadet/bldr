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
var _SassProvider_instances, _SassProvider_legacy, _SassProvider_build;
import { BldrConfig } from '../BldrConfig.js';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { logSuccess, logError } from '../utils/loggers.js';
import { ensureDirectory } from '../utils/ensureDirectory.js';
export class SassProvider {
    constructor() {
        _SassProvider_instances.add(this);
        if (SassProvider._instance) {
            return SassProvider._instance;
        }
        SassProvider._instance = this;
    }
    /**
     * @method initialize
     * @description Initializes the SassProvider
     * @returns {Promise<void>}
     * @memberof SassProvider
     */
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const require = createRequire(import.meta.url);
            this.bldrConfig = BldrConfig._instance;
            this.sass = require('sass');
            this.notice = 'SassProvider initialized';
        });
    }
    buildProcessBundle() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!((_a = this.bldrConfig.processAssetGroups) === null || _a === void 0 ? void 0 : _a.sass)) {
                return;
            }
            for (const asset of Object.keys(this.bldrConfig.processAssetGroups.sass)) {
                yield this.buildAssetGroup(this.bldrConfig.processAssetGroups.sass[asset]);
            }
        });
    }
    /**
     * @method buildAssetGroup
     * @description Builds the process bundle for sass
     * @param {ProcessAsset} assetGroup - The asset group to build
     * @returns {Promise<void>}
     * @memberof SassProvider
     */
    buildAssetGroup(assetGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const start = Date.now();
            const { src, dest } = assetGroup;
            const filename = path.basename(src);
            const ext = path.extname(src);
            const cleanName = filename.replace(ext, '');
            try {
                let result;
                yield ensureDirectory(dest);
                if ((_b = (_a = this.bldrConfig) === null || _a === void 0 ? void 0 : _a.sassConfig) === null || _b === void 0 ? void 0 : _b.useLegacy) {
                    result = yield __classPrivateFieldGet(this, _SassProvider_instances, "m", _SassProvider_legacy).call(this, src, dest);
                }
                else {
                    result = yield __classPrivateFieldGet(this, _SassProvider_instances, "m", _SassProvider_build).call(this, src, dest);
                }
                if (!(result === null || result === void 0 ? void 0 : result.css) || !result.css.toString()) {
                    logError('sass', `no css found in ${src}`);
                    return;
                }
                let cssString = result.css.toString();
                if (result === null || result === void 0 ? void 0 : result.sourceMap) {
                    cssString += '\n'.repeat(2) + '/*# sourceMappingURL=' + `${cleanName}.css.map` + ' */';
                    fs.writeFileSync(path.join(dest, `${cleanName}.css.map`), JSON.stringify(result.sourceMap));
                }
                fs.writeFileSync(path.join(dest, `${cleanName}.css`), cssString);
                // Clock the time it took to process     
                const stop = Date.now();
                // Log success message
                logSuccess('sass', `${filename} processed`, ((stop - start) / 1000));
            }
            catch (error) {
                // General error caught
                const toBailOrNotToBail = this.bldrConfig.isDev ? {} : { throwError: true, exit: true };
                logError(`sass`, `General error:`, {});
                logError(`sass`, `${error}`, toBailOrNotToBail);
            }
        });
    }
}
_SassProvider_instances = new WeakSet(), _SassProvider_legacy = function _SassProvider_legacy(src, dest) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.sass.renderSync({
            file: src,
            sourceMap: this.bldrConfig.isDev,
            sourceMapContents: true,
            style: this.bldrConfig.isDev ? 'expanded' : 'compressed',
        });
    });
}, _SassProvider_build = function _SassProvider_build(src, dest) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.sass.compile(src, {
            sourceMap: this.bldrConfig.isDev,
            sourceMapContents: true,
            style: this.bldrConfig.isDev ? 'expanded' : 'compressed',
        });
    });
};
//# sourceMappingURL=SassProvider.js.map