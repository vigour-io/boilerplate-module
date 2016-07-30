'use strict'
require('./style.css')

const getParent = require('brisky-core/lib/render/dom/parent')
const vstamp = require('vigour-stamp')
const ua = require('vigour-ua/navigator')
const ID = 'play-player'
let cnt = 0

exports.isWidget = true
exports.label = 'default'
exports.storeState = true

exports.loading = {
  $: '$root.client.player.stalled.$test',
  $test: (state) => state.compute(),
  class: 'player-loading',
  loader: {}
}

exports.properties = {
  settings: true,
  instance: true
}

const settings = exports.settings = {
  id: ID,
  updateAd (val) {
    set(settings.client.origin().get(['player', 'ad'], {}), val || null)
  },
  updateError (val) {
    set(settings.client.origin().get(['player', 'error'], false), val)
  },
  updateTime (val) {
    if (!settings.fromInteraction) {
      const time = settings.state.get('time', {})
      set(time.get('progress', 0), val / time.get('duration', 0).compute())
    }
  },
  updateDuration (val) {
    if (!settings.fromInteraction) {
      set(settings.state.get('time.duration', {}), val)
    }
  },
  updateVolume (val) {
    if (!settings.fromInteraction) {
      set(settings.client.origin().get(['player', 'volume'], 1), val)
    }
  },
  updatePlaying (val) {
    if (!settings.fromInteraction) {
      set(settings.client.origin().get(['player', 'playing'], false), val)
    }
  },
  updateFullscreen (val) {
    if (!settings.fromInteraction) {
      set(settings.client.origin().get(['player', 'fullscreen'], false), val)
    }
  },
  updateStalled (val) {
    set(settings.client.origin().get(['player', 'stalled'], false), val)
  },
  updateReady (val) {
    set(settings.client.origin().get(['player', 'ready'], false), val)
  }
}

exports.config = {
  type: 'property',
  $: '$root.player',
  render: {
    state () {}
  }
}

exports.props = {
  dir: 'ltr',
  id: ID
}

exports.class = {
  val: ID,
  advertisement: {
    $: '$root.client.player.ad',
    $transform: (val) => !!val.duration
  }
}

exports.types = {
  basic: {
    type: 'property',
    properties: {
      onchange (onchange) {
        this.define({ onchange })
      }
    },
    render: {
      state (target, state, type, stamp) {
        if (type === 'update' && vstamp.type(stamp) !== 'player') {
          const player = target.cParent()
          const instance = player.instance
          const settings = player.settings
          if (instance) {
            settings.fromInteraction = true
            target.onchange(player, target.compute(state), instance, settings)
            settings.fromInteraction = false
          }
        }
      }
    }
  }
}

exports.on = {
  remove (data, stamp) {
    destroy(this)
    const client = this.settings.client
    if (client) {
      client.origin().set({
        player: {
          current: false,
          source: false,
          ready: false
        }
      }, stamp)
    }
  }
}

exports.id = {
  type: 'property',
  $: 'id',
  render: {
    state (target, state, type, stamp) {
      if (type !== 'remove') {
        const pstate = state.cParent()
        const playerState = pstate.getRoot().client.origin().player
        playerState.set({ current: pstate, stalled: true }, stamp)
        playerState.stalled.emit('data')
      }
    }
  }
}

exports.video = {
  type: 'property',
  $: 'video',
  render: {
    state (target, state, type, stamp) {
      if (type !== 'remove') {
        const pstate = state.cParent()
        const playerState = pstate.getRoot().client.origin().player
        playerState.set({ current: pstate, stalled: true }, stamp)
        playerState.stalled.emit('data')
      }
    }
  }
}

exports.time = {
  type: 'basic',
  $: 'time',
  onchange (player, val, instance, settings) {
    if (val.progress && val.duration) {
      const progress = val.progress.compute()
      const duration = val.duration.compute()
      player.setTime(instance, progress * duration, settings)
    }
  }
}

exports.source = {
  type: 'property',
  $: '$root.client.player.source',
  render: {
    state (target, state, type, stamp, subs, tree, id, pid) {
      if (type !== 'remove' && state.compute()) {
        const src = state.origin()
        const current = state.cParent().current
        init(target.cParent(), src, current.origin(), getParent(type, stamp, subs, tree, pid), stamp)
      }
    }
  }
}

exports.animating = {
  type: 'property',
  $: '$root.client.animating',
  render: {
    state (target, state, type, stamp) {
      if (type === 'update' && !target.compute(state)) {
        const player = target.cParent()
        const settings = player.settings
        if (settings.pending) {
          load(player, settings, stamp)
        }
      }
    }
  }
}

exports.locked = {
  type: 'property',
  $: 'locked',
  render: {
    state (target, state, type, stamp) {
      const player = target.cParent()
      const settings = player.settings
      const locked = state && state.compute()
      if (type === 'update') {
        if (settings.source) {
          if (locked) {
            if (!settings.locked) {
              settings.locked = true
              destroy(player)
            }
          } else if (settings.locked) {
            settings.locked = false
            load(player, settings, stamp)
          }
        }
      }
      const client = settings.client ||
        (settings.client = state.getRoot().get('client', {}))
      client.origin().set({ player: { locked } }, stamp)
    }
  }
}

exports.lockedDiv = {
  type: 'lock',
  $: 'locked.$test',
  img: {
    type: 'img',
    $: '$root.content.current'
  },
  $test: (state) => state && state.compute()
}

exports.playing = {
  type: 'property',
  $: '$root.client.player.playing',
  render: {
    state (target, state, type, stamp) {
      if (type === 'update' && vstamp.type(stamp) !== 'player') {
        const player = target.cParent()
        const instance = player.instance
        const settings = player.settings
        if (instance) {
          settings.fromInteraction = true
          player.setPlaying(instance, target.compute(state), settings)
          settings.fromInteraction = false
        } else if (settings.native && target.compute(state)) {
          initNativePlayer(settings)
        }
      }
    }
  }
}

exports.volume = {
  type: 'basic',
  $: '$root.client.player.volume',
  onchange (player, val, instance, settings) {
    player.setVolume(instance, val, settings)
  }
}

exports.fullscreen = {
  type: 'basic',
  $: '$root.client.player.fullscreen',
  onchange (player, val, instance, settings) {
    if (ua.webview === 'cordova') {
      if (global.screen) {
        if (val) {
          if (global.screen.unlockOrientation) {
            global.screen.unlockOrientation()
          }
        } else if (global.screen.lockOrientation) {
          global.screen.lockOrientation('portrait')
        }
        player.setFullscreen(instance, val, settings)
      } else {
        // @todo this should have custom fullscreen
        player.setFullscreen(instance, val, settings)
      }
    } else {
      player.setFullscreen(instance, val, settings)
    }
  }
}

exports.subtitles = {
  type: 'basic',
  $: 'srt',
  onchange (player, val, instance, settings) {
    if (val) {
      val.each(function (track, language) {
        player.setSubtitle(instance, language, track, settings)
      })
    }
  }
}

function init (player, src, pstate, pnode, stamp) {
  const source = src.origin().serialize()

  if (!source.hls && !source.dash && !source.progressive) { return }

  const rootState = pstate.getRoot()
  const apiKey = rootState.get(['player', 'apiKey'])
  const script = rootState.get(['player', 'script'])

  if (!script || !apiKey) { return }

  const settings = player.settings
  let time = pstate.time
  let progress = time && time.progress && time.progress.compute()

  if (!progress || typeof progress !== 'number') {
    progress = 0
    time = false
  }

  const client = rootState.get(['client'], {})
  const playerState = client.origin().get(['player'], {})

  settings.apiKey = apiKey.compute()
  settings.script = script.compute()

  settings.state = pstate
  settings.token = rootState.get(['user', 'token'], {}).compute()
  settings.client = client
  settings.id = pnode.id = ID + cnt++
  settings.progress = progress
  settings.duration = pstate.duration && pstate.duration.compute()

  settings.url = playerState.url && playerState.url.compute()
  settings.playing = playerState.get(['playing'], true).compute()
  settings.volume = playerState.get(['volume'], 1).compute()

  settings.subtitles = pstate.srt
  settings.source = source

  settings.locked = pstate.locked && pstate.locked.compute()

  const ads = pstate.ads || playerState.ads

  settings.ads = ads ? {
    client: 'vast',
    schedule: ads.serialize(),
    admessage: rootState.get(['player', 'admessage'], 'This ad will end in xx seconds.').compute()
  } : void 0

  if (settings.subtitles) {
    settings.subtitles = settings.subtitles.serialize()
  }

  if (!settings.locked) {
    const animating = pstate.getRoot().animating
    if (!animating || !animating.compute()) {
      load(player, settings, stamp)
    } else {
      settings.pending = true
    }
  }
}

function load (player, settings, stamp) {
  const drm = settings.source.drm
  if (drm) {
    if (ua.platform === 'ios') {
      if (ua.webview && drm.fairplay) {
        if (global.VigourPlayer) {
          settings.native = true
          settings.client.origin().set({ player: {
            playing: true,
            stalled: false,
            ready: true
          } })
          return initNativePlayer(settings)
        } else if (typeof document !== 'undefined') {
          document.addEventListener('deviceready', () => initNativePlayer(settings))
        }
      }
    }
  }
  settings.native = false
  settings.pending = false
  player.load(player.instance, settings, (instance) => {
    player.instance = instance
  })
}

function destroy (target) {
  if (target.instance) {
    target.destroy(target.instance, target.settings)
    target.instance = null
  }
  target.settings.native = false
  target.settings.source = false
  if (target.settings.client) {
    target.settings.client.origin().set({ player: { source: false } }, false)
  }
}

function set (target, val) {
  if (target) {
    const pstamp = vstamp.create('player')
    target.set(val, pstamp)
    vstamp.close(pstamp)
  } else {
    console.error('no target to set')
  }
}

function initNativePlayer (settings) {
  addListeners(settings)
  const video = {
    proxy: {
      url: settings.url,
      headers: { 'v-token': settings.token }
    },
    appCertificate: settings.source.drm.fairplay.certificateURL
  }

  const progress = settings.progress
  const duration = settings.duration
  if (duration && progress) {
    video.resumeTime = progress * duration
  }

  global.VigourPlayer.load(function () {
    console.log('native:success')
  }, function () {
    console.log('native:error')
  }, {
    videos: [ video ],
    autoPlay: true,
    autoClose: true
  })
}

function addListeners (settings) {
  const nativePlayer = global.VigourPlayer
  if (!exports.addedListeners && nativePlayer) {
    nativePlayer.onPlayerEvent(function (s) {
      if (s.event === nativePlayer.EventType.PlayerWindowDidClose) {
        set(settings.client.origin(), { player: { playing: false } })
      }
    }, function (e) {
      console.log('event error:', e)
    })
    exports.addedListeners = true
  }
}
