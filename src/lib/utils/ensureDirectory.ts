import {existsSync, mkdirSync} from 'node:fs';

/**
 * Ensures that a directory exists by creating it if it does not.
 * @param directory - The path of the directory to ensure.
 * @returns {void}
 */
export async function ensureDirectory(directory: string): Promise<void> {
  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }
}