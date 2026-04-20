import { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams, useLocation, Link } from 'react-router-dom';
import { ChevronDown, Share2, MapPin, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider } from './ThemeContext';
import { generateTheme, applyTheme, clearInlineTheme } from './utils/generateTheme';
import { restoreBrandTheme } from './components/BrandColorPopup';
import TopBar from './components/TopBar';
import EventHeader from './components/EventHeader';
import EventBanner from './components/EventBanner';
import TabNavigation from './components/TabNavigation';
import FloatingToolbar from './components/FloatingToolbar';
import DetailsPage from './pages/DetailsPage';
import DivisionsPage from './pages/DivisionsPage';
import ThemePlayground from './pages/ThemePlayground';
import HotelsPage from './pages/HotelsPage';
import DecPreview from './pages/DecPreview';
import { PreviewProvider } from './PreviewContext';

/** Banner shown in preview mode with link back to playground + mode toggle */
function PreviewBanner({ primary, secondary, mode, onToggleMode }: { primary: string; secondary?: string; mode: string; onToggleMode: () => void }) {
  const playgroundUrl = `/playground?primary=${encodeURIComponent(primary)}${secondary ? `&secondary=${encodeURIComponent(secondary)}` : ''}`;
  return (
    <div
      className="px-12 py-2 flex items-center justify-between text-xs"
      style={{ backgroundColor: '#1a1a1a', color: '#ccc' }}
    >
      <Link to={playgroundUrl} className="text-blue-400 hover:text-blue-300 hover:underline">
        &larr; Back to Playground
      </Link>
      <div className="flex items-center gap-3">
        <span className="font-semibold text-white">Preview Mode</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primary }} />
          {primary}
        </span>
        {secondary && (
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: secondary }} />
            {secondary}
          </span>
        )}
        <button
          onClick={onToggleMode}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/10 font-medium hover:bg-white/20 transition-colors"
        >
          {mode === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
          {mode}
        </button>
      </div>
    </div>
  );
}

/** Dummy top bar for preview — no real names or profile data */
function PreviewTopBar() {
  return (
    <div style={{ backgroundColor: 'var(--color-topbar-bg)' }}>
      <div className="px-12 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-topbar-border)' }}>
        <span className="text-sm font-medium" style={{ color: 'var(--color-topbar-text)' }}>Association Name</span>
        <span className="inline-flex items-center gap-2 text-sm rounded-full px-2 py-1" style={{ color: 'var(--color-topbar-text)' }}>
          <span className="w-7 h-7 rounded-full text-white text-xs font-medium flex items-center justify-center uppercase" style={{ backgroundColor: 'var(--color-avatar-bg)' }}>AB</span>
          <span>A. Member</span>
          <ChevronDown size={14} style={{ color: 'var(--color-topbar-text-sub)' }} />
        </span>
      </div>
    </div>
  );
}

const PREVIEW_NAV = ['Event Details', 'Hotels', 'Event Store', 'Schedule', "Who's Playing", 'Bulletin Board'];

/** Dummy event header for preview — no theme toggle, generic content */
function PreviewEventHeader() {
  return (
    <div style={{ backgroundColor: 'var(--color-header-bg)', borderBottom: '1px solid var(--color-header-border)' }}>
      <div className="px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-[5px] overflow-hidden flex-shrink-0 flex items-center justify-center text-lg font-bold"
            style={{ border: '1px solid var(--color-header-border)', backgroundColor: 'var(--color-avatar-bg)', color: '#fff' }}
          >
            E
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-header-text)' }}>Sample Tournament 2026</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <MapPin size={13} style={{ color: 'var(--color-header-text-sub)' }} />
              <span className="text-xs" style={{ color: 'var(--color-header-text-sub)' }}>Example Arena, Anytown, USA</span>
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--color-header-text-sub)' }}>
          <Share2 size={18} />
          <span>Share</span>
        </span>
      </div>
      <div className="px-10 pb-4 flex items-center gap-2">
        {PREVIEW_NAV.map((item, i) => (
          <span
            key={item}
            className="inline-flex items-center px-3 py-2 text-sm rounded-[5px]"
            style={{
              backgroundColor: i === 0 ? 'var(--color-header-nav-active-bg)' : 'transparent',
              color: i === 0 ? 'var(--color-header-nav-active-text)' : 'var(--color-header-text)',
              fontWeight: i === 0 ? 500 : 400,
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Reads ?primary, ?secondary, ?mode from URL and applies generated theme */
function PreviewContent() {
  const [params, setParams] = useSearchParams();
  const primary = params.get('primary') || '#0731FA';
  const secondary = params.get('secondary') || undefined;
  const mode = (params.get('mode') || 'light') as 'light' | 'dark';

  const toggleMode = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setParams((prev) => {
      prev.set('mode', next);
      return prev;
    }, { replace: true });
  };

  useEffect(() => {
    const result = generateTheme({ primary, secondary });
    const vars = mode === 'dark' ? result.dark : result.light;
    applyTheme(vars);
    return () => { clearInlineTheme(); };
  }, [primary, secondary, mode]);

  return (
    <PreviewProvider>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-page-bg)' }}>
        <PreviewBanner primary={primary} secondary={secondary} mode={mode} onToggleMode={toggleMode} />
        <PreviewTopBar />
        <PreviewEventHeader />
        <div className="max-w-[1200px] mx-auto px-12">
          <EventBanner />
          <TabNavigation />
          <Routes>
            <Route path="/" element={<DetailsPage />} />
            <Route path="/divisions" element={<DivisionsPage />} />
          </Routes>
        </div>
      </div>
    </PreviewProvider>
  );
}

/** Shared layout with persistent header that animates between pages */
function MainLayout() {
  const location = useLocation();
  const [navPeek, setNavPeek] = useState(false);
  const [fullHeight, setFullHeight] = useState(0);
  const [navRowHeight, setNavRowHeight] = useState(0);
  const headerMeasureRef = useRef<HTMLDivElement>(null);
  const navRowRef = useRef<HTMLDivElement>(null);
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-apply brand theme on route change
  useEffect(() => {
    const saved = localStorage.getItem('brand-colors');
    if (saved) {
      const themeName = localStorage.getItem('theme') || 'dark';
      restoreBrandTheme(themeName);
    } else {
      clearInlineTheme();
    }
  }, [location.pathname]);

  // Measure EventHeader's natural full height + nav-row height. Both are
  // observed so font-load / resize / content changes stay accurate.
  useLayoutEffect(() => {
    const fullEl = headerMeasureRef.current;
    const navEl = navRowRef.current;
    if (!fullEl || !navEl) return;
    const updateFull = () => setFullHeight(fullEl.offsetHeight);
    const updateNav = () => setNavRowHeight(navEl.offsetHeight);
    updateFull();
    updateNav();
    const ro = new ResizeObserver(() => { updateFull(); updateNav(); });
    ro.observe(fullEl);
    ro.observe(navEl);
    return () => ro.disconnect();
  }, []);

  const isHotels = location.pathname === '/hotels';

  // Leaving /hotels should immediately clear peek so full-height transition
  // starts from the current peek offset, not a lingering hover state.
  useEffect(() => {
    if (!isHotels) {
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
      setNavPeek(false);
    }
  }, [isHotels]);

  // Clip-container height drives the whole drawer animation:
  //   /details         → fullHeight   (fully visible)
  //   /hotels + peek   → navRowHeight (just nav row)
  //   /hotels default  → 0            (hidden behind TopBar)
  // The EventHeader inside is bottom-anchored (flex + justify-end) so as the
  // container grows, content appears to slide DOWN from behind the TopBar.
  // Fall back to 'auto' until the first measurement lands so /details doesn't
  // render collapsed on initial load.
  const measured = fullHeight > 0;
  const drawerHeight: number | 'auto' = isHotels
    ? (navPeek ? navRowHeight : 0)
    : (measured ? fullHeight : 'auto');

  const handleEnter = useCallback(() => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    setNavPeek(true);
  }, []);

  const handleLeave = useCallback(() => {
    leaveTimeoutRef.current = setTimeout(() => setNavPeek(false), 200);
  }, []);

  return (
    // Single persistent shell for both routes: always h-screen flex column.
    // Header container and content container are siblings that never re-flow
    // during a route change — only their "size channel" (drawer height) and
    // "opacity channel" (page crossfade) animate, both on the exact same 350ms
    // cubic-bezier clock.
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--color-page-bg)', transition: 'background-color 0.3s ease' }}>
      {/* Header container — one element, animates its own height.
          On /hotels the drawer is positioned absolutely below the TopBar so the
          hover-peek overlays the hotels content below instead of pushing it
          down. On other routes the drawer stays in flow so the Details page
          sits naturally beneath the full-height header. The outer div keeps
          the hover handlers — absolute descendants still count as "inside"
          for React's onMouseEnter/Leave, so peek survives the cursor moving
          from the TopBar down onto the overlaid nav row. */}
      <div
        className="relative z-30 shrink-0"
        onMouseEnter={isHotels ? handleEnter : undefined}
        onMouseLeave={isHotels ? handleLeave : undefined}
      >
        <TopBar />

        {/* Sliding drawer. One element, one height value — navigating and
            hovering both animate the same `height`, so peek → full is a single
            continuous transition with no remount or state jump. Flex +
            justify-end anchors the EventHeader to the bottom edge, so the
            content slides down from behind the TopBar as height grows. */}
        <div
          style={{
            height: drawerHeight,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            transition: 'height 350ms cubic-bezier(0.25, 0.1, 0.25, 1)',
            backgroundColor: 'var(--color-header-bg)',
            ...(isHotels
              ? {
                  position: 'absolute' as const,
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 30,
                  // Soft shadow only when peek is visible, so overlaid nav
                  // reads as a layer above the hotels feed.
                  boxShadow: navPeek ? '0 8px 24px rgba(0, 0, 0, 0.25)' : 'none',
                  transition:
                    'height 350ms cubic-bezier(0.25, 0.1, 0.25, 1), box-shadow 250ms cubic-bezier(0.25, 0.1, 0.25, 1)',
                }
              : {}),
          }}
        >
          <div ref={headerMeasureRef}>
            <EventHeader hideEventInfo={false} navRowRef={navRowRef} />
          </div>
        </div>
      </div>

      {/* Content container — one persistent rectangle (flex-1, min-h-0, relative).
          Each route renders as an absolute inset-0 child, so exit + enter
          overlap in the same box without ever reflowing each other. There's
          nothing to stagger against the header; both containers just resize
          or fade inside the same shell. */}
      <div className="flex-1 min-h-0 relative">
        <AnimatePresence initial={false}>
          {isHotels ? (
            <motion.div
              key="hotels"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0 flex flex-col overflow-hidden"
            >
              <HotelsPage headerless />
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0 overflow-y-auto"
            >
              <div className="max-w-[1200px] mx-auto px-12">
                <EventBanner />
                <TabNavigation />
                <Routes>
                  <Route path="/" element={<DetailsPage />} />
                  <Route path="/divisions" element={<DivisionsPage />} />
                  <Route path="/rules" element={<DetailsPage />} />
                  <Route path="/payment" element={<DetailsPage />} />
                  <Route path="/accommodations" element={<DetailsPage />} />
                  <Route path="/sponsors" element={<DetailsPage />} />
                </Routes>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <FloatingToolbar />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/playground" element={<ThemePlayground />} />
          <Route path="/dec-preview" element={<DecPreview />} />
          <Route path="/preview/*" element={<PreviewContent />} />
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
