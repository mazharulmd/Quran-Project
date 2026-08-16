import type { Ayah, Surah } from '../types'
import { alFalaq } from './surah-113-al-falaq'

export const SURAHS: Surah[] = [alFalaq]

export function getSurah(numberLike: string | number | undefined): Surah | undefined {
  const n = Number(numberLike)
  return SURAHS.find((s) => s.number === n)
}

/** Joins the tajweed spans back into the plain Arabic text of the ayah. */
export function ayahArabic(ayah: Ayah): string {
  return ayah.spans.map((s) => s.t).join('')
}

/** Total seconds of recitation for a surah, from its first to last ayah. */
export function surahDuration(surah: Surah): number {
  const last = surah.ayahs[surah.ayahs.length - 1]
  return last.audio.end - surah.ayahs[0].audio.start
}

/**
 * Words that repeat across the surah, most frequent first. This is what makes
 * the "একটি স্তম্ভ, চারটি শাখা" pattern concrete in the vocabulary view.
 */
export function repeatedWords(surah: Surah) {
  const byArabic = new Map<string, { arabic: string; uccharon: string; bn: string; count: number }>()
  for (const ayah of surah.ayahs) {
    for (const w of ayah.words) {
      const found = byArabic.get(w.arabic)
      if (found) found.count += 1
      else byArabic.set(w.arabic, { arabic: w.arabic, uccharon: w.uccharon, bn: w.bn, count: 1 })
    }
  }
  return [...byArabic.values()].filter((w) => w.count > 1).sort((a, b) => b.count - a.count)
}
