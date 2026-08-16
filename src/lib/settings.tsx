import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useStoredState } from './storage'

export interface Settings {
  theme: 'light' | 'dark'
  /** Colour-code the Arabic by tajweed rule. */
  tajweed: boolean
  showUccharon: boolean
  showTranslit: boolean
  showTranslation: boolean
  /** Arabic font size in px. */
  arabicSize: number
}

const DEFAULTS: Settings = {
  theme: 'light',
  tajweed: true,
  showUccharon: true,
  showTranslit: false,
  showTranslation: true,
  arabicSize: 34,
}

interface SettingsContextValue {
  settings: Settings
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  toggle: (key: 'tajweed' | 'showUccharon' | 'showTranslit' | 'showTranslation') => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useStoredState<Settings>('settings:v1', DEFAULTS)

  // Merge in any keys added after a user's settings were first stored.
  const merged: Settings = { ...DEFAULTS, ...settings }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', merged.theme === 'dark')
    document.documentElement.lang = 'bn'
  }, [merged.theme])

  const value: SettingsContextValue = {
    settings: merged,
    set: (key, val) => setSettings((prev) => ({ ...DEFAULTS, ...prev, [key]: val })),
    toggle: (key) => setSettings((prev) => ({ ...DEFAULTS, ...prev, [key]: !{ ...DEFAULTS, ...prev }[key] })),
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>')
  return ctx
}
