import { CommandSettings } from './@types/commandSettings';
export declare class BldrSettings {
    static _instance: BldrSettings;
    version: string;
    bldrRoot: string;
    configFileName: string;
    localConfigFileName: string;
    root: string;
    allowedProcessKeys: string[];
    commandSettings: CommandSettings;
    isDev: boolean;
    syntax: {
        rules: {
            test: RegExp;
            extract?: string;
            lang?: string;
        }[];
        css: any;
        sass: any;
        scss: any;
    };
    constructor();
}
//# sourceMappingURL=BldrSettings.d.ts.map