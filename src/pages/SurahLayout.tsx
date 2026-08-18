import { NavLink, Outlet, useOutletContext, useParams } from 'react-router-dom'
import { getSurah, surahDuration } from '../data'
import { useRecitation, type Recitation } from '../lib/useRecitation'
import { useStoredState, type ProgressMap, PROGRESS_KEY } from '../lib/storage'
import { PlayerBar, type PlaybackPrefs } from '../components/PlayerBar'
import { BookIcon, BrainIcon, GridIcon, MapIcon, ScrollIcon } from '../components/Icons'
import { bn, clock } from '../lib/format'
import type { Surah } from '../types'

export interface SurahCtx {
  surah: Surah
  rec: Recitation
  /** Start playback at an ayah using the current player preferences. */
  play: (ayah: number) => void
  prefs: PlaybackPrefs
  setPrefs: (next: Partial<PlaybackPrefs>) => void
  progress: ProgressMap
  setProgress: (next: ProgressMap | ((p: ProgressMap) => ProgressMap)) => void
}

export function useSurahCtx() {
  return useOutletContext<SurahCtx>()
}

const TABS = [
  { to: '', label: 'পাঠ', Icon: BookIcon, end: true },
  { to: 'words', label: 'শব্দে শব্দে', Icon: GridIcon },
  { to: 'tafsir', label: 'তাফসীর', Icon: ScrollIcon },
  { to: 'mindmap', label: 'মাইন্ড ম্যাপ', Icon: MapIcon },
  { to: 'memorize', label: 'মুখস্থ', Icon: BrainIcon },
]

export function SurahLayout() {
  const { number } = useParams()
  const surah = getSurah(number)

  const [prefs, setPrefsState] = useStoredState<PlaybackPrefs>('player:v1', {
    repeat: 1,
    gap: 0,
    continuous: true,
  })
  const [progress, setProgress] = useStoredState<ProgressMap>(PROGRESS_KEY, {})

  // Hooks must run unconditionally, so fall back to the first surah's shape.
  const rec = useRecitation(surah ?? EMPTY_SURAH)

  if (!surah) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-lg font-semibold">এই সূরাটি এখনও যোগ করা হয়নি।</p>
        <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
          হোম পেজে ফিরে গিয়ে উপলব্ধ সূরা বেছে নিন।
        </p>
      </div>
    )
  }

  const setPrefs = (next: Partial<PlaybackPrefs>) => setPrefsState((p) => ({ ...p, ...next }))

  const play = (ayah: number) => {
    const opts = { repeat: prefs.repeat, gap: prefs.gap }
    if (prefs.continuous) rec.playFrom(ayah, opts)
    else rec.playAyah(ayah, opts)
  }

  const ctx: SurahCtx = { surah, rec, play, prefs, setPrefs, progress, setProgress }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-32">
      <section className="pt-6 pb-4 text-center">
        <p className="arabic mx-auto text-4xl sm:text-5xl" style={{ color: 'var(--gold)' }}>
          {surah.nameArabic}
        </p>
        <h1 className="mt-2 text-2xl font-bold">{surah.bnName}</h1>
        <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
          {surah.bnMeaning} · {surah.revelation} · {bn(surah.ayahCount)} আয়াত
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          <span className="chip">🎙️ {surah.reciter.bnName}</span>
          <span className="chip">⏱ {clock(surahDuration(surah))} মিনিট</span>
          <span className="chip">📖 সূরা নং {bn(surah.number)}</span>
        </div>
      </section>

      <nav
        className="no-scrollbar sticky top-[61px] z-20 -mx-4 flex gap-1 overflow-x-auto px-4 py-2 backdrop-blur"
        style={{ background: 'color-mix(in srgb, var(--bg) 90%, transparent)' }}
        aria-label="সূরার অংশসমূহ"
      >
        {TABS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className="btn shrink-0 px-3 py-1.5 text-sm"
            style={({ isActive }) =>
              isActive
                ? { background: 'var(--accent-soft)', borderColor: 'var(--accent)', color: 'var(--accent)' }
                : {}
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <Outlet context={ctx} />

      <PlayerBar surah={surah} rec={rec} prefs={prefs} setPrefs={setPrefs} />
    </div>
  )
}

/** Placeholder so `useRecitation` can be called before the surah check. */
const EMPTY_SURAH = {
  number: 0,
  nameArabic: '',
  bnName: '',
  enName: '',
  bnMeaning: '',
  revelation: '',
  ayahCount: 0,
  reciter: { name: '', bnName: '' },
  audioUrl: '',
  intro: [],
  shanENuzul: { title: '', body: [] },
  virtues: { title: '', body: [] },
  ayahs: [],
  mindMap: { intro: '', rootAyah: 0, rootArabic: '', rootUccharon: '', rootBn: '', branches: [], patterns: [] },
} satisfies Surah
