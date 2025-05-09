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
import { createRequire } from 'node:module';
export class BrowsersyncProvider {
    constructor() {
        this.browsersyncInstance = null;
        if (BrowsersyncProvider._instance) {
            return BrowsersyncProvider._instance;
        }
        BrowsersyncProvider._instance = this;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            this.bldrConfig = BldrConfig._instance;
            if ((_b = (_a = this.bldrConfig.userConfig) === null || _a === void 0 ? void 0 : _a.browsersync) === null || _b === void 0 ? void 0 : _b.disable) {
                return;
            }
            const require = createRequire(import.meta.url);
            const bsName = ((_d = (_c = this.bldrConfig.userConfig) === null || _c === void 0 ? void 0 : _c.browsersync) === null || _d === void 0 ? void 0 : _d.instanceName) || `bldr-${Math.floor(Math.random() * 1000)}`;
            this.browsersyncInstance = require('browser-sync').create(bsName);
            this.notice = 'BrowsersyncProvider initialized';
        });
    }
    bootstrap() {
        var _a, _b, _c, _d;
        if ((_b = (_a = this.bldrConfig.userConfig) === null || _a === void 0 ? void 0 : _a.browsersync) === null || _b === void 0 ? void 0 : _b.disable)
            return;
        let bsOptions = {
            logPrefix: 'bldr',
            logFileChanges: false,
        };
        if ((_d = (_c = this.bldrConfig) === null || _c === void 0 ? void 0 : _c.localConfig) === null || _d === void 0 ? void 0 : _d.browserSync) {
            bsOptions = Object.assign(Object.assign({}, this.bldrConfig.localConfig.browserSync), bsOptions);
        }
        this.browsersyncInstance.init(bsOptions);
    }
    reloadJS() {
        var _a, _b;
        if ((_b = (_a = this.bldrConfig.userConfig) === null || _a === void 0 ? void 0 : _a.browsersync) === null || _b === void 0 ? void 0 : _b.disable)
            return;
        this.browsersyncInstance.reload(['*.js']);
    }
    reloadCSS() {
        var _a, _b;
        if ((_b = (_a = this.bldrConfig.userConfig) === null || _a === void 0 ? void 0 : _a.browsersync) === null || _b === void 0 ? void 0 : _b.disable)
            return;
        this.browsersyncInstance.reload(['*.css']);
    }
}
//# sourceMappingURL=BrowsersyncProvider.js.map