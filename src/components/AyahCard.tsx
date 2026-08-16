import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Ayah } from '../types'
import { AyahArabic } from './AyahArabic'
import { TAJWEED_RULES } from '../data/tajweed'
import { useSettings } from '../lib/settings'
import { bn } from '../lib/format'
import { STATUS_LABEL, type AyahProgress } from '../lib/storage'
import { ChevronDownIcon, ChevronRightIcon, PauseIcon, PlayIcon, SparkIcon } from './Icons'

interface Props {
  surahNumber: number
  ayah: Ayah
  active: boolean
  playing: boolean
  onPlay: () => void
  onPause: () => void
  progress?: AyahProgress
}

export function AyahCard({ surahNumber, ayah, active, playing, onPlay, onPause, progress }: Props) {
  const { settings } = useSettings()
  const [openNotes, setOpenNotes] = useState(false)

  return (
    <article
      id={`ayah-${ayah.number}`}
      className="surface scroll-mt-32 p-4 sm:p-5"
      style={
        active
          ? { borderColor: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent-soft)' }
          : undefined
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className="grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold"
          style={{ background: 'var(--gold-soft)', color: 'var(--gold)' }}
        >
          {bn(ayah.number)}
        </span>
        <span className="text-sm font-semibold">{ayah.theme}</span>
        {progress && progress.status !== 'new' && (
          <span
            className="chip"
            style={
              progress.status === 'memorized'
                ? { color: 'var(--accent)', borderColor: 'var(--accent)' }
                : undefined
            }
          >
            {STATUS_LABEL[progress.status]}
          </span>
        )}
        <div className="ms-auto flex items-center gap-1.5">
          <Link
            to={`/surah/${surahNumber}/words#ayah-${ayah.number}`}
            className="btn px-2.5 py-1 text-xs"
          >
            শব্দ
          </Link>
          <Link
            to={`/surah/${surahNumber}/tafsir#ayah-${ayah.number}`}
            className="btn px-2.5 py-1 text-xs"
          >
            তাফসীর
          </Link>
          <button
            className="btn btn-primary px-3 py-1.5"
            onClick={playing ? onPause : onPlay}
            aria-label={playing ? `আয়াত ${ayah.number} থামান` : `আয়াত ${ayah.number} শুনুন`}
          >
            {playing ? <PauseIcon size={15} /> : <PlayIcon size={15} />}
          </button>
        </div>
      </div>

      <AyahArabic ayah={ayah} tajweed={settings.tajweed} size={settings.arabicSize} className="mb-3" />

      {settings.showUccharon && (
        <p className="uccharon mb-1.5 text-lg font-medium" style={{ color: 'var(--accent)' }}>
          {ayah.uccharon}
        </p>
      )}
      {settings.showTranslit && (
        <p className="mb-1.5 text-sm italic" style={{ color: 'var(--text-faint)' }}>
          {ayah.translit}
        </p>
      )}
      {settings.showTranslation && <p className="text-[1.05rem]">{ayah.bn}</p>}

      <button
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium"
        style={{ color: 'var(--text-muted)' }}
        onClick={() => setOpenNotes((v) => !v)}
        aria-expanded={openNotes}
      >
        {openNotes ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
        তাজবীদ ও মুখস্থের কৌশল
      </button>

      {openNotes && (
        <div className="mt-2 space-y-2">
          {ayah.tajweedNotes.map((note, i) => {
            const rule = TAJWEED_RULES[note.rule]
            return (
              <div
                key={i}
                className="rounded-lg p-2.5 text-sm"
                style={{
                  background: `color-mix(in srgb, var(${rule.cssVar}) 7%, transparent)`,
                  borderInlineStart: `3px solid var(${rule.cssVar})`,
                }}
              >
                <span className="font-semibold" style={{ color: `var(${rule.cssVar})` }}>
                  {rule.bnName}
                </span>
                <span> — {note.text}</span>
              </div>
            )
          })}
          <div
            className="rounded-lg p-2.5 text-sm"
            style={{ background: 'var(--gold-soft)', borderInlineStart: '3px solid var(--gold)' }}
          >
            <span className="inline-flex items-center gap-1 font-semibold" style={{ color: 'var(--gold)' }}>
              <SparkIcon size={15} /> মুখস্থের কৌশল
            </span>
            <p className="mt-0.5">{ayah.memoryHook}</p>
          </div>
        </div>
      )}
    </article>
  )
}
