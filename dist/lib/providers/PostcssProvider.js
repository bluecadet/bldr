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
export class PostcssProvider {
    constructor() {
        if (PostcssProvider._instance) {
            return PostcssProvider._instance;
        }
        PostcssProvider._instance = this;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.bldrConfig = BldrConfig._instance;
            this.notice = 'PostcssProvider initialized';
        });
    }
    buildFile(filepath) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            if ((_b = (_a = this.bldrConfig.processAssetGroups) === null || _a === void 0 ? void 0 : _a.css) === null || _b === void 0 ? void 0 : _b[filepath]) {
                console.log((_d = (_c = this.bldrConfig.processAssetGroups) === null || _c === void 0 ? void 0 : _c.css) === null || _d === void 0 ? void 0 : _d[filepath]);
            }
            else {
                console.warn(`Postcss`, `No css process found for ${filepath}`);
            }
        });
    }
    buildAssetGroup(assetGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(assetGroup);
        });
    }
}
//# sourceMappingURL=PostcssProvider.js.map