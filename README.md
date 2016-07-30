# boilerplate-module
[![Build Status](https://travis-ci.org/vigour-io/base.svg?branch=master)](https://travis-ci.org/vigour-io/base)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![npm version](https://badge.fury.io/js/vigour-base.svg)](https://badge.fury.io/js/vigour-base)
[![Coverage Status](https://coveralls.io/repos/github/vigour-io/base/badge.svg?branch=master)](https://coveralls.io/github/vigour-io/base?branch=master)

A boilerplate of how to do modules
- code
- versioning
- naming
- directory
- tests
- browser
- server
- modules
- configuration
- deployment
- readme

-
###Code
Use [jstandard as code style](http://standardjs.com/).

As a rule of thumb your js should run in the browser and nodejs if possible, [universal javascript](https://medium.com/@mjackson/universal-javascript-4761051b7ae9#.l9dabsnam).

Use es6 everywhere, allways add a browserify transform using babel in your package.json. Except in the rare case where you're code cant run in the browser
```
"browserify": {
  "transform": [
    [
      "babelify",
      {
        "presets": [
          "es2015"
        ]
      }
    ]
  ]
}
```

When there is a difference between the browser and node use the browserify-browser field.
`/index.js` is allways the node-js file and `/browser.js` is the exception
```
"browser": {
  "./lib/something/index.js": "./lib/something/browser.js"
}
```

- Use `val` as a word vs `value`
- Allways add `use strict` on top of your js files
- Try to create small concise functions preferbly split up into many files
- Use streams as much as possible when working in node (chunk based operation)
- When using promises make sure you catch errors!
- When using `vigour-base` use inject with plain objects
- When using generators make sure they run in the browser there is a util in `vigour-util/regenerator
- When using es7 make sure it works in node as well (by babelifying your code)
- Use `camelCase` for variable names or properties (dont use `something_else` for example)

-
###Versioning
Use semver all the way this means
`x.0.0` ) *major*  api changes
`0.x.0` *minor* for added features
`0.0.x` *patch* for internal changes or bug fixes

allways use the carret `^2.0.0` for dependencies, this update minor and patch version automaticly

-
###Naming
Try to be broing but concise with names for example `play-state-content`
- `play`, the product the module is part of
- `state`, the subtopic (state)
- `content`, the specific funcitonality

-
###Directory
Use a `lib` folder
In test if tests are reusable use a `fn.js` file
Try to split up files based on funcitonality

-
###Tests
The properties field is used to add property definitions for certain keys within set objects.

-
###Browser
- css, use postcssify
- Try to use browser apis whenever its possible, shim the browser api if its not aviable
- Use feature detection in browsers

-
###Server

-
###Modules
Allways use specific modules e.g. `lodash.merge` vs `lodash`
When you find a module make sure it works in `node 6.3`, and does not add too much code in the browser
Prefer plain simple javascript, micro modules are ok as long as they do 1 thing simply, try to avoid adding too many large modules since it will bloat your code

**blacklist**
- `momment-js`, to large for the client can be replaced with `new Date()` for most usecases
- `async` don't need this , use es7 `async functions` with `await`
- `express` use plain old `http`
- `hyperquest` use plain old `http`
- `request` use plain old `http`

**prefered**
- `uWebsocket` over `ws` or `websocket` (`uWebsocket` is by fat the fastest)
- `vigour-ua` for ua sniffing/device info (its a small module ~1kb)

-
###Configuration
Code over configuration -- try to add configuration variables in the `package.json` file
In general try to keep configuration simple and in plain `json` files
- For secrets like api keys, use environment variables
- For determining environments use enviroment variables

Use envivfy to expose environment variables in your module in the browser

```
"browserify": {
  "transform": [
    "envivy"
  ]
}
```

-
###deployment
  - travis
  - coverage
  - browserstack
  - now
  - npm

-
###Readme
Follow the formatting in this readme.md
Add Badges -- coveralls, travis, npm and standard
Add a usage header

###Usage
```javascript
const somemodule = require('somemodule')
// initialize the module
const something = somemodule()

// do something
something.do() // → 'doing somehting'
```

Try to keep text to a minimum, code is usualy the best documentation

**Code examples**

Use the unicode arrow → to describe return values
```javascript
const myfunction = require('myfunction')
myfunction() // → 'hello'
```

**Property options**
- `:key` this is a property
- `:reset` this is also a property
- `:val` and another one
