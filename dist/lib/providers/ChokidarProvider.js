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
import { SDCProvider } from './SDCProvider.js';
import { EsBuildProvider } from './EsBuildProvider.js';
import { PostcssProvider } from './PostcssProvider.js';
import { SassProvider } from './SassProvider.js';
export class ChokidarProvider {
    constructor() {
        var _a, _b, _c;
        /**
         * @property null|object
         * Chokidar instance
         */
        this.watcher = null;
        this.SDC = null;
        this.EsBuild = null;
        this.Postcss = null;
        this.Sass = null;
        this.bldrConfig = BldrConfig._instance;
        if (this.bldrConfig.isSDC) {
            this.SDC = SDCProvider._instance;
        }
        if ((_a = this.bldrConfig.processAssetGroups) === null || _a === void 0 ? void 0 : _a.js) {
            this.EsBuild = EsBuildProvider._instance;
        }
        if ((_b = this.bldrConfig.processAssetGroups) === null || _b === void 0 ? void 0 : _b.css) {
            this.Postcss = PostcssProvider._instance;
        }
        if ((_c = this.bldrConfig.processAssetGroups) === null || _c === void 0 ? void 0 : _c.sass) {
            this.Sass = SassProvider._instance;
        }
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
                if (this.SDC && this.isChildOfDir(filepath, this.bldrConfig.sdcPath)) {
                    if (['css', 'sass', 'js', 'ts'].includes(ext)) {
                        console.log('TODO: SDC');
                        console.log(this.SDC.notice);
                        this.SDC.buildFile(filepath, ext);
                    }
                    return;
                }
                if ((ext === 'css') && this.Postcss) {
                    console.log(this.Postcss.notice);
                    console.log('TODO: CSS');
                    return;
                }
                if ((ext === 'sass' || ext === 'scss') && this.Sass) {
                    console.log(this.Sass.notice);
                    console.log('TODO: SASS');
                    return;
                }
                if ((ext === 'js' || ext === 'ts') && this.EsBuild) {
                    console.log(this.EsBuild.notice);
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
//# sourceMappingURL=ChokidarProvider.js.map