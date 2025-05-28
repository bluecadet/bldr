<h1 style="text-align: center;">Bldr 💪</h1>
<p style="text-align: center">TL;DR: Bldr is a (very opinionated) configuration based task runner for css, js, and sass with a local development server</p>


## Installation

We recommend installing Bldr as a project dependency:
`npm i @bluecadet/bldr`

You can then add scripts to package.json to run commands:
```js
  scripts: {
    'dev': 'bldr dev',
    'build': 'bldr build',
    'devOnce': 'bldr dev --once'
  }
```
Then run `npm run dev`, which will run `bldr dev`, etc.

If you need to pass parameters to a script, add `--` between the command and the parameter:
`npm run dev -- env=SampleEnv`

You can also install it globally:
`npm i -g @bluecadet/bldr`


## Documentation

See https://bluecadet.github.io/bldr/