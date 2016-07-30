'use strict'
require('./style.css')

const time = require('../util/time')

exports.progress = {
  text: {
    $: 'time',
    $transform: (val, state) => {
      if (val) {
        const duration = state.duration
        const progress = state.progress
        return time(progress && duration ? progress.compute() * duration.compute() : 0)
      }
    }
  }
}
