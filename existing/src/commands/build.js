import { getConfigData } from '../lib/utils/getConfigData.js';
import { handleProcessAction } from '../lib/utils/reporters.js';
import { processSass } from '../lib/processes/sass.js';
import { processPostcss } from '../lib/processes/postcss.js';
import { processRollup } from '../lib/processes/rollup.js';
import { processImages } from '../lib/processes/images.js';
import { Bldr_Config } from '../lib/Bldr_Config.js';
import { Processor__SDC } from '../lib/Processor__SDC.js';

export const RunBldrBuild = async (commandOptions) => {
  const configData = await getConfigData(commandOptions);
  const BldrConfig = new Bldr_Config();
  const envKey = commandOptions.settings?.key;
  let SDC = false;

  console.log(``);
  console.log(`----------------------------------------`);
  if (envKey) {
    handleProcessAction(
      'bldr',
      '💪 Starting build using ${envKey} env configuration...'
    );
  } else {
    handleProcessAction('bldr', '💪 Starting build...');
  }
  console.log(`----------------------------------------`);
  console.log(``);

  const processStart = new Date().getTime();

  if (BldrConfig.isSDC) {
    SDC = new Processor__SDC();
    SDC.init();
    await SDC.processFiles();
  }

  return;

  await Promise.all([
    processSass(configData),
    processPostcss(configData),
    processImages(configData),
    processRollup(configData),
  ]);

  const processEnd = new Date().getTime();

  handleProcessAction(
    'bldr',
    '✨ Build complete ✨',
    `${(processEnd - processStart) / 1000}`
  );
};
