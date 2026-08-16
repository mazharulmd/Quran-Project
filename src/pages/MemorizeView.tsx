import { useMemo, useState } from 'react'
import { useSurahCtx } from './SurahLayout'
import type { Ayah, Surah, Word } from '../types'
import { useSettings } from '../lib/settings'
import { bn, relativeDays } from '../lib/format'
import {
  applyReview,
  emptyAyahProgress,
  isDue,
  progressKey,
  STATUS_LABEL,
  type ProgressMap,
} from '../lib/storage'
import {
  CheckIcon,
  CloseIcon,
  EyeIcon,
  EyeOffIcon,
  PauseIcon,
  PlayIcon,
  RefreshIcon,
  SparkIcon,
} from '../components/Icons'

type Drill = 'listen' | 'reveal' | 'chain' | 'quiz'

const DRILLS: { id: Drill; label: string; hint: string }[] = [
  { id: 'listen', label: 'শুনুন ও বলুন', hint: 'তিলাওয়াত বারবার শুনে সাথে সাথে বলুন।' },
  { id: 'reveal', label: 'ধাপে ধাপে', hint: 'শব্দ ঢেকে দিয়ে স্মৃতি থেকে পড়ার অনুশীলন।' },
  { id: 'chain', label: 'শিকল পদ্ধতি', hint: 'আয়াত জোড়া লাগিয়ে পুরো সূরা গাঁথুন।' },
  { id: 'quiz', label: 'পরীক্ষা', hint: 'পরের শব্দ কোনটি — নিজেকে যাচাই করুন।' },
]

export function MemorizeView() {
  const [drill, setDrill] = useState<Drill>('listen')

  const active = DRILLS.find((d) => d.id === drill)!

  return (
    <div className="space-y-4 pt-4">
      <section className="surface p-4">
        <h2 className="text-base font-bold">মুখস্থ করার কর্মশালা</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          হিফযের পরীক্ষিত ধারাবাহিকতা: প্রথমে <b>শুনুন ও বলুন</b> — কান দিয়ে ধ্বনি বসান; তারপর{' '}
          <b>ধাপে ধাপে</b> — চোখের সাহায্য কমিয়ে আনুন; তারপর <b>শিকল</b> — আয়াতগুলো জোড়া লাগান; শেষে{' '}
          <b>পরীক্ষা</b> — নিজেকে যাচাই করুন। প্রতিদিনের পুনরাবৃত্তির হিসাব নিচের অগ্রগতি তালিকায় থাকবে।
        </p>
      </section>

      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
        {DRILLS.map((d) => (
          <button
            key={d.id}
            className="btn shrink-0 text-sm"
            aria-pressed={drill === d.id}
            onClick={() => setDrill(d.id)}
            style={
              drill === d.id
                ? { background: 'var(--accent-soft)', borderColor: 'var(--accent)', color: 'var(--accent)' }
                : undefined
            }
          >
            {d.label}
          </button>
        ))}
      </div>
      <p className="-mt-2 px-1 text-sm" style={{ color: 'var(--text-muted)' }}>
        {active.hint}
      </p>

      {drill === 'listen' && <ListenDrill />}
      {drill === 'reveal' && <RevealDrill />}
      {drill === 'chain' && <ChainDrill />}
      {drill === 'quiz' && <QuizDrill />}

      <ProgressTracker />
    </div>
  )
}

/* ---------------------------------------------------------------- helpers */

function useAyahPicker() {
  const { surah } = useSurahCtx()
  const [ayahNumber, setAyahNumber] = useState(surah.ayahs[0].number)
  const ayah = surah.ayahs.find((a) => a.number === ayahNumber) ?? surah.ayahs[0]
  return { surah, ayah, ayahNumber, setAyahNumber }
}

function AyahPicker({
  surah,
  value,
  onChange,
}: {
  surah: Surah
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-1.5">
      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
        আয়াত:
      </span>
      {surah.ayahs.map((a) => (
        <button
          key={a.number}
          className="btn size-9 justify-center p-0 text-sm"
          aria-pressed={value === a.number}
          onClick={() => onChange(a.number)}
          style={
            value === a.number
              ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#04140f' }
              : undefined
          }
        >
          {bn(a.number)}
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------ listen drill */

function ListenDrill() {
  const { rec, prefs, setPrefs } = useSurahCtx()
  const { surah, ayah, ayahNumber, setAyahNumber } = useAyahPicker()
  const { settings } = useSettings()
  const [reps, setReps] = useState(5)
  const [gap, setGap] = useState(2)

  const running = rec.currentAyah === ayahNumber && (rec.isPlaying || rec.inGap)

  const start = () => {
    setPrefs({ repeat: reps, gap, continuous: false })
    rec.playAyah(ayahNumber, { repeat: reps, gap })
  }

  return (
    <section className="surface p-4 sm:p-5">
      <AyahPicker surah={surah} value={ayahNumber} onChange={setAyahNumber} />

      <div
        className="rounded-xl p-4 text-center"
        style={{ background: 'var(--bg-sunken)', border: '1px solid var(--border)' }}
      >
        <p className="arabic" style={{ fontSize: `${Math.max(settings.arabicSize, 34)}px` }} lang="ar">
          {ayah.spans.map((s) => s.t).join('')}
        </p>
        <p className="mt-2 text-lg font-medium" style={{ color: 'var(--accent)' }}>
          {ayah.uccharon}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {ayah.bn}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <NumberChoice
          label="কতবার শুনবেন"
          value={reps}
          options={[3, 5, 7, 10, 15]}
          format={(v) => `${bn(v)} বার`}
          onChange={setReps}
        />
        <NumberChoice
          label="প্রতিবারের পর বিরতি"
          value={gap}
          options={[0, 1, 2, 3, 5]}
          format={(v) => (v === 0 ? 'নেই' : `${bn(v)} সে.`)}
          onChange={setGap}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button className="btn btn-primary" onClick={running ? rec.pause : start}>
          {running ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
          {running ? 'থামান' : 'শুরু করুন'}
        </button>
        {rec.currentAyah === ayahNumber && rec.repeatTarget > 1 && (
          <span className="chip">
            {bn(Math.min(rec.repeatDone + 1, rec.repeatTarget))} / {bn(rec.repeatTarget)} বার
          </span>
        )}
        {rec.inGap && (
          <span className="chip" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
            ⟶ এখন আপনি পড়ুন
          </span>
        )}
        {prefs.gap > 0 && !rec.inGap && !running && (
          <span className="chip">বিরতিতে নিজে পড়ার সময় পাবেন</span>
        )}
      </div>

      <div
        className="mt-4 rounded-lg p-3 text-sm"
        style={{ background: 'var(--gold-soft)', borderInlineStart: '3px solid var(--gold)' }}
      >
        <span className="inline-flex items-center gap-1 font-semibold" style={{ color: 'var(--gold)' }}>
          <SparkIcon size={15} /> কৌশল
        </span>
        <p className="mt-0.5">{ayah.memoryHook}</p>
      </div>
    </section>
  )
}

function NumberChoice({
  label,
  value,
  options,
  format,
  onChange,
}: {
  label: string
  value: number
  options: number[]
  format: (v: number) => string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o}
            className="btn px-2.5 py-1 text-xs"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            style={
              value === o
                ? { background: 'var(--accent-soft)', borderColor: 'var(--accent)', color: 'var(--accent)' }
                : undefined
            }
          >
            {format(o)}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ reveal drill */

function RevealDrill() {
  const { play, rec } = useSurahCtx()
  const { surah, ayah, ayahNumber, setAyahNumber } = useAyahPicker()
  const { settings } = useSettings()
  const total = ayah.words.length
  const [visible, setVisible] = useState(total)
  const [showUccharon, setShowUccharon] = useState(true)

  // Reset the mask whenever a different ayah is chosen.
  const pick = (n: number) => {
    setAyahNumber(n)
    const next = surah.ayahs.find((a) => a.number === n)
    setVisible(next ? next.words.length : 0)
  }

  return (
    <section className="surface p-4 sm:p-5">
      <AyahPicker surah={surah} value={ayahNumber} onChange={pick} />

      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--bg-sunken)', border: '1px solid var(--border)' }}
      >
        <div dir="rtl" className="flex flex-wrap items-end justify-center gap-x-3 gap-y-2">
          {ayah.words.map((w, i) => (
            <MaskedWord
              key={w.id}
              word={w}
              hidden={i >= visible}
              size={Math.max(settings.arabicSize, 32)}
              showUccharon={showUccharon}
              onReveal={() => setVisible(Math.max(visible, i + 1))}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button className="btn" onClick={() => setVisible(Math.max(0, visible - 1))} disabled={visible === 0}>
          <EyeOffIcon size={15} /> একটি লুকান
        </button>
        <button
          className="btn"
          onClick={() => setVisible(Math.min(total, visible + 1))}
          disabled={visible === total}
        >
          <EyeIcon size={15} /> একটি দেখান
        </button>
        <button className="btn" onClick={() => setVisible(0)}>
          সব লুকান
        </button>
        <button className="btn" onClick={() => setVisible(total)}>
          <RefreshIcon size={15} /> সব দেখান
        </button>
        <button
          className="btn"
          onClick={() => (rec.currentAyah === ayahNumber && rec.isPlaying ? rec.pause() : play(ayahNumber))}
        >
          {rec.currentAyah === ayahNumber && rec.isPlaying ? (
            <PauseIcon size={15} />
          ) : (
            <PlayIcon size={15} />
          )}
          মিলিয়ে নিন
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <input
            type="checkbox"
            checked={showUccharon}
            onChange={(e) => setShowUccharon(e.target.checked)}
            className="size-4"
            style={{ accentColor: 'var(--accent)' }}
          />
          দৃশ্যমান শব্দের নিচে উচ্চারণ দেখান
        </label>
        <span className="chip">
          দেখা যাচ্ছে {bn(visible)} / {bn(total)} শব্দ
        </span>
      </div>

      <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
        ঢাকা ঘরে চাপ দিলে শব্দটি খুলে যাবে। প্রথমে সব দেখে কয়েকবার পড়ুন, তারপর একটি একটি করে লুকিয়ে
        স্মৃতি থেকে বলার চেষ্টা করুন — শেষ পর্যন্ত পুরো আয়াত ঢাকা অবস্থায় বলতে পারলে ধরে নিন আয়াতটি বসে
        গেছে।
      </p>
    </section>
  )
}

function MaskedWord({
  word,
  hidden,
  size,
  showUccharon,
  onReveal,
}: {
  word: Word
  hidden: boolean
  size: number
  showUccharon: boolean
  onReveal: () => void
}) {
  const [peek, setPeek] = useState(false)
  const masked = hidden && !peek

  if (masked) {
    return (
      <button
        type="button"
        onClick={() => {
          setPeek(true)
          onReveal()
        }}
        className="rounded-lg"
        aria-label="ঢাকা শব্দ — দেখতে চাপ দিন"
        style={{
          width: `${Math.max(2.5, word.arabic.length * 0.5)}rem`,
          height: `${size * 1.15}px`,
          background: 'var(--bg-elevated)',
          border: '1.5px dashed var(--border-strong)',
        }}
      />
    )
  }

  return (
    <span className="text-center" onDoubleClick={() => setPeek(false)}>
      <span className="arabic block" style={{ fontSize: `${size}px` }} lang="ar">
        {word.arabic}
      </span>
      {showUccharon && (
        <span className="block text-xs" style={{ color: 'var(--text-faint)' }} dir="ltr">
          {word.uccharon}
        </span>
      )}
    </span>
  )
}

/* ------------------------------------------------------------- chain drill */

function ChainDrill() {
  const { surah, rec } = useSurahCtx()
  const { settings } = useSettings()
  const [upto, setUpto] = useState(1)
  const [gap, setGap] = useState(2)

  const chain = surah.ayahs.filter((a) => a.number <= upto)
  const last = surah.ayahs[surah.ayahs.length - 1].number

  return (
    <section className="surface p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="chip">
          ধাপ {bn(upto)} / {bn(last)}
        </span>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          আয়াত {bn(1)} থেকে {bn(upto)} পর্যন্ত একসাথে
        </span>
      </div>

      <div
        className="space-y-3 rounded-xl p-4"
        style={{ background: 'var(--bg-sunken)', border: '1px solid var(--border)' }}
      >
        {chain.map((a) => (
          <div
            key={a.number}
            className="rounded-lg px-2 py-1 transition-colors"
            style={rec.currentAyah === a.number ? { background: 'var(--accent-soft)' } : undefined}
          >
            <p
              className="arabic text-center"
              style={{ fontSize: `${Math.max(settings.arabicSize - 2, 28)}px` }}
              lang="ar"
            >
              {a.spans.map((s) => s.t).join('')}
            </p>
            <p className="text-center text-sm" style={{ color: 'var(--accent)' }}>
              {a.uccharon}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          className="btn btn-primary"
          onClick={() => rec.playRange(1, upto, { gap, repeat: 1 })}
          disabled={rec.isPlaying}
        >
          <PlayIcon size={16} /> শিকলটি শুনুন
        </button>
        <button className="btn" onClick={() => rec.playRange(1, upto, { gap, repeat: 2 })}>
          দুইবার করে
        </button>
        <button className="btn" onClick={() => setUpto(Math.max(1, upto - 1))} disabled={upto === 1}>
          পিছিয়ে যান
        </button>
        <button
          className="btn"
          onClick={() => setUpto(Math.min(last, upto + 1))}
          disabled={upto === last}
          style={
            upto < last
              ? { background: 'var(--accent-soft)', borderColor: 'var(--accent)', color: 'var(--accent)' }
              : undefined
          }
        >
          পরের আয়াত যোগ করুন
        </button>
      </div>

      <div className="mt-3">
        <NumberChoice
          label="আয়াতের মাঝে বিরতি"
          value={gap}
          options={[0, 1, 2, 3]}
          format={(v) => (v === 0 ? 'নেই' : `${bn(v)} সে.`)}
          onChange={setGap}
        />
      </div>

      <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
        হিফযের সবচেয়ে নির্ভরযোগ্য পদ্ধতি: নতুন আয়াত একা মুখস্থ করার পর আগেরগুলোর সাথে জুড়ে একটানা পড়ুন।
        প্রতিটি ধাপে অন্তত তিনবার নির্ভুলভাবে বলতে পারলে পরের আয়াত যোগ করুন।
      </p>
    </section>
  )
}

/* -------------------------------------------------------------- quiz drill */

interface Question {
  ayah: Ayah
  index: number
  options: Word[]
  answer: Word
}

function buildQuestion(surah: Surah, seed: number): Question {
  const pool = surah.ayahs.flatMap((a) => a.words)
  // Deterministic pseudo-random so a question is stable across re-renders.
  const rand = (n: number, salt: number) => Math.abs(Math.sin(seed * 97.13 + salt * 31.7)) * n
  const ayah = surah.ayahs[Math.floor(rand(surah.ayahs.length, 1)) % surah.ayahs.length]
  const index = 1 + (Math.floor(rand(ayah.words.length - 1, 2)) % Math.max(1, ayah.words.length - 1))
  const answer = ayah.words[index]

  const distractors: Word[] = []
  let salt = 3
  while (distractors.length < 3 && salt < 60) {
    const candidate = pool[Math.floor(rand(pool.length, salt)) % pool.length]
    salt += 1
    if (candidate.arabic === answer.arabic) continue
    if (distractors.some((d) => d.arabic === candidate.arabic)) continue
    distractors.push(candidate)
  }

  const options = [answer, ...distractors]
  // Rotate rather than shuffle in place — keeps the order stable per seed.
  const shift = Math.floor(rand(options.length, 99)) % options.length
  return { ayah, index, answer, options: [...options.slice(shift), ...options.slice(0, shift)] }
}

function QuizDrill() {
  const { surah, play } = useSurahCtx()
  const { settings } = useSettings()
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 10_000))
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })

  const q = useMemo(() => buildQuestion(surah, seed), [surah, seed])
  const answered = picked !== null
  const correct = picked === q.answer.arabic

  const choose = (arabic: string) => {
    if (answered) return
    setPicked(arabic)
    setScore((s) => ({ right: s.right + (arabic === q.answer.arabic ? 1 : 0), total: s.total + 1 }))
  }

  const nextQuestion = () => {
    setPicked(null)
    setSeed((s) => s + 1)
  }

  return (
    <section className="surface p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="chip">আয়াত {bn(q.ayah.number)}</span>
        <span className="chip">
          স্কোর {bn(score.right)} / {bn(score.total)}
        </span>
        <button className="btn ms-auto px-2.5 py-1 text-xs" onClick={() => setScore({ right: 0, total: 0 })}>
          স্কোর রিসেট
        </button>
      </div>

      <p className="mb-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        এরপর কোন শব্দটি আসবে?
      </p>

      <div
        dir="rtl"
        className="flex flex-wrap items-center justify-center gap-x-3 rounded-xl p-4"
        style={{ background: 'var(--bg-sunken)', border: '1px solid var(--border)' }}
      >
        {q.ayah.words.slice(0, q.index).map((w) => (
          <span
            key={w.id}
            className="arabic"
            style={{ fontSize: `${Math.max(settings.arabicSize, 32)}px` }}
            lang="ar"
          >
            {w.arabic}
          </span>
        ))}
        <span
          className="arabic rounded-lg px-3"
          style={{
            fontSize: `${Math.max(settings.arabicSize, 32)}px`,
            color: answered ? (correct ? 'var(--accent)' : 'var(--tj-ghunnah)') : 'var(--text-faint)',
            border: '1.5px dashed var(--border-strong)',
          }}
          lang="ar"
        >
          {answered ? q.answer.arabic : '؟'}
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {q.options.map((o) => {
          const isAnswer = o.arabic === q.answer.arabic
          const isPicked = picked === o.arabic
          const style = !answered
            ? undefined
            : isAnswer
              ? { borderColor: 'var(--accent)', background: 'var(--accent-soft)', color: 'var(--accent)' }
              : isPicked
                ? { borderColor: 'var(--tj-ghunnah)', color: 'var(--tj-ghunnah)' }
                : { opacity: 0.5 }
          return (
            <button key={o.id} className="btn justify-between py-2.5" style={style} onClick={() => choose(o.arabic)}>
              <span className="arabic text-2xl" lang="ar">
                {o.arabic}
              </span>
              <span className="text-xs" style={{ color: 'inherit' }}>
                {o.uccharon}
              </span>
              {answered && isAnswer && <CheckIcon size={16} />}
              {answered && isPicked && !isAnswer && <CloseIcon size={16} />}
            </button>
          )
        })}
      </div>

      {answered && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className="chip"
            style={{
              color: correct ? 'var(--accent)' : 'var(--tj-ghunnah)',
              borderColor: correct ? 'var(--accent)' : 'var(--tj-ghunnah)',
            }}
          >
            {correct ? 'সঠিক!' : `সঠিক উত্তর: ${q.answer.uccharon} — ${q.answer.bn}`}
          </span>
          <button className="btn" onClick={() => play(q.ayah.number)}>
            <PlayIcon size={14} /> আয়াতটি শুনুন
          </button>
          <button className="btn btn-primary ms-auto" onClick={nextQuestion}>
            পরের প্রশ্ন
          </button>
        </div>
      )}
    </section>
  )
}

/* --------------------------------------------------------- progress panel */

function ProgressTracker() {
  const { surah, progress, setProgress } = useSurahCtx()

  const entries = surah.ayahs.map((a) => ({
    ayah: a,
    entry: progress[progressKey(surah.number, a.number)] ?? emptyAyahProgress(),
  }))
  const memorized = entries.filter((e) => e.entry.status === 'memorized').length
  const dueCount = entries.filter((e) => isDue(e.entry)).length

  const review = (ayahNumber: number, outcome: 'again' | 'good') => {
    setProgress((prev: ProgressMap) => {
      const key = progressKey(surah.number, ayahNumber)
      return { ...prev, [key]: applyReview(prev[key] ?? emptyAyahProgress(), outcome) }
    })
  }

  const resetAll = () => {
    setProgress((prev: ProgressMap) => {
      const next = { ...prev }
      for (const a of surah.ayahs) delete next[progressKey(surah.number, a.number)]
      return next
    })
  }

  return (
    <section className="surface p-4 sm:p-5">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h3 className="text-base font-bold">অগ্রগতি</h3>
        <span className="chip">
          মুখস্থ {bn(memorized)} / {bn(surah.ayahCount)}
        </span>
        {dueCount > 0 && (
          <span className="chip" style={{ color: 'var(--gold)', borderColor: 'var(--gold)' }}>
            আজ পুনরাবৃত্তির সময় {bn(dueCount)} আয়াতে
          </span>
        )}
        <button className="btn ms-auto px-2.5 py-1 text-xs" onClick={resetAll}>
          <RefreshIcon size={13} /> রিসেট
        </button>
      </div>

      <div
        className="mb-4 h-2 w-full overflow-hidden rounded-full"
        style={{ background: 'var(--bg-sunken)' }}
        role="progressbar"
        aria-valuenow={memorized}
        aria-valuemin={0}
        aria-valuemax={surah.ayahCount}
      >
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${(memorized / surah.ayahCount) * 100}%`, background: 'var(--accent)' }}
        />
      </div>

      <ul className="space-y-2">
        {entries.map(({ ayah, entry }) => (
          <li
            key={ayah.number}
            className="flex flex-wrap items-center gap-2 rounded-xl p-2.5"
            style={{
              background: isDue(entry) ? 'var(--gold-soft)' : 'var(--bg-sunken)',
              border: '1px solid var(--border)',
            }}
          >
            <span
              className="grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold"
              style={{ background: 'var(--bg-elevated)', color: 'var(--gold)' }}
            >
              {bn(ayah.number)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{ayah.uccharon}</span>
              <span className="block text-xs" style={{ color: 'var(--text-muted)' }}>
                {STATUS_LABEL[entry.status]} · পুনরাবৃত্তি {bn(entry.reps)} বার · পরবর্তী:{' '}
                {relativeDays(entry.dueAt)}
              </span>
            </span>
            <span className="flex gap-1.5">
              <button className="btn px-2.5 py-1 text-xs" onClick={() => review(ayah.number, 'again')}>
                আবার পড়তে হবে
              </button>
              <button
                className="btn px-2.5 py-1 text-xs"
                style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
                onClick={() => review(ayah.number, 'good')}
              >
                <CheckIcon size={13} /> পেরেছি
              </button>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs" style={{ color: 'var(--text-faint)' }}>
        “পেরেছি” চাপলে পরবর্তী পুনরাবৃত্তির তারিখ ধাপে ধাপে বাড়ে (১ → ৩ → ৭ → ২১ → ৬০ দিন), আর “আবার পড়তে
        হবে” চাপলে আয়াতটি আবার শুরুতে ফিরে আসে। তথ্য আপনার ব্রাউজারেই সংরক্ষিত থাকে।
      </p>
    </section>
  )
}
