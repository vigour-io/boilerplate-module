'use strict'
const test = require('tape')
const createServer = require('../../../lib/server')
const http = require('http')

module.exports = function () {
  // specifiy a timeout for your test, in this case 10 seconds
  test('server', { timeout: 1e4 }, (t) => {
    const server = createServer(6001)
    t.plan(1) // use plan for async tests
    http.get('http://localhost:6001', (res) => {
      var result = ''
      res.on('data', (c) => { result += c })
      res.on('end', () => {
        t.equal(result, 'hello world', 'returns hello world')
        server.close()
      })
    })
  })
}
