import { useNavigate, useLocation } from 'react-router-dom';
import { useIsPreview } from '../PreviewContext';

const TABS = [
  { label: 'Details', path: '/' },
  { label: 'Divisions', path: '/divisions' },
  { label: 'Rules & Regulations', path: '/rules' },
  { label: 'Payment Info', path: '/payment' },
  { label: 'Accommodations', path: '/accommodations' },
  { label: 'Sponsors', path: '/sponsors' },
];

export default function TabNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const isPreview = useIsPreview();
  const prefix = isPreview ? '/preview' : '';

  return (
    <div className="py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-tab-border)' }}>
      <div className="flex items-center gap-2">
        {TABS.map((tab) => {
          const fullPath = prefix + tab.path;
          const isActive = location.pathname === fullPath || (tab.path === '/' && location.pathname === prefix);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(fullPath + location.search)}
              className="inline-flex items-center px-3 py-2 text-sm rounded-[5px] transition-colors"
              style={{
                backgroundColor: isActive ? 'var(--color-tab-active-bg)' : 'transparent',
                color: isActive ? 'var(--color-tab-active-text)' : 'var(--color-text-primary)',
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <button
        className="inline-flex items-center text-sm font-medium px-4 py-2 rounded"
        style={{ backgroundColor: 'var(--color-cta)', color: 'var(--color-cta-text, var(--color-action-text))' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-cta-hover)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-cta)'; }}
      >
        New Registration
      </button>
    </div>
  );
}
