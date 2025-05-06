import colors from 'colors';
const processString = (processName) => {
    const pName = processName;
    const addPad = pName.padEnd(7, ' ');
    const onlyPad = addPad.replace(processName, '');
    return `${colors.white('[')}${colors.blue(processName)}${colors.white(']')}${onlyPad}`;
};
// Log Error
export function logError(processName, consoleMessage, options = { throwError: false, exit: false, code: 1 }) {
    console.log(`${processString(processName)} ${colors.red(consoleMessage)}`);
    if (options.throwError)
        throw new Error(consoleMessage);
    if (options.exit)
        process.exit(options.code);
}
// Log Warning
export function logWarn(processName, consoleMessage) {
    console.log(`${processString(processName)} ${colors.yellow(consoleMessage)}`);
}
// Log Success!!
export function logSuccess(processName, consoleMessage, time = false) {
    console.log(`${processString(processName)} ${colors.cyan(consoleMessage)}${time ? colors.gray(` ${time}s`) : ''}`);
}
// Log Activity
export function logAction(processName, consoleMessage, time = false) {
    console.log(`${processString(processName)} ${colors.green(consoleMessage)}${time ? colors.gray(` ${time}s`) : ''}`);
}
// Good News Message!!
export function logGoodNews(consoleMessage) {
    console.log(`${colors.green(consoleMessage)}`);
}
// Bad News Message :(
export function logBadNews(consoleMessage) {
    console.log(`${colors.red(consoleMessage)}`);
}
// Iffy News Message :(
export function logIffyNews(consoleMessage) {
    console.log(`${colors.yellow(consoleMessage)}`);
}
//# sourceMappingURL=loggers.js.map