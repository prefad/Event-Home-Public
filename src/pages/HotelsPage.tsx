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
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HotelCard } from "./hotels/hotel-card";
import { MapPanel } from "./hotels/map-panel";
import { FilterBar } from "./hotels/filter-bar";
import { AiChat } from "./hotels/ai-chat";
import { HotelStrip } from "./hotels/hotel-strip";
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

export default function HotelsPage() {
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
      icon: Waves,
      label: "Hotels with pools under $200",
      subtitle: `${poolUnder200Count} option${poolUnder200Count !== 1 ? "s" : ""} available`,
      gradient: "from-cyan-500 to-blue-500",
      bgHover: "hover:bg-cyan-50",
      iconBg: "bg-cyan-500 text-white",
    },
    {
      icon: DollarSign,
      label: "Best value for my group",
      subtitle: "Top 3 lowest rates",
      gradient: "from-emerald-500 to-teal-500",
      bgHover: "hover:bg-emerald-50",
      iconBg: "bg-emerald-500 text-white",
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
      <div className="hotels-page h-screen flex flex-col font-['Cera_Pro','Inter',sans-serif] overflow-hidden" style={{ backgroundColor: 'var(--color-page-bg)' }}>
        <div ref={headerRef}>
          <TopBar />
          <EventHeader />
        </div>

      {/* Main content */}
      <div className="hotels-feed flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Toolbar */}
        <div className="sticky top-[var(--header-height,120px)] z-20 md:static px-3 sm:px-5 pt-5 pb-2 border-b md:border-b-0" style={{ backgroundColor: 'var(--color-page-bg)', borderColor: 'var(--color-divider)' }}>
          {activeFilters.length > 0 && (
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-icon-bg)' }}>
                  {activeFilters.length} filter{activeFilters.length > 1 ? "s" : ""} active
                </span>
              </div>
            </div>
          )}

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
            className={`md:overflow-y-auto relative ${
              viewMode === "map"
                ? "hidden md:block md:w-[640px] md:min-w-[640px]"
                : "w-full md:w-[640px] md:min-w-[640px]"
            }`}
          >
            {/* Kayak-style sort/results bar */}
            <div className="sticky top-0 z-10 px-4 pt-[calc(0.625rem+0.5rem)] pb-2.5 flex items-center justify-between" style={{ backgroundColor: 'var(--color-page-bg)' }}>
              <button
                onClick={() => setChatOverlayOpen(true)}
                className="flex items-center gap-1.5 text-sm hover:text-brand transition-colors cursor-pointer"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <div className="w-[15px] h-[17px] shrink-0">
                  <Vector />
                </div>
                <span className="sm:hidden">Booking Assistant</span>
                <span className="hidden sm:inline">Chat with Booking Assistant</span>
                <ArrowRight className="w-3.5 h-3.5 hidden sm:block" />
              </button>
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: 'var(--color-text-heading)' }}>
                  {filteredHotels.length} results
                </span>
                <span style={{ color: 'var(--color-divider)' }}>|</span>
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

            <div className="p-4 flex flex-col gap-3">
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
            {!chatOverlayOpen && (
            <div className="hidden md:flex items-center gap-2 px-4 pt-1 pb-2 shrink-0">
              <div className="flex items-center gap-1.5 mr-1">
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-text-heading)' }} />
                <span className="text-sm whitespace-nowrap" style={{ color: 'var(--color-text-heading)' }}>Top finds</span>
              </div>
              <div className="flex gap-2 flex-1 min-w-0">
                {SUGGESTION_PILLS.map((pill) => {
                  const Icon = pill.icon;
                  const isActive = activeSuggestion === pill.label;
                  return (
                    <button
                      key={pill.label}
                      onClick={() => handleSuggestionClick(pill.label)}
                      className={`group/pill flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-xl border transition-all duration-200 whitespace-nowrap flex-1 min-w-0 cursor-pointer ${
                        isActive
                          ? "bg-brand-light border-brand/20 shadow-sm shadow-brand/10"
                          : "hover:shadow-md"
                      }`}
                      style={!isActive ? { backgroundColor: 'var(--color-chip-bg)', borderColor: 'var(--color-chip-border)' } : undefined}
                    >
                      <div className={`w-8 h-8 min-w-8 min-h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isActive ? "bg-brand/10 text-brand" : pill.iconBg
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className={`text-[12px] transition-colors ${
                          isActive ? "text-brand" : ""
                        }`}
                        style={!isActive ? { color: 'var(--color-text-primary)' } : undefined}>
                          {pill.label}
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{pill.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            )}

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

                {/* Hotel strip overlay for suggestion pills */}
                <HotelStrip
                  hotels={suggestionFilteredHotels}
                  label={activeSuggestion || ""}
                  icon={SUGGESTION_PILLS.find((p) => p.label === activeSuggestion)?.icon}
                  isOpen={!!activeSuggestion && !chatOverlayOpen}
                  onClose={() => setActiveSuggestion(null)}
                  onHotelHover={(id) => setActiveHotelId(id)}
                  onHotelLeave={() => setActiveHotelId(null)}
                />
              </div>
            )}

            {/* Desktop AI chat — when overlay open, takes flex-1 to fill map area */}
            <div className={`hidden md:flex flex-col shrink-0 ${chatOverlayOpen ? "flex-1 min-h-0" : ""}`}>
              <AiChat overlayOpen={chatOverlayOpen} onOverlayChange={handleChatOverlayChange} />
            </div>
          </motion.div>
        </div>

        {/* Mobile floating chat bar */}
        <div className="md:hidden">
          <AiChat variant="mobile-float" overlayOpen={chatOverlayOpen} onOverlayChange={handleChatOverlayChange} />
        </div>
      </div>
    </div>
    <FloatingToolbar />
    </>
  );
}