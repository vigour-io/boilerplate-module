'use strict'
const test = require('tape')
const boilerplate = require('../../')

module.exports = function () {
  test('hello world', { timeout: 5e3 }, (t) => {
    t.equal(boilerplate(), 'hello world', 'returns hello world')
    t.end()
  })
}
