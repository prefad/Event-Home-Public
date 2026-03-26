import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { generateTheme, applyTheme, clearInlineTheme, type ThemeInput } from '../utils/generateTheme';

const PRESETS: { name: string; primary: string; secondary?: string }[] = [
  { name: 'EC Default', primary: '#0731FA' },
  { name: 'Weekend Hockey', primary: '#2b70b6', secondary: '#b92b30' },
  { name: 'Forest FC', primary: '#1a7a42' },
  { name: 'Crimson League', primary: '#c41e3a', secondary: '#1a1a2e' },
  { name: 'Sunset Sports', primary: '#e65100', secondary: '#4a148c' },
  { name: 'Royal Athletic', primary: '#4a148c', secondary: '#f9a825' },
  { name: 'Teal Wave', primary: '#00796b' },
  { name: 'Charcoal United', primary: '#37474f', secondary: '#ff6f00' },
];

const isValidHex = (v: string) => /^#?[0-9a-fA-F]{6}$/.test(v);

interface Props {
  onClose: () => void;
}

export default function BrandColorPopup({ onClose }: Props) {
  const { theme } = useTheme();

  const [primary, setPrimary] = useState('#0731FA');
  const [secondary, setSecondary] = useState('');
  const [hasSecondary, setHasSecondary] = useState(false);
  const [primaryInput, setPrimaryInput] = useState('#0731FA');
  const [secondaryInput, setSecondaryInput] = useState('');
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (isValidHex(primaryInput)) {
      setPrimary(primaryInput.startsWith('#') ? primaryInput : `#${primaryInput}`);
    }
  }, [primaryInput]);

  useEffect(() => {
    if (isValidHex(secondaryInput)) {
      setSecondary(secondaryInput.startsWith('#') ? secondaryInput : `#${secondaryInput}`);
    } else if (secondaryInput === '') {
      setSecondary('');
    }
  }, [secondaryInput]);

  const input: ThemeInput = useMemo(
    () => ({
      primary,
      secondary: hasSecondary && secondary ? secondary : undefined,
    }),
    [primary, secondary, hasSecondary],
  );

  const result = useMemo(() => generateTheme(input), [input]);

  const handleApply = () => {
    const mode = theme === 'light' ? 'light' : 'dark';
    const vars = mode === 'dark' ? result.dark : result.light;
    applyTheme(vars);
    setApplied(true);
  };

  const handleReset = () => {
    clearInlineTheme();
    setApplied(false);
  };

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setPrimaryInput(preset.primary);
    setPrimary(preset.primary);
    if (preset.secondary) {
      setHasSecondary(true);
      setSecondaryInput(preset.secondary);
      setSecondary(preset.secondary);
    } else {
      setHasSecondary(false);
      setSecondaryInput('');
      setSecondary('');
    }
    setApplied(false);
  };

  return (
    <div
      className="w-[320px] rounded-2xl overflow-hidden"
      style={{
        backgroundColor: '#1e1e22',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <h3 className="text-sm font-semibold text-white">Brand Colours</h3>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-7 h-7 rounded-full transition-colors"
          style={{ color: 'rgba(255, 255, 255, 0.5)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
          }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Primary color */}
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-1.5">Primary</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={primary}
              onChange={(e) => {
                setPrimaryInput(e.target.value);
                setPrimary(e.target.value);
              }}
              className="w-10 h-10 rounded-lg cursor-pointer p-0.5"
              style={{ border: '1px solid rgba(255, 255, 255, 0.15)', backgroundColor: '#2a2a2e' }}
            />
            <input
              type="text"
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value)}
              placeholder="#0731FA"
              className="flex-1 px-3 py-2 text-sm rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              style={{
                backgroundColor: '#2a2a2e',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e0e0e0',
              }}
            />
          </div>
        </div>

        {/* Secondary toggle */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasSecondary}
              onChange={(e) => setHasSecondary(e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: primary }}
            />
            <span className="text-xs font-medium text-gray-400">Secondary colour</span>
          </label>
          {hasSecondary && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="color"
                value={secondary || '#b92b30'}
                onChange={(e) => {
                  setSecondaryInput(e.target.value);
                  setSecondary(e.target.value);
                }}
                className="w-10 h-10 rounded-lg cursor-pointer p-0.5"
                style={{ border: '1px solid rgba(255, 255, 255, 0.15)', backgroundColor: '#2a2a2e' }}
              />
              <input
                type="text"
                value={secondaryInput}
                onChange={(e) => setSecondaryInput(e.target.value)}
                placeholder="#b92b30"
                className="flex-1 px-3 py-2 text-sm rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                style={{
                  backgroundColor: '#2a2a2e',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#e0e0e0',
                }}
              />
            </div>
          )}
        </div>

        {/* Presets */}
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-2">Presets</label>
          <div className="grid grid-cols-2 gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-left"
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                <div className="flex -space-x-1">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: preset.primary, border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                  {preset.secondary && (
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: preset.secondary, border: '1px solid rgba(255,255,255,0.2)' }}
                    />
                  )}
                </div>
                <span className="text-[11px] font-medium text-gray-300 truncate">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Apply / Reset buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleApply}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white text-center transition-all"
            style={{
              backgroundColor: primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Apply Theme
          </button>
          {applied && (
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-center transition-colors"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
