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
var _BldrConfig_instances, _BldrConfig_fg, _BldrConfig_loadConfig, _BldrConfig_createProcessConfig, _BldrConfig_setProcessSrc, _BldrConfig_handleProcessGroup, _BldrConfig_createSrcDestObject, _BldrConfig_handleSDC, _BldrConfig_handleSDCType, _BldrConfig_buildProviderConfig, _BldrConfig_setEsBuildConfig, _BldrConfig_setRollupConfig, _BldrConfig_setEslintConfig, _BldrConfig_setStylelintConfig, _BldrConfig_setBiomeConfig, _BldrConfig_setSassConfig;
import { BldrSettings } from "./BldrSettings.js";
import path from "node:path";
import { logAction, logError, logWarn } from "./utils/loggers.js";
import { createRequire } from 'node:module';
export class BldrConfig {
    /**
     * @description BldrConfig constructor
     *
     * This class is a singleton and should only be instantiated once.
     * It is used to load the user config file and create the process asset config.
     * It also builds the provider config based on the user config.
     *
     * @param commandSettings {CommandSettings} options from the cli
     * @param isDev {boolean} if the command is run in dev mode
     *
     * @example
     * const bldrConfig = new BldrConfig(commandSettings);
     */
    constructor(commandSettings, isDev = false) {
        _BldrConfig_instances.add(this);
        /**
         * @property null|object
         * Local config
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
        this.chokidarIgnorePathsArray = [];
        /**
         * @property null|array
         * File extensions for chokidar to reload
         */
        this.reloadExtensions = [];
        /**
         * @property boolean
         * If Single Directory Component actions should be ran
         */
        this.isSDC = false;
        /**
         * @property null|object
         * Settings for single component directory processes
         */
        this.sdcProcessAssetGroups = {};
        /**
         * @property null|string
         * Environment key from CLI args
         */
        this.envKey = null;
        /**
         * @property null|object
         * User defined config for Sass processing
         */
        this.sassConfig = null;
        /**
         * @property null|object
         * User defined config for EsBuild processing
         */
        this.esBuildConfig = null;
        /**
         * @property null|object
         * User defined config for Rollup processing
         */
        this.rollupConfig = null;
        /**
         * @property null|object
         * User defined config for EsLint processing
         */
        this.eslintConfig = null;
        /**
         * @property null|object
         * User defined config for StyleLint processing
         */
        this.stylelintConfig = null;
        /**
         * @property null|object
         * User defined config for Biome processing
         */
        this.biomeConfig = null;
        /**
         * @property null|function
         * Fast-glob function
         */
        _BldrConfig_fg.set(this, null);
        if (BldrConfig._instance) {
            return BldrConfig._instance;
        }
        BldrConfig._instance = this;
        const require = createRequire(import.meta.url);
        this.bldrSettings = new BldrSettings();
        this.cliArgs = commandSettings;
        this.isDev = isDev;
        __classPrivateFieldSet(this, _BldrConfig_fg, require('fast-glob'), "f");
    }
    /**
     * @method initialize
     * @description Initialize the BldrConfig class
     * @returns {Promise<void>}
     */
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            // Get local user config
            yield __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_loadConfig).call(this);
            // Define process & asset config
            yield __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_createProcessConfig).call(this);
            // Define provider config
            yield __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_buildProviderConfig).call(this);
        });
    }
    /**
     * @method addFileToAssetGroup
     * @description add a file an asset group
     */
    addFileToAssetGroup(file_1, key_1) {
        return __awaiter(this, arguments, void 0, function* (file, key, isSDC = false, dest = null) {
            const group = isSDC ? this.sdcProcessAssetGroups : this.processAssetGroups;
            const localFile = file.replace(process.cwd() + '/', '');
            if (!(group === null || group === void 0 ? void 0 : group[key])) {
                group[key] = {};
            }
            if (!dest) {
                dest = path.dirname(file);
            }
            group[key][localFile] = __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_createSrcDestObject).call(this, file, dest);
        });
    }
    /**
     * @method rebuildConfig
     * @description Rebuild the configuration based on the user config file
     *
     * This method will reset the asset groups, reload the user config,
     * and rebuild the process and provider configurations.
     *
     * @returns {Promise<void>}
     */
    rebuildConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const start = Date.now();
            logAction('bldr', '...rebuilding configuration...');
            // Reset asset group config
            this.processAssetGroups = {};
            this.sdcProcessAssetGroups = {};
            // Get local user config
            yield __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_loadConfig).call(this);
            // Define process & asset config
            yield __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_createProcessConfig).call(this);
            const stop = Date.now();
            logAction('bldr', 'Configuration rebuild complete', ((stop - start) / 1000));
        });
    }
}
_BldrConfig_fg = new WeakMap(), _BldrConfig_instances = new WeakSet(), _BldrConfig_loadConfig = function _BldrConfig_loadConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        // Load bldr config file
        try {
            const config = yield import(this.bldrSettings.configFilePath);
            this.userConfig = config.default;
        }
        catch (error) {
            console.log(error);
            logError('bldr', `Missing required ${this.bldrSettings.configFileName} file`, { throwError: true, exit: true });
        }
        // Load Local User Config
        try {
            const localConfig = yield import(this.bldrSettings.localConfigFilePath);
            this.localConfig = localConfig.default;
        }
        catch (error) {
            if (this.isDev && !((_a = this.userConfig.browsersync) === null || _a === void 0 ? void 0 : _a.disable)) {
                logWarn('bldr', `Missing ${this.bldrSettings.localConfigFileName} file, using defaults`);
            }
            this.localConfig = null;
        }
    });
}, _BldrConfig_createProcessConfig = function _BldrConfig_createProcessConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        yield __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_setProcessSrc).call(this);
        yield Promise.all([
            __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_handleProcessGroup).call(this, 'css'),
            __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_handleProcessGroup).call(this, 'js'),
            __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_handleProcessGroup).call(this, 'sass'),
        ]);
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
        // Dedupe chokidar watch array
        this.chokidarWatchArray = this.chokidarWatchArray.filter((elem, pos) => this.chokidarWatchArray.indexOf(elem) == pos);
    });
}, _BldrConfig_setProcessSrc = function _BldrConfig_setProcessSrc() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        if ((_a = this.cliArgs) === null || _a === void 0 ? void 0 : _a.env) {
            if ((_c = (_b = this.userConfig) === null || _b === void 0 ? void 0 : _b.env) === null || _c === void 0 ? void 0 : _c[this.cliArgs.env]) {
                this.envKey = this.cliArgs.env;
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
                    this.chokidarIgnorePathsArray.push(path.resolve(p.dest));
                    this.addFileToAssetGroup(file, key, false, p.dest);
                }
            }
        });
    });
}, _BldrConfig_createSrcDestObject = function _BldrConfig_createSrcDestObject(src, dest) {
    return {
        src: src, //path.join(process.cwd(), src),
        dest: dest, // path.join(process.cwd(), dest),
    };
}, _BldrConfig_handleSDC = function _BldrConfig_handleSDC() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        if (!((_a = this.userConfig.sdc) === null || _a === void 0 ? void 0 : _a.directory)) {
            logError('BldrConfig', 'No directory key found for `sdc`', { throwError: true, exit: true });
            return;
        }
        this.sdcPaths = Array.isArray(this.userConfig.sdc.directory) ? this.userConfig.sdc.directory : [this.userConfig.sdc.directory];
        this.sdcAssetSubDirectory = ((_b = this.userConfig.sdc) === null || _b === void 0 ? void 0 : _b.assetSubDirectory) || 'assets';
        this.isSDC = true;
        for (const sdcDir of this.sdcPaths) {
            const sdcFilePath = path.join(process.cwd(), sdcDir);
            if ((_c = this.userConfig) === null || _c === void 0 ? void 0 : _c.watchPaths) {
                this.chokidarWatchArray.push(sdcDir);
            }
            yield Promise.all([
                __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_handleSDCType).call(this, 'css', 'css', sdcFilePath),
                __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_handleSDCType).call(this, 'pcss', 'css', sdcFilePath),
                __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_handleSDCType).call(this, 'sass', 'sass', sdcFilePath),
                __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_handleSDCType).call(this, 'scss', 'sass', sdcFilePath),
                __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_handleSDCType).call(this, 'js', 'js', sdcFilePath),
                __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_handleSDCType).call(this, 'ts', 'js', sdcFilePath),
            ]);
        }
    });
}, _BldrConfig_handleSDCType = function _BldrConfig_handleSDCType(ext, key, sdcDirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield __classPrivateFieldGet(this, _BldrConfig_fg, "f").sync([`${sdcDirPath}/**/**/${this.sdcAssetSubDirectory}/*.${ext}`]);
        if (files && files.length > 0) {
            for (const file of files) {
                let dest = path.normalize(path.join(path.dirname(file), '..'));
                this.addFileToAssetGroup(file, key, true, dest);
            }
        }
    });
}, _BldrConfig_buildProviderConfig = function _BldrConfig_buildProviderConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (((_a = this.processAssetGroups) === null || _a === void 0 ? void 0 : _a.js) || ((_b = this.sdcProcessAssetGroups) === null || _b === void 0 ? void 0 : _b.js)) {
            if (this.isDev) {
                yield __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_setEsBuildConfig).call(this);
            }
            else {
                yield __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_setRollupConfig).call(this);
            }
            yield __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_setEslintConfig).call(this);
        }
        if (((_c = this.processAssetGroups) === null || _c === void 0 ? void 0 : _c.sass) || ((_d = this.sdcProcessAssetGroups) === null || _d === void 0 ? void 0 : _d.sass)) {
            yield __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_setSassConfig).call(this);
        }
        if (((_e = this.processAssetGroups) === null || _e === void 0 ? void 0 : _e.css) || ((_f = this.sdcProcessAssetGroups) === null || _f === void 0 ? void 0 : _f.css) || ((_g = this.processAssetGroups) === null || _g === void 0 ? void 0 : _g.sass) || ((_h = this.sdcProcessAssetGroups) === null || _h === void 0 ? void 0 : _h.sass)) {
            yield __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_setStylelintConfig).call(this);
        }
        yield __classPrivateFieldGet(this, _BldrConfig_instances, "m", _BldrConfig_setBiomeConfig).call(this);
    });
}, _BldrConfig_setEsBuildConfig = function _BldrConfig_setEsBuildConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        // EsBuild Config
        this.esBuildConfig = {
            plugins: [],
            overridePlugins: false,
        };
        if ((_a = this.userConfig) === null || _a === void 0 ? void 0 : _a.esBuild) {
            this.esBuildConfig = Object.assign(Object.assign({}, this.esBuildConfig), this.userConfig.esBuild);
        }
    });
}, _BldrConfig_setRollupConfig = function _BldrConfig_setRollupConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        this.rollupConfig = {
            useBabel: true,
            babelPluginOptions: { babelHelpers: 'bundled' },
            useSWC: false,
            swcPluginOptions: null,
            useTerser: true,
            terserOptions: {},
            inputOptions: null,
            inputPlugins: null,
            overrideInputPlugins: false,
            outputOptions: { format: 'iife', },
            outputPlugins: null,
            overrideOutputPlugins: false,
            sdcOptions: {
                minify: true,
                bundle: true,
                format: 'es',
            },
        };
        if ((_a = this.userConfig) === null || _a === void 0 ? void 0 : _a.rollup) {
            this.rollupConfig = Object.assign(Object.assign({}, this.rollupConfig), this.userConfig.rollup);
        }
    });
}, _BldrConfig_setEslintConfig = function _BldrConfig_setEslintConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        this.eslintConfig = {
            useEslint: true,
            options: {},
            forceBuildIfError: true,
        };
        if ((_a = this.userConfig) === null || _a === void 0 ? void 0 : _a.eslint) {
            this.eslintConfig = Object.assign(Object.assign({}, this.eslintConfig), this.userConfig.eslint);
        }
    });
}, _BldrConfig_setStylelintConfig = function _BldrConfig_setStylelintConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        this.stylelintConfig = {
            useStyleLint: true,
            forceBuildIfError: true,
        };
        if ((_a = this.userConfig) === null || _a === void 0 ? void 0 : _a.stylelint) {
            this.stylelintConfig = Object.assign(Object.assign({}, this.stylelintConfig), this.userConfig.stylelint);
        }
    });
}, _BldrConfig_setBiomeConfig = function _BldrConfig_setBiomeConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        this.biomeConfig = {
            useBiome: false,
            forceBuildIfError: true,
            ignorePaths: [],
            writeLogfile: false,
            logFilePath: 'biome.log.html',
        };
        if ((_a = this.userConfig) === null || _a === void 0 ? void 0 : _a.biome) {
            this.biomeConfig = Object.assign(Object.assign({}, this.biomeConfig), this.userConfig.biome);
        }
        if (this.biomeConfig.useBiome) {
            if ((_b = this.eslintConfig) === null || _b === void 0 ? void 0 : _b.useEslint) {
                this.eslintConfig.useEslint = false;
            }
            if ((_c = this.stylelintConfig) === null || _c === void 0 ? void 0 : _c.useStyleLint) {
                this.stylelintConfig.useStyleLint = false;
            }
        }
    });
}, _BldrConfig_setSassConfig = function _BldrConfig_setSassConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        this.sassConfig = {
            useLegacy: false,
        };
        if ((_a = this.userConfig) === null || _a === void 0 ? void 0 : _a.sassConfig) {
            this.sassConfig = Object.assign(Object.assign({}, this.sassConfig), this.userConfig.sassConfig);
        }
    });
};
//# sourceMappingURL=BldrConfig.js.map