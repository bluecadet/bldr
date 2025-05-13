import {existsSync, mkdirSync} from 'node:fs';


export async function ensureDirectory(directory: string): Promise<void> {
  // Check if directory exists, make it if not
  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }
}