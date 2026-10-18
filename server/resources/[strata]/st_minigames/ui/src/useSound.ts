import { useMemo, useRef } from 'react'
import beepSrc from './assets/sounds/beep.mp3'
import backSrc from './assets/sounds/back.mp3'
import confirmSrc from './assets/sounds/confirm.mp3'
import positiveSrc from './assets/sounds/positive.mp3'
import negativeSrc from './assets/sounds/negative.mp3'
import tickSrc from './assets/sounds/ticking.ogg'

export type SoundEffect = 'beep' | 'back' | 'confirm' | 'positive' | 'negative' | 'tick' | 'stop'

const VOLUMES: Record<Exclude<SoundEffect, 'stop'>, number> = {
  beep: 0.25,
  back: 0.25,
  confirm: 0.25,
  positive: 0.15,
  negative: 0.25,
  tick: 0.25,
}

const SOURCES: Record<Exclude<SoundEffect, 'stop'>, string> = {
  beep: beepSrc,
  back: backSrc,
  confirm: confirmSrc,
  positive: positiveSrc,
  negative: negativeSrc,
  tick: tickSrc,
}

export function useSound(): (effect?: SoundEffect) => void {
  const pool = useRef<Partial<Record<Exclude<SoundEffect, 'stop'>, HTMLAudioElement>>>({})

  return useMemo(() => (effect: SoundEffect = 'beep') => {
    if (effect === 'stop') {
      for (const a of Object.values(pool.current)) {
        if (!a) continue
        a.pause()
        a.currentTime = 0
      }
      return
    }
    let a = pool.current[effect]
    if (!a) {
      a = new Audio(SOURCES[effect])
      a.volume = VOLUMES[effect]
      if (effect === 'tick') a.loop = true
      pool.current[effect] = a
    }
    try {
      a.currentTime = 0
      void a.play()
    } catch {
      /* noop */
    }
  }, [])
}
