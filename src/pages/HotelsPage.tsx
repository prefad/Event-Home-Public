import { useState, useMemo, useEffect, useRef } from "react";
import FloatingToolbar from "../components/FloatingToolbar";
import { hotels } from "./hotels/hotel-data";
import {
  MapPin,
  ChevronDown,
  ArrowRight,
  DollarSign,
  Waves,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HotelCard } from "./hotels/hotel-card";
import { MapPanel } from "./hotels/map-panel";
import { FilterBar } from "./hotels/filter-bar";
import { AiChat } from "./hotels/ai-chat";
import Vector from "./hotels/Vector";
import TopBar from "../components/TopBar";
import EventHeader from "../components/EventHeader";

const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Guest Rating" },
  { value: "distance", label: "Distance to Venue" },
];

export default function HotelsPage({ headerless = false }: { headerless?: boolean } = {}) {
  const [activeHotelId, setActiveHotelId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [sortBy, setSortBy] = useState("recommended");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([100, 500]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSort, setShowSort] = useState(false);
  const [chatOverlayOpen, setChatOverlayOpen] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        document.documentElement.style.setProperty(
          "--header-height",
          `${headerRef.current.offsetHeight}px`
        );
      }
    };
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  const handleFilterToggle = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const handleClearFilters = () => {
    setActiveFilters([]);
    setPriceRange([100, 500]);
    setSearchQuery("");
    setMaxDistance(null);
  };

  const filteredHotels = useMemo(() => {
    let result = [...hotels];

    // Search filter
    if (searchQuery) {
      result = result.filter((h) =>
        h.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Amenity filters
    if (activeFilters.length > 0) {
      result = result.filter((h) =>
        activeFilters.every((f) => h.amenities.includes(f))
      );
    }

    // Price filter
    result = result.filter(
      (h) => h.price >= priceRange[0] && h.price <= priceRange[1]
    );

    // Distance filter
    if (maxDistance !== null) {
      result = result.filter((h) => parseFloat(h.distance) <= maxDistance);
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.guestRating - a.guestRating);
        break;
      case "distance":
        result.sort(
          (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
        );
        break;
      default:
        // Recommended: host hotel first, then by rating
        result.sort((a, b) => {
          if (a.isHostHotel) return -1;
          if (b.isHostHotel) return 1;
          return b.guestRating - a.guestRating;
        });
    }

    return result;
  }, [searchQuery, activeFilters, priceRange, sortBy, maxDistance]);

  // Hotels filtered by active suggestion (for map pins when suggestion strip is open)
  const suggestionFilteredHotels = useMemo(() => {
    if (!activeSuggestion) return filteredHotels;
    const all = [...hotels];
    switch (activeSuggestion) {
      case "Hotels with pools under $200":
        return all.filter((h) => h.amenities.includes("pool") && h.price <= 200);
      case "Closest hotels to the venue":
        return [...all].sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)).slice(0, 3);
      case "Top rated by guests":
        return all.filter((h) => h.guestRating >= 4.5).sort((a, b) => b.guestRating - a.guestRating);
      case "Best value for my group":
        return [...all].sort((a, b) => a.price - b.price).slice(0, 3);
      default:
        return filteredHotels;
    }
  }, [activeSuggestion, filteredHotels]);

  // Compute dynamic counts for suggestion pills
  const poolUnder200Count = useMemo(() => hotels.filter((h) => h.amenities.includes("pool") && h.price <= 200).length, []);
  const topRatedCount = useMemo(() => hotels.filter((h) => h.guestRating >= 4.5).length, []);

  const SUGGESTION_PILLS = [
    {
      icon: MapPin,
      label: "Closest hotels to the venue",
      subtitle: "Walk or short drive",
      gradient: "from-orange-500 to-rose-500",
      bgHover: "hover:bg-orange-50",
      iconBg: "bg-orange-500 text-white",
    },
    {
      icon: Star,
      label: "Top rated by guests",
      subtitle: `${topRatedCount} highly rated`,
      gradient: "from-amber-500 to-yellow-500",
      bgHover: "hover:bg-amber-50",
      iconBg: "bg-amber-500 text-white",
    },
    {
      icon: DollarSign,
      label: "Best value for my group",
      subtitle: "Top 3 lowest rates",
      gradient: "from-emerald-500 to-teal-500",
      bgHover: "hover:bg-emerald-50",
      iconBg: "bg-emerald-500 text-white",
    },
    {
      icon: Waves,
      label: "Hotels with pools under $200",
      subtitle: `${poolUnder200Count} option${poolUnder200Count !== 1 ? "s" : ""} available`,
      gradient: "from-cyan-500 to-blue-500",
      bgHover: "hover:bg-cyan-50",
      iconBg: "bg-cyan-500 text-white",
    },
  ];

  const handleSuggestionClick = (label: string) => {
    // Toggle: clicking the same pill again closes the strip
    if (activeSuggestion === label) {
      setActiveSuggestion(null);
    } else {
      setActiveSuggestion(label);
      // Close chat overlay so the map + hotel strip become visible
      if (chatOverlayOpen) {
        setChatOverlayOpen(false);
      }
    }
  };

  const handleChatOverlayChange = (open: boolean) => {
    setChatOverlayOpen(open);
  };

  return (
    <>
      <style>{`
        .hotels-feed button.border,
        .hotels-feed button[class*="border-gray"],
        .hotels-feed button[class*="border-brand"] {
          border-style: solid;
        }
      `}</style>
      <div className={`hotels-page flex flex-col font-['Cera_Pro','Inter',sans-serif] overflow-hidden ${headerless ? 'flex-1 min-h-0' : 'h-screen'}`} style={{ backgroundColor: 'var(--color-page-bg)' }}>
        {!headerless && (
          <div ref={headerRef}>
            <TopBar />
            <EventHeader hideEventInfo />
          </div>
        )}

      {/* Main content */}
      <div className="hotels-feed flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Toolbar */}
        <div className="sticky top-0 z-20 md:static px-3 sm:px-5 pt-3 pb-3 md:pt-5 md:pb-5 border-b md:border-b-0" style={{ backgroundColor: 'var(--color-page-bg)', borderColor: 'var(--color-divider)' }}>

          <FilterBar
            sortBy={sortBy}
            onSortChange={setSortBy}
            activeFilters={activeFilters}
            onFilterToggle={handleFilterToggle}
            onClearFilters={handleClearFilters}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeToggle={() => setViewMode(viewMode === "list" ? "map" : "list")}
            maxDistance={maxDistance}
            onMaxDistanceChange={setMaxDistance}
          />
        </div>

        {/* Content area */}
        <div className="flex-1 flex md:overflow-hidden pr-0 md:pr-5 pb-0 md:pb-5 relative" style={{ backgroundColor: 'var(--color-page-bg)' }}>
          {/* Hotel list — on mobile: only in list mode; on desktop: always visible as sidebar */}
          <motion.div
            layout
            className={`md:overflow-y-auto relative rounded-[10px] ${
              viewMode === "map"
                ? "hidden md:block md:w-[640px] md:min-w-[640px]"
                : "w-full md:w-[640px] md:min-w-[640px]"
            }`}
          >
            {/* Kayak-style sort/results bar */}
            <div className="sticky top-0 z-10 px-4 pt-[calc(0.625rem+0.125rem)] pb-3.5 flex items-center justify-between" style={{ backgroundColor: 'var(--color-page-bg)' }}>
              <span className="text-sm" style={{ color: 'var(--color-text-heading)' }}>
                {filteredHotels.length} results
              </span>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setShowSort(!showSort)}
                    className="flex items-center gap-1.5 text-sm transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <span className="hidden sm:inline">Sort by{" "}</span>
                    <span style={{ color: 'var(--color-text-heading)' }}>
                      {sortOptions.find((s) => s.value === sortBy)?.label}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSort ? "rotate-180" : ""}`} style={{ color: 'var(--color-text-heading)' }} />
                  </button>
                  <AnimatePresence>
                    {showSort && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowSort(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute top-full mt-1 right-0 rounded-xl shadow-xl border py-1 z-40 min-w-[200px]"
                          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-divider)' }}
                        >
                          {sortOptions.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => {
                                setSortBy(opt.value);
                                setShowSort(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs transition-colors"
                              style={sortBy === opt.value
                                ? { color: 'var(--color-action)', backgroundColor: 'var(--color-icon-bg)' }
                                : { color: 'var(--color-text-primary)' }
                              }
                              onMouseEnter={(e) => { if (sortBy !== opt.value) (e.currentTarget.style.backgroundColor = 'var(--color-page-bg)'); }}
                              onMouseLeave={(e) => { if (sortBy !== opt.value) (e.currentTarget.style.backgroundColor = ''); }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="px-4 pt-0 pb-4 flex flex-col gap-3">
              {filteredHotels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16" style={{ color: 'var(--color-text-secondary)' }}>
                  <MapPin className="w-10 h-10 mb-3" style={{ color: 'var(--color-divider)' }} />
                  <p className="text-sm">No hotels match your filters</p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-2 text-xs text-brand hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                filteredHotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    isActive={activeHotelId === hotel.id}
                    onHover={() => setActiveHotelId(hotel.id)}
                    onLeave={() => setActiveHotelId(null)}
                    onClick={() => setActiveHotelId(hotel.id)}
                  />
                ))
              )}
            </div>
            {/* Spacer for mobile floating chat bar */}
            <div className="h-20 md:hidden" />
          </motion.div>

          {/* Map panel — on mobile: only in map mode; on desktop: always visible */}
          <motion.div
            layout
            className={`flex-1 flex flex-col relative overflow-hidden rounded-r-xl ${
              viewMode === "map" ? "block" : "hidden md:flex"
            }`}
          >
            {/* AI Suggestion pills above map — hidden when chat overlay is open */}
            {/* Map area — hidden when chat overlay is open */}
            {!chatOverlayOpen && (
              <div className="flex-1 relative overflow-hidden rounded-tr-xl">
                <MapPanel
                  hotels={activeSuggestion ? suggestionFilteredHotels : filteredHotels}
                  activeHotelId={activeHotelId}
                  onHotelHover={(id) => setActiveHotelId(id)}
                  onHotelLeave={() => setActiveHotelId(null)}
                  overlayOpen={chatOverlayOpen || !!activeSuggestion}
                />

                {/* Top finds / Results + Chat input inside map */}
                <div className="absolute bottom-4 left-4 right-4 z-[60] hidden md:block">
                  <AnimatePresence mode="wait">
                    {activeSuggestion && !chatOverlayOpen ? (
                      <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-2xl px-3 py-2 mb-1"
                        style={{ backgroundColor: 'var(--color-input-bg)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--color-input-border)' }}
                      >
                        {/* Results header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {(() => {
                              const pill = SUGGESTION_PILLS.find((p) => p.label === activeSuggestion);
                              const SuggIcon = pill?.icon;
                              return SuggIcon ? <SuggIcon className="w-3.5 h-3.5" style={{ color: 'var(--color-text-heading)' }} /> : null;
                            })()}
                            <span className="text-sm whitespace-nowrap" style={{ color: 'var(--color-text-heading)' }}>{activeSuggestion}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-chip-bg)' }}>
                              {suggestionFilteredHotels.length} result{suggestionFilteredHotels.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <button
                            onClick={() => setActiveSuggestion(null)}
                            className="w-6 h-6 flex items-center justify-center rounded-full transition-colors"
                            style={{ color: 'var(--color-text-secondary)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-chip-bg)'; e.currentTarget.style.color = 'var(--color-text-heading)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {/* Horizontal scrollable hotel cards */}
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                          {suggestionFilteredHotels.map((hotel) => (
                            <div
                              key={hotel.id}
                              className="w-[180px] min-w-[180px] rounded-xl border overflow-hidden transition-all cursor-pointer group"
                              style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-action)'; setActiveHotelId(hotel.id); }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-card-border)'; setActiveHotelId(null); }}
                            >
                              <div className="relative h-[100px] overflow-hidden">
                                <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                {hotel.badges.length > 0 && (
                                  <span className="absolute top-1.5 left-1.5 text-[9px] px-1.5 py-0.5 rounded-full backdrop-blur-sm" style={{ backgroundColor: 'var(--color-chip-bg)', color: 'var(--color-text-heading)' }}>
                                    {hotel.badges[0]}
                                  </span>
                                )}
                              </div>
                              <div className="p-2">
                                <p className="text-[11px] truncate" style={{ color: 'var(--color-text-heading)' }}>{hotel.name}</p>
                                <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-heading)' }}>
                                  ${hotel.price}<span className="text-[9px]" style={{ color: 'var(--color-text-secondary)' }}>/night</span>
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                  <MapPin className="w-2.5 h-2.5" style={{ color: 'var(--color-text-secondary)' }} />
                                  <span className="text-[9px]" style={{ color: 'var(--color-text-secondary)' }}>{hotel.distance}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="pills"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-2xl px-3 py-2 mb-1"
                        style={{ backgroundColor: 'var(--color-input-bg)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--color-input-border)' }}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-text-heading)' }} />
                          <span className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--color-text-heading)' }}>Top finds</span>
                        </div>
                        <div className="flex gap-2 flex-1 min-w-0 overflow-x-auto scrollbar-hide">
                          {SUGGESTION_PILLS.map((pill) => {
                            const Icon = pill.icon;
                            const isActive = activeSuggestion === pill.label;
                            return (
                              <button
                                key={pill.label}
                                onClick={() => handleSuggestionClick(pill.label)}
                                className={`group/pill flex items-center gap-2.5 pl-2 pr-11 py-2 rounded-xl border transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
                                  isActive
                                    ? "shadow-sm"
                                    : "hover:shadow-md"
                                }`}
                                style={{
                                  backgroundColor: isActive ? 'var(--color-card-bg)' : 'var(--color-chip-bg)',
                                  borderColor: isActive ? 'var(--color-action)' : 'var(--color-card-border)',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isActive) {
                                    e.currentTarget.style.borderColor = 'var(--color-action)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isActive) {
                                    e.currentTarget.style.borderColor = 'var(--color-card-border)';
                                  }
                                }}
                              >
                                <div className={`w-8 h-8 min-w-8 min-h-8 rounded-lg flex items-center justify-center transition-colors ${
                                  isActive ? "" : pill.iconBg
                                }`}
                                  style={isActive ? { backgroundColor: 'var(--color-action)', color: 'var(--color-action-text)' } : undefined}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                  <p className="text-[12px] transition-colors" style={{ color: isActive ? 'var(--color-action)' : 'var(--color-text-heading)' }}>
                                    {pill.label}
                                  </p>
                                  <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{pill.subtitle}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AiChat overlayOpen={chatOverlayOpen} onOverlayChange={handleChatOverlayChange} />
                </div>
              </div>
            )}

            {/* Desktop AI chat — when overlay open, takes flex-1 to fill map area */}
            {chatOverlayOpen && (
              <div className="hidden md:flex flex-col flex-1 min-h-0">
                <AiChat overlayOpen={chatOverlayOpen} onOverlayChange={handleChatOverlayChange} />
              </div>
            )}
          </motion.div>
        </div>

        {/* Mobile floating chat bar */}
        <div className="md:hidden">
          <AiChat variant="mobile-float" overlayOpen={chatOverlayOpen} onOverlayChange={handleChatOverlayChange} />
        </div>
      </div>
    </div>
    {!headerless && <FloatingToolbar />}
    </>
  );
}