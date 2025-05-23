var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getConfigData } from '../lib/utils/getConfigData.js';
import { handleProcessAction, handleProcessWarn, handleProcessSuccess, } from '../utils/loggers.js';
import { settings } from '../settings/BldrConfig.js';
import { processSass } from '../providers/sass.js';
import { processPostcss } from '../providers/postcss.js';
import { processEsBuild } from '../providers/esBuild.js';
import { processImages } from '../lib/providers/images.js';
import { basename, extname } from 'node:path';
// import util from 'node:util';
import { createRequire } from 'node:module';
import { Processor__SDC } from '../lib/Processor__SDC.js';
const require = createRequire(import.meta.url);
const chokidar = require('chokidar');
export const RunBldrDev = (commandOptions) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const configData = yield getConfigData(commandOptions);
    const envKey = (_a = commandOptions.settings) === null || _a === void 0 ? void 0 : _a.key;
    const sassExts = ['.scss', '.sass'];
    const postCssExts = ['.css', '.pcss', '.postcss'];
    const jsExts = ['.js', '.jsx', '.cjs', '.mjs'];
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.svg', 'webp'];
    let bsInstance = false;
    let bsInstanceName = false;
    const isSDC = (_b = configData === null || configData === void 0 ? void 0 : configData.processes) === null || _b === void 0 ? void 0 : _b.singleDirectoryComponent;
    let SDC = false;
    if (isSDC) {
        SDC = new Processor__SDC();
        SDC.init();
        handleProcessAction('bldr', 'Single Directory Component structure active');
    }
    if ((_c = commandOptions.settings) === null || _c === void 0 ? void 0 : _c.once) {
        if (envKey) {
            handleProcessAction('bldr', `Running single dev build using ${envKey} env configuration...`);
        }
        else {
            handleProcessAction('bldr', 'Running single dev build...');
        }
        const processStart = new Date().getTime();
        yield processSass(configData);
        yield processPostcss(configData);
        yield processEsBuild(configData);
        yield processImages(configData);
        if (isSDC) {
            SDC.processFiles();
        }
        const processEnd = new Date().getTime();
        handleProcessAction('bldr', '✨ Dev processes complete ✨', `${(processEnd - processStart) / 1000}`);
        return;
    }
    if (envKey) {
        handleProcessAction('bldr', `Starting dev using ${envKey} env configuration...`);
    }
    else {
        handleProcessAction('bldr', 'Starting dev...');
    }
    // Run processes before starting local build
    if ((_d = commandOptions.settings) === null || _d === void 0 ? void 0 : _d.start) {
        handleProcessAction('bldr', 'Running initial processes...');
        yield processSass(configData, bsInstance);
        yield processPostcss(configData, bsInstance);
        yield processEsBuild(configData, bsInstance);
        yield processImages(configData, bsInstance);
        if (isSDC) {
            SDC.processFiles();
        }
    }
    // Handle a single file from Chokidar event
    const handleFile = (ext, file) => __awaiter(void 0, void 0, void 0, function* () {
        if (isSDC && SDC.isFile(file, ext)) {
            yield SDC.processFile(file);
            if (bsInstance) {
                if (sassExts.includes(ext) || postCssExts.includes(ext)) {
                    // bsInstance.stream({match: "**/*.css"});
                    bsInstance.reload(['*.css']);
                }
                if (jsExts.includes(ext)) {
                    bsInstance.reload(['*.js']);
                }
            }
        }
        else {
            if (sassExts.includes(ext)) {
                yield processSass(configData);
                if (bsInstance) {
                    // bsInstance.stream({match: "**/*.css"});
                    bsInstance.reload(['*.css']);
                }
            }
            if (postCssExts.includes(ext)) {
                yield processPostcss(configData);
                if (bsInstance) {
                    // bsInstance.stream({match: "**/*.css"});
                    bsInstance.reload(['*.css']);
                }
            }
            if (jsExts.includes(ext)) {
                if (isSDC && SDC.isFile(file, 'sass')) {
                    yield SDC.processFile(file);
                }
                else {
                    yield processEsBuild(configData);
                }
                if (bsInstance) {
                    bsInstance.reload(['*.js']);
                }
            }
            if (imageExts.includes(ext)) {
                yield processImages(configData);
                if (bsInstance) {
                    bsInstance.reload();
                }
            }
            if (configData.watch.reloadExts.includes(ext) && bsInstance) {
                bsInstance.reload();
                handleProcessSuccess('bldr', `${basename(file)} triggered reload`);
            }
        }
    });
    const handleChokidar = () => {
        // Chokidar watcher
        const watcher = chokidar.watch(configData.watch.files, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            persistent: true,
            ignoreInitial: true,
        });
        watcher
            .on('ready', () => {
            console.log(``);
            console.log(`-------------------------------------------`);
            handleProcessAction('bldr', '💪 Ready and waiting for changes!');
            console.log(`-------------------------------------------`);
            console.log(``);
        })
            .on('add', (filePath) => {
            handleFile(extname(filePath), filePath);
        })
            .on('change', (filePath) => {
            handleFile(extname(filePath), filePath);
        })
            .on('unlink', (filePath) => {
            handleFile(extname(filePath), filePath);
        });
    };
    // Create browsersync instance if appropriate
    if (!((_f = (_e = configData === null || configData === void 0 ? void 0 : configData.processSettings) === null || _e === void 0 ? void 0 : _e.browsersync) === null || _f === void 0 ? void 0 : _f.disable)) {
        if (!(configData === null || configData === void 0 ? void 0 : configData.local)) {
            handleProcessWarn('bldr', `Create a ${settings.localFilename} file in project root to configure browsersync`);
        }
        const bsLocalOpts = configData.local || {};
        const bsOptions = (bsLocalOpts === null || bsLocalOpts === void 0 ? void 0 : bsLocalOpts.browserSync)
            ? Object.assign({}, bsLocalOpts.browserSync) : {};
        bsInstanceName =
            (_h = (_g = bsLocalOpts === null || bsLocalOpts === void 0 ? void 0 : bsLocalOpts.browserSync) === null || _g === void 0 ? void 0 : _g.instanceName) !== null && _h !== void 0 ? _h : `bldr-${Math.floor(Math.random() * 1000)}`;
        bsInstance = yield require('browser-sync').create(bsInstanceName);
        // Bldr enforced options
        bsOptions.logPrefix = 'bldr';
        bsOptions.logFileChanges = false;
        bsInstance.init(bsOptions, () => {
            handleChokidar();
        });
    }
    else {
        if ((_k = (_j = configData === null || configData === void 0 ? void 0 : configData.processSettings) === null || _j === void 0 ? void 0 : _j.browsersync) === null || _k === void 0 ? void 0 : _k.disable) {
            handleProcessWarn('bldr', 'Browsersync is disabled in config');
        }
        handleChokidar();
    }
});
//# sourceMappingURL=dev.js.map