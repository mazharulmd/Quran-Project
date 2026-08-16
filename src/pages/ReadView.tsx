import { useEffect } from 'react'
import { useSurahCtx } from './SurahLayout'
import { AyahCard } from '../components/AyahCard'
import { TajweedLegend } from '../components/TajweedLegend'
import { progressKey } from '../lib/storage'
import { PlayIcon } from '../components/Icons'
import { bn } from '../lib/format'

export function ReadView() {
  const { surah, rec, play, progress, prefs } = useSurahCtx()

  // Keep the ayah being recited in view.
  useEffect(() => {
    if (rec.currentAyah == null) return
    document
      .getElementById(`ayah-${rec.currentAyah}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [rec.currentAyah])

  return (
    <div className="space-y-4 pt-4">
      <section className="surface p-4">
        <h2 className="text-base font-bold">সূরা পরিচিতি</h2>
        {surah.intro.map((p, i) => (
          <p key={i} className="mt-2 text-[0.97rem]" style={{ color: 'var(--text-muted)' }}>
            {p}
          </p>
        ))}
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={() => play(surah.ayahs[0].number)}>
            <PlayIcon size={16} /> পুরো সূরা শুনুন
          </button>
          <span className="chip">
            {prefs.repeat > 1 ? `প্রতি আয়াত ${bn(prefs.repeat)} বার` : 'প্রতি আয়াত একবার'}
            {prefs.gap > 0 ? ` · ${bn(prefs.gap)} সে. বিরতি` : ''}
          </span>
        </div>
      </section>

      <TajweedLegend />

      {surah.ayahs.map((ayah) => (
        <AyahCard
          key={ayah.number}
          surahNumber={surah.number}
          ayah={ayah}
          active={rec.currentAyah === ayah.number}
          playing={rec.currentAyah === ayah.number && (rec.isPlaying || rec.inGap)}
          onPlay={() => play(ayah.number)}
          onPause={rec.pause}
          progress={progress[progressKey(surah.number, ayah.number)]}
        />
      ))}
    </div>
  )
}
