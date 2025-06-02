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
import { logAction } from '../utils/loggers.js';
import { EslintProvider } from './EslintProvider.js';
import { StylelintProvider } from './StylelintProvider.js';
export class ChokidarProvider {
    constructor() {
        _ChokidarProvider_instances.add(this);
        /**
         * @property null|object
         * Chokidar instance
         */
        this.watcher = null;
        this.isSDCFile = false;
        this.Browsersync = new BrowsersyncProvider();
        this.bldrConfig = BldrConfig._instance;
        this.Postcss = PostcssProvider._instance;
        this.Sass = SassProvider._instance;
        this.EsBuild = EsBuildProvider._instance;
        this.EsLint = EslintProvider._instance;
        this.Stylelint = StylelintProvider._instance;
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
            this.watcher.on('ready', () => {
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
        var _a, _b, _c, _d, _e, _f;
        __classPrivateFieldGet(this, _ChokidarProvider_instances, "m", _ChokidarProvider_checkIsSDCFile).call(this, filepath);
        const ext = path.extname(filepath).replace('.', '');
        // Reload if extension is in the reloadExtensions array
        if (this.bldrConfig.reloadExtensions.includes(ext)) {
            this.Browsersync.reload();
            return;
        }
        // Ignore files that are SDC files but are not in the SDC asset subdirectory
        if (this.isSDCFile && !path.dirname(filepath).endsWith(this.bldrConfig.sdcAssetSubDirectory)) {
            return;
        }
        // Process css files
        if ((ext === 'css') || (ext === 'pcss')) {
            yield this.Stylelint.lintFile(filepath);
            if (this.isSDCFile && ((_a = this.bldrConfig.sdcProcessAssetGroups.css) === null || _a === void 0 ? void 0 : _a[filepath])) {
                yield this.Postcss.buildAssetGroup(this.bldrConfig.sdcProcessAssetGroups.css[filepath]);
                this.Browsersync.reloadCSS();
                return;
            }
            else if ((_b = this.bldrConfig.processAssetGroups.css) === null || _b === void 0 ? void 0 : _b[filepath]) {
                yield this.Postcss.buildProcessBundle();
                this.Browsersync.reloadCSS();
                return;
            }
            // logWarn('bldr', `No css file found for ${filepath}`);
            return;
        }
        // Process sass files
        if ((ext === 'sass' || ext === 'scss') && this.Sass) {
            yield this.Stylelint.lintFile(filepath);
            if (this.isSDCFile && ((_c = this.bldrConfig.sdcProcessAssetGroups.css) === null || _c === void 0 ? void 0 : _c[filepath])) {
                yield this.Sass.buildAssetGroup(this.bldrConfig.sdcProcessAssetGroups.css[filepath]);
                this.Browsersync.reloadCSS();
                return;
            }
            else if ((_d = this.bldrConfig.processAssetGroups.sass) === null || _d === void 0 ? void 0 : _d[filepath]) {
                yield this.Sass.buildProcessBundle();
                this.Browsersync.reloadCSS();
                return;
            }
            // logWarn('bldr', `No sass file found for ${filepath}`);
            return;
        }
        // Process js files
        if ((ext === 'js' || ext === 'ts') && this.EsBuild) {
            yield this.EsLint.lintFile(filepath);
            if (this.isSDCFile && ((_e = this.bldrConfig.sdcProcessAssetGroups.js) === null || _e === void 0 ? void 0 : _e[filepath])) {
                yield this.EsBuild.buildAssetGroup(this.bldrConfig.sdcProcessAssetGroups.js[filepath]);
                this.Browsersync.reloadJS();
                return;
            }
            else if ((_f = this.bldrConfig.processAssetGroups.js) === null || _f === void 0 ? void 0 : _f[filepath]) {
                yield this.EsBuild.buildProcessBundle();
                this.Browsersync.reloadJS();
                return;
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
    this.isSDCFile = false;
    for (const file of this.bldrConfig.sdcPaths) {
        if (__classPrivateFieldGet(this, _ChokidarProvider_instances, "m", _ChokidarProvider_isChildOfDir).call(this, filepath, file)) {
            this.isSDCFile = true;
            break;
        }
    }
    return this.isSDCFile;
}, _ChokidarProvider_isChildOfDir = function _ChokidarProvider_isChildOfDir(filepath, dir) {
    const relativePath = path.relative(dir, filepath);
    return (relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)) ? true : false;
};
//# sourceMappingURL=ChokidarProvider.js.map