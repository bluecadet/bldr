import colors from 'colors';

const processString = (processName: string) => {
  const pName   = processName;
  const addPad  = pName.padEnd(7, ' ');
  const onlyPad = addPad.replace(processName, '');

  return `${colors.white('[')}${colors.blue(processName)}${colors.white(']')}${onlyPad}`;
}

interface LogOptions {
  throwError?: boolean;
  exit?: boolean;
  code?: number;
}

// Log Error
export function logError( processName: string, consoleMessage: string, options: LogOptions = {throwError: false, exit: false, code: 1} ) {
  console.log(`${processString(processName)} ${colors.red(consoleMessage)}`);

  if ( options.throwError ) throw new Error(consoleMessage);
  if ( options.exit ) process.exit(options.code);
}

// Log Warning
export function logWarn( processName: string, consoleMessage: string ) {
  console.log(`${processString(processName)} ${colors.yellow(consoleMessage)}`);
}

// Log Success!!
export function logSuccess(processName: string, consoleMessage: string, time: any = false) {
  console.log(`${processString(processName)} ${colors.cyan(consoleMessage)}${time ? colors.gray(` ${time}s`) : ''}`);
}

// Log Activity
export function logAction(processName: string, consoleMessage: string, time: any = false) {
  console.log(`${processString(processName)} ${colors.green(consoleMessage)}${time ? colors.gray(` ${time}s`) : ''}`);
}

// Good News Message!!
export function logGoodNews(consoleMessage: string) {
  console.log(`${colors.green(consoleMessage)}`);
}

// Bad News Message :(
export function logBadNews(consoleMessage: string) {
  console.log(`${colors.red(consoleMessage)}`);
}

// Iffy News Message :(
export function logIffyNews(consoleMessage: string) {
  console.log(`${colors.yellow(consoleMessage)}`);
}



// PostCss Error Message
export function logPostCssErrorMessage(err: any, errOpts: any) {
  const errMessage = `${colors.red(`Error proccessing file ./${err.file}`)}
${colors.white('reason:')} ${colors.red(err.reason)}${err?.line ? `
${colors.white('line:')} ${colors.red(err.line)}` : ''}${err?.columns ? `
${colors.white('columns:')} ${colors.red(err.columns)}` : ''}
${colors.white('error:')} ${err}
`;

  logError(`postcss`, errMessage, errOpts);
}