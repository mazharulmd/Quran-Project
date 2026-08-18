import { useSurahCtx } from './SurahLayout'
import { bn } from '../lib/format'
import { PlayIcon, SparkIcon } from '../components/Icons'

/**
 * A screen version of the printed mind map: a root ayah, the branches growing
 * from it, plus the linguistic patterns that make the surah stick.
 */
export function MindMapView() {
  const { surah, play, rec } = useSurahCtx()
  const map = surah.mindMap

  return (
    <div className="space-y-4 pt-4">
      <section className="surface p-4">
        <h2 className="text-base font-bold">মাইন্ড ম্যাপ — এক নজরে পুরো সূরা</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          {map.intro}
        </p>
      </section>

      {/* Root */}
      <div className="flex flex-col items-center">
        <div
          className="w-full max-w-md rounded-2xl p-4 text-center"
          style={{ background: 'var(--gold-soft)', border: '1px solid var(--gold)' }}
        >
          <p className="chip mb-2" style={{ color: 'var(--gold)', borderColor: 'var(--gold)' }}>
            আয়াত {bn(map.rootAyah)} · কাণ্ড
          </p>
          <p className="arabic text-3xl sm:text-4xl" lang="ar">
            {map.rootArabic}
          </p>
          <p className="mt-2 font-medium" style={{ color: 'var(--gold)' }}>
            {map.rootUccharon}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {map.rootBn}
          </p>
          <button className="btn mt-3 px-3 py-1.5 text-xs" onClick={() => play(map.rootAyah)}>
            <PlayIcon size={13} /> শুনুন
          </button>
        </div>
        <div className="h-6 w-px" style={{ background: 'var(--border-strong)' }} aria-hidden />
      </div>

      {/* Branches — laid out right-to-left like the printed map */}
      <div className="relative">
        <div
          className="absolute inset-x-[12.5%] -top-3 hidden h-px lg:block"
          style={{ background: 'var(--border-strong)' }}
          aria-hidden
        />
        <div dir="rtl" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {map.branches.map((b) => {
            const active = rec.currentAyah === b.ayah
            return (
              <div key={b.ayah} className="flex flex-col items-center">
                <div
                  className="hidden h-3 w-px lg:block"
                  style={{ background: 'var(--border-strong)' }}
                  aria-hidden
                />
                <div
                  className="surface flex w-full flex-1 flex-col p-3.5 text-center transition-colors"
                  style={
                    active
                      ? { borderColor: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent-soft)' }
                      : undefined
                  }
                >
                  <div dir="ltr" className="mb-1 flex items-center justify-between">
                    <span className="chip">আয়াত {bn(b.ayah)}</span>
                    <span className="text-xl" aria-hidden>
                      {b.icon}
                    </span>
                  </div>

                  <p className="arabic text-lg" lang="ar" style={{ color: 'var(--gold)' }}>
                    {b.stem}
                  </p>
                  <p className="arabic text-2xl leading-snug" lang="ar">
                    {b.payload}
                  </p>

                  <div dir="ltr" className="mt-2">
                    <p className="text-xs" style={{ color: 'var(--gold)' }}>
                      {b.stemUccharon}
                    </p>
                    <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                      {b.payloadUccharon}
                    </p>
                    <p className="mt-1 text-sm">{b.payloadBn}</p>
                    <p className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {b.gist}
                    </p>
                    <button className="btn mt-2.5 w-full px-2 py-1 text-xs" onClick={() => play(b.ayah)}>
                      <PlayIcon size={12} /> শুনুন
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <section className="surface p-4">
        <h3 className="inline-flex items-center gap-1.5 text-base font-bold">
          <SparkIcon size={18} /> ভাষাগত ও মানসিক প্যাটার্ন
        </h3>
        <p className="mt-0.5 mb-3 text-sm" style={{ color: 'var(--text-muted)' }}>
          এই প্যাটার্নগুলো চিনতে পারলে লম্বা আয়াতও পরিচিত টুকরোয় ভেঙে যায়।
        </p>
        <ol className="space-y-3">
          {map.patterns.map((p, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="grid size-7 shrink-0 place-items-center rounded-lg text-sm font-bold"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                {bn(i + 1)}
              </span>
              <div>
                <p className="font-semibold">{p.title}</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {p.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
