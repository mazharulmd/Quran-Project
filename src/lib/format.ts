const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

export function bn(n: number | string): string {
  return String(n).replace(/\d/g, (d) => BANGLA_DIGITS[Number(d)])
}

export function ar(n: number | string): string {
  return String(n).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)])
}

/** "১:০৫ মিনিট"-style clock for the player. */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  return `${bn(Math.floor(s / 60))}:${bn(String(s % 60).padStart(2, '0'))}`
}

export function banglaDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return bn(
    `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`,
  )
}

/** "আজ", "আগামীকাল", "৩ দিন পর", "২ দিন আগে" */
export function relativeDays(iso: string | null): string {
  if (!iso) return 'এখনও পড়া হয়নি'
  const target = new Date(iso)
  if (Number.isNaN(target.getTime())) return '—'
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const diff = Math.round((target.getTime() - startOfToday.getTime()) / 86_400_000)
  if (diff === 0) return 'আজ'
  if (diff === 1) return 'আগামীকাল'
  if (diff === -1) return 'গতকাল'
  return diff > 0 ? `${bn(diff)} দিন পর` : `${bn(-diff)} দিন আগে`
}
