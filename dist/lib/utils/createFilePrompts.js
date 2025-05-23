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
            initial: true,
        },
    ]);
    if (basePrompt.use) {
        const pathPrompt = yield prompt([
            {
                type: 'input',
                name: `${processName}Src`,
                message: `${colors.cyan(`${processName} source path`)} ${colors.dim('(from root, can end with glob pattern)')}:`,
                initial: true,
            },
            {
                type: 'input',
                name: `${processName}Dest`,
                message: `${colors.cyan(`${processName} destination path`)} ${colors.dim('(from root, end in dir name)')}:`,
                initial: true,
            },
        ]);
        config[processName] = [
            {
                src: pathPrompt[`${processName}Src`],
                dest: pathPrompt[`${processName}Dest`],
            }
        ];
        if (processName === 'sass') {
            const sassPrompt = yield prompt([
                {
                    type: 'input',
                    name: `sassOpt`,
                    message: `${colors.cyan(`Use legacy api?`)}`,
                    initial: false,
                }
            ]);
            config.sassConfig = {
                useLegacy: sassPrompt.sassOpt
            };
        }
    }
    return config;
});
export const handleWatchPaths = (config) => __awaiter(void 0, void 0, void 0, function* () {
    const basePrompt = yield prompt([
        {
            type: 'confirm',
            name: 'use',
            message: `${colors.blue(`Add custom watch paths? (defaults to root directory)`)}`,
        },
    ]);
    if (basePrompt.use) {
        const pathPrompt = yield prompt([
            {
                type: 'input',
                name: `text`,
                message: `${colors.cyan(`enter a comma seperated list of directory paths`)} ${colors.dim('( from root, can end with glob pattern)')}:`,
            },
        ]);
        config['watchPaths'] = pathPrompt.text.split(',').map((str) => str.trim());
    }
    return config;
});
export const handleReloadExtensions = (config) => __awaiter(void 0, void 0, void 0, function* () {
    const basePrompt = yield prompt([
        {
            type: 'confirm',
            name: 'use',
            message: `${colors.blue(`Add custom reload extensions? (ie html, php, twig etc.)`)}`,
        },
    ]);
    if (basePrompt.use) {
        const pathPrompt = yield prompt([
            {
                type: 'input',
                name: `text`,
                message: `${colors.cyan(`enter a comma seperated list of extensions`)} ${colors.dim(`(extension name only without a dot, such as 'twig' or 'html')`)}:`,
            },
        ]);
        config['reloadExtensions'] = pathPrompt.text.split(',').map((str) => str.trim());
    }
    return config;
});
export const handleSDC = (config) => __awaiter(void 0, void 0, void 0, function* () {
    const basePrompt = yield prompt([
        {
            type: 'confirm',
            name: 'use',
            message: `${colors.blue(`Configure SDC?`)}`,
            initial: false,
        },
    ]);
    if (basePrompt.use) {
        const pathPrompt = yield prompt([
            {
                type: 'input',
                name: `directory`,
                message: `${colors.cyan(`path to SDC components from root`)}:`,
            },
            {
                type: 'input',
                name: `assetSubDirectory`,
                message: `${colors.cyan(`subdirectory name within an SDC component that contains raw assets`)} ${colors.dim(`(defaults to 'assets')`)}:`,
                initial: 'assets',
            },
            {
                type: 'confirm',
                name: 'bundle',
                message: `${colors.blue(`Bundle SDC js files with rollup?`)}`,
                initial: true,
            },
        ]);
        config['sdc'] = {
            directory: pathPrompt.directory,
            assetSubDirectory: pathPrompt.assetSubDirectory || 'assets',
        };
        if (pathPrompt.bundle) {
            if (!(config === null || config === void 0 ? void 0 : config.rollup)) {
                config.rollup = {};
            }
            if (!config.rollup.sdcOptions) {
                config.rollup.sdcOptions = {
                    bundle: pathPrompt.bundle,
                };
            }
            const rollupPrompt = yield prompt([
                {
                    type: 'confirm',
                    name: 'minify',
                    message: `${colors.blue(`Minify SDC js files with rollup?`)}`,
                    initial: true,
                },
                {
                    type: 'select',
                    name: 'format',
                    message: `${colors.blue(`Bundle SDC js files with rollup?`)}`,
                    choices: ['es', 'iife', 'amd', 'cjs', 'umd', 'system'],
                    initial: 'es',
                },
            ]);
            config.rollup.sdcOptions.minify = rollupPrompt.minify;
            config.rollup.sdcOptions.format = rollupPrompt.format;
        }
    }
    return config;
});
export const handleRollup = (config) => __awaiter(void 0, void 0, void 0, function* () {
    const basePrompt = yield prompt([
        {
            type: 'select',
            name: 'compiler',
            message: `${colors.blue(`Rollup Transpiler?`)}`,
            choices: ['babel', 'swc', 'none'],
            initial: 'babel',
        },
        {
            type: 'confirm',
            name: 'terser',
            message: `${colors.blue(`Minify with Terser?`)}`,
            initial: true,
        }
    ]);
    if (!(config === null || config === void 0 ? void 0 : config.rollup)) {
        config.rollup = {};
    }
    config.rollup.useBabel = basePrompt.compiler === 'babel' ? true : false;
    config.rollup.useSWC = basePrompt.compiler === 'swc' ? true : false;
    if (basePrompt.compiler === 'none') {
        config.rollup.useBabel = false;
        config.rollup.useSWC = false;
    }
    config.rollup.useTerser = basePrompt.terser;
    return config;
});
export const handleEsLint = (config) => __awaiter(void 0, void 0, void 0, function* () {
    const basePrompt = yield prompt([
        {
            type: 'confirm',
            name: 'use',
            message: `${colors.blue(`Use EsLint?`)}`,
            initial: true,
        },
    ]);
    if (basePrompt.use) {
        const pathPrompt = yield prompt([
            {
                type: 'confirm',
                name: `forceBuild`,
                message: `${colors.cyan(`force production build if eslint results in errors?`)}`,
                initial: true,
            },
        ]);
        config['eslint'] = {
            useEslint: true,
            forceBuildIfError: pathPrompt.forceBuild,
        };
    }
    else {
        config['eslint'] = {
            useEslint: false,
        };
    }
    return config;
});
export const handleStylelint = (config) => __awaiter(void 0, void 0, void 0, function* () {
    const basePrompt = yield prompt([
        {
            type: 'confirm',
            name: 'use',
            message: `${colors.blue(`Use StyleLint?`)}`,
            initial: true,
        },
    ]);
    if (basePrompt.use) {
        const pathPrompt = yield prompt([
            {
                type: 'confirm',
                name: `forceBuild`,
                message: `${colors.cyan(`force production build if eslint results in errors?`)}`,
                initial: true,
            },
        ]);
        config['stylelint'] = {
            useStyleLint: true,
            forceBuildIfError: pathPrompt.forceBuild,
        };
    }
    else {
        config['stylelint'] = {
            useStyleLint: false,
        };
    }
    return config;
});
export const handleBrowsersync = (config) => __awaiter(void 0, void 0, void 0, function* () {
    const basePrompt = yield prompt([
        {
            type: 'confirm',
            name: 'use',
            message: `${colors.blue(`Use browsersync?`)}`,
            initial: true,
        },
    ]);
    if (!basePrompt.use) {
        config['browsersync'] = {
            disable: true,
        };
    }
    return config;
});
//# sourceMappingURL=createFilePrompts.js.map