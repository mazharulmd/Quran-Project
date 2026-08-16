import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Surah } from '../types'

export interface PlayOptions {
  /** How many times each ayah in the plan is recited. 1 = once. */
  repeat?: number
  /** Silent seconds inserted between repetitions — your turn to recite. */
  gap?: number
  /** Restart the plan from the top when it finishes. */
  loop?: boolean
}

interface Plan {
  ayahs: number[]
  index: number
  repeat: number
  repeatDone: number
  gap: number
  loop: boolean
}

export interface Recitation {
  /** Ayah number currently loaded in the player, or null when idle. */
  currentAyah: number | null
  isPlaying: boolean
  /** 0–1 position inside the current ayah's segment. */
  progress: number
  /** Which repetition of the current ayah we are on (1-based). */
  repeatDone: number
  repeatTarget: number
  /** True while sitting in the silent gap between repetitions. */
  inGap: boolean
  rate: number
  setRate: (r: number) => void
  ready: boolean
  error: string | null

  /** Play a single ayah, honouring `opts.repeat` / `opts.gap`. */
  playAyah: (ayah: number, opts?: PlayOptions) => void
  /** Play `from`…`to` inclusive as one plan. */
  playRange: (from: number, to: number, opts?: PlayOptions) => void
  /** Play the whole surah from `ayah` to the end. */
  playFrom: (ayah: number, opts?: PlayOptions) => void
  toggle: () => void
  pause: () => void
  stop: () => void
  next: () => void
  prev: () => void
  /** Seek to a fraction (0–1) inside the current ayah. */
  seekFraction: (f: number) => void
}

/**
 * Drives one <audio> element holding the full-surah recording, and turns it
 * into per-ayah playback: segment boundaries come from `ayah.audio`, and a
 * requestAnimationFrame loop stops the clip precisely at the boundary
 * (`timeupdate` only fires ~4×/s, which overshoots by up to 250ms).
 */
export function useRecitation(surah: Surah): Recitation {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const planRef = useRef<Plan | null>(null)
  const rafRef = useRef<number | null>(null)
  const gapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [currentAyah, setCurrentAyah] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [repeatDone, setRepeatDone] = useState(0)
  const [repeatTarget, setRepeatTarget] = useState(1)
  const [inGap, setInGap] = useState(false)
  const [rate, setRateState] = useState(1)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const segments = useMemo(() => {
    const map = new Map<number, { start: number; end: number }>()
    for (const a of surah.ayahs) map.set(a.number, a.audio)
    return map
  }, [surah])

  // One audio element per surah, created lazily on the client.
  useEffect(() => {
    if (!surah.audioUrl) return
    const audio = new Audio()
    audio.preload = 'auto'
    audio.src = new URL(surah.audioUrl, document.baseURI).href
    audioRef.current = audio

    const onReady = () => setReady(true)
    const onError = () =>
      setError('তিলাওয়াতের অডিও লোড করা যায়নি। ইন্টারনেট সংযোগ বা ফাইলের পথ যাচাই করুন।')
    audio.addEventListener('loadedmetadata', onReady)
    audio.addEventListener('canplay', onReady)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('loadedmetadata', onReady)
      audio.removeEventListener('canplay', onReady)
      audio.removeEventListener('error', onError)
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [surah.audioUrl])

  const clearTimers = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (gapTimerRef.current !== null) {
      clearTimeout(gapTimerRef.current)
      gapTimerRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    clearTimers()
    planRef.current = null
    const audio = audioRef.current
    if (audio) audio.pause()
    setIsPlaying(false)
    setInGap(false)
    setProgress(0)
    setRepeatDone(0)
    setCurrentAyah(null)
  }, [clearTimers])

  /** Seeks to an ayah's start and plays it; safe to call before metadata loads. */
  const startSegment = useCallback(
    (ayahNumber: number) => {
      const audio = audioRef.current
      const seg = segments.get(ayahNumber)
      if (!audio || !seg) return

      setCurrentAyah(ayahNumber)
      setProgress(0)
      setInGap(false)

      const go = () => {
        audio.currentTime = seg.start
        audio.playbackRate = rate
        void audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay policies reject play() until a user gesture; the UI
            // surfaces this as "paused" rather than a hard error.
            setIsPlaying(false)
          })
      }

      if (audio.readyState >= 1) go()
      else audio.addEventListener('loadedmetadata', go, { once: true })
    },
    [rate, segments],
  )

  // Declared as a ref so the rAF loop always sees the latest implementation.
  const advanceRef = useRef<() => void>(() => {})

  advanceRef.current = () => {
    const plan = planRef.current
    const audio = audioRef.current
    if (!plan || !audio) return

    const doneReps = plan.repeatDone + 1
    const moreReps = doneReps < plan.repeat

    const resume = (ayahNumber: number) => {
      if (plan.gap > 0) {
        audio.pause()
        setIsPlaying(false)
        setInGap(true)
        gapTimerRef.current = setTimeout(() => {
          setInGap(false)
          startSegment(ayahNumber)
          rafRef.current = requestAnimationFrame(tickRef.current)
        }, plan.gap * 1000)
      } else {
        startSegment(ayahNumber)
        rafRef.current = requestAnimationFrame(tickRef.current)
      }
    }

    if (moreReps) {
      plan.repeatDone = doneReps
      setRepeatDone(doneReps)
      resume(plan.ayahs[plan.index])
      return
    }

    plan.repeatDone = 0
    setRepeatDone(0)
    const nextIndex = plan.index + 1

    if (nextIndex < plan.ayahs.length) {
      plan.index = nextIndex
      resume(plan.ayahs[nextIndex])
      return
    }

    if (plan.loop) {
      plan.index = 0
      resume(plan.ayahs[0])
      return
    }

    stop()
  }

  const tickRef = useRef<() => void>(() => {})

  tickRef.current = () => {
    const audio = audioRef.current
    const plan = planRef.current
    if (!audio || !plan) return

    const ayahNumber = plan.ayahs[plan.index]
    const seg = segments.get(ayahNumber)
    if (!seg) return

    const span = Math.max(seg.end - seg.start, 0.001)
    setProgress(Math.min(1, Math.max(0, (audio.currentTime - seg.start) / span)))

    if (audio.currentTime >= seg.end) {
      rafRef.current = null
      advanceRef.current()
      return
    }
    rafRef.current = requestAnimationFrame(tickRef.current)
  }

  const begin = useCallback(
    (ayahs: number[], opts: PlayOptions | undefined) => {
      if (ayahs.length === 0) return
      clearTimers()
      const repeat = Math.max(1, opts?.repeat ?? 1)
      planRef.current = {
        ayahs,
        index: 0,
        repeat,
        repeatDone: 0,
        gap: Math.max(0, opts?.gap ?? 0),
        loop: opts?.loop ?? false,
      }
      setRepeatTarget(repeat)
      setRepeatDone(0)
      startSegment(ayahs[0])
      rafRef.current = requestAnimationFrame(tickRef.current)
    },
    [clearTimers, startSegment],
  )

  const playAyah = useCallback((ayah: number, opts?: PlayOptions) => begin([ayah], opts), [begin])

  const playRange = useCallback(
    (from: number, to: number, opts?: PlayOptions) => {
      const lo = Math.min(from, to)
      const hi = Math.max(from, to)
      const list = surah.ayahs.filter((a) => a.number >= lo && a.number <= hi).map((a) => a.number)
      begin(list, opts)
    },
    [begin, surah.ayahs],
  )

  const playFrom = useCallback(
    (ayah: number, opts?: PlayOptions) => playRange(ayah, surah.ayahs[surah.ayahs.length - 1].number, opts),
    [playRange, surah.ayahs],
  )

  const pause = useCallback(() => {
    clearTimers()
    audioRef.current?.pause()
    setIsPlaying(false)
    setInGap(false)
  }, [clearTimers])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying || inGap) {
      pause()
      return
    }
    if (!planRef.current) {
      playFrom(surah.ayahs[0].number)
      return
    }
    audio.playbackRate = rate
    void audio
      .play()
      .then(() => {
        setIsPlaying(true)
        rafRef.current = requestAnimationFrame(tickRef.current)
      })
      .catch(() => setIsPlaying(false))
  }, [inGap, isPlaying, pause, playFrom, rate, surah.ayahs])

  const step = useCallback(
    (delta: number) => {
      const plan = planRef.current
      const numbers = surah.ayahs.map((a) => a.number)
      const base = currentAyah ?? numbers[0]
      const target = base + delta
      if (!numbers.includes(target)) return

      if (plan) {
        const idx = plan.ayahs.indexOf(target)
        if (idx >= 0) {
          clearTimers()
          plan.index = idx
          plan.repeatDone = 0
          setRepeatDone(0)
          startSegment(target)
          rafRef.current = requestAnimationFrame(tickRef.current)
          return
        }
      }
      playFrom(target, { repeat: plan?.repeat, gap: plan?.gap })
    },
    [clearTimers, currentAyah, playFrom, startSegment, surah.ayahs],
  )

  const next = useCallback(() => step(1), [step])
  const prev = useCallback(() => step(-1), [step])

  const setRate = useCallback((r: number) => {
    setRateState(r)
    if (audioRef.current) audioRef.current.playbackRate = r
  }, [])

  const seekFraction = useCallback(
    (f: number) => {
      const audio = audioRef.current
      if (!audio || currentAyah == null) return
      const seg = segments.get(currentAyah)
      if (!seg) return
      audio.currentTime = seg.start + Math.min(1, Math.max(0, f)) * (seg.end - seg.start)
      setProgress(f)
    },
    [currentAyah, segments],
  )

  useEffect(() => clearTimers, [clearTimers])

  return {
    currentAyah,
    isPlaying,
    progress,
    repeatDone,
    repeatTarget,
    inGap,
    rate,
    setRate,
    ready,
    error,
    playAyah,
    playRange,
    playFrom,
    toggle,
    pause,
    stop,
    next,
    prev,
    seekFraction,
  }
}
