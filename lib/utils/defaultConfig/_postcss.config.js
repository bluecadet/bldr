const syntax = require('postcss-syntax')({
  rules: [
    {
      test: /\.(?:[sx]?html?|[sx]ht|vue|ux|php)$/i,
      extract: 'html',
    },
    {
      test: /\.(?:markdown|md)$/i,
      extract: 'markdown',
    },
    {
      test: /\.(?:m?[jt]sx?|es\d*|pac)$/i,
      extract: 'jsx',
    },
    {
      test: /\.(?:postcss|pcss|css)$/i,
      lang: 'scss'
    },
  ],
  css:  require('postcss-safe-parser'),
  sass: require('postcss-sass'),
  scss: require('postcss-scss'),
});

module.exports = {
  root: 'am default',
  syntax: syntax,
  plugins: [
    require('postcss-import-ext-glob'),
    require('postcss-easy-import'),
    // require("postcss-import")({base: ['./']}),
    require('postcss-strip-inline-comments'),
    require('postcss-mixins'),
    require('postcss-extend-rule'),
    require('postcss-simple-vars'),
    require('postcss-define-function'),
    require('postcss-map-get'),
    require('postcss-advanced-variables'),
    require('postcss-nested'),
    require('postcss-conditionals'),
    require("postcss-calc"),
    require('cssnano')({}),
    require('autoprefixer'),
  ]
}