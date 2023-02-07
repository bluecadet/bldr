import colors from 'colors';

const processString = (processName) => {
  return `${colors.white('[')}${colors.blue(processName)}${colors.white(']')}`;
}

// Process Error
export function handleProcessError( processName, consoleMessage, options = {throwError: false, exit: false, code: 1} ) {
  console.log(`${processString(processName)} ${colors.red(consoleMessage)}`);

  if ( options.throwError ) throw new Error(consoleMessage);
  if ( options.exit ) process.exit(options.code);
}

// Process Warning
export function handleProcessWarn( processName, consoleMessage ) {
  console.log(`${processString(processName)} ${colors.yellow(consoleMessage)}`);
}

// Process Success!!
export function handleProcessSuccess(processName, consoleMessage, time = false) {
  console.log(`${processString(processName)} ${colors.cyan(consoleMessage)}${time ? colors.gray(` ${time}s`) : ''}`);
}

// Process Activity
export function handleProcessAction(processName, consoleMessage, time = false) {
  console.log(`${processString(processName)} ${colors.green(consoleMessage)}${time ? colors.gray(` ${time}s`) : ''}`);
}

// Good News Message!!
export function handleGoodNews(consoleMessage) {
  console.log(`${colors.green(consoleMessage)}`);
}

// Bad News Message :(
export function handleBadNews(consoleMessage) {
  console.log(`${colors.red(consoleMessage)}`);
}

// Iffy News Message :(
export function handleIffyNews(consoleMessage) {
  console.log(`${colors.yellow(consoleMessage)}`);
}