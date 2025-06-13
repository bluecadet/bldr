var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { logSuccess, logError } from "../lib/utils/loggers.js";
import { handleBrowsersync, handleEsLint, handlePathPrompt, handleReloadExtensions, handleRollup, handleSDC, handleStylelint, handleWatchPaths } from "../lib/utils/createFilePrompts.js";
import path from "node:path";
import fs from "node:fs";
import Module from "node:module";
const require = Module.createRequire(import.meta.url);
import { prompt } from 'enquirer';
import colors from 'colors';
export default function init(commandOptions) {
    maybeCreateFiles();
}
const maybeCreateFiles = () => __awaiter(void 0, void 0, void 0, function* () {
    const configPath = path.join(process.cwd(), 'bldr.config.js');
    const localConfigPath = path.join(process.cwd(), 'bldr.local.config.js');
    if (fs.existsSync(configPath)) {
        logSuccess('bldr init', 'bldr.config.js already exists in this project.');
    }
    else {
        yield createBldrConfig();
    }
    if (fs.existsSync(localConfigPath)) {
        logSuccess('bldr init', 'bldr.local.config.js already exists in this project.');
    }
    else {
        yield createBldrLocalConfig();
    }
    logSuccess('bldr init', 'all done!');
});
/**
 * Creates a bldrConfigLocal.js file in the project root
 */
const createBldrLocalConfig = () => __awaiter(void 0, void 0, void 0, function* () {
    const askToCreate = yield prompt({
        type: 'confirm',
        name: 'local',
        message: `${colors.yellow('Would you like to create a bldr.local.config.js file?')}`
    });
    if (!askToCreate.local) {
        logSuccess('bldr init', 'a bldr.local.config.js file was not created');
        return;
    }
    const localPrompt = yield prompt([
        {
            type: 'input',
            name: 'port',
            message: `${colors.cyan('port number:')}`,
        },
        {
            type: 'input',
            name: 'proxyUrl',
            message: `${colors.cyan('proxy')} ${colors.dim('(local dev url)')}:`,
        }
    ]);
    const config = {
        browsersync: {}
    };
    if (localPrompt.port !== '') {
        config.browsersync.port = localPrompt.port;
    }
    if (localPrompt.proxyUrl !== '') {
        config.browsersync.proxy = localPrompt.proxyUrl;
    }
    const content = `import { bldrLocalConfig } from "@bluecadet/bldr";

export default bldrLocalConfig(${JSON.stringify(config, null, 2)})`;
    try {
        fs.writeFileSync(`${path.join(process.cwd(), 'bldr.local.config.js')}`, content, 'utf8');
        logSuccess('bldr init', 'bldr.local.config.js file created in project root.');
    }
    catch (err) {
        // Error if can't write file
        logError('bldr init', `error writing bldr.local.config.js file to ${process.cwd()}`);
    }
});
/**
 * Creates a bldrConfig.js file in the project root
 */
const createBldrConfig = () => __awaiter(void 0, void 0, void 0, function* () {
    const askToCreate = yield prompt({
        type: 'confirm',
        name: 'local',
        message: `${colors.yellow('Would you like to create a bldr.config.js file?')}`
    });
    if (!askToCreate.local) {
        logSuccess('bldr init', 'a bldr.config.js file was not created');
        return;
    }
    let config = {};
    config = yield handlePathPrompt('css', 'css', config);
    config = yield handlePathPrompt('js', 'js', config);
    config = yield handlePathPrompt('sass', 'sass/scss', config);
    config = yield handleWatchPaths(config);
    config = yield handleReloadExtensions(config);
    config = yield handleSDC(config);
    config = yield handleRollup(config);
    config = yield handleEsLint(config);
    config = yield handleStylelint(config);
    config = yield handleBrowsersync(config);
    const content = `import {bldrConfig} from '@bluecadet/bldr/config';

export default bldrConfig(${JSON.stringify(config, null, 2)})`;
    try {
        fs.writeFileSync(`${path.join(process.cwd(), 'bldr.config.js')}`, content, 'utf8');
        logSuccess('bldr init', 'bldr.config.js file created in project root.');
    }
    catch (err) {
        // Error if can't write file
        logError('bldr init', `error writing bldr.config.js file to ${process.cwd()}`);
    }
});
//# sourceMappingURL=init.js.map