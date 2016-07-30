'use strict'
require('./style.css')

exports.play = {
  type: 'icon',
  class: {
    $: '$root.client.player.playing',
    $transform: (val) => `icon-${val === true ? 'pause' : 'play'}-o` + ' play'
  },
  on: {
    click (data, stamp) {
      const playing = data.state.get('getRoot.client.origin.player.playing', false)
      playing.set(!playing.compute(), stamp)
    }
  }
}
