import type { ConfigSettings, ProcessKey } from "../@types/configTypes";
/**
 * Handles the path prompts for various processes like sass, js, etc.
 * @param {ProcessKey} processName - The name of the process (e.g., 'sass', 'js').
 * @param {string} ext - The file extension to process (e.g., 'scss', 'js').
 * @param {ConfigSettings} config - The configuration object to update.
 * @returns {Promise<ConfigSettings>} - The updated configuration object.
 */
export declare const handlePathPrompt: (processName: ProcessKey, ext: string, config: ConfigSettings) => Promise<ConfigSettings>;
/**
 * Handles the watch paths prompt for custom directories.
 * @param {ConfigSettings} config - The configuration object to update.
 * @returns {Promise<ConfigSettings>} - The updated configuration object.
 */
export declare const handleWatchPaths: (config: ConfigSettings) => Promise<ConfigSettings>;
export declare const handleReloadExtensions: (config: ConfigSettings) => Promise<ConfigSettings>;
export declare const handleSDC: (config: ConfigSettings) => Promise<ConfigSettings>;
export declare const handleRollup: (config: ConfigSettings) => Promise<ConfigSettings>;
export declare const handleEsLint: (config: ConfigSettings) => Promise<ConfigSettings>;
export declare const handleStylelint: (config: ConfigSettings) => Promise<ConfigSettings>;
export declare const handleBrowsersync: (config: ConfigSettings) => Promise<ConfigSettings>;
//# sourceMappingURL=createFilePrompts.d.ts.map