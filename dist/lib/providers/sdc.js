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
export class SDC {
    constructor() {
        if (SDC._instance) {
            return SDC._instance;
        }
        SDC._instance = this;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.bldrConfig = BldrConfig._instance;
            this.notice = 'SDC initialized';
        });
    }
}
//# sourceMappingURL=sdc.js.map