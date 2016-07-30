'use strict'
require('./style.css')

exports.$desktop = {
  volume: {
    $: '$root.client.player.volume',
    0: { class: { $: true, $transform: (val) => val <= 0 && 'inactive' } },
    1: { class: { $: true, $transform: (val) => val <= 0.2 && 'inactive' } },
    2: { class: { $: true, $transform: (val) => val <= 0.4 && 'inactive' } },
    3: { class: { $: true, $transform: (val) => val <= 0.6 && 'inactive' } },
    4: { class: { $: true, $transform: (val) => val <= 0.8 && 'inactive' } },
    on: {
      down: scrub,
      drag: scrub
    }
  }
}

function scrub (data, stamp) {
  const target = data.target
  const rect = target.getBoundingClientRect()
  const left = rect.left + 7
  const nr = (data.x - left) / (rect.width - 15)
  data.state.set(nr > 1 ? 1 : nr < 0 ? 0 : nr, stamp)
}
