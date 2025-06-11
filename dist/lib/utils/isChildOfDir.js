import path from 'node:path';
/**
 * @function isChildOfDir
 * @description Checks if a given filepath is a child of a specified directory.
 * @param {string} filepath - The path to check.
 * @param {string} dir - The directory to check against.
 * @returns {boolean} - Returns true if the filepath is a child of the directory, false otherwise.
 */
export function isChildOfDir(filepath, dir) {
    const relativePath = path.relative(dir, filepath);
    return (relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)) ? true : false;
}
//# sourceMappingURL=isChildOfDir.js.map