import { ChevronDown, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopBar() {
  return (
    <div style={{ backgroundColor: 'var(--color-topbar-bg)' }}>
      <div className="px-12 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-topbar-border)' }}>
        <span className="text-sm font-medium" style={{ color: 'var(--color-topbar-text)' }}>Weekend Hockey</span>
        <div className="flex items-center gap-3">
          <Link
            to="/playground"
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-colors"
            style={{ color: 'var(--color-topbar-text-sub)', backgroundColor: 'rgba(255,255,255,0.06)' }}
          >
            <Palette size={12} />
            <span>Theme Playground</span>
          </Link>
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
