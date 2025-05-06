var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _BldrConfig_instances, _BldrConfig_fg, _BldrConfig_loadConfig, _BldrConfig_buildProcessConfig, _BldrConfig_setProcessSrc, _BldrConfig_handleProcessGroup, _BldrConfig_handleSDC, _BldrConfig_handleSDCType, _BldrConfig_buildProviderConfig;
import { BldrSettings } from "./BldrSettings.js";
import * as path from "path";
import { logError, logWarn } from "./utils/loggers.js";
import { createRequire } from 'node:module';
import { unglobPath } from "./utils/unglobPath.js";
export class BldrConfig {
    /**
     * @param commandSettings {CommandSettings} options from the cli
     * @param isDev {boolean} if the command is run in dev mode
     */
    constructor(commandSettings, isDev = false) {
        _BldrConfig_instances.add(this);
        /**
         * @property null|object
         * Config from projects bldrConfigLocal.js
         */
        this.localConfig = null;
        /**
         * @property null|object
         * Settings for processes
         */
        this.processAssetGroups = {};
        /**
         * @property null|array
         * Files for chokidar to watch
         */
        this.chokidarWatchArray = [];
        /**
         * @property null|array
         * Files for chokidar to watch
         */
        this.watchAssetArray = [];
        /**
         * @property null|array
         * Files for chokidar to watch
         */
        this.reloadExtensions = [];
        /**
         * @property null|object
         * Src/Dest/Watch for each process
         */
        this.sdcProcessAssetGroups = {};
        /**
         * @property null|function
         * Fast-glob function
         */
        _BldrConfig_fg.set(this, null);
        /**
         * @property boolean
         * If Single Directory Component actions should be ran
         */
        this.isSDC = false;
        /**
         * @property null|object
         * Settings for Single Directory Component actions
         */
        this.sdcConfig = null;
        if (BldrConfig._instance) {
            return BldrConfig._instance;
        }
        BldrConfig._instance = this;
        this.bldrSettings = new BldrSettings();
        this.cliArgs = commandSettings;
        this.isDev = isDev;
        const require = createRequire(import.meta.url);
        __classPrivateFieldSet(this, _BldrConfig_fg, require('fast-glob'), "f");
    }
    getInstance() {
        if (BldrConfig._instance) {
            return BldrConfig._instance;
        }
        else {
            throw new Error("BldrConfig instance not initialized");
        }
    }
    /**
     * @description Initialize the config class
     */
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            // Get local user config
            yield __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_loadConfig).call(this);
            // Define process & asset config
            yield __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_buildProcessConfig).call(this);
            // Define provider config
            yield __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_buildProviderConfig).call(this);
        });
    }
    /**
     * @method addProcessAsset
     * @description Add a file to the process asset groups
     */
    addProcessAsset(file, dest, key) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!((_a = this.processAssetGroups) === null || _a === void 0 ? void 0 : _a[key])) {
                this.processAssetGroups[key] = {};
            }
            const localFile = file.replace(process.cwd() + '/', '');
            this.processAssetGroups[key][localFile] = this.createSrcDestObject(localFile, dest);
        });
    }
    /**
     * @description Create a src/dest object for a file to be processed
     */
    createSrcDestObject(src, dest) {
        return {
            src: src, //path.join(process.cwd(), src),
            dest: dest, // path.join(process.cwd(), dest),
        };
    }
    /**
     * @method addChokidarWatchFile
     * @description add a file to the watch path array
     */
    addChokidarWatchFile(watchPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const unglobbedPath = unglobPath(watchPath);
            if (!this.chokidarWatchArray.includes(unglobbedPath)) {
                this.chokidarWatchArray.push(unglobbedPath);
            }
        });
    }
    /**
     * @method addSDCAsset
     * @description Add a file to the sdc process asset groups
     */
    addSDCAsset(file, key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.sdcProcessAssetGroups[key]) {
                this.sdcProcessAssetGroups[key] = {};
            }
            const localFile = file.replace(process.cwd() + '/', '');
            const dest = path.dirname(localFile);
            this.sdcProcessAssetGroups[key][localFile] = this.createSrcDestObject(localFile, dest);
        });
    }
}
_BldrConfig_fg = new WeakMap(), _BldrConfig_instances = new WeakSet(), _BldrConfig_loadConfig = function _BldrConfig_loadConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        // Load User Config
        const configFile = path.join(process.cwd(), this.bldrSettings.configFileName);
        try {
            const config = yield import(configFile);
            this.userConfig = config.default;
        }
        catch (error) {
            console.log(error);
            process.exit(1);
        }
        // Load Local User Config
        const localConfigFile = path.join(process.cwd(), this.bldrSettings.localConfigFileName);
        try {
            const config = yield import(localConfigFile);
            this.localConfig = config.default;
        }
        catch (error) {
            if (this.isDev && !((_a = this.userConfig.browsersync) === null || _a === void 0 ? void 0 : _a.disable)) {
                logWarn('browsersync', `Missing ${this.bldrSettings.configFileName} file, using defaults`);
            }
            this.localConfig = null;
        }
    });
}, _BldrConfig_buildProcessConfig = function _BldrConfig_buildProcessConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        yield __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_setProcessSrc).call(this);
        yield __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_handleProcessGroup).call(this, 'css');
        yield __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_handleProcessGroup).call(this, 'js');
        yield __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_handleProcessGroup).call(this, 'sass');
        if ((_a = this.userConfig) === null || _a === void 0 ? void 0 : _a.sdc) {
            yield __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_handleSDC).call(this);
        }
        if ((_b = this.userConfig) === null || _b === void 0 ? void 0 : _b.reloadExtensions) {
            this.reloadExtensions = this.userConfig.reloadExtensions;
        }
        if ((_c = this.userConfig) === null || _c === void 0 ? void 0 : _c.watchPaths) {
            this.chokidarWatchArray = [...this.chokidarWatchArray, ...this.userConfig.watchPaths];
        }
        else {
            this.chokidarWatchArray.push('.');
        }
        // Dedup chokidar watch array
        this.chokidarWatchArray = this.chokidarWatchArray.filter((elem, pos) => this.chokidarWatchArray.indexOf(elem) == pos);
    });
}, _BldrConfig_setProcessSrc = function _BldrConfig_setProcessSrc() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        if ((_a = this.cliArgs) === null || _a === void 0 ? void 0 : _a.env) {
            if ((_c = (_b = this.userConfig) === null || _b === void 0 ? void 0 : _b.env) === null || _c === void 0 ? void 0 : _c[this.cliArgs.env]) {
                this.processSrc = this.userConfig.env[this.cliArgs.env];
            }
            else {
                logError('BldrConfig', `No env found for ${this.cliArgs.env}`, { throwError: true, exit: true });
            }
        }
        else {
            this.processSrc = this.userConfig;
        }
    });
}, _BldrConfig_handleProcessGroup = function _BldrConfig_handleProcessGroup(key) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!((_a = this.processSrc) === null || _a === void 0 ? void 0 : _a[key])) {
            return;
        }
        this.processSrc[key].forEach((p) => {
            const files = __classPrivateFieldGet(this, _BldrConfig_fg, "f").sync([`${path.join(process.cwd(), p.src)}`]);
            if (files && files.length > 0) {
                for (const file of files) {
                    this.addProcessAsset(file, p.dest, key);
                }
            }
            // if ( p.watch ) {
            //   p.watch.forEach((w: string) => {
            //     this.addChokidarWatchFile(w);
            //   });
            // }
        });
    });
}, _BldrConfig_handleSDC = function _BldrConfig_handleSDC() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        if (!((_a = this.userConfig.sdc) === null || _a === void 0 ? void 0 : _a.directory)) {
            logError('BldrConfig', 'No directory key found for `sdc`', { throwError: true, exit: true });
            return;
        }
        this.extPrefix = ((_b = this.userConfig.sdc) === null || _b === void 0 ? void 0 : _b.fileExtensionPrefix) || '.bldr';
        this.sdcPath = path.join(process.cwd(), this.userConfig.sdc.directory);
        this.sdcLocalPath = this.userConfig.sdc.directory;
        this.isSDC = true;
        if ((_c = this.userConfig) === null || _c === void 0 ? void 0 : _c.watchPaths) {
            this.chokidarWatchArray.push(this.sdcLocalPath);
        }
        Promise.all([
            __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_handleSDCType).call(this, 'css', 'css'),
            __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_handleSDCType).call(this, 'sass', 'sass'),
            __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_handleSDCType).call(this, 'scss', 'sass'),
            __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_handleSDCType).call(this, 'js', 'js'),
            __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_handleSDCType).call(this, 'ts', 'js'),
        ]);
    });
}, _BldrConfig_handleSDCType = function _BldrConfig_handleSDCType(ext, key) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield __classPrivateFieldGet(this, _BldrConfig_fg, "f").sync([`${this.sdcPath}/**/*${this.extPrefix}.${ext}`]);
        if (files && files.length > 0) {
            for (const file of files) {
                yield this.addSDCAsset(file, key);
            }
        }
    });
}, _BldrConfig_buildProviderConfig = function _BldrConfig_buildProviderConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        if (((_a = this.processAssetGroups) === null || _a === void 0 ? void 0 : _a.css) || ((_b = this.sdcProcessAssetGroups) === null || _b === void 0 ? void 0 : _b.css)) {
            console.log('TODO: postcss');
        }
        if (((_c = this.processAssetGroups) === null || _c === void 0 ? void 0 : _c.js) || ((_d = this.sdcProcessAssetGroups) === null || _d === void 0 ? void 0 : _d.js)) {
            if (this.isDev) {
                console.log('TODO: esBuild');
            }
            else {
                console.log('TODO: rollup');
            }
        }
        if (((_e = this.processAssetGroups) === null || _e === void 0 ? void 0 : _e.sass) || ((_f = this.sdcProcessAssetGroups) === null || _f === void 0 ? void 0 : _f.sass)) {
            console.log('TODO: sass');
        }
        // if ( this.userConfig?.env?.[this.cliArgs.env]?.sdc ) {
        //   this.sdcConfig = this.userConfig.env[this.cliArgs.env].sdc;
        // }
    });
};
//# sourceMappingURL=BldrConfig.js.map