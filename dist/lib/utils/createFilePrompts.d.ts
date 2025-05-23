import { ConfigSettings, ProcessKey } from "../@types/configTypes";
export declare const handlePathPrompt: (processName: ProcessKey, ext: string, config: ConfigSettings) => Promise<ConfigSettings>;
export declare const handleWatchPaths: (config: ConfigSettings) => Promise<ConfigSettings>;
export declare const handleReloadExtensions: (config: ConfigSettings) => Promise<ConfigSettings>;
export declare const handleSDC: (config: ConfigSettings) => Promise<ConfigSettings>;
export declare const handleRollup: (config: ConfigSettings) => Promise<ConfigSettings>;
export declare const handleEsLint: (config: ConfigSettings) => Promise<ConfigSettings>;
export declare const handleStylelint: (config: ConfigSettings) => Promise<ConfigSettings>;
export declare const handleBrowsersync: (config: ConfigSettings) => Promise<ConfigSettings>;
//# sourceMappingURL=createFilePrompts.d.ts.map