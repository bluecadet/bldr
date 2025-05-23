import { CommandSettings } from "./@types/commandSettings";
import { BldrConfig } from "./BldrConfig.js";
export declare class Bldr {
    #private;
    bldrConfig: BldrConfig;
    private commandSettings;
    private isDev;
    private EsBuildProvider;
    private RollupProvider;
    private PostcssProvider;
    private SassProvider;
    private EslintProvider;
    private StylelintProvider;
    constructor(commandSettings: CommandSettings, isDev?: boolean, isInit?: boolean);
}
//# sourceMappingURL=Bldr.d.ts.map