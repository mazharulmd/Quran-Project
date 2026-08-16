import { useState } from 'react'
import { TAJWEED_RULES, TAJWEED_RULE_ORDER } from '../data/tajweed'
import type { TajweedRuleId } from '../types'
import { ChevronDownIcon, ChevronRightIcon } from './Icons'

/**
 * The colour key for the reader. Mirrors the "Tajweed Color Coded System"
 * panel of the mind map: knowing why a letter is coloured is what makes the
 * colours useful for memorisation.
 */
export function TajweedLegend() {
  const [openRule, setOpenRule] = useState<TajweedRuleId | null>(null)

  return (
    <section className="surface p-4">
      <h2 className="text-base font-bold">তাজবীদ রঙের চাবি</h2>
      <p className="mt-0.5 mb-3 text-sm" style={{ color: 'var(--text-muted)' }}>
        রঙিন হরফে চাপ দিলে নিয়মটির ব্যাখ্যা খুলবে। সঠিক উচ্চারণ জানা থাকলে তিলাওয়াত সহজ হয় এবং মুখস্থও
        পাকা হয়।
      </p>

      <div className="flex flex-wrap gap-1.5">
        {TAJWEED_RULE_ORDER.map((id) => {
          const rule = TAJWEED_RULES[id]
          const active = openRule === id
          return (
            <button
              key={id}
              className="btn px-2.5 py-1 text-sm"
              aria-expanded={active}
              onClick={() => setOpenRule(active ? null : id)}
              style={{
                color: `var(${rule.cssVar})`,
                borderColor: active
                  ? `var(${rule.cssVar})`
                  : `color-mix(in srgb, var(${rule.cssVar}) 35%, transparent)`,
                background: `color-mix(in srgb, var(${rule.cssVar}) ${active ? 16 : 8}%, transparent)`,
              }}
            >
              {active ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
              {rule.bnName}
              <span className="arabic ms-1 text-base">{rule.arabic}</span>
            </button>
          )
        })}
      </div>

      {openRule && (
        <div
          className="mt-3 rounded-xl p-3 text-sm"
          style={{
            background: 'var(--bg-sunken)',
            borderInlineStart: `3px solid var(${TAJWEED_RULES[openRule].cssVar})`,
          }}
        >
          <p className="font-semibold">{TAJWEED_RULES[openRule].bnShort}</p>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
            {TAJWEED_RULES[openRule].bnLong}
          </p>
        </div>
      )}
    </section>
  )
}
