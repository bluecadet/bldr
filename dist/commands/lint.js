var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BldrConfig } from "../lib/BldrConfig.js";
import { EslintProvider } from "../lib/providers/EslintProvider.js";
import { StylelintProvider } from "../lib/providers/StylelintProvider.js";
import { logSuccess } from "../lib/utils/loggers.js";
export default function lint(commandOptions) {
    doLint(commandOptions);
}
const doLint = (commandOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const config = new BldrConfig(commandOptions, false);
    const eslintProvider = new EslintProvider();
    const stylelintProvider = new StylelintProvider();
    yield config.initialize();
    yield eslintProvider.initialize();
    yield stylelintProvider.initialize();
    yield eslintProvider.lintAll();
    yield stylelintProvider.lintAll();
    logSuccess('bldr', 'Linting complete');
});
//# sourceMappingURL=lint.js.map