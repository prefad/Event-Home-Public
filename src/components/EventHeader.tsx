import { Share2, MapPin, Sun, Moon, Zap } from 'lucide-react';
import { useTheme, type ThemeName } from '../ThemeContext';

const NAV_ITEMS = ['Event Details', 'Hotels', 'Event Store', 'Schedule & Standings', "Who's Playing", 'Bulletin Board'];

const THEME_OPTIONS: { key: ThemeName; icon: typeof Moon; label: string }[] = [
  { key: 'dark', icon: Moon, label: 'Dark mode' },
  { key: 'light', icon: Sun, label: 'Light mode' },
  { key: 'bold', icon: Zap, label: 'Bold mode' },
];

export default function EventHeader() {
  const { theme, setTheme } = useTheme();

  const activeColor = theme === 'bold' ? '#e85358' : '#5ba3e0';
  const activeBg = theme === 'bold' ? 'rgba(185, 43, 48, 0.25)' : 'rgba(91, 163, 224, 0.25)';

  return (
    <div style={{ backgroundColor: 'var(--color-header-bg)', borderBottom: '1px solid var(--color-header-border)' }}>
      {/* Event Info Row */}
      <div className="px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[5px] overflow-hidden flex-shrink-0" style={{ border: '1px solid var(--color-header-border)' }}>
            <img src="https://weekendhockey.com/wp-content/uploads/2024/02/image-1-1.png" alt="Weekend Hockey logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-base font-semibold" style={{ color: 'var(--color-header-text)' }}>Presidents Day on the Beach</h1>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-header-text-sub)' }}>
              <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: 'var(--color-status-dot)' }}></span>
              <span>Feb 13 – Feb 16, 2026</span>
              <MapPin size={14} className="flex-shrink-0" style={{ color: 'var(--color-header-text-sub)' }} />
              <span>Fort Lauderdale, FL</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <div
            className="flex items-center rounded-full p-0.5"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            {THEME_OPTIONS.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
                style={{
                  backgroundColor: theme === key ? activeBg : 'transparent',
                  color: theme === key ? activeColor : 'var(--color-header-text-sub)',
                }}
                title={label}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
          <button className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--color-header-text-sub)' }}>
            <Share2 size={18} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-10 pb-4 flex items-center gap-2">
        {NAV_ITEMS.map((item, i) => (
          <button
            key={item}
            className="inline-flex items-center px-3 py-2 text-sm rounded-[5px] transition-colors"
            style={{
              backgroundColor: i === 0 ? 'var(--color-header-nav-active-bg)' : 'transparent',
              color: i === 0 ? 'var(--color-header-nav-active-text)' : 'var(--color-header-text)',
              fontWeight: i === 0 ? 500 : 400,
            }}
            onMouseEnter={(e) => { if (i !== 0) e.currentTarget.style.backgroundColor = 'var(--color-header-nav-hover)'; }}
            onMouseLeave={(e) => { if (i !== 0) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
