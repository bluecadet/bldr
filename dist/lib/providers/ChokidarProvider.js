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
var _ChokidarProvider_instances, _ChokidarProvider_changeFile, _ChokidarProvider_addFile, _ChokidarProvider_unlinkFile, _ChokidarProvider_checkIsSDCFile, _ChokidarProvider_isChildOfDir;
import chokidar from 'chokidar';
import { BldrConfig } from '../BldrConfig.js';
import path from 'node:path';
import { EsBuildProvider } from './EsBuildProvider.js';
import { PostcssProvider } from './PostcssProvider.js';
import { SassProvider } from './SassProvider.js';
import { BrowsersyncProvider } from './BrowsersyncProvider.js';
import { logAction, logGrayText } from '../utils/loggers.js';
import { EslintProvider } from './EslintProvider.js';
import { StylelintProvider } from './StylelintProvider.js';
import { BiomeProvider } from './BiomeProvider.js';
export class ChokidarProvider {
    constructor() {
        _ChokidarProvider_instances.add(this);
        /**
         * @property null|object
         * Chokidar instance
         */
        this.watcher = null;
        this.isSDCFile = false;
        this.SDCAssetDepBuildMessage = '[building sdc dependency assets]';
        this.SDCAssetDepDoneMessage = '[building sdc asset]';
        this.Browsersync = new BrowsersyncProvider();
        this.bldrConfig = BldrConfig._instance;
        this.Postcss = PostcssProvider._instance;
        this.Sass = SassProvider._instance;
        this.EsBuild = EsBuildProvider._instance;
        this.EsLint = EslintProvider._instance;
        this.Stylelint = StylelintProvider._instance;
        this.Biome = BiomeProvider._instance;
    }
    /**
     * @method initialize
     * @description Initializes the ChokidarProvider
     * @returns {Promise<void>}
     * @memberof ChokidarProvider
     */
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Browsersync.initialize();
            // Initialize the watcher
            this.watcher = chokidar.watch(this.bldrConfig.chokidarWatchArray, {
                ignored: (path) => {
                    if (path.endsWith('.map') || path.includes('node_modules')) {
                        return true;
                    }
                    // Ignore dest files
                    let isDestPath = false;
                    this.bldrConfig.chokidarIgnorePathsArray.forEach((destPath) => {
                        if (__classPrivateFieldGet(this, _ChokidarProvider_instances, "m", _ChokidarProvider_isChildOfDir).call(this, path, destPath)) {
                            isDestPath = true;
                        }
                    });
                    return isDestPath;
                },
                ignoreInitial: true,
            });
            this.watcher.once('ready', () => {
                console.log(``);
                console.log(`-------------------------------------------`);
                logAction('bldr', '💪 Ready and waiting for changes!');
                console.log(`-------------------------------------------`);
                console.log(``);
                this.Browsersync.bootstrap();
            });
            this.watcher.on('add', (filepath) => {
                __classPrivateFieldGet(this, _ChokidarProvider_instances, "m", _ChokidarProvider_addFile).call(this, filepath);
            });
            this.watcher.on('unlink', () => {
                __classPrivateFieldGet(this, _ChokidarProvider_instances, "m", _ChokidarProvider_unlinkFile).call(this);
            });
            this.watcher.on('change', (filepath) => {
                __classPrivateFieldGet(this, _ChokidarProvider_instances, "m", _ChokidarProvider_changeFile).call(this, filepath);
            });
        });
    }
}
_ChokidarProvider_instances = new WeakSet(), _ChokidarProvider_changeFile = function _ChokidarProvider_changeFile(filepath) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
        const ext = path.extname(filepath).replace('.', '');
        // Reload if extension is in the reloadExtensions array
        if (this.bldrConfig.reloadExtensions.includes(ext)) {
            this.Browsersync.reload();
            return;
        }
        __classPrivateFieldGet(this, _ChokidarProvider_instances, "m", _ChokidarProvider_checkIsSDCFile).call(this, filepath);
        // Ignore files that are SDC files but are not in the SDC asset subdirectory
        if (this.isSDCFile && !path.dirname(filepath).endsWith(this.bldrConfig.sdcAssetSubDirectory)) {
            return;
        }
        // Process css files
        if ((ext === 'css') || (ext === 'pcss')) {
            yield this.Stylelint.lintFile(filepath);
            if (this.isSDCFile && ((_a = this.bldrConfig.sdcProcessAssetGroups.css) === null || _a === void 0 ? void 0 : _a[filepath])) {
                if (((_c = (_b = this.bldrConfig) === null || _b === void 0 ? void 0 : _b.sdcAssetDependencies) === null || _c === void 0 ? void 0 : _c.css) || ((_e = (_d = this.bldrConfig) === null || _d === void 0 ? void 0 : _d.sdcAssetDependencies) === null || _e === void 0 ? void 0 : _e.sass)) {
                    logGrayText(this.SDCAssetDepBuildMessage);
                    if ((_g = (_f = this.bldrConfig) === null || _f === void 0 ? void 0 : _f.sdcAssetDependencies) === null || _g === void 0 ? void 0 : _g.css) {
                        for (const dep in this.bldrConfig.sdcAssetDependencies.css) {
                            yield this.Postcss.buildAssetGroup(this.bldrConfig.sdcAssetDependencies.css[dep]);
                        }
                    }
                    if ((_j = (_h = this.bldrConfig) === null || _h === void 0 ? void 0 : _h.sdcAssetDependencies) === null || _j === void 0 ? void 0 : _j.sass) {
                        for (const dep in this.bldrConfig.sdcAssetDependencies.sass) {
                            yield this.Postcss.buildAssetGroup(this.bldrConfig.sdcAssetDependencies.css[dep]);
                        }
                    }
                    logGrayText(this.SDCAssetDepDoneMessage);
                }
                yield this.Postcss.buildAssetGroup(this.bldrConfig.sdcProcessAssetGroups.css[filepath]);
            }
            else if ((_k = this.bldrConfig.processAssetGroups.css) === null || _k === void 0 ? void 0 : _k[filepath]) {
                yield this.Postcss.buildAssetGroup(this.bldrConfig.processAssetGroups.css[filepath]);
            }
            else {
                yield this.Postcss.buildProcessAssetGroupsBundle();
            }
            this.Browsersync.reloadCSS();
            return;
        }
        // Process sass files
        if ((ext === 'sass' || ext === 'scss') && this.Sass) {
            yield this.Stylelint.lintFile(filepath);
            if (this.isSDCFile && ((_l = this.bldrConfig.sdcProcessAssetGroups.sass) === null || _l === void 0 ? void 0 : _l[filepath])) {
                if (((_o = (_m = this.bldrConfig) === null || _m === void 0 ? void 0 : _m.sdcAssetDependencies) === null || _o === void 0 ? void 0 : _o.css) || ((_q = (_p = this.bldrConfig) === null || _p === void 0 ? void 0 : _p.sdcAssetDependencies) === null || _q === void 0 ? void 0 : _q.sass)) {
                    logGrayText(this.SDCAssetDepBuildMessage);
                    if ((_s = (_r = this.bldrConfig) === null || _r === void 0 ? void 0 : _r.sdcAssetDependencies) === null || _s === void 0 ? void 0 : _s.css) {
                        for (const dep in this.bldrConfig.sdcAssetDependencies.css) {
                            yield this.Postcss.buildAssetGroup(this.bldrConfig.sdcAssetDependencies.css[dep]);
                        }
                    }
                    if ((_u = (_t = this.bldrConfig) === null || _t === void 0 ? void 0 : _t.sdcAssetDependencies) === null || _u === void 0 ? void 0 : _u.sass) {
                        for (const dep in this.bldrConfig.sdcAssetDependencies.sass) {
                            yield this.Postcss.buildAssetGroup(this.bldrConfig.sdcAssetDependencies.css[dep]);
                        }
                    }
                    logGrayText(this.SDCAssetDepDoneMessage);
                }
                yield this.Sass.buildAssetGroup(this.bldrConfig.sdcProcessAssetGroups.sass[filepath]);
            }
            else if ((_v = this.bldrConfig.processAssetGroups.sass) === null || _v === void 0 ? void 0 : _v[filepath]) {
                yield this.Sass.buildProcessBundle();
            }
            else {
                yield this.Sass.buildProcessAssetGroupsBundle();
            }
            this.Browsersync.reloadCSS();
            return;
        }
        // Process js files
        if ((ext === 'js' || ext === 'ts') && this.EsBuild) {
            yield this.EsLint.lintFile(filepath);
            yield this.Biome.lintFile(filepath);
            if (this.isSDCFile && ((_w = this.bldrConfig.sdcProcessAssetGroups.js) === null || _w === void 0 ? void 0 : _w[filepath])) {
                if ((_y = (_x = this.bldrConfig) === null || _x === void 0 ? void 0 : _x.sdcAssetDependencies) === null || _y === void 0 ? void 0 : _y.js) {
                    logGrayText(this.SDCAssetDepBuildMessage);
                    for (const dep in this.bldrConfig.sdcAssetDependencies.js) {
                        yield this.EsBuild.buildAssetGroup(this.bldrConfig.sdcAssetDependencies.js[dep]);
                    }
                    logGrayText(this.SDCAssetDepDoneMessage);
                }
                yield this.EsBuild.buildAssetGroup(this.bldrConfig.sdcProcessAssetGroups.js[filepath]);
            }
            else if ((_z = this.bldrConfig.processAssetGroups.js) === null || _z === void 0 ? void 0 : _z[filepath]) {
                yield this.EsBuild.buildProcessBundle();
            }
            else {
                yield this.EsBuild.buildProcessAssetGroupsBundle();
            }
            this.Browsersync.reloadJS();
            return;
        }
        return;
    });
}, _ChokidarProvider_addFile = function _ChokidarProvider_addFile(filepath) {
    return __awaiter(this, void 0, void 0, function* () {
        yield this.bldrConfig.rebuildConfig();
        yield __classPrivateFieldGet(this, _ChokidarProvider_instances, "m", _ChokidarProvider_changeFile).call(this, filepath);
    });
}, _ChokidarProvider_unlinkFile = function _ChokidarProvider_unlinkFile() {
    return __awaiter(this, void 0, void 0, function* () {
        yield this.bldrConfig.rebuildConfig();
    });
}, _ChokidarProvider_checkIsSDCFile = function _ChokidarProvider_checkIsSDCFile(filepath) {
    var _a;
    this.isSDCFile = false;
    if ((_a = this.bldrConfig) === null || _a === void 0 ? void 0 : _a.sdcPaths) {
        for (const file of this.bldrConfig.sdcPaths) {
            if (__classPrivateFieldGet(this, _ChokidarProvider_instances, "m", _ChokidarProvider_isChildOfDir).call(this, filepath, file)) {
                this.isSDCFile = true;
                break;
            }
        }
    }
    return this.isSDCFile;
}, _ChokidarProvider_isChildOfDir = function _ChokidarProvider_isChildOfDir(filepath, dir) {
    const relativePath = path.relative(dir, filepath);
    return (relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)) ? true : false;
};
//# sourceMappingURL=ChokidarProvider.js.map