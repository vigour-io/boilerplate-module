# vigour-boilerplate-module
A boilerplate of how to do modules

[![Build Status](https://travis-ci.org/vigour-io/boilerplate-module.svg?branch=master)](https://travis-ci.org/vigour-io/boilerplate-module)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![npm version](https://badge.fury.io/js/vigour-boilerplate-module.svg)](https://badge.fury.io/js/vigour-base)
[![Coverage Status](https://coveralls.io/repos/github/vigour-io/boilerplate-module/badge.svg?branch=master)](https://coveralls.io/github/vigour-io/boilerplate-module?branch=master)

- prerequisite
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

--
###Prerequisite
Before you start be sure you have knowledge about
- [node.js 6.6](http://nodeschool.io/)
- [es6](https://github.com/lukehoban/es6features)
- [browserify](http://browserify.org/articles.html)
- [github](https://guides.github.com/activities/hello-world/)


--
###Code
Use [jstandard as code style](http://standardjs.com/).

As a rule of thumb your js should run in the browser and nodejs if possible, [universal javascript](https://medium.com/@mjackson/universal-javascript-4761051b7ae9#.l9dabsnam).
An exception would be for example, a c++ websocket server, this will not run in the browser!


Use es6 everywhere, always add a browserify transform using babel in your package.json. Except in the rare case where you're code cant run in the browser
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

When using fancy features like promises be sure to include a transform that adds the feature

```
"browserify": {
  "transform": [
    [
      "babelify",
      {
        "plugins": [
          "transform-promise-to-bluebird",
          "transform-runtime"
        ],
        "presets": [
          "es2015"
        ]
      }
    ]
  ]
}
```

We use the bluebird transform since it's the best

When there is a difference between the browser and node use the browserify-browser field.
`/index.js` is always the node-js file and `/browser.js` is the exception
```
"browser": {
  "./lib/something/index.js": "./lib/something/browser.js"
}
```

**requirements**
- Use `val` as a word vs `value`
- Always add `use strict` on top of your js files
- When using promises make sure you catch errors!
- When using generators make sure they run in the browser there is a util in `vigour-util/regenerator`
- Use `camelCase` for variable names or properties (dont use `something_else` for example)
- When using es7 make sure it works in node as well (by babelifying your code)

**recommendations**
- Try to create small concise functions preferbly split up into many files
- Use streams as much as possible when working in node (chunk based operation), to learn about streams check [stream-adventure](https://github.com/substack/stream-adventure)
- When using `vigour-base` use inject with plain objects
- Don't overcomlicate things with reusability, as a rule of thumb when something is done 3 times make something for it but not before


--
###Logs
Never use `console.log` in production logs are only for developing

- If you want to log an error try to integrate it to a service like `slack`
- When using state use `state.root.emit('error', err)`


--
###Directory
Always use a `lib` folder, with the `./lib/index.js` as a main file

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

When using browserstack you need to set the environment vars `BROWSERSTACK_USERNAME=${username}` and `BROWSERSTACK_KEY=${key}`. Set these both locally and in your projects Travis settings.

For now you need to set `NOW_TOKEN` environment variable in Travis


- When creating ui components try to use tests as your go to place to develop the component, run `npm run watch-browser` as defined in the scripts field of this module, same goes for the node.js but then use `npm run watch`
- Enable your repo in travis by going to the [pubic-profile](https://travis-ci.org/profile/vigour-io) for public modules and the [private profile](https://travis-ci.com/profile/vigour-io) for private modules, then click the sync button and check the box for your repo
- Set enviroment variables in travis in the [repo settings](https://travis-ci.org/vigour-io/boilerplate-module/settings)
- Enable coveralls.io by going to [add new repo](https://coveralls.io/repos/new)
- Test as if you're working against a blackbox, you're tests need to do the same as users of modules
don't tests internals test api with results (input - output), this allows you to refactor code many times and does not get you lost with too many tests
- Do not tests things that are not part of your module e.g `module a` uses `module b`, do not test the funcionality of `module b`, do this in `module b`. This keeps tests concise and more valuable
- Coverage is an indicator of normal tests as a rule of thumb when you have 90% coverage it shows that there are some tests. Beware, coverage does not mean that your tests are any good!
- When developing start makeing unit tests, this is your spec from there you can start building the app code, see tests as the tool you develop with, this pattern is called [TDD](https://www.agilealliance.org/glossary/tdd/)
- Use `npm run watch` (located in the script folder) for fast development in node
- Use `npm run watch-browser` to develop for the browser
- When you have a server, do deploys trough travis by now after tests pass


--
###Browser

[List of supported browsers](https://github.com/vigour-io/guidelines/blob/master/README.md#supported-browsers)

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

--
###Server
To start a server use `npm start` with no arguments
To launch a server for testing puposes you can use [now](https://zeit.co/now), they map port 80 to https by default.

- Add your start script in a bin folder `bin/server.js`, this way you ensure that your module is allways usable programaticly
- Do not add too many arguments to your start script, in general having one argument that is the port should be enough for development
- Prefer errors over logs, throw Errors. In most cases where you use`vigour-state` the whole state will be stored in a database, this means every error is reproducable by replaying the history
- Dont add too many `dev-tools` to your server, custom cli tools, too many fancy colorts in the console
- For notifications make a slack channel for your service (e.g. service crashed, new version launched)
- If you want a server that has to be redeployed on push (continous delivery), redploy your service from `travis-ci` after tests pass using `now`, this can be done on the same location as publishing your module


--
###Modules
Always use specific modules e.g. `lodash.merge` vs `lodash`
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
- `uWebsocket` over `ws` or `websocket` (`uWebsocket` is by far the fastest)
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

--
###Versioning
Use semver all the way this means
- `x.0.0` *major*  api changes, or everytime changes break backwards compatibility
- `0.x.0` *minor* for added features
- `0.0.x` *patch* for internal changes or bug fixes

always use the carret `^2.0.0` for dependencies, this updates minor and patch version automaticly

-
###Naming

[Repo Naming Conventions](https://github.com/vigour-io/guidelines/blob/master/README.md#repo-naming-conventions)

Try to be boring but concise with names `blend-state-content`
- `blend`, the product the module is part of
- `state`, the subtopic (state)
- `content`, the specific funcitonality

Extensions of modules always folow the same pattern e.g. `blend-state-content-brightcove` extends or replaces `blend-state-content` This will keep reasoning about behaviours of modules simple for everyone

--
###Installation
Modules should always be installable using
`npm i` or `npm i --production` (wihtout dev dependencies)

-
###Commiting

[Git Workflow Guidelines](https://github.com/vigour-io/guidelines/blob/master/README.md#git-workflow)

Commit to feature branches, there is no develop branch only master and feature, use pull requests even to yourself to merge features into master. Similair model as git flow, minus the develop branch. Reason to remove a devleop branch is to get less version disparity

--
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
