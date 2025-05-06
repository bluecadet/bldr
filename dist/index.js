#! /usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Command } from 'commander';
const handleDev = (commandOptions) => __awaiter(void 0, void 0, void 0, function* () {
    let run = yield import('./lib/commands/dev.js');
    run.default(commandOptions);
});
const handleBuild = (commandOptions) => __awaiter(void 0, void 0, void 0, function* () {
    let run = yield import('./lib/commands/build.js');
    run.default(commandOptions);
});
const handleInit = (commandOptions) => __awaiter(void 0, void 0, void 0, function* () {
    let run = yield import('./lib/commands/init.js');
    run.default(commandOptions);
});
const bldrCLI = new Command();
bldrCLI
    .description('Configurable build tool for css, sass, js and images')
    .option('-e, --env <name>', 'env key name from config')
    .option('-l, --lintOnly', 'only run linting processes');
bldrCLI
    .command('dev')
    .description('create a local dev environment with live reloading')
    .alias('watch')
    .option('-s, --start', 'run all `dev` processes before starting local enviornment')
    .option('-o, --once', 'run all `dev` processes once without starting local enviornment')
    .action((options, cmd) => {
    handleDev(cmd.optsWithGlobals());
});
bldrCLI
    .command('build')
    .description('create a production build')
    .action((options, cmd) => {
    handleBuild(cmd.optsWithGlobals());
});
bldrCLI
    .command('init')
    .description('create basic bldr config files')
    .action((commandOptions) => {
    handleInit(commandOptions);
});
bldrCLI.parse(process.argv);
const options = bldrCLI.opts();
//# sourceMappingURL=index.js.map