import type { Badge } from '../data/eventData';

const BADGE_VARS: Record<Badge['variant'], { bg: string; text: string } | null> = {
  'early-bird': { bg: 'var(--color-badge-success-bg)', text: 'var(--color-badge-success-text)' },
  'players-only': null,
  'spots-left': null, // spots-left is now handled separately as a numeric indicator
  'waitlist': { bg: 'var(--color-badge-waiting-bg)', text: 'var(--color-badge-waiting-text)' },
  'closing-soon': { bg: 'var(--color-badge-warning-bg)', text: 'var(--color-badge-warning-text)' },
  'sold-out': { bg: 'var(--color-group-header-bg)', text: 'var(--color-text-secondary)' },
};

export default function DivisionBadge({ badge }: { badge: Badge }) {
  const vars = BADGE_VARS[badge.variant];
  if (!vars) return null;

  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium pl-2 pr-3 py-1 rounded"
      style={{ backgroundColor: vars.bg, color: vars.text }}
    >
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
      <span>{badge.label}</span>
    </span>
  );
}

/** Compact numeric indicator for limited spots remaining */
export function SpotsLeftIndicator({ count }: { count: number }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded"
      style={{
        color: 'var(--color-badge-critical-text)',
        backgroundColor: 'var(--color-badge-critical-bg)',
        border: '1px solid var(--color-badge-critical-text)',
        borderColor: 'color-mix(in srgb, var(--color-badge-critical-text) 30%, transparent)',
      }}
    >
      <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>{count} {count === 1 ? 'spot' : 'spots'} left</span>
    </span>
  );
}
