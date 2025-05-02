import { globSync } from 'glob';
import path from 'path';
import { Bldr_Config } from './Bldr_Config.js';
import { handleProcessAction } from './utils/reporters.js';

export class Processor__SDC {
  #files = {};
  #sdcConfig = null;

  constructor() {
    if (Processor__SDC._instance) {
      throw new Error(
        "Singleton classes can't be instantiated more than once."
      );
    }
    Processor__SDC._instance = this;
  }

  init() {

    if ( this.#sdcConfig !== null ) {
      return;
    }

    const BldrConfig = new Bldr_Config();
    this.#sdcConfig = BldrConfig.sdcConfig;

    // Cache glob files
    this.#cacheInitialFiles();
  }

  isFile(file, ext) {
    const type = ext.replace(/^\./, '');
    if (!type in this.#files) {
      return false;
    }

    const f = this.#files[type].filter((fo) => fo.src === file);
    if (f.length) {
      return f[0];
    }

    return false;
  }

  async processFiles() {
    handleProcessAction('bldr', 'Processing Single Component Directory Files...');

    for (const type of Object.keys(this.#files)) {
      const files = this.#files[type];
      console.log(type)
      console.log(files);
    }
  }

  async processFile(file, type) {
    console.log('SDC Process File');
  }

  #cacheInitialFiles() {
    this.#addGlobFiles(`${this.#sdcConfig.basePath}${this.#sdcConfig.filePattern}.css`, 'css');
    this.#addGlobFiles(`${this.#sdcConfig.basePath}${this.#sdcConfig.filePattern}.scss`, 'sass');
    this.#addGlobFiles(`${this.#sdcConfig.basePath}${this.#sdcConfig.filePattern}.sass`, 'sass');
    this.#addGlobFiles(`${this.#sdcConfig.basePath}${this.#sdcConfig.filePattern}.js`, 'js');
  }

  #addGlobFiles(pattern, type) {
    const fileGlob = globSync(pattern, { dot: true });
    fileGlob.forEach((f) => {
      const fn = path.basename(f);
      const fp = f.substring(0, f.lastIndexOf(path.sep));
      const fnClean = fn.replace(this.#sdcConfig.decorator, '');
      this.#addFile(type, f, fn, fnClean, fp);
    });
  }

  #addFile(type, file, filename, destFilename, dest = false) {
    if (!this.#files?.[type]) {
      this.#files[type] = [];
    }
    this.#files[type].push({
      src: file,
      dest: dest,
      name: filename,
      destFilename: destFilename,
    });
  }

  #getFiles() {
    return this.#files;
  }
}
