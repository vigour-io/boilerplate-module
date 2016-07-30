'use strict'
require('./style.css')

const loadscript = require('tiny-load-script')
const ua = require('vigour-ua/navigator')
const NULL = ua.browser === 'ie' ? '' : null
var script

exports.load = function (instance, settings, done) {
  settings.updateStalled(true)
  settings.updateReady(false)
  if (!script) {
    script = loadscript(settings.script)
    script.onerror = (err) => console.error('script error:', err)
    script.onload = () => exports.load(instance, settings, done)
  } else if (global.bitdash) {
    if (instance) { exports.destroy(instance, settings) }
    instance = setup(settings)
    start(instance, settings)
    done(instance)
  } else {
    script.onload = () => exports.load(instance, settings, done)
  }
}

exports.unlisten = unlisten

exports.destroy = function (instance, settings) {
  unlisten(instance, settings)
  if (instance.destroy) {
    instance.destroy()
  } else {
    console.warn('no destroy!', instance)
  }
}

exports.setTime = function (instance, val, settings) {
  instance.seek(val)
}

exports.setVolume = function (instance, val) {
  instance.setVolume(val * 100)
}

exports.setPlaying = function (instance, val) {
  val ? instance.play() : instance.pause()
}

exports.setFullscreen = function (instance, val, settings) {
  val ? instance.enterFullscreen() : instance.exitFullscreen()
}

exports.setSubtitle = function (instance, language, track) {
  console.log(track, language)
  instance.addSubtitle(track, language, 'subtitle', language, language)
  instance.setSubtitle(language)
}

function setup (settings) {
  const instance = global.bitdash(settings.id)
  const domEvents = settings.domEvents = {}
  let resumePlayback

  const config = {
    key: settings.apiKey,
    style: {
      controls: false,
      bufferingOverlay: false,
      playOverlay: false,
      mouse: false,
      aspectratio: '16:9',
      width: '100%'
    },
    tweaks: {
      file_protocol: true,
      app_id: 'io.vigour.app'
    },
    playback: {
      autoplay: true
    },
    skin: { screenLogoImage: '' },
    source: settings.source
  }

  if (settings.ads) {
    config.advertising = settings.ads
  }

  instance.setup(config)

  document.addEventListener('pause', domEvents.pause = pause)
  document.addEventListener('resume', domEvents.resume = resume)
  document.addEventListener('keydown', domEvents.keydown = keydown)

  // Fix until bitdash handles exitFullscreen correctly on iPad
  const videoEls = document.getElementsByTagName('video')
  for (var i = 0, l = videoEls.length; i < l; i++) {
    videoEls[i].addEventListener('webkitendfullscreen', onExitFullcreenHandler, false)
  }

  return instance

  function onExitFullcreenHandler () {
    settings.updateFullscreen(false)
  }

  function pause () {
    resumePlayback = instance.isPlaying()
    for (var i = 0, l = videoEls.length; i < l; i++) {
      if (!videoEls[i].paused) {
        resumePlayback = true
      }
    }
    instance.pause()
  }

  function resume () {
    if (resumePlayback) {
      instance.play()
    }
  }
}

function start (instance, settings) {
  let adPlaying, interval
  let index = 0
  let prerolls = 0
  let source

  listen(instance, settings,
  'onError', (data) => {
    exports.destroy(instance, settings)
    if (data.code === 3020) {
      data.message = 'drm not supported'
    }
    settings.updateError(data.message)
  },
  'onReady', function (e) {
    if (source === settings.source) { return }

    source = settings.source
    settings.updateReady(true)
    const subtitles = settings.subtitles
    const duration = this.getDuration()
    const volume = this.getVolume()

    if (duration > 0 && duration < Infinity) {
      settings.updateDuration(duration)
      listen(instance, settings,
        'onTimeChanged', (data) => {
          if (!adPlaying) {
            settings.updateTime(data.time)
          }
        },
        'onSeek', (data) => {
          if (!adPlaying) {
            settings.updateTime(data.seekTarget)
          }
        }
      )
      if (settings.progress) {
        setTimeout(() => {
          this.seek(settings.progress * duration)
        }, 1000)
      }
    }

    if (subtitles) {
      for (let lang in subtitles) {
        exports.setSubtitle(instance, lang, subtitles[lang])
      }
    }

    settings.updatePlaying(instance.isPlaying())
    settings.updateStalled(instance.isStalled())
    settings.updateVolume(volume > 5 ? volume / 100 : 0)

    if (settings.ads) {
      for (var i in settings.ads.schedule) {
        if (settings.ads.schedule[i].offset === 'pre') {
          prerolls++
        }
      }
    }

    listen(instance, settings,
      'onAdStarted', (data) => {
        adPlaying = true

        clearInterval(interval)

        interval = setInterval(() => {
          if (!this.getCurrentTime) {
            clearInterval(interval)
          } else {
            const time = this.getCurrentTime()
            settings.updateAd({
              left: Math.round(this.getDuration() - time)
            })
          }
        }, 500)

        const adDuration = Math.round(this.getDuration())
        settings.updatePlaying(instance.isPlaying())

        settings.updateAd({
          index: ++index,
          count: prerolls,
          url: data.clickThroughUrl,
          duration: adDuration,
          left: adDuration
        })
      },
      'onAdSkipped', (data) => {
        adPlaying = false
        clearInterval(interval)
        settings.updateAd(false)
        if (settings.progress) {
          setTimeout(() => this.seek(settings.progress * duration), 1000)
        }
      },
      'onAdFinished', (data) => {
        adPlaying = false
        clearInterval(interval)
        settings.updateAd(false)
        if (settings.progress) {
          setTimeout(() => this.seek(settings.progress * duration), 1000)
        }
      },
      'onPlaybackFinished', (data) => settings.updatePlaying(false),
      'onVolumeChange', (data) => settings.updateVolume(data.targetVolume / 100),
      'onStartBuffering', (data) => settings.updateStalled(true),
      'onStopBuffering', (data) => settings.updateStalled(false),
      'onFullscreenEnter', (data) => settings.updateFullscreen(true),
      'onFullscreenExit', (data) => settings.updateFullscreen(false),
      'onPlay', (data) => settings.updatePlaying(true),
      'onPause', (data) => settings.updatePlaying(false)
    )
  })
}

function listen (instance, settings) {
  if (!settings.events) {
    settings.events = {}
  }
  for (var i = 2, l = arguments.length; i < l; i++) {
    const key = arguments[i]
    const listener = arguments[i + 1]
    instance.addEventHandler(key, listener)
    settings.events[key] = listener
  }
}

function unlisten (instance, settings) {
  // remove player events
  if (instance.removeEventHandler) {
    const events = settings.events
    for (let i in events) {
      instance.removeEventHandler(i, events[i])
    }
  }
  settings.events = {}
  // remove dom events
  const domEvents = settings.domEvents
  if (domEvents) {
    for (var i in domEvents) {
      document.removeEventListener(i, domEvents[i])
    }
    settings.domEvents = {}
  }
}

function keydown (e) {
  const keyCode = e.keyCode
  if (keyCode === 32) { // space
    if (!document.activeElement || document.activeElement.nodeName !== 'INPUT') {
      e.preventDefault()
    }
  } else if (keyCode === 13) { // on enter
    if (!document.activeElement || document.activeElement.nodeName !== 'INPUT') {
      const player = global.bitdash('*')[0]
      if (player) {
        if (player.isPlaying()) {
          player.pause()
        } else {
          player.play()
        }
      }
    }
  }
}
