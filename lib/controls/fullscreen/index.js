'use strict'
require('./style.css')

exports.fullscreen = {
  $: '$root.client.player.fullscreen',
  type: 'icon',
  class: {
    $: true,
    $transform: (val) => val ? 'fullscreen icon-fullscreen-exit' : 'fullscreen icon-fullscreen'
  },
  on: {
    click (data, stamp) {
      const fullscreen = data.state
      fullscreen.set(!fullscreen.compute(), stamp)
    }
  }
}
