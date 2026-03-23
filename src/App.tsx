import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams, useLocation, Link } from 'react-router-dom';
import { ChevronDown, Share2, MapPin, Sun, Moon } from 'lucide-react';
import { ThemeProvider } from './ThemeContext';
import { generateTheme, applyTheme, clearInlineTheme } from './utils/generateTheme';
import TopBar from './components/TopBar';
import EventHeader from './components/EventHeader';
import EventBanner from './components/EventBanner';
import TabNavigation from './components/TabNavigation';
import FloatingToolbar from './components/FloatingToolbar';
import DetailsPage from './pages/DetailsPage';
import DivisionsPage from './pages/DivisionsPage';
import ThemePlayground from './pages/ThemePlayground';
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

function AppContent() {
  const location = useLocation();

  // Clear any leftover inline theme vars when entering the main portal
  useEffect(() => {
    clearInlineTheme();
  }, [location.pathname]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-page-bg)', transition: 'background-color 0.3s ease' }}>
      <TopBar />
      <EventHeader />
      <div
        className="max-w-[1200px] mx-auto px-12"
        style={{ transition: 'background-color 0.3s ease' }}
      >
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
          <Route path="/preview/*" element={<PreviewContent />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
