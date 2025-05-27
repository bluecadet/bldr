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
import { rollup } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
// import injectProcessEnv from 'rollup-plugin-inject-process-env';
import swc from '@rollup/plugin-swc';
import { babel } from '@rollup/plugin-babel';
import { minify } from "terser";
import { logAction, logError, logSuccess } from '../utils/loggers.js';
import { ensureDirectory } from '../utils/ensureDirectory.js';
export class RollupProvider {
    constructor() {
        if (RollupProvider._instance) {
            return RollupProvider._instance;
        }
        RollupProvider._instance = this;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.bldrConfig = BldrConfig._instance;
            this.notice = 'RollupProvider initialized';
        });
    }
    buildProcessBundle() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            if (!((_a = this.bldrConfig.processAssetGroups) === null || _a === void 0 ? void 0 : _a.js) || !((_b = this.bldrConfig.sdcProcessAssetGroups) === null || _b === void 0 ? void 0 : _b.js)) {
                return;
            }
            yield this.compileFinalConfig();
            if ((_c = this.bldrConfig.processAssetGroups) === null || _c === void 0 ? void 0 : _c.js) {
                for (const asset of Object.keys(this.bldrConfig.processAssetGroups.js)) {
                    yield this.buildAssetGroup(this.bldrConfig.processAssetGroups.js[asset]);
                }
            }
            if ((_d = this.bldrConfig.sdcProcessAssetGroups) === null || _d === void 0 ? void 0 : _d.js) {
                for (const asset of Object.keys(this.bldrConfig.sdcProcessAssetGroups.js)) {
                    yield this.buildAssetGroup(this.bldrConfig.sdcProcessAssetGroups.js[asset], true);
                }
            }
        });
    }
    /**
     * @description Build a single asset group
     * @param {ProcessAsset} assetGroup
     * @param {boolean} isSDC
     * @returns {Promise<void>}
     * @memberof RollupProvider
     */
    buildAssetGroup(assetGroup_1) {
        return __awaiter(this, arguments, void 0, function* (assetGroup, isSDC = false) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            const { src, dest } = assetGroup;
            const filename = path.basename(src);
            const destPath = path.join(dest, filename);
            if (isSDC && ((_b = (_a = this.bldrConfig.rollupConfig) === null || _a === void 0 ? void 0 : _a.sdcOptions) === null || _b === void 0 ? void 0 : _b.bundle) === false) {
                logAction('rollup', `rollup.sdcOptions.bundle is set to false in config, copying ${filename}`);
                yield ensureDirectory(dest);
                fs.copyFileSync(src, destPath);
                return;
            }
            const bundleConfig = Object.assign({}, this.rollupFinalConfig);
            bundleConfig.inputOptions.input = src;
            bundleConfig.outputOptions.file = destPath;
            if (isSDC && ((_d = (_c = this.bldrConfig.rollupConfig) === null || _c === void 0 ? void 0 : _c.sdcOptions) === null || _d === void 0 ? void 0 : _d.format)) {
                bundleConfig.outputOptions.format = (_e = this.bldrConfig.rollupConfig.sdcOptions) === null || _e === void 0 ? void 0 : _e.format;
            }
            let bundle;
            let buildStart = 0;
            let buildEnd = 0;
            try {
                yield ensureDirectory(dest);
                buildStart = new Date().getTime();
                // create a bundle
                bundle = yield rollup(Object.assign(Object.assign({}, this.rollupFinalConfig.inputOptions), { input: src }));
                // write the bundle
                yield bundle.write(Object.assign(Object.assign({}, this.rollupFinalConfig.outputOptions), { file: destPath }));
            }
            catch (error) {
                console.error(error);
                logError('rollup', `An error occured while creating the bundle for ${src}`, { throwError: true, exit: true });
            }
            // Handle build time
            if (bundle) {
                yield bundle.close();
                buildEnd = new Date().getTime();
                logSuccess('rollup', `${filename} processed`, `${(buildEnd - buildStart) / 1000}`);
                if ((_f = this.bldrConfig.rollupConfig) === null || _f === void 0 ? void 0 : _f.useTerser) {
                    if (!isSDC || (isSDC && (((_h = (_g = this.bldrConfig.rollupConfig) === null || _g === void 0 ? void 0 : _g.sdcOptions) === null || _h === void 0 ? void 0 : _h.minify) !== false))) {
                        try {
                            const terserStart = new Date().getTime();
                            const bundledFileData = fs.readFileSync(destPath, 'utf8');
                            const result = yield minify(bundledFileData, ((_j = this.bldrConfig.rollupConfig) === null || _j === void 0 ? void 0 : _j.terserOptions) || {});
                            fs.writeFileSync(destPath, result.code, "utf8");
                            const terserStop = new Date().getTime();
                            logSuccess('terser', `${filename} minified`, `${(terserStop - terserStart) / 1000}`);
                        }
                        catch (err) {
                            console.log(err);
                            logError('terser', 'Build Error', { throwError: true });
                        }
                    }
                }
            }
        });
    }
    compileFinalConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            this.rollupFinalConfig = {
                inputOptions: {},
                outputOptions: {},
            };
            // INPUT OPTIONS
            if ((_a = this.bldrConfig.rollupConfig) === null || _a === void 0 ? void 0 : _a.inputOptions) {
                this.rollupFinalConfig.inputOptions = Object.assign({}, this.bldrConfig.rollupConfig.inputOptions);
            }
            // INPUT PLUGINS
            if ((_b = this.bldrConfig.rollupConfig) === null || _b === void 0 ? void 0 : _b.overrideInputPlugins) {
                // User overrides all plugins
                this.rollupFinalConfig.inputOptions.plugins = ((_c = this.bldrConfig.rollupConfig) === null || _c === void 0 ? void 0 : _c.inputPlugins) || [];
            }
            else {
                // Default plugins
                const inputPlugins = [];
                // CommonJS
                inputPlugins.push(commonjs());
                // Replace process.env in files with production
                // inputPlugins.push(injectProcessEnv({
                //   NODE_ENV: 'production',
                // }));
                // SWC or Babel
                if (this.rollupFinalConfig.useSWC) {
                    inputPlugins.push(swc(this.rollupFinalConfig.swcPluginOptions || {}));
                }
                else if (this.rollupFinalConfig.useBabel) {
                    inputPlugins.push(babel(this.rollupFinalConfig.babelPluginOptions));
                }
                // Node resolve
                inputPlugins.push(nodeResolve());
                // Set plugins
                if ((_d = this.bldrConfig.rollupConfig) === null || _d === void 0 ? void 0 : _d.inputPlugins) {
                    // User added plugins
                    this.rollupFinalConfig.inputOptions.plugins = [...inputPlugins, ...this.bldrConfig.rollupConfig.inputPlugins];
                }
                else {
                    this.rollupFinalConfig.inputOptions.plugins = inputPlugins;
                }
            }
            // OUTPUT OPTIONS
            if ((_e = this.bldrConfig.rollupConfig) === null || _e === void 0 ? void 0 : _e.outputOptions) {
                this.rollupFinalConfig.outputOptions = Object.assign({}, this.bldrConfig.rollupConfig.outputOptions);
            }
            // OUTPUT PLUGINS
            if ((_f = this.bldrConfig.rollupConfig) === null || _f === void 0 ? void 0 : _f.overrideOutputPlugins) {
                // User overrides all plugins
                this.rollupFinalConfig.outputOptions.plugins = ((_g = this.bldrConfig.rollupConfig) === null || _g === void 0 ? void 0 : _g.outputPlugins) || [];
            }
            else {
                // Default plugins
                this.rollupFinalConfig.outputOptions.plugins = [];
            }
            if (!this.rollupFinalConfig.outputOptions.format) {
                this.rollupFinalConfig.outputOptions.format = 'es';
            }
        });
    }
}
//# sourceMappingURL=RollupProvider.js.map