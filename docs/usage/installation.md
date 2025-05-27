# Installation

Install bldr at the project level:

```bash
npm i @bluecadet/bldr
```

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


## Requirements

- Node v22+

