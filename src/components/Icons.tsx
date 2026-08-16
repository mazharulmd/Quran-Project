interface IconProps {
  className?: string
  size?: number
}

function base(size = 20, className = '') {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    className,
  }
}

export const PlayIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)} fill="currentColor" stroke="none">
    <path d="M8 5.5v13l11-6.5z" />
  </svg>
)

export const PauseIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)} fill="currentColor" stroke="none">
    <rect x="7" y="5.5" width="3.5" height="13" rx="1" />
    <rect x="13.5" y="5.5" width="3.5" height="13" rx="1" />
  </svg>
)

export const PrevIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)} fill="currentColor" stroke="none">
    <path d="M17 5.5v13L8 12z" />
    <rect x="5" y="5.5" width="2.4" height="13" rx="1" />
  </svg>
)

export const NextIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)} fill="currentColor" stroke="none">
    <path d="M7 5.5v13L16 12z" />
    <rect x="16.6" y="5.5" width="2.4" height="13" rx="1" />
  </svg>
)

export const RepeatIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M17 2l4 4-4 4" />
    <path d="M3 11v-1a4 4 0 014-4h14" />
    <path d="M7 22l-4-4 4-4" />
    <path d="M21 13v1a4 4 0 01-4 4H3" />
  </svg>
)

export const StopIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)} fill="currentColor" stroke="none">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
)

export const BookIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M4 4.5A2.5 2.5 0 016.5 2H20v17H6.5A2.5 2.5 0 004 21.5z" />
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
  </svg>
)

export const GridIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
  </svg>
)

export const ScrollIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M8 3h9a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
    <path d="M5 6a2 2 0 012-2h1v4H5z" />
    <path d="M9 8h7M9 12h7M9 16h4" />
  </svg>
)

export const MapIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="4.5" r="2.5" />
    <circle cx="5" cy="19" r="2.5" />
    <circle cx="19" cy="19" r="2.5" />
    <path d="M12 7v4M12 11H5v5.5M12 11h7v5.5" />
  </svg>
)

export const BrainIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M12 5a3 3 0 00-5.9-.7A2.8 2.8 0 004 7a2.9 2.9 0 00-.7 4.6A3 3 0 004 17a3 3 0 005 2.2A2.9 2.9 0 0012 20z" />
    <path d="M12 5a3 3 0 015.9-.7A2.8 2.8 0 0120 7a2.9 2.9 0 01.7 4.6A3 3 0 0120 17a3 3 0 01-5 2.2A2.9 2.9 0 0112 20z" />
  </svg>
)

export const SunIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)

export const MoonIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M21 13.2A8.5 8.5 0 1110.8 3a6.8 6.8 0 1010.2 10.2z" />
  </svg>
)

export const CheckIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M4.5 12.5l5 5 10-11" />
  </svg>
)

export const CloseIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
  </svg>
)

export const ChevronDownIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M5 8.5l7 7 7-7" />
  </svg>
)

export const ChevronRightIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M8.5 5l7 7-7 7" />
  </svg>
)

export const EyeIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
)

export const EyeOffIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M3 3l18 18" />
    <path d="M10.6 6.2A9.8 9.8 0 0112 6c6.2 0 10 6 10 6a17 17 0 01-3.3 3.9" />
    <path d="M6.3 8.1A16.7 16.7 0 002 12s3.8 6.5 10 6.5a9.9 9.9 0 004-.8" />
    <path d="M9.6 9.9a3 3 0 004.3 4.2" />
  </svg>
)

export const RefreshIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M20 11a8 8 0 10-1.6 5.6" />
    <path d="M20 4.5V11h-6.5" />
  </svg>
)

export const SlidersIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h8M16 18h4" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="14" cy="18" r="2" />
  </svg>
)

export const SparkIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
    <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
  </svg>
)
