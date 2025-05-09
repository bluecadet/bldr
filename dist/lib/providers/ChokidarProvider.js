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
var _ChokidarProvider_instances, _ChokidarProvider_changeFile, _ChokidarProvider_addFile, _ChokidarProvider_unlinkFile, _ChokidarProvider_getFileAsset, _ChokidarProvider_isChildOfDir;
import chokidar from 'chokidar';
import { BldrConfig } from '../BldrConfig.js';
import path from 'node:path';
import { SDCProvider } from './SDCProvider.js';
import { EsBuildProvider } from './EsBuildProvider.js';
import { PostcssProvider } from './PostcssProvider.js';
import { SassProvider } from './SassProvider.js';
import { BrowsersyncProvider } from './BrowsersyncProvider.js';
import { logAction, logWarn } from '../utils/loggers.js';
export class ChokidarProvider {
    constructor() {
        _ChokidarProvider_instances.add(this);
        /**
         * @property null|object
         * Chokidar instance
         */
        this.watcher = null;
        this.Browsersync = new BrowsersyncProvider();
        this.bldrConfig = BldrConfig._instance;
        this.SDC = SDCProvider._instance;
        this.Postcss = PostcssProvider._instance;
        this.Sass = SassProvider._instance;
        this.EsBuild = EsBuildProvider._instance;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Browsersync.initialize();
            // Initialize the watcher
            this.watcher = chokidar.watch(this.bldrConfig.chokidarWatchArray, {
                ignored: (path) => {
                    return path.endsWith('.map') || path.includes('node_modules') || path.includes('dist') || path.includes('build') || path.includes('out') || path.includes('coverage');
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
            this.watcher.on('unlink', (filepath) => {
                __classPrivateFieldGet(this, _ChokidarProvider_instances, "m", _ChokidarProvider_unlinkFile).call(this, filepath);
            });
            this.watcher.on('change', (filepath) => {
                __classPrivateFieldGet(this, _ChokidarProvider_instances, "m", _ChokidarProvider_changeFile).call(this, filepath);
            });
        });
    }
}
_ChokidarProvider_instances = new WeakSet(), _ChokidarProvider_changeFile = function _ChokidarProvider_changeFile(filepath) {
    const ext = path.extname(filepath).replace('.', '');
    console.log(ext);
    if (this.bldrConfig.reloadExtensions.includes(ext)) {
        console.log('TODO: RELOAD');
        return;
    }
    // if ( this.SDC && this.#isChildOfDir(filepath, this.bldrConfig.sdcPath)) {
    //   if ( ['css', 'sass', 'js', 'ts'].includes(ext) ) {
    //     console.log('TODO: SDC');
    //     console.log(this.SDC.notice);
    //     this.SDC.buildFile(filepath, ext as 'css' | 'sass' | 'js');
    //   }
    //   return;
    // }
    if ((ext === 'css')) {
        console.log(this.Postcss.notice);
        console.log('TODO: CSS');
        const fileAsset = __classPrivateFieldGet(this, _ChokidarProvider_instances, "m", _ChokidarProvider_getFileAsset).call(this, filepath, ext);
        if (fileAsset) {
            this.Postcss.buildAssetGroup(fileAsset);
            return;
        }
        logWarn('bldr', `No file found for ${filepath}`);
        return;
    }
    if ((ext === 'sass' || ext === 'scss') && this.Sass) {
        console.log(this.Sass.notice);
        console.log('TODO: SASS');
        return;
    }
    if ((ext === 'js' || ext === 'ts') && this.EsBuild) {
        console.log(this.EsBuild.notice);
        console.log('TODO: JS');
        return;
    }
    return;
}, _ChokidarProvider_addFile = function _ChokidarProvider_addFile(filepath) {
    if (this.bldrConfig.isSDC && filepath.includes(this.bldrConfig.sdcLocalPathTest)) {
        console.log('TODO: ADD SDC FILE');
    }
    else {
        console.log('TODO: ADD SOME OTHER FILE');
    }
}, _ChokidarProvider_unlinkFile = function _ChokidarProvider_unlinkFile(filepath) {
    if (this.bldrConfig.isSDC && filepath.includes(this.bldrConfig.sdcLocalPathTest)) {
        console.log('TODO: UNLINK SDC FILE');
    }
    else {
        console.log('TODO: UNLINK SOME OTHER FILE');
    }
}, _ChokidarProvider_getFileAsset = function _ChokidarProvider_getFileAsset(filepath, key) {
    var _a;
    let assetGroup = this.bldrConfig.processAssetGroups;
    if (this.SDC && __classPrivateFieldGet(this, _ChokidarProvider_instances, "m", _ChokidarProvider_isChildOfDir).call(this, filepath, this.bldrConfig.sdcPath)) {
        assetGroup = this.bldrConfig.sdcProcessAssetGroups;
    }
    if ((_a = assetGroup === null || assetGroup === void 0 ? void 0 : assetGroup[key]) === null || _a === void 0 ? void 0 : _a[filepath]) {
        return assetGroup[key][filepath];
    }
    return null;
}, _ChokidarProvider_isChildOfDir = function _ChokidarProvider_isChildOfDir(filepath, dir) {
    const relativePath = path.relative(dir, filepath);
    return (relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)) ? true : false;
};
//# sourceMappingURL=ChokidarProvider.js.map