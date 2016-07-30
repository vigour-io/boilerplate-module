'use strict'
const test = require('tape')
const render = require('brisky/render')
const ua = require('vigour-ua/navigator')

module.exports = function (elem, state) {
  document.body.appendChild(render(elem, state))
  const playerState = state.client.origin().player
  if (ua.device === 'desktop') {
    test('play-player - desktop', { timeout: 10000 }, function (t) {
      pollPlayer(instance => {
        universalInit(instance, t)
        once(instance, instance.isReady(), 'onReady', () => {
          universalReady(instance, t)
          once(instance, instance.isPlaying(), 'onPlay', () => {
            t.pass('video autoplays')
            t.ok(playerState.playing.compute(), 'playerState.playing === true')
            once(instance, 'onTimeChanged', (data) => {
              const progress = data.time / instance.getDuration()
              t.pass(`updates time: ${data.time}`)
              t.equals(state.time.progress.compute(), progress, `content state has progress: ${progress}`)
              t.notOk(playerState.stalled.compute(), 'player is not stalled')
              t.end()
            })
          })
        })
      })
    })
  } else if (ua.platform === 'ios') {
    test('play-player - ios', { timeout: 10000 }, function (t) {
      pollPlayer(instance => {
        universalInit(instance, t)
        once(instance, instance.isReady(), 'onReady', () => {
          universalReady(instance, t)
          once(instance, !instance.isPlaying(), 'onPause', () => {
            t.pass('video is paused on start')
            t.notOk(playerState.stalled.compute(), 'player is not stalled')
            t.end()
          })
        })
      })
    })
  } else if (ua.platform === 'android') {
    test('play-player - android', { timeout: 10000 }, function (t) {
      pollPlayer(instance => {
        universalInit(instance, t)
        t.end()
      })
    })
  }

  function universalInit (instance, t) {
    t.ok(instance, 'create an instance')
    t.ok(playerState.source.origin().keys().length, 'player sets playerState.source')
  }

  function universalReady (instance, t) {
    const duration = instance.getDuration()
    t.pass('player fires ready event')
    t.ok(playerState.ready.compute(), 'player sets playerState.ready')
    t.equals(state.time.duration.compute(), duration, `content state has duration: ${duration}`)
  }
}

function once (instance, condition, type, cb) {
  if (arguments.length === 3) {
    cb = type
    type = condition
    condition = false
  }
  if (condition) {
    cb()
  } else {
    instance.addEventHandler(type, function listener () {
      instance.removeEventHandler(type, listener)
      cb.apply(this, arguments)
    })
  }
}

function pollPlayer (cb) {
  global.bitdash ? cb(global.bitdash('*')[0]) : setTimeout(() => pollPlayer(cb), 500)
}
