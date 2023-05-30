export const checkMissingConfigKeys = (configObject) => {

  if ( !configObject?.src || !configObject?.dest ) {
    let msg = '';

    if ( !configObject?.src && !configObject?.dest ) {
      msg = 'src and dest keys';
    } else if ( !configObject?.src ) {
      msg = 'src key';
    } else if ( !configObject?.dest ) {
      msg = 'dest key';
    }

    return `${msg} missing in config - process will not be ran.`;
  }

  return false;
}