var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import chokidar from 'chokidar';
import { BldrConfig } from '../BldrConfig.js';
import path from 'node:path';
import { SDC } from './sdc.js';
export class Chokidar {
    constructor() {
        /**
         * @property null|object
         * Chokidar instance
         */
        this.watcher = null;
        this.bldrConfig = BldrConfig._instance;
        this.SDC = SDC._instance;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            // Initialize the watcher
            this.watcher = chokidar.watch(this.bldrConfig.chokidarWatchArray, {
                ignored: (path) => {
                    return path.endsWith('.map') || path.includes('node_modules') || path.includes('dist') || path.includes('build') || path.includes('out') || path.includes('coverage');
                }
            });
            this.watcher.on('change', (filepath) => {
                let hasRan = false;
                const ext = path.extname(filepath).replace('.', '');
                if (this.bldrConfig.reloadExtensions.includes(ext)) {
                    console.log('TODO: RELOAD');
                    return;
                }
                if (this.bldrConfig.isSDC && this.isChildOfDir(filepath, this.bldrConfig.sdcPath)) {
                    console.log('TODO: SDC');
                    console.log(this.SDC.notice);
                    return;
                }
                if (ext === 'css') {
                    console.log('TODO: CSS');
                    return;
                }
                if (ext === 'sass' || ext === 'scss') {
                    console.log('TODO: SASS');
                    return;
                }
                if (ext === 'js' || ext === 'ts') {
                    console.log('TODO: JS');
                    return;
                }
                return;
            });
        });
    }
    isChildOfDir(filepath, dir) {
        const relativePath = path.relative(dir, filepath);
        return (relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)) ? true : false;
    }
}
//# sourceMappingURL=chokidar.js.map