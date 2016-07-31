'use strict'
const test = require('tape')
const boilerplate = require('../../')
const isNode = require('vigour-util/is/node')

module.exports = function () {
  if (isNode) {
    require('vigour-util/require')()
  }
  require('./style.css')

  require('./server')()

  test('hello world', { timeout: 5e3 }, (t) => {
    t.equal(boilerplate(), 'hello world', 'returns hello world')
    t.end()
  })
}
