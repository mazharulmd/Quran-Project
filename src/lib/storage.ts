import { useCallback, useEffect, useState } from 'react'

const PREFIX = 'quran-pathshala'

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(`${PREFIX}:${key}`)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify(value))
  } catch {
    /* quota or private mode — progress is a convenience, never a hard failure */
  }
}

/** State backed by localStorage, kept in sync across tabs. */
export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => read(key, initial))

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        write(key, resolved)
        return resolved
      })
    },
    [key],
  )

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === `${PREFIX}:${key}`) setValue(read(key, initial))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
    // `initial` is only used as a fallback for a cross-tab re-read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return [value, update] as const
}

export type AyahStatus = 'new' | 'learning' | 'memorized'

export interface AyahProgress {
  status: AyahStatus
  /** How many supervised repetitions have been logged. */
  reps: number
  /** Leitner box index into REVIEW_INTERVALS_DAYS. */
  box: number
  /** ISO date of the last review, or null. */
  lastReviewed: string | null
  /** ISO date the ayah is next due, or null when never reviewed. */
  dueAt: string | null
}

export type ProgressMap = Record<string, AyahProgress>

/** Leitner-style spacing: a correct recall moves up one box. */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 21, 60]

export const PROGRESS_KEY = 'progress:v1'

export function emptyAyahProgress(): AyahProgress {
  return { status: 'new', reps: 0, box: 0, lastReviewed: null, dueAt: null }
}

export function progressKey(surah: number, ayah: number) {
  return `${surah}:${ayah}`
}

function addDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

/** Applies a review outcome and returns the updated entry. */
export function applyReview(entry: AyahProgress, outcome: 'again' | 'good'): AyahProgress {
  const reps = entry.reps + 1
  if (outcome === 'again') {
    return {
      status: 'learning',
      reps,
      box: 0,
      lastReviewed: new Date().toISOString(),
      dueAt: addDays(REVIEW_INTERVALS_DAYS[0]),
    }
  }
  const box = Math.min(entry.box + 1, REVIEW_INTERVALS_DAYS.length - 1)
  return {
    // Two clean recalls in a row is the bar for "memorised".
    status: box >= 2 ? 'memorized' : 'learning',
    reps,
    box,
    lastReviewed: new Date().toISOString(),
    dueAt: addDays(REVIEW_INTERVALS_DAYS[box]),
  }
}

export function isDue(entry: AyahProgress | undefined): boolean {
  if (!entry || !entry.dueAt) return false
  return new Date(entry.dueAt).getTime() <= Date.now()
}

export const STATUS_LABEL: Record<AyahStatus, string> = {
  new: 'নতুন',
  learning: 'শিখছি',
  memorized: 'মুখস্থ',
}
