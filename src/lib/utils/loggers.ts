import colors from 'colors';


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
 * Function to format the process name for logging
 */
const processString = (processName: string) => {
  const pName   = processName;
  const addPad  = pName.padEnd(10, ' ');
  const onlyPad = addPad.replace(processName, '');

  return `${colors.white('[')}${colors.blue(processName)}${colors.white(']')}${onlyPad}`;
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
export function logError( processName: string, consoleMessage: string, options: LogOptions = {throwError: false, exit: false, code: 1} ): void {
  console.log(`${processString(processName)} ${colors.red(consoleMessage)}`);

  if ( options.throwError ) throw new Error(consoleMessage);
  if ( options.exit ) process.exit(options.code);
}



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
export function logWarn( processName: string, consoleMessage: string ): void {
  console.log(`${processString(processName)} ${colors.yellow(consoleMessage)}`);
}



/**
 * Log Success!!
 * @param processName - Name of the process
 * @param consoleMessage - Message to log
 * @param time - Optional time taken for the process
 * @returns {void}
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function logSuccess(processName: string, consoleMessage: string, time: any = false): void {
  console.log(`${processString(processName)} ${colors.cyan(consoleMessage)}${time ? colors.gray(` ${time}s`) : ''}`);
}



/**
 * Log Action
 * @param processName - Name of the process
 * @param consoleMessage - Message to log
 * @param time - Optional time taken for the process
 * @returns {void}
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function logAction(processName: string, consoleMessage: string, time: any = false): void {
  console.log(`${processString(processName)} ${colors.green(consoleMessage)}${time ? colors.gray(` ${time}s`) : ''}`);
}




/**
 * Log PostCSS Error Message
 * @param {any} err - The error object from PostCSS
 * @param {any} errOpts - Options for logging the error
 * @returns {void}
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function logPostCssErrorMessage(err: any, errOpts: any): void {
  const errMessage = `${colors.red(`Error proccessing file ./${err.file}`)}
${colors.white('reason:')} ${colors.red(err.reason)}${err?.line ? `
${colors.white('line:')} ${colors.red(err.line)}` : ''}${err?.columns ? `
${colors.white('columns:')} ${colors.red(err.columns)}` : ''}
${colors.white('error:')} ${err}
`;

  logError('postcss', errMessage, errOpts);
}



/**
 * Function to create a dash-padded string based on the length of the input string
 * @param {string} string - The input string to base the padding on
 * @returns {string} - A string of dashes with the same length as the input string
 */
export function dashPadFromString(string: string): string {
  const str = '';
  return str.padEnd(string.length, '-');
}