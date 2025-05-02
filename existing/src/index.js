#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bldrConfig = bldrConfig;
const commander_1 = require("commander");
const dev_js_1 = require("./commands/dev.js");
const build_js_1 = require("./commands/build.js");
const init_js_1 = require("./commands/init.js");
const Bldr_Settings_js_1 = require("./lib/Bldr_Settings.js");
const Bldr_Config_js_1 = require("./lib/Bldr_Config.js");
const bldrCLI = new commander_1.Command();
function bldrConfig(config) {
    return config;
}
const commandSettings = {
    bldrEnv: '',
    settings: {},
};
const handleInitialization = (commandSettings) => __awaiter(void 0, void 0, void 0, function* () {
    new Bldr_Settings_js_1.Bldr_Settings();
    const CONFIG = new Bldr_Config_js_1.Bldr_Config;
    yield CONFIG.initialize(commandSettings);
});
const handleDev = (commandSettings) => __awaiter(void 0, void 0, void 0, function* () {
    yield handleInitialization(commandSettings);
    yield (0, dev_js_1.RunBldrDev)(commandSettings);
});
const handleBuild = (commandSettings) => __awaiter(void 0, void 0, void 0, function* () {
    yield handleInitialization(commandSettings);
    yield (0, build_js_1.RunBldrBuild)(commandSettings);
});
const handleInit = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, init_js_1.RunInit)();
});
const handleCommands = () => {
    bldrCLI
        .description('Configurable build tool for css, sass, js and images')
        .option('-e, --env <name>', 'env key name from config');
    // .configureHelp({
    //   showGlobalOptions: true,
    // });
    bldrCLI
        .command('dev')
        .description('create a local dev environment with live reloading')
        .alias('watch')
        .option('-s, --start', 'run all `dev` processes before starting local enviornment')
        .option('-o, --once', 'run all `dev` processes once without starting local enviornment')
        .action((options) => {
        console.log('HELLO');
        // commandSettings.bldrEnv = 'dev';
        // commandSettings.settings = {
        //   ...{ watch: true },
        //   ...options,
        //   ...bldrCLI.opts(),
        // };
        // handleDev(commandSettings);
    });
    bldrCLI
        .command('build')
        .description('create a production build')
        .action((options) => {
        commandSettings.bldrEnv = 'build';
        commandSettings.settings = Object.assign(Object.assign({ watch: false }, options), bldrCLI.opts());
        handleBuild(commandSettings);
    });
    bldrCLI
        .command('init')
        .description('create basic bldr config files')
        .action(() => {
        handleInit();
    });
    bldrCLI.parse(process.argv);
};
handleCommands();
//# sourceMappingURL=index.js.map