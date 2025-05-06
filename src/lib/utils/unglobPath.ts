import * as path from 'path';

function unglobPathRecusively(originPath: string) {

  const basename = path.basename(originPath);
  const basenameIsGlob = basename.includes("*") || basename.includes("!") || basename.includes('?');
  
  if (basenameIsGlob) {
    originPath = path.dirname(originPath);
    unglobPathRecusively(originPath);
  }

  return originPath;
  
}

export function unglobPath(originPath: string) {

  originPath = path.dirname(originPath);
  return unglobPathRecusively(originPath);
  
}