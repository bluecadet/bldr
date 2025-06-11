import { isChildOfDir } from './isChildOfDir.js';

export function checkIsSDCFile(filepath: string, paths: string | string[]): boolean {
  let isSDCFile = false;

  for (const file of paths) {
    if (isChildOfDir(filepath, file)) {
      isSDCFile = true;
      break;
    }
  }

  return isSDCFile;
}