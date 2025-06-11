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
import { BiomeProvider } from "../lib/providers/BiomeProvider.js";
import { logSuccess } from "../lib/utils/loggers.js";
export default function lint(commandOptions) {
    doLint(commandOptions);
}
const doLint = (commandOptions) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const config = new BldrConfig(commandOptions, false);
    yield config.initialize();
    if ((_a = config === null || config === void 0 ? void 0 : config.biomeConfig) === null || _a === void 0 ? void 0 : _a.useBiome) {
        const biomeProvider = new BiomeProvider();
        yield biomeProvider.initialize();
        yield biomeProvider.lintAll();
        logSuccess('bldr', 'Linting complete with Biome');
        process.exit(0);
    }
    else {
        const stylelintProvider = new StylelintProvider();
        if ((_b = config === null || config === void 0 ? void 0 : config.eslintConfig) === null || _b === void 0 ? void 0 : _b.useEslint) {
            const eslintProvider = new EslintProvider();
            yield eslintProvider.initialize();
            yield eslintProvider.lintAll();
        }
        if ((_c = config === null || config === void 0 ? void 0 : config.stylelintConfig) === null || _c === void 0 ? void 0 : _c.useStyleLint) {
            yield stylelintProvider.initialize();
            yield stylelintProvider.lintAll();
        }
        logSuccess('bldr', 'Linting complete');
        process.exit(0);
    }
});
//# sourceMappingURL=lint.js.map