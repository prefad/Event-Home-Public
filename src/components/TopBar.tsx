import { ChevronDown } from 'lucide-react';

export default function TopBar() {
  return (
    <div style={{ backgroundColor: 'var(--color-topbar-bg)' }}>
      <div className="px-12 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-topbar-border)' }}>
        <span className="text-sm font-medium" style={{ color: 'var(--color-topbar-text)' }}>Weekend Hockey</span>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 text-sm rounded-full px-2 py-1" style={{ color: 'var(--color-topbar-text)' }}>
            <span className="w-7 h-7 rounded-full text-white text-xs font-medium flex items-center justify-center uppercase" style={{ backgroundColor: 'var(--color-avatar-bg)' }}>cw</span>
            <span>C. Wilson</span>
            <ChevronDown size={14} style={{ color: 'var(--color-topbar-text-sub)' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
