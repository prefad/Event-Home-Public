/**
 * generateTheme.ts
 *
 * Takes a primary (and optional secondary) brand hex color and generates
 * a complete set of CSS custom properties for both light and dark themes.
 *
 * Based on the Figma "Brand Colour Logic" system:
 *   - 3 lighter variants: color at 6%, 10%, 15% opacity
 *   - 3 darker variants: color with HSL luminance shifted by -6, -10, -15
 *   - 1 light-on-dark variant: boosted lightness for dark mode text/accents
 *
 * Neutral palette (text, badges, dividers) stays fixed for guaranteed
 * readability. Only brand-influenced tokens shift per client.
 */

// ─── Color Math Utilities ───────────────────────────────────────────

interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/** Parse "#RRGGBB" or "#RGB" to RGB */
function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2]
      : clean;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** RGB to hex string */
function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) =>
    Math.round(Math.min(255, Math.max(0, n)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** RGB to HSL */
function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/** HSL to RGB */
function hslToRgb({ h, s, l }: HSL): RGB {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let rn = 0,
    gn = 0,
    bn = 0;

  if (h < 60) {
    rn = c; gn = x; bn = 0;
  } else if (h < 120) {
    rn = x; gn = c; bn = 0;
  } else if (h < 180) {
    rn = 0; gn = c; bn = x;
  } else if (h < 240) {
    rn = 0; gn = x; bn = c;
  } else if (h < 300) {
    rn = x; gn = 0; bn = c;
  } else {
    rn = c; gn = 0; bn = x;
  }

  return {
    r: Math.round((rn + m) * 255),
    g: Math.round((gn + m) * 255),
    b: Math.round((bn + m) * 255),
  };
}

/** Shift HSL luminance by a delta (can be negative) */
export function shiftLuminance(hex: string, delta: number): string {
  const hsl = rgbToHsl(hexToRgb(hex));
  hsl.l = Math.min(100, Math.max(0, hsl.l + delta));
  return rgbToHex(hslToRgb(hsl));
}

/** Create an rgba() string from hex + opacity */
export function hexToRgba(hex: string, opacity: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/** Blend a foreground hex at given opacity onto a solid background hex */
function blendOnto(fgHex: string, bgHex: string, opacity: number): string {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  return rgbToHex({
    r: Math.round(fg.r * opacity + bg.r * (1 - opacity)),
    g: Math.round(fg.g * opacity + bg.g * (1 - opacity)),
    b: Math.round(fg.b * opacity + bg.b * (1 - opacity)),
  });
}

/** Calculate relative luminance for WCAG contrast */
function relativeLuminance({ r, g, b }: RGB): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** WCAG contrast ratio between two hex colors */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Ensure a color meets minimum contrast against a background.
 * Nudges lightness up or down until AA (4.5:1) is met.
 */
function ensureContrast(
  foregroundHex: string,
  backgroundHex: string,
  minRatio = 4.5
): string {
  let fg = foregroundHex;
  let ratio = contrastRatio(fg, backgroundHex);
  if (ratio >= minRatio) return fg;

  const bgLum = relativeLuminance(hexToRgb(backgroundHex));
  const direction = bgLum < 0.5 ? 1 : -1;

  for (let i = 0; i < 50; i++) {
    fg = shiftLuminance(fg, direction * 2);
    ratio = contrastRatio(fg, backgroundHex);
    if (ratio >= minRatio) break;
  }
  return fg;
}

/**
 * Generate a "light on dark" version of a color for use as
 * accented text/icons on dark backgrounds.
 */
function generateLightVariant(hex: string): string {
  const hsl = rgbToHsl(hexToRgb(hex));
  hsl.l = Math.max(hsl.l, 68);
  hsl.s = Math.min(hsl.s, 75);
  return rgbToHex(hslToRgb(hsl));
}

// ─── Derived Brand Colors ───────────────────────────────────────────

export interface BrandPalette {
  primary: string;
  opacity6: string;
  opacity10: string;
  opacity15: string;
  dark6: string;
  dark10: string;
  dark15: string;
  light: string;
  safeOnWhite: string;
  safeOnDark: string;
}

export function deriveBrandPalette(hex: string, darkBgRef = '#0a1628'): BrandPalette {
  const primary = hex.startsWith('#') ? hex : `#${hex}`;
  const lightVariant = generateLightVariant(primary);

  return {
    primary,
    opacity6: hexToRgba(primary, 0.06),
    opacity10: hexToRgba(primary, 0.10),
    opacity15: hexToRgba(primary, 0.15),
    dark6: shiftLuminance(primary, -6),
    dark10: shiftLuminance(primary, -10),
    dark15: shiftLuminance(primary, -15),
    light: lightVariant,
    safeOnWhite: ensureContrast(primary, '#ffffff', 4.5),
    safeOnDark: ensureContrast(lightVariant, darkBgRef, 4.5),
  };
}

// ─── Full Theme Generation ──────────────────────────────────────────

export interface ThemeVariables {
  [key: string]: string;
}

export interface GeneratedThemes {
  light: ThemeVariables;
  dark: ThemeVariables;
  primaryPalette: BrandPalette;
  secondaryPalette: BrandPalette | null;
}

export interface ThemeInput {
  primary: string;
  secondary?: string;
}

/**
 * Main entry point. Give it one or two hex colors, get back complete
 * light + dark CSS variable sets.
 *
 * Secondary color usage:
 *   - CTA / "New Registration" button
 *   - Status dot & avatar accent
 *   - Icon stroke color (adds visual variety)
 *   - Link hover alternative
 *
 * When no secondary is provided, primary handles everything.
 */
export function generateTheme(input: ThemeInput): GeneratedThemes {
  const p = deriveBrandPalette(input.primary);

  // Dark surfaces derived from the primary hue
  const darkHsl = rgbToHsl(hexToRgb(p.primary));
  const darkPageBg = rgbToHex(hslToRgb({ h: darkHsl.h, s: Math.min(darkHsl.s, 50), l: 8 }));
  const darkCardBg = rgbToHex(hslToRgb({ h: darkHsl.h, s: Math.min(darkHsl.s, 45), l: 12 }));
  const darkSurfaceMid = rgbToHex(hslToRgb({ h: darkHsl.h, s: Math.min(darkHsl.s, 40), l: 16 }));
  const darkBorder = rgbToHex(hslToRgb({ h: darkHsl.h, s: Math.min(darkHsl.s, 40), l: 20 }));
  const darkHeaderBg = rgbToHex(hslToRgb({ h: darkHsl.h, s: Math.min(darkHsl.s, 55), l: 10 }));

  // Secondary palette (if provided)
  const s = input.secondary ? deriveBrandPalette(input.secondary, darkPageBg) : null;

  // Decide which color fills which role
  const ctaLight = s ? s.safeOnWhite : p.safeOnWhite;
  const ctaLightHover = s ? s.dark6 : p.dark6;
  const ctaDark = s ? s.safeOnDark : p.safeOnDark;
  const ctaDarkHover = s ? shiftLuminance(s.safeOnDark, -8) : shiftLuminance(p.safeOnDark, -8);
  const iconStrokeLight = s ? s.safeOnWhite : p.safeOnWhite;
  const iconStrokeDark = s ? s.safeOnDark : p.safeOnDark;
  const statusDotLight = s ? s.safeOnWhite : p.safeOnWhite;
  const statusDotDark = s ? s.safeOnDark : p.safeOnDark;

  // Neutral palette (fixed)
  const neutrals = {
    badgeSuccessBg: { light: '#a3ceb6', dark: '#1a5c38' },
    badgeSuccessText: { light: '#0d1f38', dark: '#a3ceb6' },
    badgeWarningBg: { light: '#f9e7a4', dark: '#5c4a1a' },
    badgeWarningText: { light: '#0d1f38', dark: '#f9e7a4' },
    badgeCriticalBg: { light: '#f7aaae', dark: '#5c1a1e' },
    badgeCriticalText: { light: '#0d1f38', dark: '#f7aaae' },
    badgeWaitingBg: { light: '#fbc7a2', dark: '#5c3a1a' },
    badgeWaitingText: { light: '#0d1f38', dark: '#fbc7a2' },
  };

  // ── Accessible text colors ──

  // Button text: ensure readable on action/CTA backgrounds
  const actionTextLight = contrastRatio('#ffffff', p.safeOnWhite) >= 4.5 ? '#ffffff' : '#0d1f38';
  const actionTextDark = contrastRatio('#ffffff', p.safeOnDark) >= 3 ? '#ffffff' : '#0d1f38';
  const ctaTextLight = s
    ? (contrastRatio('#ffffff', ctaLight) >= 4.5 ? '#ffffff' : '#0d1f38')
    : actionTextLight;
  const ctaTextDark = s
    ? (contrastRatio('#ffffff', ctaDark) >= 3 ? '#ffffff' : '#0d1f38')
    : actionTextDark;

  // Header nav active text: check against the blended pill bg (rgba on header)
  const headerNavBlendedLight = blendOnto(p.light, p.dark15, 0.2);
  const headerNavBlendedDark = blendOnto(p.light, darkHeaderBg, 0.25);
  const headerNavActiveLight = ensureContrast(p.light, headerNavBlendedLight, 4.5);
  const headerNavActiveDark = ensureContrast(p.safeOnDark, headerNavBlendedDark, 4.5);

  // Tab active text: check against blended pill bg (rgba on page bg)
  const tabBlendedLight = blendOnto(p.primary, '#f0f3f8', 0.15);
  const tabBlendedDark = blendOnto(p.light, darkPageBg, 0.25);
  const tabActiveTextLight = ensureContrast(p.safeOnWhite, tabBlendedLight, 4.5);
  const tabActiveTextDark = ensureContrast(p.safeOnDark, tabBlendedDark, 4.5);

  // Topbar text: ensure readable against the branded topbar bg
  const topbarTextMain = ensureContrast('#f6f6f6', p.dark15, 4.5);
  const headerTextMain = topbarTextMain;

  // ── Light Theme ──
  const light: ThemeVariables = {
    '--color-page-bg': '#f0f3f8',
    '--color-topbar-bg': p.dark15,
    '--color-topbar-text': topbarTextMain,
    '--color-topbar-text-sub': '#8899b0',
    '--color-topbar-border': p.dark10,
    '--color-header-bg': p.dark15,
    '--color-header-border': p.dark10,
    '--color-header-text': headerTextMain,
    '--color-header-text-sub': '#8899b0',
    '--color-header-nav-active-bg': hexToRgba(p.light, 0.2),
    '--color-header-nav-active-text': headerNavActiveLight,
    '--color-header-nav-hover': 'rgba(255, 255, 255, 0.08)',
    '--color-content-bg': '#f0f3f8',
    '--color-card-bg': '#ffffff',
    '--color-card-border': '#d5dce8',
    '--color-text-primary': '#0d1f38',
    '--color-text-secondary': '#4a5f7a',
    '--color-text-heading': '#0d1f38',
    '--color-action': p.safeOnWhite,
    '--color-action-hover': p.dark6,
    '--color-action-text': actionTextLight,
    '--color-cta': ctaLight,
    '--color-cta-hover': ctaLightHover,
    '--color-cta-text': ctaTextLight,
    '--color-link': p.safeOnWhite,
    '--color-tab-active-bg': p.opacity15,
    '--color-tab-active-text': tabActiveTextLight,
    '--color-tab-border': '#cdd5e0',
    '--color-divider': '#cdd5e0',
    '--color-icon-bg': '#e4eaf2',
    '--color-icon-stroke': iconStrokeLight,
    '--color-input-bg': '#ffffff',
    '--color-input-border': '#cdd5e0',
    '--color-input-text': '#0d1f38',
    '--color-input-placeholder': '#7a8fa8',
    '--color-group-header-bg': '#e4eaf2',
    '--color-group-header-text': '#0d1f38',
    '--color-early-bird-row': p.opacity6,
    '--color-badge-success-bg': neutrals.badgeSuccessBg.light,
    '--color-badge-success-text': neutrals.badgeSuccessText.light,
    '--color-badge-warning-bg': neutrals.badgeWarningBg.light,
    '--color-badge-warning-text': neutrals.badgeWarningText.light,
    '--color-badge-critical-bg': neutrals.badgeCriticalBg.light,
    '--color-badge-critical-text': neutrals.badgeCriticalText.light,
    '--color-badge-waiting-bg': neutrals.badgeWaitingBg.light,
    '--color-badge-waiting-text': neutrals.badgeWaitingText.light,
    '--color-map-bg': '#e4eaf2',
    '--color-sponsor-bg': '#e4eaf2',
    '--color-avatar-bg': statusDotLight,
    '--color-status-dot': statusDotLight,
    '--color-gold': '#b59960',
  };

  // ── Dark Theme ──
  const dark: ThemeVariables = {
    '--color-page-bg': darkPageBg,
    '--color-topbar-bg': darkHeaderBg,
    '--color-topbar-text': '#f6f6f6',
    '--color-topbar-text-sub': '#8899b0',
    '--color-topbar-border': darkBorder,
    '--color-header-bg': darkHeaderBg,
    '--color-header-border': darkBorder,
    '--color-header-text': '#f6f6f6',
    '--color-header-text-sub': '#8899b0',
    '--color-header-nav-active-bg': hexToRgba(p.light, 0.25),
    '--color-header-nav-active-text': headerNavActiveDark,
    '--color-header-nav-hover': 'rgba(255, 255, 255, 0.06)',
    '--color-content-bg': darkPageBg,
    '--color-card-bg': darkCardBg,
    '--color-card-border': darkBorder,
    '--color-text-primary': '#e0e8f0',
    '--color-text-secondary': '#7a8fa8',
    '--color-text-heading': '#ffffff',
    '--color-action': p.safeOnDark,
    '--color-action-hover': shiftLuminance(p.safeOnDark, -8),
    '--color-action-text': actionTextDark,
    '--color-cta': ctaDark,
    '--color-cta-hover': ctaDarkHover,
    '--color-cta-text': ctaTextDark,
    '--color-link': p.safeOnDark,
    '--color-tab-active-bg': hexToRgba(p.light, 0.25),
    '--color-tab-active-text': tabActiveTextDark,
    '--color-tab-border': darkBorder,
    '--color-divider': darkBorder,
    '--color-icon-bg': darkSurfaceMid,
    '--color-icon-stroke': iconStrokeDark,
    '--color-input-bg': darkCardBg,
    '--color-input-border': darkBorder,
    '--color-input-text': '#f6f6f6',
    '--color-input-placeholder': '#5a7090',
    '--color-group-header-bg': darkSurfaceMid,
    '--color-group-header-text': '#f6f6f6',
    '--color-early-bird-row': hexToRgba(p.primary, 0.08),
    '--color-badge-success-bg': neutrals.badgeSuccessBg.dark,
    '--color-badge-success-text': neutrals.badgeSuccessText.dark,
    '--color-badge-warning-bg': neutrals.badgeWarningBg.dark,
    '--color-badge-warning-text': neutrals.badgeWarningText.dark,
    '--color-badge-critical-bg': neutrals.badgeCriticalBg.dark,
    '--color-badge-critical-text': neutrals.badgeCriticalText.dark,
    '--color-badge-waiting-bg': neutrals.badgeWaitingBg.dark,
    '--color-badge-waiting-text': neutrals.badgeWaitingText.dark,
    '--color-map-bg': darkSurfaceMid,
    '--color-sponsor-bg': darkSurfaceMid,
    '--color-avatar-bg': statusDotDark,
    '--color-status-dot': statusDotDark,
    '--color-gold': '#b59960',
  };

  return { light, dark, primaryPalette: p, secondaryPalette: s };
}

/** Apply a set of CSS variables to a specific element (defaults to :root) */
export function applyTheme(variables: ThemeVariables, el?: HTMLElement): void {
  const target = el || document.documentElement;
  for (const [key, value] of Object.entries(variables)) {
    target.style.setProperty(key, value);
  }
}

/** Remove all inline --color-* properties from an element */
export function clearInlineTheme(el?: HTMLElement): void {
  const target = el || document.documentElement;
  const style = target.style;
  for (let i = style.length - 1; i >= 0; i--) {
    const prop = style[i];
    if (prop.startsWith('--color-')) {
      target.style.removeProperty(prop);
    }
  }
}
