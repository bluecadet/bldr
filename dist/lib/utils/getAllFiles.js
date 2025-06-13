var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createRequire } from 'node:module';
import { BldrConfig } from '../BldrConfig.js';
import path from 'node:path';
export function getAllFiles() {
    return __awaiter(this, arguments, void 0, function* (types = ['js', 'css'], ignorePaths = false) {
        var _a, _b, _c, _d, _e, _f;
        const bldrConfig = BldrConfig._instance;
        const pathStore = [];
        const require = createRequire(import.meta.url);
        const fg = require('fast-glob');
        // Set glob ignore paths
        const globIgnorePaths = [
            '**/node_modules/**'
        ];
        // Additional ignore paths
        if (ignorePaths && ignorePaths.length > 0) {
            globIgnorePaths.push(...ignorePaths);
        }
        // Ignore SDC Paths in globs as
        if (bldrConfig.isSDC && (bldrConfig === null || bldrConfig === void 0 ? void 0 : bldrConfig.sdcPaths)) {
            for (const sdcPath of bldrConfig.sdcPaths) {
                globIgnorePaths.push(`${sdcPath}/**/*`);
            }
        }
        // Ignore dist files for javascript
        if (types.includes('js') && ((_a = bldrConfig.userConfig) === null || _a === void 0 ? void 0 : _a.js)) {
            for (const p of bldrConfig.userConfig.js) {
                let destPath = p.dest.startsWith('./') ? p.dest.replace('./', '') : p.dest;
                destPath = destPath.endsWith('/') ? destPath : `${destPath}/`;
                globIgnorePaths.push(`${destPath}**/*.js`);
            }
        }
        // Ignore dist files for css
        if (types.includes('css') && ((_b = bldrConfig.userConfig) === null || _b === void 0 ? void 0 : _b.js)) {
            for (const p of bldrConfig.userConfig.js) {
                let destPath = p.dest.startsWith('./') ? p.dest.replace('./', '') : p.dest;
                destPath = destPath.endsWith('/') ? destPath : `${destPath}/`;
                globIgnorePaths.push(`${destPath}**/*.css`);
            }
        }
        // Use chokidar watch array
        if (bldrConfig.chokidarWatchArray.length > 0) {
            // Loop watch paths and get all js and css files
            for (const filepath of bldrConfig.chokidarWatchArray) {
                if (types.includes('js') && ((_c = bldrConfig.userConfig) === null || _c === void 0 ? void 0 : _c.js)) {
                    pathStore.push(path.join(filepath, '**', '*.js'));
                }
                if (types.includes('css') && ((_d = bldrConfig.userConfig) === null || _d === void 0 ? void 0 : _d.css)) {
                    pathStore.push(path.join(filepath, '**', '*.css'));
                }
            }
            // Get all the files to lint
            const allFiles = fg.sync(pathStore, {
                ignore: globIgnorePaths,
            });
            if (bldrConfig.isSDC) {
                if (types.includes('js') && ((_e = bldrConfig.sdcProcessAssetGroups) === null || _e === void 0 ? void 0 : _e.js)) {
                    for (const [key, value] of Object.entries(bldrConfig.sdcProcessAssetGroups.js)) {
                        allFiles.push(key);
                    }
                }
                if (types.includes('css') && ((_f = bldrConfig.sdcProcessAssetGroups) === null || _f === void 0 ? void 0 : _f.css)) {
                    for (const [key, value] of Object.entries(bldrConfig.sdcProcessAssetGroups.css)) {
                        allFiles.push(key);
                    }
                }
            }
            if (allFiles.length === 0) {
                return false;
            }
            return allFiles;
        }
        return false;
    });
}
//# sourceMappingURL=getAllFiles.js.map