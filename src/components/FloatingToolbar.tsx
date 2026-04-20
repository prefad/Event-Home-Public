import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, SlidersHorizontal } from 'lucide-react';
import BrandColorPopup from './BrandColorPopup';
import Vector16 from '../pages/hotels/Vector-16-985';

/**
 * DEC Playbook URL. Currently points at the local dev server spun up from
 * the cloned source repo at ~/projects/dec. Once a hosted Playbook exists
 * (Vercel preview, dec.eventconnect.ai, etc.), swap this constant.
 */
const DEC_PLAYBOOK_URL = 'http://localhost:5175/';

export default function FloatingToolbar() {
  const [showColorPopup, setShowColorPopup] = useState(false);
  const [decToast, setDecToast] = useState<string | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShowColorPopup(false);
      }
    }
    if (showColorPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showColorPopup]);

  /**
   * Open the DEC Playbook. In a sandboxed preview iframe (e.g. Claude Code's
   * live preview) navigation to any non-preview-origin URL is blocked silently
   * — `window.open` returns a truthy Window but the actual load never happens,
   * so we can't rely on its return value. Detect the iframe case up front and
   * copy the URL to the clipboard with a toast instead; outside an iframe, let
   * the browser open the link normally via `window.open`.
   */
  async function handleDecClick(e: React.MouseEvent) {
    e.preventDefault();

    const inIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        // cross-origin access throws → definitely in a sandboxed iframe
        return true;
      }
    })();

    if (!inIframe) {
      const opened = window.open(DEC_PLAYBOOK_URL, '_blank', 'noopener,noreferrer');
      if (opened) return;
    }

    // Iframe (or popup blocked): copy URL + toast.
    try {
      await navigator.clipboard.writeText(DEC_PLAYBOOK_URL);
      setDecToast(`URL copied — paste in a browser tab: ${DEC_PLAYBOOK_URL}`);
    } catch {
      setDecToast(`Open in browser: ${DEC_PLAYBOOK_URL}`);
    }
    setTimeout(() => setDecToast(null), 4000);
  }

  return (
    <div ref={toolbarRef} className="fixed bottom-6 right-6 z-50">
      {/* Color popup - positioned above the toolbar, right-aligned so it opens leftward */}
      {showColorPopup && (
        <div className="absolute bottom-full right-0 mb-3">
          <BrandColorPopup onClose={() => setShowColorPopup(false)} />
        </div>
      )}

      {/* Toast shown when the DEC Playbook open is sandbox-blocked and
          we fall back to clipboard. Non-intrusive, auto-dismisses. */}
      {decToast && (
        <div
          className="absolute bottom-full right-0 mb-3 px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-xl"
          style={{
            backgroundColor: '#1a1a1e',
            color: 'rgba(255,255,255,0.92)',
            border: '1px solid rgba(255,255,255,0.08)',
            maxWidth: '360px',
          }}
        >
          {decToast}
        </div>
      )}

      {/* Floating pill bar */}
      <div
        className="flex items-center gap-0 rounded-full px-3 py-2 shadow-2xl"
        style={{
          backgroundColor: '#1a1a1e',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Option 1: EventConnect DEC Playbook launcher.
            Vector16 fills via `var(--fill-0, #0731FA)`, so we override
            --fill-0 on the wrapper to recolor the logo white to match
            the other icon colours on the pill. */}
        <a
          href={DEC_PLAYBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDecClick}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
          style={{
            backgroundColor: 'transparent',
            // Vector16 reads --fill-0 for its path fill.
            ...({ '--fill-0': 'rgba(255, 255, 255, 0.7)' } as Record<string, string>),
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.setProperty('--fill-0', '#ffffff');
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.setProperty('--fill-0', 'rgba(255, 255, 255, 0.7)');
          }}
          title="Open DEC Playbook"
        >
          <div className="w-5 h-5 shrink-0">
            <Vector16 />
          </div>
        </a>

        {/* Divider */}
        <div
          className="w-px h-6 mx-2"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
        />

        {/* Option 2: Brand colors popup */}
        <button
          onClick={() => setShowColorPopup(!showColorPopup)}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
          style={{
            backgroundColor: showColorPopup ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
            color: showColorPopup ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
          }}
          onMouseEnter={(e) => {
            if (!showColorPopup) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
          }}
          onMouseLeave={(e) => {
            if (!showColorPopup) e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Brand Colours"
        >
          <Palette size={20} />
        </button>

        {/* Divider */}
        <div
          className="w-px h-6 mx-2"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
        />

        {/* Option 3: Go to playground */}
        <button
          onClick={() => navigate('/playground')}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
          style={{
            backgroundColor: 'transparent',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Theme Playground"
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>
    </div>
  );
}
