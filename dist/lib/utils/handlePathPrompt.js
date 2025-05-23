var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Module from "node:module";
const require = Module.createRequire(import.meta.url);
const { prompt } = require('enquirer');
const colors = require('colors');
export const handlePathPrompt = (processName, ext, config) => __awaiter(void 0, void 0, void 0, function* () {
    const basePrompt = yield prompt([
        {
            type: 'confirm',
            name: 'use',
            message: `${colors.blue(`Want to process ${ext} files?`)}`,
        },
    ]);
    if (basePrompt.use) {
        const pathPrompt = yield prompt([
            {
                type: 'input',
                name: `${processName}Src`,
                message: `${colors.cyan(`${processName} source path`)} ${colors.dim('(from root, can end with glob pattern)')}:`,
            },
            {
                type: 'input',
                name: `${processName}Dest`,
                message: `${colors.cyan(`${processName} destination path`)} ${colors.dim('(from root, end in dir name)')}:`,
            },
        ]);
        config[processName] = [
            {
                src: pathPrompt[`${processName}Src`],
                dest: pathPrompt[`${processName}Dest`],
            }
        ];
    }
    return config;
});
//# sourceMappingURL=handlePathPrompt.js.map