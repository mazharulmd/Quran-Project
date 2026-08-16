import { useState } from 'react'
import type { Surah } from '../types'
import type { Recitation } from '../lib/useRecitation'
import { bn } from '../lib/format'
import {
  ChevronDownIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  SlidersIcon,
  StopIcon,
} from './Icons'

export interface PlaybackPrefs {
  /** Times each ayah repeats before moving on. */
  repeat: number
  /** Silent seconds after each repetition — your turn to recite. */
  gap: number
  /** Continue to the following ayahs instead of stopping after one. */
  continuous: boolean
}

interface Props {
  surah: Surah
  rec: Recitation
  prefs: PlaybackPrefs
  setPrefs: (next: Partial<PlaybackPrefs>) => void
}

const RATES = [0.5, 0.75, 1, 1.25, 1.5]
const REPEATS = [1, 3, 5, 7, 10]
const GAPS = [0, 1, 2, 3, 5]

export function PlayerBar({ surah, rec, prefs, setPrefs }: Props) {
  const [open, setOpen] = useState(false)
  const ayah = surah.ayahs.find((a) => a.number === rec.currentAyah)

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur"
      style={{
        borderColor: 'var(--border)',
        background: 'color-mix(in srgb, var(--bg-elevated) 92%, transparent)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {open && (
        <div
          className="mx-auto max-w-4xl px-4 pt-3 pb-1"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <Choice
              label="গতি"
              value={rec.rate}
              options={RATES.map((r) => ({ value: r, label: `${bn(r)}×` }))}
              onChange={(v) => rec.setRate(v)}
            />
            <Choice
              label="পুনরাবৃত্তি"
              value={prefs.repeat}
              options={REPEATS.map((r) => ({ value: r, label: r === 1 ? 'একবার' : `${bn(r)} বার` }))}
              onChange={(v) => setPrefs({ repeat: v })}
            />
            <Choice
              label="বিরতি (নিজে পড়ার সময়)"
              value={prefs.gap}
              options={GAPS.map((g) => ({ value: g, label: g === 0 ? 'নেই' : `${bn(g)} সে.` }))}
              onChange={(v) => setPrefs({ gap: v })}
            />
          </div>
          <label className="mt-3 mb-2 flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <input
              type="checkbox"
              checked={prefs.continuous}
              onChange={(e) => setPrefs({ continuous: e.target.checked })}
              className="size-4 accent-current"
            />
            পরের আয়াতগুলোও একটানা চলবে
          </label>
        </div>
      )}

      {/* Progress within the current ayah */}
      <button
        type="button"
        aria-label="আয়াতের ভেতরে সরান"
        className="block h-1.5 w-full cursor-pointer"
        style={{ background: 'var(--bg-sunken)' }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          rec.seekFraction((e.clientX - rect.left) / rect.width)
        }}
      >
        <span
          className="block h-full transition-[width] duration-100"
          style={{ width: `${rec.progress * 100}%`, background: 'var(--accent)' }}
        />
      </button>

      <div className="mx-auto flex max-w-4xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">
            {ayah ? `আয়াত ${bn(ayah.number)} — ${ayah.theme}` : surah.bnName}
          </div>
          <div className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>
            {rec.error
              ? rec.error
              : rec.inGap
                ? '⟶ এখন আপনি পড়ুন…'
                : ayah
                  ? ayah.uccharon
                  : `${surah.reciter.bnName} · ${bn(surah.ayahCount)} আয়াত`}
          </div>
        </div>

        {prefs.repeat > 1 && rec.currentAyah != null && (
          <span className="chip hidden sm:inline-flex">
            {bn(rec.repeatDone + 1)}/{bn(rec.repeatTarget)}
          </span>
        )}

        <div className="flex items-center gap-1">
          <button
            className="btn px-2"
            onClick={rec.prev}
            disabled={rec.currentAyah === surah.ayahs[0].number || rec.currentAyah == null}
            aria-label="আগের আয়াত"
          >
            <PrevIcon size={18} />
          </button>
          <button
            className="btn btn-primary size-11 rounded-full p-0"
            onClick={rec.toggle}
            aria-label={rec.isPlaying ? 'থামান' : 'শুনুন'}
          >
            {rec.isPlaying || rec.inGap ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
          </button>
          <button
            className="btn px-2"
            onClick={rec.next}
            disabled={rec.currentAyah === surah.ayahs[surah.ayahs.length - 1].number}
            aria-label="পরের আয়াত"
          >
            <NextIcon size={18} />
          </button>
          <button
            className="btn hidden px-2 sm:inline-flex"
            onClick={rec.stop}
            disabled={rec.currentAyah == null}
            aria-label="বন্ধ করুন"
          >
            <StopIcon size={16} />
          </button>
          <button
            className="btn px-2"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="প্লেয়ার সেটিংস"
          >
            {open ? <ChevronDownIcon size={18} /> : <SlidersIcon size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}

function Choice<T extends number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o.value}
            className="btn px-2.5 py-1 text-xs"
            aria-pressed={value === o.value}
            style={
              value === o.value
                ? { background: 'var(--accent-soft)', borderColor: 'var(--accent)', color: 'var(--accent)' }
                : undefined
            }
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
