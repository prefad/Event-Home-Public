import { ChevronDown, Moon, Sun, Zap } from 'lucide-react';
import { useTheme, type ThemeName } from '../ThemeContext';

const THEME_OPTIONS: { key: ThemeName; icon: typeof Moon; label: string }[] = [
  { key: 'dark', icon: Moon, label: 'Dark mode' },
  { key: 'light', icon: Sun, label: 'Light mode' },
  { key: 'bold', icon: Zap, label: 'Bold mode' },
];

export default function TopBar() {
  const { theme, setTheme } = useTheme();
  const activeColor = theme === 'bold' ? '#e85358' : '#5ba3e0';
  const activeBg = theme === 'bold' ? 'rgba(185, 43, 48, 0.25)' : 'rgba(91, 163, 224, 0.25)';

  return (
    <div style={{ backgroundColor: 'var(--color-topbar-bg)' }}>
      <div className="px-12 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-topbar-border)' }}>
        <span className="text-sm font-medium" style={{ color: 'var(--color-topbar-text)' }}>Weekend Hockey</span>
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <div
            className="flex items-center rounded-full p-0.5"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            {THEME_OPTIONS.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className="flex items-center justify-center w-7 h-7 rounded-full transition-all"
                style={{
                  backgroundColor: theme === key ? activeBg : 'transparent',
                  color: theme === key ? activeColor : 'var(--color-topbar-text-sub)',
                }}
                title={label}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
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
