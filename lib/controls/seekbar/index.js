'use strict'
require('./style.css')

exports.seekbar = {
  $: '$test',
  storeState: true,
  $test: {
    val (state) {
      if (state) {
        const time = state.origin().time
        if (time) {
          const duration = time.duration
          return duration && typeof duration.compute() === 'number'
        }
      }
    },
    $: 'time.duration'
  },
  seek: {
    bar: {
      style: {
        width: {
          $: 'time.progress',
          $transform: (val) => typeof val === 'number' ? val * 100 + '%' : 0
        }
      },
      button: {}
    }
  },
  on: {
    down: scrub,
    drag: scrub
  }
}

function scrub (data, stamp) {
  const rect = data.target.getBoundingClientRect()
  const width = rect.width
  const height = rect.height
  let n
  if (width > height) {
    n = (data.x - rect.left) / width
  } else {
    n = (data.y - rect.top) / height
  }
  data.state.origin().get('time.progress', 0).set(n > 1 ? 1 : n < 0 ? 0 : n, stamp)
}
