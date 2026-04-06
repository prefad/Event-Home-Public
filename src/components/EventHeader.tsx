import { Share2, MapPin } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const NAV_ITEMS = [
  { label: 'Event Details', path: '/' },
  { label: 'Hotels', path: '/hotels' },
  { label: 'Event Store', path: null },
  { label: 'Schedule & Standings', path: null },
  { label: "Who's Playing", path: null },
  { label: 'Bulletin Board', path: null },
];

export default function EventHeader({ hideEventInfo }: { hideEventInfo?: boolean } = {}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-detect from route if not explicitly provided
  const shouldHideEventInfo = hideEventInfo ?? location.pathname === '/hotels';

  return (
    <div style={{ backgroundColor: 'var(--color-header-bg)' }}>
      {/* Event Info Row — animated collapse/expand */}
      <AnimatePresence initial={false}>
        {!shouldHideEventInfo && (
          <motion.div
            key="event-info"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
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
                <button className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--color-header-text-sub)' }}>
                  <Share2 size={18} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Tabs */}
      <div className="px-10 py-4 flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.path === '/hotels'
            ? location.pathname === '/hotels'
            : item.path === '/'
            ? location.pathname === '/' || (!location.pathname.startsWith('/hotels') && !location.pathname.startsWith('/playground') && !location.pathname.startsWith('/preview'))
            : false;
          return (
            <button
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              className="inline-flex items-center px-3 py-2 text-sm rounded-[5px] transition-colors"
              style={{
                backgroundColor: isActive ? 'var(--color-header-nav-active-bg)' : 'transparent',
                color: isActive ? 'var(--color-header-nav-active-text)' : 'var(--color-header-text)',
                fontWeight: isActive ? 500 : 400,
                cursor: item.path ? 'pointer' : 'default',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-header-nav-hover)'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {item.label}
            </button>
          );
        })}
        </div>
        {/* Share button — animated in/out with nav row */}
        <AnimatePresence initial={false}>
          {shouldHideEventInfo && (
            <motion.button
              key="share-btn"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="inline-flex items-center gap-2 text-sm"
              style={{ color: 'var(--color-header-text-sub)' }}
            >
              <Share2 size={18} />
              <span>Share</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
