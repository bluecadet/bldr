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
import { logWarn } from '../utils/loggers.js';
export class SDCProvider {
    constructor() {
        if (SDCProvider._instance) {
            return SDCProvider._instance;
        }
        SDCProvider._instance = this;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.bldrConfig = BldrConfig._instance;
            this.notice = 'SDCProvider initialized';
        });
    }
    buildFile(filepath, type) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if ((_b = (_a = this.bldrConfig.sdcProcessAssetGroups) === null || _a === void 0 ? void 0 : _a[type]) === null || _b === void 0 ? void 0 : _b[filepath]) {
                console.log(this.bldrConfig.sdcProcessAssetGroups[type][filepath]);
            }
            else {
                logWarn(`SDC`, `No SDC process found for ${filepath}`);
            }
        });
    }
}
//# sourceMappingURL=SDCProvider.js.map