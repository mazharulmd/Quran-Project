import { useState } from 'react'
import { useSurahCtx } from './SurahLayout'
import { repeatedWords } from '../data'
import type { Word } from '../types'
import { useSettings } from '../lib/settings'
import { bn } from '../lib/format'
import { AyahArabic } from '../components/AyahArabic'
import { PlayIcon } from '../components/Icons'

export function WordsView() {
  const { surah, play, rec } = useSurahCtx()
  const { settings } = useSettings()
  const repeats = repeatedWords(surah)

  return (
    <div className="space-y-4 pt-4">
      <section className="surface p-4">
        <h2 className="text-base font-bold">শব্দে শব্দে বিশ্লেষণ</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          প্রতিটি শব্দের আরবি, বাংলা উচ্চারণ, অর্থ এবং মূল ধাতু (root) দেওয়া আছে। যেকোনো শব্দে চাপ দিলে
          তার ব্যাকরণ ও মূলের ব্যাখ্যা খুলবে।
        </p>
      </section>

      {repeats.length > 0 && (
        <section className="surface p-4">
          <h3 className="text-sm font-bold">যে শব্দগুলো বারবার আসে</h3>
          <p className="mt-0.5 mb-3 text-sm" style={{ color: 'var(--text-muted)' }}>
            এগুলো একবার শিখলেই সূরার বড় অংশ চেনা হয়ে যায়।
          </p>
          <div className="flex flex-wrap gap-2">
            {repeats.map((w) => (
              <div
                key={w.arabic}
                className="rounded-xl px-3 py-2 text-center"
                style={{ background: 'var(--bg-sunken)', border: '1px solid var(--border)' }}
              >
                <p className="arabic text-2xl" lang="ar">
                  {w.arabic}
                </p>
                <p className="text-xs" style={{ color: 'var(--accent)' }}>
                  {w.uccharon}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {w.bn} · {bn(w.count)} বার
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {surah.ayahs.map((ayah) => (
        <section key={ayah.number} id={`ayah-${ayah.number}`} className="surface scroll-mt-32 p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <span
              className="grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold"
              style={{ background: 'var(--gold-soft)', color: 'var(--gold)' }}
            >
              {bn(ayah.number)}
            </span>
            <span className="text-sm font-semibold">{ayah.theme}</span>
            <button
              className="btn ms-auto px-3 py-1.5"
              onClick={() => play(ayah.number)}
              aria-label={`আয়াত ${ayah.number} শুনুন`}
            >
              <PlayIcon size={14} /> শুনুন
            </button>
          </div>

          <AyahArabic
            ayah={ayah}
            tajweed={settings.tajweed}
            size={Math.min(settings.arabicSize, 32)}
            className="mb-1 opacity-90"
          />
          <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            {ayah.bn}
          </p>

          {/* Words flow right-to-left, matching how the ayah is recited. */}
          <div dir="rtl" className="flex flex-wrap gap-2">
            {ayah.words.map((word, i) => (
              <WordCard
                key={word.id}
                word={word}
                index={i + 1}
                highlight={rec.currentAyah === ayah.number}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function WordCard({ word, index, highlight }: { word: Word; index: number; highlight: boolean }) {
  const [open, setOpen] = useState(false)
  const hasDetail = Boolean(word.root || word.grammar || word.rootNote)

  return (
    <div
      className="min-w-[8.5rem] flex-1 basis-[8.5rem] rounded-xl p-2.5 text-center transition-colors"
      style={{
        background: highlight ? 'var(--accent-soft)' : 'var(--bg-sunken)',
        border: `1px solid ${highlight ? 'var(--accent)' : 'var(--border)'}`,
      }}
    >
      <button
        type="button"
        className="w-full cursor-pointer"
        onClick={() => hasDetail && setOpen((v) => !v)}
        aria-expanded={hasDetail ? open : undefined}
      >
        <span
          dir="ltr"
          className="mb-1 inline-block rounded-full px-1.5 text-[0.68rem]"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-faint)' }}
        >
          {bn(index)}
        </span>
        <p className="arabic text-3xl leading-tight" lang="ar">
          {word.arabic}
        </p>
        <div dir="ltr">
          <p className="mt-1 text-sm font-medium" style={{ color: 'var(--accent)' }}>
            {word.uccharon}
          </p>
          <p className="text-sm">{word.bn}</p>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            {word.en}
          </p>
        </div>
      </button>

      {open && hasDetail && (
        <div
          dir="ltr"
          className="mt-2 space-y-1 rounded-lg p-2 text-start text-xs"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          {word.root && (
            <p>
              <span style={{ color: 'var(--text-muted)' }}>মূল ধাতু: </span>
              <span className="arabic text-base" lang="ar">
                {word.root}
              </span>
            </p>
          )}
          {word.rootNote && <p style={{ color: 'var(--text-muted)' }}>{word.rootNote}</p>}
          {word.grammar && (
            <p>
              <span style={{ color: 'var(--text-muted)' }}>ব্যাকরণ: </span>
              {word.grammar}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
