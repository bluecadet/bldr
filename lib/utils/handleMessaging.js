import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const colors = require('colors');

const processString = (processName) => {
  return `${colors.white('[')}${colors.blue(processName)}${colors.white(']')}`;
}

const setSuccessMessage = (processName, consoleMessage, time) => {
  return `${processString(processName)} ${colors.cyan(consoleMessage)}${time ? colors.gray(` ${time}s`) : ''}`;
}

const setWarnMessage = (processName, consoleMessage, customColors = false) => {
  if ( customColors ) {
    return `${processString(processName)} ${consoleMessage}`;
  } else {
    return `${processString(processName)} ${colors.yellow(consoleMessage)}`;
  }
}

const setErrorMessage = (processName, consoleMessage, customColors = false) => {
  if ( customColors ) {
    return `${processString(processName)} ${consoleMessage}`;
  } else {
    return `${processString(processName)} ${colors.red(consoleMessage)}`;
  }
}

const handleProcessSuccess = (consoleMessage) => {
  console.log(colors.green(consoleMessage));
}

const handleProcessWarn = (consoleMessage) => {
  console.log(colors.yellow(consoleMessage));
}

const handleMessageSuccess = (processName, consoleMessage, time = false) => {
  console.log(setSuccessMessage(processName, consoleMessage, time));
}

const handleMessageWarn = (processName, consoleMessage, time = false) => {
  console.log(setWarnMessage(processName, consoleMessage, time));
}

const handleMessageError = (processName, consoleMessage, customColors = false) => {
  console.log(setErrorMessage(processName, consoleMessage, false, customColors));
}

const handleThrowMessageError = (processName, consoleMessage, err) => {
  if ( err ) {
    console.log(err);
  }

  throw new Error(setErrorMessage(processName, consoleMessage));
}


module.exports = {
  handleProcessWarn,
  handleProcessSuccess,
  handleMessageSuccess,
  handleMessageWarn,
  handleMessageError,
  handleThrowMessageError
}