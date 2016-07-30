'use strict'
require('./style.css')

const getParent = require('brisky-core/lib/render/dom/parent')
const injectControls = {
  inject: [
    require('./progress'),
    require('./seekbar'),
    require('./duration'),
    require('./volume'),
    require('./fullscreen')
  ]
}

exports.types = {
  icon: require('@vigour-io/play-icon'),
  controls: {
    $: '$test',
    $test: {
      val (state) {
        const client = state.getRoot().client
        if (client) {
          const player = client.origin().get('player', {})
          return player.get('ready', false).compute()
        }
      },
      $: '$root.client.player.ready'
    },
    child: {
      class: true,
      child: 'Constructor'
    },
    adOverlay: {
      class: 'ad-overlay',
      $: '$root.client.player.ad.url',
      tag: 'a',
      props: {
        href: { $: true },
        target: '_blank'
      },
      $android: {
        $cordova: {
          props: {
            href: null,
            target: null
          },
          on: {
            click (data) {
              const app = global.navigator.app
              if (app && app.loadUrl) {
                app.loadUrl(data.state.compute(), { openExternal: true })
              }
            }
          }
        }
      }
    },
    '!$tv': { bg: {} },
    inject: [ require('./play') ],
    $ios: { '!$phone': injectControls },
    '!$ios': { '!$tv': injectControls },
    showControls: {
      type: 'property',
      $: '$root.client.player.playing',
      render: {
        state (target, state, type, stamp, subs, tree, id, pid) {
          if (type !== 'remove') {
            const pnode = getParent(type, stamp, subs, tree, pid)
            const style = pnode.style
            if (type === 'new') {
              pnode.addEventListener('click', (e) => show(pnode, style, e))
              pnode.addEventListener('mousemove', (e) => show(pnode, style, e))
            }
            pnode._playing = target.compute(state)
            show(pnode, style)
          }
        }
      }
    }
  }
}

exports.adBar = {
  class: 'ad-bar',
  $: '$root.client.player.ad',
  child: {
    type: 'text'
  },
  willEnd: {
    val: 'Deze advertentie zal in ',
    $add: ' '
  },
  in: {
    $: 'left',
    $add: ' '
  },
  seconds: {
    val: 'seconden sluiten.',
    $add: ' '
  },
  count: {
    type: 'element',
    style: { display: 'inline' },
    $: '$test',
    $test: {
      val: (state) => state.count && state.count.compute(),
      $: {
        index: true,
        count: true
      }
    },
    adIndex: {
      type: 'text',
      $: 'index',
      $prepend: '(advertentie ',
      $add: ' van '
    },
    adNr: {
      type: 'text',
      $: 'count',
      $add: ')'
    }
  }
}

exports.controls = {
  class: 'play-player-controls',
  type: 'controls'
}

function show (pnode, style, e) {
  if (pnode._timer) {
    clearTimeout(pnode._timer)
  } else {
    if (e) { e.stopPropagation() }
    const children = pnode.children
    for (var i = children.length - 1; i >= 0; i--) {
      const child = children[i]
      const name = child.className
      if (name === 'ad-overlay') {
        child.style.display = 'block'
      } else if (name !== 'bg') {
        child.style.pointerEvents = 'auto'
      }
    }
    style.opacity = 1
    style.cursor = 'auto'
  }
  pnode._timer = setTimeout(function () {
    if (pnode._playing) {
      const children = pnode.children
      for (var i = children.length - 1; i >= 0; i--) {
        const child = children[i]
        const name = child.className
        if (name === 'ad-overlay') {
          child.style.display = 'none'
        } else if (name !== 'bg') {
          child.style.pointerEvents = 'none'
        }
      }
      style.opacity = 0
      style.cursor = 'none'
    }
    pnode._timer = null
  }, 1000)
}
