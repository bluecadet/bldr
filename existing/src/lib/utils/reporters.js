import colors from 'colors';

const processString = (processName) => {
  const pName   = processName;
  const addPad  = pName.padEnd(7, ' ');
  const onlyPad = addPad.replace(processName, '');

  // const parts = pName.split('\n');
  // const max = 9;

  // const padName = parts.map(s => s
  //   .padStart(s.length + Math.floor((max - s.length) / 2), ' ')
  //   .padEnd(max, ' ')
  // );

  // console.log(padName);

  // return `${colors.bgGray(
  //   colors.white(padName.join('\n'))
  // )}`;

  // return `${
  //   colors.bgBlue(
  //     colors.white(`[${processName}${onlyPad}]`)
  //   )
  // }`;

  return `${colors.white('[')}${colors.blue(processName)}${colors.white(']')}${onlyPad}`;
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