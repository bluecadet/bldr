import { getConfigData } from '../lib/utils/getConfigData.js';
import { handleProcessAction } from '../lib/utils/reporters.js';
import { processSass } from '../lib/processes/sass.js';
import { processPostcss } from '../lib/processes/postcss.js';
import { processRollup } from '../lib/processes/rollup.js';
import { processImages } from '../lib/processes/images.js';

export const RunBldrBuild = async (commandOptions) => {

  const configData  = await getConfigData(commandOptions);
  const envKey      = commandOptions.settings?.key;

  console.log(``);
  console.log(`----------------------------------------`);
  if ( envKey ) {
    handleProcessAction('bldr', '💪 Starting build using ${envKey} env configuration...');
  } else {
    handleProcessAction('bldr', '💪 Starting build...');
  }
  console.log(`----------------------------------------`);
  console.log(``);

  const processStart = new Date().getTime();

  await processSass(configData);
  await processPostcss(configData);
  await processImages(configData);
  await processRollup(configData);

  const processEnd = new Date().getTime();


  handleProcessAction('bldr', '✨ Build complete ✨', `${(processEnd - processStart)/1000}`);

}