import type { CSSProperties } from 'react'
import type { Ayah, TajweedRuleId } from '../types'
import { TAJWEED_RULES } from '../data/tajweed'
import { ar } from '../lib/format'

interface Props {
  ayah: Ayah
  tajweed: boolean
  /** Font size in px. */
  size?: number
  /** Show the ayah number ornament at the end of the line. */
  showNumber?: boolean
  className?: string
}

/**
 * Renders the ayah from its tajweed spans. Only `color` changes between spans,
 * so browsers keep Arabic shaping across the element boundaries.
 */
export function AyahArabic({ ayah, tajweed, size = 34, showNumber = true, className = '' }: Props) {
  const style: CSSProperties = { fontSize: `${size}px` }

  return (
    <p className={`arabic ${className}`} style={style} lang="ar">
      {ayah.spans.map((span, i) =>
        tajweed && span.r ? (
          <span key={i} style={{ color: `var(${TAJWEED_RULES[span.r].cssVar})` }} data-rule={span.r}>
            {span.t}
          </span>
        ) : (
          <span key={i}>{span.t}</span>
        ),
      )}
      {showNumber && <AyahOrnament number={ayah.number} size={size} />}
    </p>
  )
}

export function AyahOrnament({ number, size = 34 }: { number: number; size?: number }) {
  const box = Math.round(size * 0.95)
  return (
    <span
      aria-label={`আয়াত ${number}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: box,
        height: box,
        margin: '0 0.35em',
        fontSize: `${Math.round(size * 0.42)}px`,
        lineHeight: 1,
        borderRadius: '50%',
        border: '1.5px solid var(--gold)',
        color: 'var(--gold)',
        verticalAlign: 'middle',
      }}
    >
      {ar(number)}
    </span>
  )
}

/** Small inline pill naming a tajweed rule in its own colour. */
export function RuleTag({ rule }: { rule: TajweedRuleId }) {
  const r = TAJWEED_RULES[rule]
  return (
    <span
      className="chip"
      style={{
        color: `var(${r.cssVar})`,
        borderColor: `color-mix(in srgb, var(${r.cssVar}) 40%, transparent)`,
        background: `color-mix(in srgb, var(${r.cssVar}) 10%, transparent)`,
      }}
    >
      {r.bnName}
    </span>
  )
}
