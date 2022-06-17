const buildStatistics = require('rollup-plugin-build-statistics');

module.exports = {
  dev: {
    css: {
      src: './web/theme/sample_theme/assets/src/css/*.css',
      dest: './web/theme/sample_theme/assets/dist/css/',
      watch: [
        './web/theme/sample_theme/assets/src/**/*.css',
        './web/theme/sample_theme/components/**/*.css',
      ]
    },
    js: {
      src: './web/theme/sample_theme/assets/src/js/*.js',
      dest: './web/theme/sample_theme/assets/dist/js/',
      watch: [
        './web/theme/sample_theme/assets/src/**/*.js'
      ],
    },
    image: {
      src: '',
      dest: '',
      // watch: '',
    },
    env: {
      fractal: {
        css: [
          {
            src: './web/theme/sample_theme/assets/src/css/*.css',
            dest: './web/theme/sample_theme/assets/dist/css/',
            watch: [
              './web/theme/sample_theme/assets/src/**/*.css',
              './web/theme/sample_theme/components/**/*.css',
            ]
          },
          {
            src: './web/theme/admin_theme/assets/src/css/*.css',
            dest: './web/theme/admin_theme/assets/dist/css/',
            watch: [
              './web/theme/admin_theme/assets/src/**/*.css',
              './web/theme/admin_theme/components/**/*.css',
            ]
          }
        ],
        js: [
          {
            src: './web/theme/sample_theme/assets/src/js/*.js',
            dest: './web/theme/sample_theme/assets/dist/js/',
            watch: [
              './web/theme/sample_theme/assets/src/js/**/*.js'
            ]
          },
          {
            src: './web/theme/admin_theme/assets/src/js/*.js',
            dest: './web/theme/admin_theme/assets/dist/js/',
            watch: [
              './web/theme/admin_theme/assets/src/js/**/*.js'
            ]
          }
        ]
      }
    }
  },
  build: {
    css: {
      src: './web/theme/sample_theme/assets/src/css/*.css',
      dest: './web/theme/sample_theme/assets/dist/css/',
      watch: [
        './web/theme/sample_theme/assets/src/**/*.css',
        './web/theme/sample_theme/components/**/*.css',
      ]
    },
    js: {
      src: './web/theme/sample_theme/assets/src/js/*.js',
      dest: './web/theme/sample_theme/assets/dist/js/',
    },
    image: {
      src: '',
      dest: '',
      watch: '',
    }
  },
  esBuild: {
    plugins: [
      require("essass"),
    ]
  },
  rollup: {
    inputOptions: {
      plugins: [
        buildStatistics({
          projectName: 'awesome-project',
        }),
      ]
    }
  }
}