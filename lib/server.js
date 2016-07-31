'use strict'
const http = require('http')

module.exports = function startServer (port) {
  if (!port) {
    port = 80 // allways 80 as a default
  }
  const server = http.createServer((req, res) => {
    // allways add these non-cors headers to a server
    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.setHeader('Accept', '*/*')
    res.end('hello world')
  }).listen(port)
  return server
}
