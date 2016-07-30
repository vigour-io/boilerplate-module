'use strict'
require('./style.css')

const time = require('../util/time')

exports.duration = {
  text: {
    $: 'time.duration',
    $transform: time
  }
}
