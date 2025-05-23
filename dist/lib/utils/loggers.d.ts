interface LogOptions {
    throwError?: boolean;
    exit?: boolean;
    code?: number;
}
export declare function logError(processName: string, consoleMessage: string, options?: LogOptions): void;
export declare function logWarn(processName: string, consoleMessage: string): void;
export declare function logSuccess(processName: string, consoleMessage: string, time?: any): void;
export declare function logAction(processName: string, consoleMessage: string, time?: any): void;
export declare function logGoodNews(consoleMessage: string): void;
export declare function logBadNews(consoleMessage: string): void;
export declare function logIffyNews(consoleMessage: string): void;
export declare function logPostCssErrorMessage(err: any, errOpts: any): void;
export declare function dashPadFromString(string: string): string;
export {};
//# sourceMappingURL=loggers.d.ts.map