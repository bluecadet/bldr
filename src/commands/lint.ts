import type { CommandSettings } from "../lib/@types/commandSettings";
import { BldrConfig } from "../lib/BldrConfig.js";
import { BiomeProvider } from "../lib/providers/BiomeProvider.js";
import { EslintProvider } from "../lib/providers/EslintProvider.js";
import { StylelintProvider } from "../lib/providers/StylelintProvider.js";
import { logSuccess } from "../lib/utils/loggers.js";

export default function lint(commandOptions: CommandSettings) {
  doLint(commandOptions);
}

const doLint = async (commandOptions: CommandSettings) => {

  const config = new BldrConfig(commandOptions, false);
  await config.initialize();

  if ( config?.biomeConfig?.useBiome ) {
    const biomeProvider = new BiomeProvider();
    await biomeProvider.initialize();
    await biomeProvider.lintAll();
  }
  
  if ( config?.eslintConfig?.useEslint ) {
    const eslintProvider = new EslintProvider();
    await eslintProvider.initialize();
    await eslintProvider.lintAll();
  }

  if ( config?.stylelintConfig?.useStyleLint ) {
    const stylelintProvider = new StylelintProvider();
    await stylelintProvider.initialize();
    await stylelintProvider.lintAll();
  }

  logSuccess('bldr', 'Linting complete');
}