import { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sun, Moon, Check, AlertCircle, ExternalLink } from 'lucide-react';
import {
  generateTheme,
  deriveBrandPalette,
  contrastRatio,
  type ThemeVariables,
  type BrandPalette,
  type ThemeInput,
} from '../utils/generateTheme';

// ─── Preset brands to test with ──────────────────────────────────────

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

// ─── Swatch component ────────────────────────────────────────────────

function Swatch({
  color,
  label,
  sublabel,
  small,
}: {
  color: string;
  label: string;
  sublabel?: string;
  small?: boolean;
}) {
  const isRgba = color.startsWith('rgba');
  return (
    <div className={`flex items-center gap-2 ${small ? '' : 'mb-1'}`}>
      <div
        className={`${small ? 'w-5 h-5' : 'w-8 h-8'} rounded border border-black/10 flex-shrink-0`}
        style={{
          backgroundColor: isRgba ? undefined : color,
          background: isRgba ? `linear-gradient(${color}, ${color}), repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 8px 8px` : undefined,
        }}
      />
      <div className="min-w-0">
        <p className={`${small ? 'text-[11px]' : 'text-xs'} font-medium leading-tight text-gray-800`}>{label}</p>
        {sublabel && <p className="text-[10px] leading-tight text-gray-500">{sublabel}</p>}
      </div>
    </div>
  );
}

// ─── Contrast badge ──────────────────────────────────────────────────

function ContrastBadge({ fg, bg, label }: { fg: string; bg: string; label: string }) {
  // Skip rgba values for contrast calculation
  if (fg.startsWith('rgba') || bg.startsWith('rgba')) return null;
  const ratio = contrastRatio(fg, bg);
  const pass = ratio >= 4.5;
  const passLarge = ratio >= 3;
  return (
    <div className="flex items-center gap-1.5 text-[11px]">
      <span className="text-gray-500">{label}:</span>
      <span className={`font-mono font-semibold ${pass ? 'text-green-700' : passLarge ? 'text-amber-600' : 'text-red-600'}`}>
        {ratio.toFixed(1)}:1
      </span>
      {pass ? (
        <Check size={12} className="text-green-600" />
      ) : (
        <AlertCircle size={12} className={passLarge ? 'text-amber-500' : 'text-red-500'} />
      )}
      <span className={`text-[10px] ${pass ? 'text-green-600' : passLarge ? 'text-amber-600' : 'text-red-500'}`}>
        {pass ? 'AA' : passLarge ? 'AA Large' : 'Fail'}
      </span>
    </div>
  );
}

// ─── Palette display ─────────────────────────────────────────────────

function PaletteSection({ palette, label }: { palette: BrandPalette; label: string }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label} Palette</h4>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <Swatch color={palette.primary} label="Primary" sublabel={palette.primary} small />
        <Swatch color={palette.light} label="Light variant" sublabel={palette.light} small />
        <Swatch color={palette.opacity6} label="O: 6%" sublabel="Surfaces" small />
        <Swatch color={palette.opacity10} label="O: 10%" sublabel="Hover states" small />
        <Swatch color={palette.opacity15} label="O: 15%" sublabel="Active states" small />
        <Swatch color={palette.dark6} label="L: -6" sublabel={palette.dark6} small />
        <Swatch color={palette.dark10} label="L: -10" sublabel={palette.dark10} small />
        <Swatch color={palette.dark15} label="L: -15" sublabel={palette.dark15} small />
        <Swatch color={palette.safeOnWhite} label="Safe on white" sublabel={palette.safeOnWhite} small />
        <Swatch color={palette.safeOnDark} label="Safe on dark" sublabel={palette.safeOnDark} small />
      </div>
    </div>
  );
}

// ─── Mini preview (renders inside a scoped container) ────────────────

function MiniPreview({ vars, mode }: { vars: ThemeVariables; mode: 'light' | 'dark' }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    for (const [key, value] of Object.entries(vars)) {
      containerRef.current.style.setProperty(key, value);
    }
  }, [vars]);

  return (
    <div ref={containerRef} className="rounded-lg overflow-hidden border border-gray-200" style={{ fontSize: 13 }}>
      {/* Header bar */}
      <div style={{ backgroundColor: 'var(--color-header-bg)', padding: '10px 16px' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-header-text)' }}>Event Name</p>
            <p className="text-xs" style={{ color: 'var(--color-header-text-sub)' }}>Feb 13 - 16, 2026</p>
          </div>
          <span className="text-[10px] uppercase tracking-wide font-medium px-2 py-0.5 rounded" style={{ color: 'var(--color-header-text-sub)' }}>
            {mode}
          </span>
        </div>
        {/* Nav tabs */}
        <div className="flex gap-1 mt-2">
          {['Details', 'Divisions', 'Hotels'].map((tab, i) => (
            <span
              key={tab}
              className="text-xs px-2 py-1 rounded"
              style={{
                backgroundColor: i === 0 ? 'var(--color-header-nav-active-bg)' : 'transparent',
                color: i === 0 ? 'var(--color-header-nav-active-text)' : 'var(--color-header-text)',
                fontWeight: i === 0 ? 500 : 400,
              }}
            >
              {tab}
            </span>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div style={{ backgroundColor: 'var(--color-page-bg)', padding: '12px 16px' }}>
        {/* Info row with icon */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-icon-bg)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-icon-stroke)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>February 13 - 16, 2026</p>
            <p className="text-[11px]" style={{ color: 'var(--color-link)' }}>Add to Calendar</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-3 pb-2" style={{ borderBottom: '1px solid var(--color-divider)' }}>
          {['Details', 'Divisions & Fees'].map((tab, i) => (
            <span
              key={tab}
              className="text-[11px] px-2 py-1 rounded"
              style={{
                backgroundColor: i === 0 ? 'var(--color-tab-active-bg)' : 'transparent',
                color: i === 0 ? 'var(--color-tab-active-text)' : 'var(--color-text-secondary)',
                fontWeight: i === 0 ? 500 : 400,
              }}
            >
              {tab}
            </span>
          ))}
          <span
            className="text-[11px] px-2 py-1 rounded ml-auto font-medium"
            style={{ backgroundColor: 'var(--color-cta)', color: 'var(--color-cta-text, #fff)' }}
          >
            New Registration
          </span>
        </div>

        {/* Card */}
        <div className="rounded-lg p-3 mb-2" style={{ backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-card-border)' }}>
          <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-text-heading)' }}>12U Boys AAA</p>
          {/* Early bird row */}
          <div className="rounded px-2 py-1.5 mb-1.5 flex items-center justify-between" style={{ backgroundColor: 'var(--color-early-bird-row)' }}>
            <div>
              <p className="text-[11px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>Early Bird</p>
              <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Ends Nov 30</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-badge-success-bg)', color: 'var(--color-badge-success-text)' }}>
                Early Bird
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>$1,695</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--color-action)', color: 'var(--color-action-text)' }}>
                Register
              </span>
            </div>
          </div>
          {/* General row */}
          <div className="rounded px-2 py-1.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>General</p>
              <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Ends Jan 31</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-badge-warning-bg)', color: 'var(--color-badge-warning-text)' }}>
                Closing Soon
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>$1,895</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--color-action)', color: 'var(--color-action-text)' }}>
                Register
              </span>
            </div>
          </div>
        </div>

        {/* Group header */}
        <div className="rounded px-3 py-2 flex items-center justify-between" style={{ backgroundColor: 'var(--color-group-header-bg)' }}>
          <span className="text-xs font-medium" style={{ color: 'var(--color-group-header-text)' }}>Ice Hockey — Girls</span>
          <span className="text-[11px]" style={{ color: 'var(--color-group-header-text)' }}>8 Divisions</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Playground Page ────────────────────────────────────────────

export default function ThemePlayground() {
  const [params] = useSearchParams();
  const urlPrimary = params.get('primary') || '#0731FA';
  const urlSecondary = params.get('secondary') || '';

  const [primary, setPrimary] = useState(urlPrimary);
  const [secondary, setSecondary] = useState(urlSecondary);
  const [hasSecondary, setHasSecondary] = useState(!!urlSecondary);
  const [primaryInput, setPrimaryInput] = useState(urlPrimary);
  const [secondaryInput, setSecondaryInput] = useState(urlSecondary);

  // Debounce: only regenerate when inputs are valid hex
  const isValidHex = (v: string) => /^#?[0-9a-fA-F]{6}$/.test(v);

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

  const input: ThemeInput = useMemo(() => ({
    primary,
    secondary: hasSecondary && secondary ? secondary : undefined,
  }), [primary, secondary, hasSecondary]);

  const result = useMemo(() => generateTheme(input), [input]);
  const primaryPalette = result.primaryPalette;
  const secondaryPalette = result.secondaryPalette;

  const buildPreviewUrl = (mode: 'light' | 'dark', page = '') => {
    const p = encodeURIComponent(primary);
    const s = hasSecondary && secondary ? `&secondary=${encodeURIComponent(secondary)}` : '';
    return `/preview${page}?primary=${p}${s}&mode=${mode}`;
  };

  const applyPreset = (preset: typeof PRESETS[number]) => {
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
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-gray-900" style={{ fontFamily: "'Cera Pro', -apple-system, sans-serif" }}>
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Theme Playground</h1>
            <p className="text-sm text-gray-500 mt-0.5">Generate a complete branded theme from one or two colours</p>
          </div>
          <a href="/" className="text-sm text-blue-600 hover:underline">&larr; Back to portal</a>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-6">
        <div className="flex gap-6">
          {/* ── Left column: Controls ── */}
          <div className="w-[340px] flex-shrink-0 space-y-5">
            {/* Color inputs */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 space-y-4">
              <h3 className="text-sm font-semibold text-gray-800">Brand Colours</h3>

              {/* Primary */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Primary</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primary}
                    onChange={(e) => { setPrimaryInput(e.target.value); setPrimary(e.target.value); }}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={primaryInput}
                    onChange={(e) => setPrimaryInput(e.target.value)}
                    placeholder="#0731FA"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
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
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-xs font-medium text-gray-600">Secondary colour</span>
                </label>
                {hasSecondary && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="color"
                      value={secondary || '#b92b30'}
                      onChange={(e) => { setSecondaryInput(e.target.value); setSecondary(e.target.value); }}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={secondaryInput}
                      onChange={(e) => setSecondaryInput(e.target.value)}
                      placeholder="#b92b30"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Presets */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Presets</h3>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex -space-x-1">
                      <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: preset.primary }} />
                      {preset.secondary && (
                        <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: preset.secondary }} />
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-700 truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Derived palette */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 space-y-4">
              <PaletteSection palette={primaryPalette} label="Primary" />
              {secondaryPalette && <PaletteSection palette={secondaryPalette} label="Secondary" />}
            </div>

            {/* Contrast checks */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Contrast Checks</h4>
              <div className="space-y-1">
                <ContrastBadge fg={primaryPalette.safeOnWhite} bg="#ffffff" label="Action on white" />
                <ContrastBadge fg={primaryPalette.safeOnDark} bg={result.dark['--color-page-bg']} label="Action on dark bg" />
                <ContrastBadge fg="#e0e8f0" bg={result.dark['--color-page-bg']} label="Text on dark bg" />
                <ContrastBadge fg="#0d1f38" bg="#f0f3f8" label="Text on light bg" />
                {secondaryPalette && (
                  <>
                    <ContrastBadge fg={secondaryPalette.safeOnWhite} bg="#ffffff" label="CTA on white" />
                    <ContrastBadge fg={secondaryPalette.safeOnDark} bg={result.dark['--color-page-bg']} label="CTA on dark bg" />
                  </>
                )}
              </div>
            </div>

            {/* Secondary color role explanation */}
            {hasSecondary && (
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Secondary Colour Usage</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: secondary || '#ccc' }} />
                    CTA buttons (New Registration)
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: secondary || '#ccc' }} />
                    Icon strokes & status indicators
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: secondary || '#ccc' }} />
                    Avatar background
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* ── Right column: Previews ── */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Side-by-side previews */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sun size={14} className="text-amber-500" />
                  <h3 className="text-sm font-semibold text-gray-700">Light Mode</h3>
                </div>
                <MiniPreview vars={result.light} mode="light" />
                <div className="flex gap-2 mt-2">
                  <a
                    href={buildPreviewUrl('light')}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <ExternalLink size={12} />
                    Preview Details
                  </a>
                  <a
                    href={buildPreviewUrl('light', '/divisions')}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <ExternalLink size={12} />
                    Preview Divisions
                  </a>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Moon size={14} className="text-indigo-400" />
                  <h3 className="text-sm font-semibold text-gray-700">Dark Mode</h3>
                </div>
                <MiniPreview vars={result.dark} mode="dark" />
                <div className="flex gap-2 mt-2">
                  <a
                    href={buildPreviewUrl('dark')}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <ExternalLink size={12} />
                    Preview Details
                  </a>
                  <a
                    href={buildPreviewUrl('dark', '/divisions')}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <ExternalLink size={12} />
                    Preview Divisions
                  </a>
                </div>
              </div>
            </div>

            {/* Variable output */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <VariableOutput label="Light" vars={result.light} />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <VariableOutput label="Dark" vars={result.dark} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Collapsible variable output ─────────────────────────────────────

function VariableOutput({ label, vars }: { label: string; vars: ThemeVariables }) {
  const [open, setOpen] = useState(false);
  const entries = Object.entries(vars);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-700">{label} Theme Variables</span>
        <span className="text-xs text-gray-400">{entries.length} vars &middot; {open ? 'collapse' : 'expand'}</span>
      </button>
      {open && (
        <div className="px-5 pb-4 max-h-[400px] overflow-auto">
          <pre className="text-[11px] leading-relaxed font-mono text-gray-700">
            {entries.map(([k, v]) => `${k}: ${v};`).join('\n')}
          </pre>
        </div>
      )}
    </div>
  );
}
