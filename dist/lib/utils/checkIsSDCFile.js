import { isChildOfDir } from './isChildOfDir.js';
export function checkIsSDCFile(filepath, paths) {
    let isSDCFile = false;
    for (const file of paths) {
        if (isChildOfDir(filepath, file)) {
            isSDCFile = true;
            break;
        }
    }
    return isSDCFile;
}
//# sourceMappingURL=checkIsSDCFile.js.map