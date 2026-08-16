import { useSurahCtx } from './SurahLayout'
import { useSettings } from '../lib/settings'
import { AyahArabic } from '../components/AyahArabic'
import { PlayIcon } from '../components/Icons'
import { bn } from '../lib/format'
import type { TafsirSection } from '../types'

export function TafsirView() {
  const { surah, play } = useSurahCtx()
  const { settings } = useSettings()

  return (
    <div className="space-y-4 pt-4">
      <Section section={surah.shanENuzul} tone="gold" />
      <Section section={surah.virtues} tone="accent" />

      {surah.ayahs.map((ayah) => (
        <article key={ayah.number} id={`ayah-${ayah.number}`} className="surface scroll-mt-32 p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <span
              className="grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold"
              style={{ background: 'var(--gold-soft)', color: 'var(--gold)' }}
            >
              {bn(ayah.number)}
            </span>
            <span className="text-sm font-semibold">{ayah.theme}</span>
            <button className="btn ms-auto px-3 py-1.5" onClick={() => play(ayah.number)}>
              <PlayIcon size={14} /> শুনুন
            </button>
          </div>

          <AyahArabic
            ayah={ayah}
            tajweed={settings.tajweed}
            size={Math.min(settings.arabicSize, 32)}
            className="mb-2"
          />
          <p className="mb-1 text-base font-medium" style={{ color: 'var(--accent)' }}>
            {ayah.uccharon}
          </p>
          <p
            className="mb-4 border-s-2 ps-3 text-[1.02rem]"
            style={{ borderColor: 'var(--border-strong)' }}
          >
            {ayah.bn}
          </p>

          {ayah.tafsir.map((sec, i) => (
            <div key={i} className="mt-4 first:mt-0">
              <h3 className="mb-1 text-[0.95rem] font-bold">{sec.title}</h3>
              {sec.body.map((p, j) => (
                <p key={j} className="mt-2 text-[0.97rem]" style={{ color: 'var(--text-muted)' }}>
                  {p}
                </p>
              ))}
            </div>
          ))}
        </article>
      ))}

      <p className="px-1 pb-2 text-xs" style={{ color: 'var(--text-faint)' }}>
        তাফসীরের বক্তব্য মূলধারার তাফসীরগ্রন্থ (ইবনে কাসীর, তাবারী, সাদী) ও সহীহ হাদীসের ভিত্তিতে সংক্ষেপে
        উপস্থাপিত। গভীর অধ্যয়নের জন্য মূল গ্রন্থ ও আলিমের পরামর্শ নিন।
      </p>
    </div>
  )
}

function Section({ section, tone }: { section: TafsirSection; tone: 'gold' | 'accent' }) {
  const color = tone === 'gold' ? 'var(--gold)' : 'var(--accent)'
  const bg = tone === 'gold' ? 'var(--gold-soft)' : 'var(--accent-soft)'
  return (
    <section className="surface overflow-hidden">
      <h2 className="px-4 py-2.5 text-base font-bold" style={{ background: bg, color }}>
        {section.title}
      </h2>
      <div className="p-4 pt-3">
        {section.body.map((p, i) => (
          <p key={i} className="mt-2 text-[0.97rem] first:mt-0" style={{ color: 'var(--text-muted)' }}>
            {p}
          </p>
        ))}
      </div>
    </section>
  )
}
