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
var _Bldr_instances, _Bldr_initialize, _Bldr_dev, _Bldr_production, _Bldr_runOnce;
import { BldrConfig } from "./BldrConfig.js";
import { ChokidarProvider } from "./providers/ChokidarProvider.js";
import { PostcssProvider } from "./providers/PostcssProvider.js";
import { SassProvider } from "./providers/SassProvider.js";
import { EsBuildProvider } from "./providers/EsBuildProvider.js";
import { RollupProvider } from "./providers/RollupProvider.js";
import { logAction } from "./utils/loggers.js";
import { EslintProvider } from "./providers/EslintProvider.js";
import { StylelintProvider } from "./providers/StylelintProvider.js";
import { BiomeProvider } from "./providers/BiomeProvider.js";
export class Bldr {
    constructor(commandSettings, isDev = false) {
        _Bldr_instances.add(this);
        this.commandSettings = commandSettings;
        this.isDev = isDev;
        this.bldrConfig = new BldrConfig(commandSettings, isDev);
        this.EsBuildProvider = new EsBuildProvider();
        this.RollupProvider = new RollupProvider();
        this.PostcssProvider = new PostcssProvider();
        this.SassProvider = new SassProvider();
        this.EslintProvider = new EslintProvider();
        this.StylelintProvider = new StylelintProvider();
        this.BiomeProvider = new BiomeProvider();
        __classPrivateFieldGet(this, _Bldr_instances, "m", _Bldr_initialize).call(this);
    }
}
_Bldr_instances = new WeakSet(), _Bldr_initialize = function _Bldr_initialize() {
    return __awaiter(this, void 0, void 0, function* () {
        // Initialize the Bldr instance with command settings
        yield this.bldrConfig.initialize();
        yield Promise.all([
            this.EsBuildProvider.initialize(),
            this.RollupProvider.initialize(),
            this.PostcssProvider.initialize(),
            this.SassProvider.initialize(),
            this.EslintProvider.initialize(),
            this.StylelintProvider.initialize(),
            this.BiomeProvider.initialize(),
        ]);
        if (this.isDev) {
            yield __classPrivateFieldGet(this, _Bldr_instances, "m", _Bldr_dev).call(this);
        }
        else {
            yield __classPrivateFieldGet(this, _Bldr_instances, "m", _Bldr_production).call(this);
        }
    });
}, _Bldr_dev = function _Bldr_dev() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        if ((_a = this.bldrConfig) === null || _a === void 0 ? void 0 : _a.envKey) {
            logAction('bldr', `🐣 Starting dev using ${(_b = this.bldrConfig) === null || _b === void 0 ? void 0 : _b.envKey} env configuration...`);
        }
        else {
            logAction('bldr', '🐣 Starting dev...');
        }
        // The once command was sent, run dev build and bail
        if ((_c = this.commandSettings) === null || _c === void 0 ? void 0 : _c.once) {
            const processStart = new Date().getTime();
            logAction('bldr', '💪 Running single dev build...');
            yield __classPrivateFieldGet(this, _Bldr_instances, "m", _Bldr_runOnce).call(this);
            const processEnd = new Date().getTime();
            // All Done
            logAction('bldr', '✨ Build complete ✨', `${(processEnd - processStart) / 1000}`);
            return;
        }
        // The start command was sent, run dev build before proceeding
        if ((_d = this.commandSettings) === null || _d === void 0 ? void 0 : _d.start) {
            logAction('bldr', 'Running single dev build before starting server...');
            yield __classPrivateFieldGet(this, _Bldr_instances, "m", _Bldr_runOnce).call(this);
        }
        // Fire up chokidar
        const chok = new ChokidarProvider();
        yield chok.initialize();
    });
}, _Bldr_production = function _Bldr_production() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const processStart = new Date().getTime();
        console.log('');
        if ((_a = this.bldrConfig) === null || _a === void 0 ? void 0 : _a.envKey) {
            console.log('-'.repeat(process.stdout.columns));
            logAction('bldr', `💪 Starting production build using ${(_b = this.bldrConfig) === null || _b === void 0 ? void 0 : _b.envKey} env configuration...`);
            console.log('-'.repeat(process.stdout.columns));
        }
        else {
            console.log('-'.repeat(process.stdout.columns));
            logAction('bldr', '💪 Starting production build...');
            console.log('-'.repeat(process.stdout.columns));
        }
        console.log('');
        yield __classPrivateFieldGet(this, _Bldr_instances, "m", _Bldr_runOnce).call(this);
        const processEnd = new Date().getTime();
        // All Done
        logAction('bldr', '✨ Build complete ✨', `${(processEnd - processStart) / 1000}`);
    });
}, _Bldr_runOnce = function _Bldr_runOnce() {
    return __awaiter(this, void 0, void 0, function* () {
        // Lint the things
        yield Promise.all([
            this.EslintProvider.lintAll(),
        ]);
        // Build the things
        if (this.isDev) {
            yield Promise.all([
                this.PostcssProvider.buildProcessBundle(),
                this.SassProvider.buildProcessBundle(),
                this.EsBuildProvider.buildProcessBundle(),
            ]);
        }
        else {
            yield Promise.all([
                this.PostcssProvider.buildProcessBundle(),
                this.SassProvider.buildProcessBundle(),
                this.RollupProvider.buildProcessBundle(),
            ]);
        }
    });
};
//# sourceMappingURL=Bldr.js.map