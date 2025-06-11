import { CommandSettings } from "../lib/@types/commandSettings";
import { BldrConfig } from "../lib/BldrConfig.js";
import { EslintProvider } from "../lib/providers/EslintProvider.js";
import { StylelintProvider } from "../lib/providers/StylelintProvider.js";
import { BiomeProvider } from "../lib/providers/BiomeProvider.js";
import { logSuccess } from "../lib/utils/loggers.js";

export default function lint(commandOptions: CommandSettings) {
  doLint(commandOptions);

}

const doLint = async (commandOptions: CommandSettings) => {
  const config = new BldrConfig(commandOptions, false);
  await config.initialize();
  

  if (config?.biomeConfig?.useBiome) {
    const biomeProvider = new BiomeProvider();
    await biomeProvider.initialize();

    await biomeProvider.lintAll(true);
    
    logSuccess('bldr', 'Linting complete with Biome');
    process.exit(0);
    return;
  } else {
    const eslintProvider = new EslintProvider();
    const stylelintProvider = new StylelintProvider();

    await eslintProvider.initialize();
    await stylelintProvider.initialize();

    await eslintProvider.lintAll();
    await stylelintProvider.lintAll();
  }

  

  logSuccess('bldr', 'Linting complete');
}