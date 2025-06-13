import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
export class BldrSettings {
    constructor() {
        if (BldrSettings._instance) {
            // biome-ignore lint/correctness/noConstructorReturn: <explanation>
            return BldrSettings._instance;
        }
        BldrSettings._instance = this;
        const require = createRequire(import.meta.url);
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const bldrRoot = path.join(__dirname, '../..');
        const bldrPackagePath = path.join(bldrRoot, 'package.json');
        const bldrPackageJson = require(bldrPackagePath);
        // Determine if old User Config File...
        let configFileName = 'bldrConfig.js';
        let configFilePath = path.join(process.cwd(), configFileName);
        if (!fs.existsSync(configFilePath)) {
            configFileName = 'bldr.config.js';
            configFilePath = path.join(process.cwd(), configFileName);
        }
        // Determine User Local Config File
        let localConfigFileName = 'bldrConfigLocal.js';
        let localConfigFilePath = path.join(process.cwd(), localConfigFileName);
        if (!fs.existsSync(localConfigFilePath)) {
            localConfigFileName = 'bldr.local.config.js';
            localConfigFilePath = path.join(process.cwd(), localConfigFileName);
        }
        this.version = bldrPackageJson.version;
        this.bldrRoot = bldrRoot;
        this.configFileName = configFileName;
        this.configFilePath = configFilePath;
        this.localConfigFileName = localConfigFileName;
        this.localConfigFilePath = localConfigFilePath;
        this.root = process.cwd();
        this.allowedProcessKeys = ['css', 'sass', 'js'];
    }
}
//# sourceMappingURL=BldrSettings.js.map