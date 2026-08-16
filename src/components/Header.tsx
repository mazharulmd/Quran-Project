import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../lib/settings'
import { bn } from '../lib/format'
import { ChevronDownIcon, MoonIcon, SunIcon } from './Icons'

export function Header() {
  const { settings, set, toggle } = useSettings()
  const [open, setOpen] = useState(false)
  const popRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur"
      style={{
        borderColor: 'var(--border)',
        background: 'color-mix(in srgb, var(--bg) 88%, transparent)',
      }}
    >
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-xl text-lg"
            style={{ background: 'var(--gold-soft)', color: 'var(--gold)' }}
            aria-hidden
          >
            ۩
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base leading-tight font-bold">কুরআন পাঠশালা</span>
            <span className="block truncate text-xs" style={{ color: 'var(--text-muted)' }}>
              আয়াতে আয়াতে শেখা
            </span>
          </span>
        </Link>

        <div className="ms-auto flex items-center gap-1.5">
          <div className="relative" ref={popRef}>
            <button
              className="btn text-xs"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="dialog"
            >
              প্রদর্শন <ChevronDownIcon size={15} />
            </button>
            {open && (
              <div
                className="surface absolute end-0 z-50 mt-2 w-72 p-3 shadow-xl"
                role="dialog"
                aria-label="প্রদর্শন সেটিংস"
              >
                <Switch label="তাজবীদ রঙ" checked={settings.tajweed} onChange={() => toggle('tajweed')} />
                <Switch
                  label="বাংলা উচ্চারণ"
                  checked={settings.showUccharon}
                  onChange={() => toggle('showUccharon')}
                />
                <Switch
                  label="ইংরেজি উচ্চারণ"
                  checked={settings.showTranslit}
                  onChange={() => toggle('showTranslit')}
                />
                <Switch
                  label="বাংলা অনুবাদ"
                  checked={settings.showTranslation}
                  onChange={() => toggle('showTranslation')}
                />
                <div className="mt-3 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                  <label className="mb-1 flex items-center justify-between text-sm">
                    <span>আরবি ফন্টের আকার</span>
                    <span style={{ color: 'var(--text-muted)' }}>{bn(settings.arabicSize)}</span>
                  </label>
                  <input
                    type="range"
                    min={24}
                    max={56}
                    step={2}
                    value={settings.arabicSize}
                    onChange={(e) => set('arabicSize', Number(e.target.value))}
                    className="w-full"
                    style={{ accentColor: 'var(--accent)' }}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            className="btn px-2.5"
            onClick={() => set('theme', settings.theme === 'dark' ? 'light' : 'dark')}
            aria-label={settings.theme === 'dark' ? 'দিনের থিম' : 'রাতের থিম'}
          >
            {settings.theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
        </div>
      </div>
    </header>
  )
}

function Switch({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-1.5 text-sm">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4"
        style={{ accentColor: 'var(--accent)' }}
      />
    </label>
  )
}
