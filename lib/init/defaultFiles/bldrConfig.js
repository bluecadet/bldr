/**
 * Bldr Config
 *
 * npm i --save-dev @bluecadet/bldr
 *
 * run `bldr dev`, `bldr watch`, or `bldr build`
 *
 * !!------------------------------------------------------------!!
 *
 * `css` and `js` keys can be an object with src and dist paths,
 * or an array of objects with src and dist paths
 *
 * !!------------------------------------------------------------!!
 *
 * `dev.env` can have multiple objects, each with its own set of
 * config for processing. Create an object in `env` and run
 * `bldr dev env=ENV_KEY_NAME` to run specific processing.
 *
 * !!------------------------------------------------------------!!
 *
 */

const baseSrcPath = './path/to/src';
const baseDestPath = './path/to/dest';

// ---------------------------------------------------------
// Uncomment if paths are the SAME for dev, watch, and build
// ---------------------------------------------------------

// module.exports = {
//   css: {
//     src: `${baseSrcPath}/css/*.css`,
//     dest: `${baseDestPath}/css/`,
//     watch: [
//       `${baseSrcPath}/**/*.css'`,
//       `${baseSrcPath}/**/*.scss'`,
//       `${baseSrcPath}/**/*.pcss'`,
//     ]
//   },
//   js: {
//     src: `${baseSrcPath}/js/*.js`,
//     dest: `${baseDestPath}/js/`,
//     watch: [
//       `${baseSrcPath}/**/*.js'`,
//     ]
//   },
//   images: {
//     src: `${baseSrcPath}/images/*.{jpg,JPG,jpeg,JPEG,gif,png,svg}`,
//     dest: `${baseDestPath}/images/`,
//     watch: [
//       `${baseSrcPath}/images/**/*`
//     ],
//   },
// };


// ------------------------------------------------------
// Uncomment if dev, watch, and build paths are different
// ------------------------------------------------------

// module.exports = {
//   dev: {
//     css: {
//       src: `${baseSrcPath}/css/*.css`,
//       dest: `${baseDestPath}/css/`,
//       watch: [
//         `${baseSrcPath}/**/*.css'`,
//         `${baseSrcPath}/**/*.scss'`,
//         `${baseSrcPath}/**/*.pcss'`,
//       ]
//     },
//     js: {
//       src: `${baseSrcPath}/js/*.js`,
//       dest: `${baseDestPath}/js/`,
//       watch: [
//         `${baseSrcPath}/**/*.js'`,
//       ]
//     },
//     images: {
//       src: `${baseSrcPath}/images/*.{jpg,JPG,jpeg,JPEG,gif,png,svg}`,
//       dest: `${baseDestPath}/images/`,
//       watch: [
//         `${baseSrcPath}/images/**/*`
//       ],
//     },
//   },
//   build: {
//     css: {
//       src: `${baseSrcPath}/css/*.css`,
//       dest: `${baseDestPath}/css/`,
//       watch: [
//         `${baseSrcPath}/**/*.css'`,
//         `${baseSrcPath}/**/*.scss'`,
//         `${baseSrcPath}/**/*.pcss'`,
//       ]
//     },
//     js: {
//       src: `${baseSrcPath}/js/*.js`,
//       dest: `${baseDestPath}/js/`,
//       watch: [
//         `${baseSrcPath}/**/*.js'`,
//       ]
//     },
//     images: {
//       src: `${baseSrcPath}/images/*.{jpg,JPG,jpeg,JPEG,gif,png,svg}`,
//       dest: `${baseDestPath}/images/`,
//       watch: [
//         `${baseSrcPath}/images/**/*`
//       ],
//     },
//   },
// }