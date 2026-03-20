import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { divisionGroups } from '../data/eventData';
import { previewDivisionGroups } from '../data/previewData';
import type { Division, Tier } from '../data/eventData';
import DivisionBadge, { SpotsLeftIndicator } from '../components/DivisionBadge';
import { useIsPreview } from '../PreviewContext';

function RateRow({ tier, isEarlyBird }: { tier: Tier; isEarlyBird: boolean }) {
  return (
    <div
      className="flex items-center gap-4 px-4 py-2 rounded-lg"
      style={{ backgroundColor: isEarlyBird ? 'var(--color-early-bird-row)' : 'var(--color-card-bg)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold leading-5" style={{ color: 'var(--color-text-primary)' }}>{tier.name}</p>
        <p className="text-xs leading-4" style={{ color: 'var(--color-text-secondary)' }}>{tier.deadline}</p>
      </div>
      {tier.badges.map((badge, i) => <DivisionBadge key={i} badge={badge} />)}
      {tier.spotsLeft != null && <SpotsLeftIndicator count={tier.spotsLeft} />}
      <div className="flex items-center gap-4 w-[248px] justify-end">
        <span className="text-base font-medium text-right leading-5 whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>{tier.price}</span>
        <button
          className="inline-flex items-center text-sm font-medium px-4 py-2 rounded"
          style={{ backgroundColor: 'var(--color-action)', color: 'var(--color-action-text)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-action-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-action)'; }}
        >
          Register
        </button>
      </div>
    </div>
  );
}

function DivisionCard({ division }: { division: Division }) {
  return (
    <div
      className="rounded-lg pl-5 pr-4 py-5 flex gap-2"
      style={{ backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-card-border)' }}
    >
      <div className="w-[375px] flex-shrink-0 self-stretch">
        <p className="text-lg font-bold leading-6" style={{ color: 'var(--color-text-heading)' }}>{division.name}</p>
      </div>
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {division.tiers.map((tier, i) => (
          <RateRow key={i} tier={tier} isEarlyBird={tier.name.toLowerCase().includes('early bird')} />
        ))}
      </div>
    </div>
  );
}

export default function DivisionsPage() {
  const isPreview = useIsPreview();
  const groups = isPreview ? previewDivisionGroups : divisionGroups;
  const [searchQuery, setSearchQuery] = useState('');
  const [layerFilter, setLayerFilter] = useState('All Layers');

  return (
    <div className="py-8">
      <h3 className="text-[28px] font-medium leading-8 mb-6" style={{ color: 'var(--color-text-heading)' }}>Divisions</h3>
      <div className="flex items-center gap-3 mb-6">
        <div className="relative w-[520px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-input-placeholder)' }} />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-action)]/20"
            style={{
              backgroundColor: 'var(--color-input-bg)',
              border: '1px solid var(--color-input-border)',
              color: 'var(--color-input-text)',
            }}
          />
        </div>
        <div className="relative w-[520px]">
          <select
            value={layerFilter}
            onChange={(e) => setLayerFilter(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-action)]/20"
            style={{
              backgroundColor: 'var(--color-input-bg)',
              border: '1px solid var(--color-input-border)',
              color: 'var(--color-input-text)',
            }}
          >
            <option>All Layers</option><option>AAA</option><option>AA</option><option>A/B</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-input-placeholder)' }} />
        </div>
      </div>
      <div className="space-y-6">
        {groups.map((group, gi) => {
          const filtered = group.divisions.filter((d) => !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()));
          if (!filtered.length) return null;
          return (
            <div key={gi}>
              <div className="pb-4">
                <div className="rounded-lg px-5 py-3 flex items-center justify-between" style={{ backgroundColor: 'var(--color-group-header-bg)' }}>
                  <h4 className="text-xl font-medium leading-6" style={{ color: 'var(--color-group-header-text)' }}>{group.sport} — {group.gender}</h4>
                  <span className="text-base font-medium leading-6" style={{ color: 'var(--color-group-header-text)' }}>{group.divisionCount} Divisions</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {filtered.map((division, di) => <DivisionCard key={di} division={division} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
