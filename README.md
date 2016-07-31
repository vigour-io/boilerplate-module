# vigour-boilerplate-module
[![Build Status](https://travis-ci.org/vigour-io/base.svg?branch=master)](https://travis-ci.org/vigour-io/base)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![npm version](https://badge.fury.io/js/vigour-base.svg)](https://badge.fury.io/js/vigour-base)
[![Coverage Status](https://coveralls.io/repos/github/vigour-io/base/badge.svg?branch=master)](https://coveralls.io/github/vigour-io/base?branch=master)

A boilerplate of how to do modules
- code
- directory
- tests
- browser
- server
- modules
- configuration
- versioning
- naming
- installation
- committing
- publishing
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
- When using generators make sure they run in the browser there is a util in `vigour-util/regenerator`
- When using es7 make sure it works in node as well (by babelifying your code)
- Use `camelCase` for variable names or properties (dont use `something_else` for example)
- Don't overcomlicate things with reusability, as a rule of thumb when something is done 3 times make something for it but not before

-
###Directory
Allways use a `lib` folder, with the `./lib/index.js` as a main file

If files are requirable as an api add entry points in the root of the repo
```javascript
const somemodule = require('somemodule/etc')
```

Try to split up files based on functionality, when using `vigour-base` objects use injectables for your modules
- See [observable](https://github.com/vigour-io/observable/tree/master/lib/observable) for injectables
- Files should not be longer then 200 lines of code
- Line width should have a maximum of 100 characters

-
###Tests
Create tests using
- [tap + tape](https://github.com/vigour-io/base/blob/master/test/compute.js), read this [article](https://medium.com/javascript-scene/why-i-use-tape-instead-of-mocha-so-should-you-6aa105d8eaf4#.wly1efig4) for why tap.
- [precommit hook](https://www.npmjs.com/package/pre-commit), helps with avoiding broken commits
- [browserstack](https://github.com/vigour-io/boilerplate-module/blob/master/test/browserstack.json)
- [coveralls.io](https://coveralls.io/), when making a private module make sure to add a [.coveralls.yml](https://github.com/vigour-io/play-state-geo/blob/master/.coveralls.yml) file
- [travis-ci](https://github.com/vigour-io/boilerplate-module/blob/master/.travis.yml)
- [ducktape](https://www.npmjs.com/package/ducktape), a tool to test for common gotchas

In test if tests are reusable use a `fn.js` file wrapping the tests in a function

- Test as if youre working against a blackbox, youre tests need to do the same as users of modules
don't tests internals test api with results (input - output), this allows you to refactor code many times and does not get you lost with too many tests
- Do not tests things that are not part of your module e.g `module a` uses `module b`, do not test the funcionality of `module b`, do this in `module b`. This keeps tests concise and more valuable
- Coverage is an indicator of normal tests as a rule of thumb when you have 90% coverage it shows that there are some tests. Beware, coverage does not mean that your tests are any good!
- When developing start makeing unit tests, this is your spec from there you can start building the app code, see tests as the tool you develop with, this pattern is called [TDD](https://www.agilealliance.org/glossary/tdd/)
- Use `npm run watch` (located in the script folder) for fast development in node
- Use `npm run watch-browser` to develop for the browser

-
###Browser
Browsers should be able to run allmost all code, universal modules using browserify
- Use feature detection in browsers
- Make sure to test your module in multiple browsers, browserstack tests are very helpfull for this

**css**

Css4 with [postcssify](https://www.npmjs.com/package/postcssify) a transform for cssnext for browserify
```
"browserify": {
  "transform": [
    "postcssify": "^2.0.0"
  ]
}
```

```javascript
'use strict'
require('./style.css')
```

In order to run this in node wihtout crashes there is an option to use [vigour-util/require](https://www.npmjs.com/package/vigour-util#enhancerequireoptions)

At the start of your script add
```javascript
require('vigour-util/require')()
```

-
###Server
To start a server use `npm start` with no arguments
To launch a server for testing puposes you can use `now`, they map port 80 to https by default.

- Do not add to many arguments to your start script, in general having one argument that is the port should be enough for development
- Prefer errors over logs, throw Errors. In most cases where you use`vigour-state` the whole state will be stored in a database, this means every error is reproducable by replaying the history
- Dont add too many `dev-tools` to your server, custom cli tools, too many fancy colorts in the console
- For notifications make a slack channel for your service (e.g. service crashed, new version launched)
- If you want a server that has to be redeployed on push (continous delivery), redploy your service from `travis-ci` after tests pass using `now`, this can be done on the same location as publishing your module

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
- All modules that "help" with logging for the server

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
###Versioning
Use semver all the way this means
- `x.0.0` *major*  api changes
- `0.x.0` *minor* for added features
- `0.0.x` *patch* for internal changes or bug fixes

allways use the carret `^2.0.0` for dependencies, this updates minor and patch version automaticly

-
###Naming
Try to be broing but concise with names `play-state-content`
- `play`, the product the module is part of
- `state`, the subtopic (state)
- `content`, the specific funcitonality

Extensions of modules allways folow the same pattern e.g. `blend-state-content-brightcove` extends or replaces `play-state-content` This will keep reasoning about behaviours of modules simple for everyone

-
###Installation
Modules should allways be installable using
`npm i` or `npm i --production` (wihtout dev dependencies)

-
###Commiting
Commit to feature branches, there is no develop branch only master and feature, use pull requests even to yourself to merge features into master. Similair model as git flow, minus the develop branch. Reason to remove a devleop branch is to get less version disparity

-
###Publishing
Publishing of modules has to be done trough [travis-ci](https://docs.travis-ci.com/user/deployment/npm), make sure you setup an npm api-key in travis-ci as an enviroment variable so it can publish.

`npm version patch`, `npm version minor`, `npm version major`

Then pushing to github by doing `git push --tags`

When you push a major version be sure to edit the release notes in github

-
###Readme
Follow the formatting in this readme.md Add Badges, coveralls, travis, npm and standard

Add a usage field in bold, like this

**Usage**
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

Make sure after you publish your module to npm that the readme and description in npm does not look bad