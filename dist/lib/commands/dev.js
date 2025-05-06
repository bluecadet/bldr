import { Bldr } from "../Bldr.js";
export default function (commandSettings) {
    // const CONFIG = new Bldr_Config();
    // await CONFIG.initialize(commandSettings);
    // await RunBldrDev(commandSettings);
    console.log('RunDev', commandSettings);
    const settings = new Bldr(commandSettings, true);
}
//# sourceMappingURL=dev.js.map