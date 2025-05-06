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
var _Bldr_instances, _Bldr_commandSettings, _Bldr_settings, _Bldr_config, _Bldr_isDev, _Bldr_initialize;
import { BldrConfig } from "./BldrConfig.js";
import { BldrSettings } from "./BldrSettings.js";
import { ChokidarProvider } from "./providers/ChokidarProvider.js";
export class Bldr {
    constructor(commandSettings, isDev = false, isInit = false) {
        _Bldr_instances.add(this);
        _Bldr_commandSettings.set(this, void 0);
        _Bldr_settings.set(this, void 0);
        _Bldr_config.set(this, void 0);
        _Bldr_isDev.set(this, void 0);
        __classPrivateFieldSet(this, _Bldr_commandSettings, commandSettings, "f");
        __classPrivateFieldSet(this, _Bldr_settings, new BldrSettings(), "f");
        __classPrivateFieldSet(this, _Bldr_config, new BldrConfig(commandSettings, isDev), "f");
        __classPrivateFieldSet(this, _Bldr_isDev, isDev, "f");
        __classPrivateFieldGet(this, _Bldr_instances, "m", _Bldr_initialize).call(this);
    }
    dev() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Running in dev mode');
            const chok = new ChokidarProvider();
            yield chok.initialize();
        });
    }
    build() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Running in build mode');
        });
    }
}
_Bldr_commandSettings = new WeakMap(), _Bldr_settings = new WeakMap(), _Bldr_config = new WeakMap(), _Bldr_isDev = new WeakMap(), _Bldr_instances = new WeakSet(), _Bldr_initialize = function _Bldr_initialize() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        yield __classPrivateFieldGet(this, _Bldr_config, "f").initialize();
        if (__classPrivateFieldGet(this, _Bldr_config, "f").isSDC) {
            const SDC = yield import('./providers/SDCProvider.js');
            this.SDCProvider = new SDC.SDCProvider();
            yield this.SDCProvider.initialize();
        }
        if ((_a = __classPrivateFieldGet(this, _Bldr_config, "f").processAssetGroups) === null || _a === void 0 ? void 0 : _a.js) {
            if (__classPrivateFieldGet(this, _Bldr_config, "f").isDev) {
                const EsBuild = yield import('./providers/EsBuildProvider.js');
                this.EsBuildProvider = new EsBuild.EsBuildProvider();
                yield this.EsBuildProvider.initialize();
            }
            else {
                const Rollup = yield import('./providers/RollupProvider.js');
                this.RollupProvider = new Rollup.RollupProvider();
                yield this.RollupProvider.initialize();
            }
        }
        if ((_b = __classPrivateFieldGet(this, _Bldr_config, "f").processAssetGroups) === null || _b === void 0 ? void 0 : _b.postcss) {
            const Postcss = yield import('./providers/PostcssProvider.js');
            this.PostcssProvider = new Postcss.PostcssProvider();
            yield this.PostcssProvider.initialize();
        }
        if ((_c = __classPrivateFieldGet(this, _Bldr_config, "f").processAssetGroups) === null || _c === void 0 ? void 0 : _c.sass) {
            const Sass = yield import('./providers/SassProvider.js');
            this.SassProvider = new Sass.SassProvider();
            yield this.SassProvider.initialize();
        }
        // Initialize the Bldr instance with command settings
        console.log('Initializing Bldr');
        // console.log(JSON.stringify(this.#config, null, 4))
        if (__classPrivateFieldGet(this, _Bldr_isDev, "f")) {
            this.dev();
        }
        else {
            this.build();
        }
    });
};
//# sourceMappingURL=Bldr.js.map