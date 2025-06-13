/**
 * Interface for log options
 * @interface LogOptions
 */
interface LogOptions {
    throwError?: boolean;
    exit?: boolean;
    code?: number;
}
/**
 * Log Error
 * @param processName - Name of the process
 * @param consoleMessage - Message to log
 * @param options - Options for logging behavior
 * @param options.throwError - Whether to throw an error after logging
 * @param options.exit - Whether to exit the process after logging
 * @param options.code - Exit code if exiting the process
 * @returns {void}
 */
export declare function logError(processName: string, consoleMessage: string, options?: LogOptions): void;
/**
 * Log Warning
 * @param processName - Name of the process
 * @param consoleMessage - Message to log
 * @param options - Options for logging behavior
 * @param options.throwError - Whether to throw an error after logging
 * @param options.exit - Whether to exit the process after logging
 * @param options.code - Exit code if exiting the process
 * @returns {void}
 */
export declare function logWarn(processName: string, consoleMessage: string): void;
/**
 * Log Success!!
 * @param processName - Name of the process
 * @param consoleMessage - Message to log
 * @param time - Optional time taken for the process
 * @returns {void}
 */
export declare function logSuccess(processName: string, consoleMessage: string, time?: any): void;
/**
 * Log Action
 * @param processName - Name of the process
 * @param consoleMessage - Message to log
 * @param time - Optional time taken for the process
 * @returns {void}
 */
export declare function logAction(processName: string, consoleMessage: string, time?: any): void;
/**
 * Log PostCSS Error Message
 * @param {any} err - The error object from PostCSS
 * @param {any} errOpts - Options for logging the error
 * @returns {void}
 */
export declare function logPostCssErrorMessage(err: any, errOpts: any): void;
/**
 * Function to create a dash-padded string based on the length of the input string
 * @param {string} string - The input string to base the padding on
 * @returns {string} - A string of dashes with the same length as the input string
 */
export declare function dashPadFromString(string: string): string;
export {};
//# sourceMappingURL=loggers.d.ts.map