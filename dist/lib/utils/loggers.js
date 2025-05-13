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
// PostCss Error Message
export function logPostCssErrorMessage(err, errOpts) {
    const errMessage = `${colors.red(`Error proccessing file ./${err.file}`)}
${colors.white('reason:')} ${colors.red(err.reason)}${(err === null || err === void 0 ? void 0 : err.line) ? `
${colors.white('line:')} ${colors.red(err.line)}` : ''}${(err === null || err === void 0 ? void 0 : err.columns) ? `
${colors.white('columns:')} ${colors.red(err.columns)}` : ''}
${colors.white('error:')} ${err}
`;
    logError(`postcss`, errMessage, errOpts);
}
//# sourceMappingURL=loggers.js.map