import * as path from 'path';
function unglobPathRecusively(originPath) {
    const basename = path.basename(originPath);
    const basenameIsGlob = basename.includes("*") || basename.includes("!") || basename.includes('?');
    if (basenameIsGlob) {
        originPath = path.dirname(originPath);
        unglobPathRecusively(originPath);
    }
    return originPath;
}
export function unglobPath(originPath) {
    originPath = path.dirname(originPath);
    return unglobPathRecusively(originPath);
}
//# sourceMappingURL=unglobPath.js.map