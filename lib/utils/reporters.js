import colors from 'colors';

const processString = (processName) => {
  return `${colors.white('[')}${colors.blue(processName)}${colors.white(']')}`;
}

const buildErrorMessage = (processName, consoleMessage) => {
  return `${processString(processName)} ${colors.red(consoleMessage)}`;
}

export function handleErrorMessage( processName, consoleMessage, options = {throwError: false, exit: false, code: 1} ) {

  const { throwError, exit, code } = options;

  console.log(`${buildErrorMessage(processName, consoleMessage)}`);

  if ( throwError ) {
    throw new Error(consoleMessage);
  }

  if ( exit ) {
    process.exit(code);
  }
}



export function handleErrorWarn( processName, consoleMessage ) {
  console.log(`${processString(processName)} ${colors.yellow(consoleMessage)}`);
}