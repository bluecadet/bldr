import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Bldr",
  description: "Configurable Task Runner - @bluecadet/bldr",
  base: '/bldr/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/examples' }
    ],

    sidebar: [
      {
        text: 'Usage',
        items: [
          { text: 'Installation', link: '/usage/installation' },
          { text: 'Commands', link: '/usage/commands' },
        ]
      },
      {
        text: 'Configuration',
        items: [   
          { text: 'General Configuation', link: '/config/general-configuration' },
          { text: 'Dev Configuation', link: '/config/dev-configuration' },
          { text: 'Single Directory Component (SDC) Configuration', link: '/config/sdc' },
          { text: 'Environment Configuation', link: '/config/env' },
          {
            text: 'Providers',
            items: [   
              { text: 'PostCSS', link: '/config/providers/postcss' },
              { text: 'esbuild', link: '/config/providers/esbuild' },
              { text: 'Rollup', link: '/config/providers/rollup' },
              { text: 'Biome', link: '/config/providers/biome' },
              { text: 'ESLint', link: '/config/providers/eslint' },
              { text: 'Stylelint', link: '/config/providers/stylelint' },
              { text: 'Sass', link: '/config/providers/sass' },
              { text: 'Browsersync', link: '/config/providers/browsersync' },
            ]
          },
          { text: 'Local Configuration', link: '/config/local-config' },
          { text: 'Bldr Provided ESLint Config', link: '/config/eslint-bldr-instance' },
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/bluecadet/bldr' }
    ]
  }
})
