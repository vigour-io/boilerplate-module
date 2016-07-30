'use strict'
module.exports = function time (sec) {
  sec = sec | 0
  if (sec < 60) {
    return '0:' + d(sec)
  } else if (sec < 3600) {
    return ((sec / 60) | 0) + ':' + d(sec % 60)
  } else {
    const h = (sec / 3600) | 0
    return h + ':' + d(((sec / 3600 - h) * 60) | 0) + ':' + d(sec % 60)
  }
}

function d (n) {
  return n < 10 ? '0' + n : n
}
