/** Tajweed rules that the reader colour-codes and explains. */
export type TajweedRuleId =
  | 'ikhfa'
  | 'ghunnah'
  | 'qalqalah'
  | 'madd'
  | 'madd-muttasil'
  | 'madd-lazim'
  | 'idgham'
  | 'izhar'
  | 'lam-shamsi'
  | 'lam-qamari'

export interface TajweedRule {
  id: TajweedRuleId
  /** Rule name in Arabic script, e.g. إخفاء */
  arabic: string
  /** Rule name transliterated into Bangla, e.g. ইখফা */
  bnName: string
  /** One-line Bangla definition. */
  bnShort: string
  /** Fuller Bangla explanation with the condition + how to recite it. */
  bnLong: string
  /** CSS custom property holding the colour for this rule. */
  cssVar: string
}

/**
 * An ayah's Arabic text split into runs. Concatenating every `t` in order
 * reproduces the ayah exactly — `ayahArabic()` relies on that.
 */
export interface TajweedSpan {
  t: string
  r?: TajweedRuleId
}

export interface Word {
  /** "113:1:2" — surah:ayah:position */
  id: string
  arabic: string
  /** Latin transliteration, e.g. "a'ūdhu" */
  translit: string
  /** Bangla উচ্চারণ, e.g. "আউযু" */
  uccharon: string
  /** Bangla meaning */
  bn: string
  /** English meaning */
  en: string
  /** Trilateral root in Arabic, e.g. "ع و ذ" */
  root?: string
  /** Bangla note on the root's shared sense across the Qur'an */
  rootNote?: string
  /** Bangla grammatical note (verb form, case, particle type…) */
  grammar?: string
}

export interface TafsirSection {
  title: string
  /** Paragraphs of Bangla prose. */
  body: string[]
}

export interface AyahAudio {
  /** Seconds into the surah recording where this ayah begins. */
  start: number
  /** Seconds where it ends (includes the natural pause tail). */
  end: number
}

export interface Ayah {
  number: number
  /** Colour-coded runs; `ayahArabic(ayah)` joins them into plain text. */
  spans: TajweedSpan[]
  /** Full Bangla উচ্চারণ of the ayah. */
  uccharon: string
  /** Full Latin transliteration. */
  translit: string
  /** Bangla translation. */
  bn: string
  /** English translation. */
  en: string
  /** Short Bangla label for the ayah, used in navigation and the mind map. */
  theme: string
  audio: AyahAudio
  words: Word[]
  tafsir: TafsirSection[]
  /** Bangla notes about the tajweed rules occurring in this ayah. */
  tajweedNotes: { rule: TajweedRuleId; text: string }[]
  /** Bangla memorisation hook — the trick that makes this ayah stick. */
  memoryHook: string
}

export interface MindMapBranch {
  ayah: number
  /** The repeated stem, e.g. وَمِنْ شَرِّ */
  stem: string
  stemUccharon: string
  /** The part that changes from branch to branch. */
  payload: string
  payloadUccharon: string
  payloadBn: string
  /** Emoji used as the branch's visual anchor (mirrors the mind-map icons). */
  icon: string
  /** Bangla one-liner: what this refuge covers. */
  gist: string
}

export interface MindMap {
  /** Bangla sentence describing this surah's particular shape. */
  intro: string
  /** Which ayah the root card shows and plays. */
  rootAyah: number
  rootArabic: string
  rootUccharon: string
  rootBn: string
  branches: MindMapBranch[]
  /** Bangla observations about the repeating linguistic pattern. */
  patterns: { title: string; text: string }[]
}

export interface Reciter {
  name: string
  bnName: string
}

export interface Surah {
  number: number
  nameArabic: string
  bnName: string
  enName: string
  /** Bangla meaning of the surah's name. */
  bnMeaning: string
  /** 'মাক্কী' | 'মাদানী' */
  revelation: string
  ayahCount: number
  reciter: Reciter
  /** Path (relative to the site root) of the full-surah recording. */
  audioUrl: string
  /** Bangla introduction paragraphs. */
  intro: string[]
  /** Bangla: শানে নুযূল / background of revelation. */
  shanENuzul: TafsirSection
  /** Bangla: ফযীলত / virtues, with source attributions. */
  virtues: TafsirSection
  ayahs: Ayah[]
  mindMap: MindMap
}
