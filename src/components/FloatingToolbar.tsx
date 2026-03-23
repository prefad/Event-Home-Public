import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, SlidersHorizontal } from 'lucide-react';
import BrandColorPopup from './BrandColorPopup';

export default function FloatingToolbar() {
  const [showColorPopup, setShowColorPopup] = useState(false);
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

  return (
    <div ref={toolbarRef} className="fixed bottom-6 right-6 z-50">
      {/* Color popup - positioned above the toolbar */}
      {showColorPopup && (
        <div className="absolute bottom-full right-0 mb-3">
          <BrandColorPopup onClose={() => setShowColorPopup(false)} />
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
        {/* Option 1: Brand colors popup */}
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

        {/* Option 2: Go to playground */}
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
