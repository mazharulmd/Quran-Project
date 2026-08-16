import { Link } from 'react-router-dom'
import { SURAHS, surahDuration } from '../data'
import { useStoredState, isDue, progressKey, PROGRESS_KEY, type ProgressMap } from '../lib/storage'
import { bn, clock } from '../lib/format'
import {
  BookIcon,
  BrainIcon,
  ChevronRightIcon,
  GridIcon,
  MapIcon,
  PlayIcon,
  ScrollIcon,
} from '../components/Icons'

const FEATURES = [
  { Icon: PlayIcon, title: 'আয়াতভিত্তিক তিলাওয়াত', text: 'প্রতিটি আয়াত আলাদা করে শুনুন, বারবার শুনুন, নিজের গতিতে শুনুন।' },
  { Icon: BookIcon, title: 'আরবি, উচ্চারণ ও অনুবাদ', text: 'তাজবীদ-রঙে আরবি, পাশে বাংলা উচ্চারণ ও অর্থ।' },
  { Icon: GridIcon, title: 'শব্দে শব্দে বিশ্লেষণ', text: 'প্রতিটি শব্দের অর্থ, মূল ধাতু ও ব্যাকরণ।' },
  { Icon: ScrollIcon, title: 'আয়াতভিত্তিক তাফসীর', text: 'শানে নুযূল, ব্যাখ্যা এবং বাস্তব শিক্ষা।' },
  { Icon: MapIcon, title: 'মাইন্ড ম্যাপ', text: 'সূরার ভাষাগত প্যাটার্ন এক নজরে।' },
  { Icon: BrainIcon, title: 'মুখস্থের কর্মশালা', text: 'শুনুন-বলুন, ধাপে ধাপে, শিকল ও পরীক্ষা — সাথে অগ্রগতির হিসাব।' },
]

export function Home() {
  const [progress] = useStoredState<ProgressMap>(PROGRESS_KEY, {})

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16">
      <section className="pt-10 pb-8 text-center">
        <p className="arabic text-4xl sm:text-5xl" style={{ color: 'var(--gold)' }} lang="ar">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <h1 className="mt-5 text-3xl font-bold sm:text-4xl">আয়াতে আয়াতে কুরআন শেখা</h1>
        <p className="mx-auto mt-3 max-w-xl" style={{ color: 'var(--text-muted)' }}>
          প্রতিটি আয়াতের তিলাওয়াত, তাজবীদ-রঙে আরবি, বাংলা উচ্চারণ ও অনুবাদ, শব্দে শব্দে বিশ্লেষণ, তাফসীর
          এবং মুখস্থ করার ধাপে ধাপে পদ্ধতি — সবকিছু এক জায়গায়।
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {SURAHS.map((surah) => {
          const memorized = surah.ayahs.filter(
            (a) => progress[progressKey(surah.number, a.number)]?.status === 'memorized',
          ).length
          const due = surah.ayahs.filter((a) => isDue(progress[progressKey(surah.number, a.number)])).length

          return (
            <Link
              key={surah.number}
              to={`/surah/${surah.number}`}
              className="surface flex items-center gap-4 p-4 transition-colors hover:border-[var(--border-strong)]"
            >
              <span
                className="grid size-14 shrink-0 place-items-center rounded-2xl text-xl font-bold"
                style={{ background: 'var(--gold-soft)', color: 'var(--gold)' }}
              >
                {bn(surah.number)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-lg font-bold">{surah.bnName}</span>
                  <span className="arabic shrink-0 text-xl" style={{ color: 'var(--gold)' }} lang="ar">
                    {surah.nameArabic}
                  </span>
                </span>
                <span className="block text-sm" style={{ color: 'var(--text-muted)' }}>
                  {surah.bnMeaning} · {surah.revelation} · {bn(surah.ayahCount)} আয়াত ·{' '}
                  {clock(surahDuration(surah))} মি.
                </span>
                <span className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className="chip">
                    মুখস্থ {bn(memorized)}/{bn(surah.ayahCount)}
                  </span>
                  {due > 0 && (
                    <span className="chip" style={{ color: 'var(--gold)', borderColor: 'var(--gold)' }}>
                      পুনরাবৃত্তি বাকি {bn(due)}
                    </span>
                  )}
                </span>
              </span>
              <ChevronRightIcon size={20} className="shrink-0 opacity-40" />
            </Link>
          )
        })}
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-bold">অ্যাপে যা যা আছে</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, text }) => (
            <div key={title} className="surface p-4">
              <span
                className="mb-2 grid size-9 place-items-center rounded-xl"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                <Icon size={18} />
              </span>
              <p className="font-semibold">{title}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-10 text-center text-xs" style={{ color: 'var(--text-faint)' }}>
        তিলাওয়াত: শাইখ ইয়াসির আদ-দোসারী। অনুবাদ ও তাফসীর মূলধারার তাফসীরগ্রন্থের ভিত্তিতে সংক্ষেপে
        উপস্থাপিত।
      </p>
    </div>
  )
}
