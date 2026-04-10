import { useState, useMemo, useEffect, useRef } from "react";
import FloatingToolbar from "../components/FloatingToolbar";
import { hotels, Hotel } from "./hotels/hotel-data";
import {
  MapPin,
  ChevronDown,
  ArrowRight,
  DollarSign,
  Waves,
  Sparkles,
  Star,
  X,
  Car,
  Coffee,
  Wifi,
  CircleParking,
  Clock,
  Navigation,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HotelCard } from "./hotels/hotel-card";
import { MapPanel } from "./hotels/map-panel";
import { FilterBar } from "./hotels/filter-bar";
import { AiChat } from "./hotels/ai-chat";
import Vector from "./hotels/Vector";
import Vector16 from "./hotels/Vector-16-985";
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
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
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
      activeColor: "#f97316",
    },
    {
      icon: Star,
      label: "Top rated by guests",
      subtitle: `${topRatedCount} highly rated`,
      gradient: "from-amber-500 to-yellow-500",
      bgHover: "hover:bg-amber-50",
      iconBg: "bg-amber-500 text-white",
      activeColor: "#f59e0b",
    },
    {
      icon: DollarSign,
      label: "Best value for my group",
      subtitle: "Top 3 lowest rates",
      gradient: "from-emerald-500 to-teal-500",
      bgHover: "hover:bg-emerald-50",
      iconBg: "bg-emerald-500 text-white",
      activeColor: "#10b981",
    },
    {
      icon: Waves,
      label: "Hotels with pools under $200",
      subtitle: `${poolUnder200Count} option${poolUnder200Count !== 1 ? "s" : ""} available`,
      gradient: "from-cyan-500 to-blue-500",
      bgHover: "hover:bg-cyan-50",
      iconBg: "bg-cyan-500 text-white",
      activeColor: "#06b6d4",
    },
  ];

  const handleSuggestionClick = (label: string) => {
    // Switch to new suggestion (don't toggle off — only Clear closes)
    setActiveSuggestion(label);
    setSelectedHotelId(null);
    if (chatOverlayOpen) {
      setChatOverlayOpen(false);
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
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`relative rounded-[10px] ${activeSuggestion ? 'flex flex-col overflow-hidden' : 'md:overflow-y-auto'} ${
              viewMode === "map"
                ? "hidden md:block md:w-[640px] md:min-w-[640px]"
                : "w-full md:w-[640px] md:min-w-[640px]"
            }`}
          >
            {/* Kayak-style sort/results bar — hidden when suggestion expanded */}
            {!activeSuggestion && (
            <div className="sticky top-0 z-10 px-4 pt-2 pb-3.5 flex items-center justify-between" style={{ backgroundColor: 'var(--color-page-bg)' }}>
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
            )}

            <div className={`px-4 pt-0 flex flex-col ${activeSuggestion ? 'flex-1 min-h-0 pb-0' : 'pb-4 gap-3'}`}>
              {/* Top finds pills */}
              <div
                className={`px-3 py-2.5 flex flex-col ${activeSuggestion ? 'flex-1 min-h-0 overflow-hidden rounded-t-[10px]' : 'rounded-[10px]'}`}
                style={{ backgroundColor: 'var(--color-card-bg)' }}
              >
                <div className="flex gap-2 min-w-0 overflow-x-auto scrollbar-hide shrink-0">
                  {SUGGESTION_PILLS.map((pill) => {
                    const Icon = pill.icon;
                    const isActive = activeSuggestion === pill.label;
                    return (
                      <button
                        key={pill.label}
                        onClick={() => handleSuggestionClick(pill.label)}
                        className={`group/pill w-[220px] min-w-[220px] flex items-center gap-2.5 pl-2 pr-3 py-2 rounded-xl border transition-all duration-200 shrink-0 cursor-pointer ${
                          isActive
                            ? "shadow-sm"
                            : "hover:shadow-md"
                        }`}
                        style={{
                          backgroundColor: isActive ? 'var(--color-card-bg)' : 'var(--color-chip-bg)',
                          borderColor: isActive ? pill.activeColor : 'var(--color-card-border)',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.borderColor = pill.activeColor;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.borderColor = 'var(--color-card-border)';
                          }
                        }}
                      >
                        <div className={`w-7 h-7 min-w-7 min-h-7 rounded-lg flex items-center justify-center transition-colors ${pill.iconBg}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left">
                          <p className="text-[11px] transition-colors" style={{ color: isActive ? pill.activeColor : 'var(--color-text-heading)' }}>
                            {pill.label}
                          </p>
                          <p className="text-[9px]" style={{ color: 'var(--color-text-secondary)' }}>{pill.subtitle}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Inline results when a suggestion is active */}
                <AnimatePresence>
                  {activeSuggestion && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden flex-1 min-h-0"
                    >
                      <div className="pt-3 overflow-y-auto max-h-full scrollbar-hide">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            {(() => {
                              const pill = SUGGESTION_PILLS.find((p) => p.label === activeSuggestion);
                              const SuggIcon = pill?.icon;
                              return SuggIcon ? <SuggIcon className="w-3.5 h-3.5 shrink-0" style={{ color: pill?.activeColor }} /> : null;
                            })()}
                            <span className="text-[13px] font-medium" style={{ color: 'var(--color-text-heading)' }}>{activeSuggestion}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-chip-bg)' }}>{suggestionFilteredHotels.length}</span>
                          </div>
                          <button
                            onClick={() => setActiveSuggestion(null)}
                            className="text-[11px] px-2.5 py-0.5 rounded-full border transition-colors"
                            style={{ color: 'var(--color-text-secondary)', borderColor: 'var(--color-card-border)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-heading)'; e.currentTarget.style.borderColor = 'var(--color-text-secondary)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.borderColor = 'var(--color-card-border)'; }}
                          >
                            Clear
                          </button>
                        </div>
                        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
                          {suggestionFilteredHotels.map((hotel) => {
                            const ratingLabel = hotel.guestRating >= 9 ? "Exceptional" : hotel.guestRating >= 8.5 ? "Excellent" : hotel.guestRating >= 8 ? "Very Good" : "Good";
                            return (
                              <div
                                key={hotel.id}
                                className="w-[200px] min-w-[200px] rounded-xl border overflow-hidden transition-all cursor-pointer group"
                                style={{
                                  backgroundColor: 'var(--color-chip-bg)',
                                  borderColor: selectedHotelId === hotel.id ? 'var(--color-action)' : 'var(--color-card-border)',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-action)'; setActiveHotelId(hotel.id); }}
                                onMouseLeave={(e) => { if (selectedHotelId !== hotel.id) e.currentTarget.style.borderColor = 'var(--color-card-border)'; setActiveHotelId(null); }}
                                onClick={() => setSelectedHotelId(selectedHotelId === hotel.id ? null : hotel.id)}
                              >
                                <div className="relative h-[90px] overflow-hidden">
                                  <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                  {hotel.badges.length > 0 && (
                                    <span className="absolute top-1.5 left-1.5 text-[8px] px-1.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm font-medium">
                                      {hotel.badges[0]}
                                    </span>
                                  )}
                                  <div className="absolute bottom-1.5 left-2 right-2 flex items-end justify-between">
                                    <span className="text-[13px] font-semibold text-white drop-shadow-sm">${hotel.price}<span className="text-[9px] font-normal text-white/70">/night</span></span>
                                    {hotel.originalPrice && (
                                      <span className="text-[9px] text-white/50 line-through">${hotel.originalPrice}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="p-2">
                                  <p className="text-[11px] font-medium truncate" style={{ color: 'var(--color-text-heading)' }}>{hotel.name}</p>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-[9px] px-1 py-0.5 rounded font-medium bg-emerald-500/15 text-emerald-400">{hotel.guestRating}</span>
                                    <span className="text-[9px]" style={{ color: 'var(--color-text-secondary)' }}>{ratingLabel}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1.5 text-[9px]" style={{ color: 'var(--color-text-secondary)' }}>
                                    <span className="flex items-center gap-0.5">
                                      <MapPin className="w-2.5 h-2.5 text-orange-400" />
                                      {hotel.distance}
                                    </span>
                                    <span className="flex items-center gap-0.5">
                                      <Car className="w-2.5 h-2.5" />
                                      {hotel.driveTime}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* AI assistant response */}
                        <div className="flex gap-2 mt-3">
                          <div className="w-5 h-5 shrink-0 mt-0.5 text-brand">
                            <Vector16 />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--color-chip-bg)' }}>
                              {activeSuggestion === "Closest hotels to the venue" && (
                                <>
                                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                                    Here are the <strong style={{ color: 'var(--color-text-heading)' }}>3 closest hotels</strong> to the venue. Quality Suites is walkable at just 0.5 mi — no car needed on game days.
                                  </p>
                                  <table className="w-full mt-2 text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                                    <thead>
                                      <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
                                        <th className="text-left pb-1 font-medium" style={{ color: 'var(--color-text-heading)' }}>Hotel</th>
                                        <th className="text-right pb-1 font-medium" style={{ color: 'var(--color-text-heading)' }}>Distance</th>
                                        <th className="text-right pb-1 font-medium" style={{ color: 'var(--color-text-heading)' }}>Drive</th>
                                        <th className="text-right pb-1 font-medium" style={{ color: 'var(--color-text-heading)' }}>Price</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {suggestionFilteredHotels.map((h) => (
                                        <tr key={h.id} style={{ borderBottom: '1px solid var(--color-divider)' }}>
                                          <td className="py-1.5 truncate max-w-[120px]">{h.name}</td>
                                          <td className="py-1.5 text-right">{h.distance}</td>
                                          <td className="py-1.5 text-right">{h.driveTime}</td>
                                          <td className="py-1.5 text-right font-medium" style={{ color: 'var(--color-text-heading)' }}>${h.price}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  <p className="text-[10px] mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                                    Tip: Quality Suites is the best pick for walkability. Holiday Inn is the best all-rounder with breakfast and pool included.
                                  </p>
                                </>
                              )}
                              {activeSuggestion === "Top rated by guests" && (
                                <>
                                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                                    These hotels all scored <strong style={{ color: 'var(--color-text-heading)' }}>8.5+ guest ratings</strong>. The Waterfront Hotel & Spa leads with a 9.4 — guests love the spa and waterfront views.
                                  </p>
                                  <p className="text-[10px] mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                                    For the best value among top-rated options, Holiday Inn Express offers a 9.2 rating at $235/night with all amenities included.
                                  </p>
                                </>
                              )}
                              {activeSuggestion === "Best value for my group" && (
                                <>
                                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                                    Here are the <strong style={{ color: 'var(--color-text-heading)' }}>3 lowest group rates</strong> locked in for the tournament. The Lambton Inn at $140/night is the standout — it's the host hotel with dedicated check-in and dining discounts.
                                  </p>
                                  <table className="w-full mt-2 text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                                    <thead>
                                      <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
                                        <th className="text-left pb-1 font-medium" style={{ color: 'var(--color-text-heading)' }}>Hotel</th>
                                        <th className="text-right pb-1 font-medium" style={{ color: 'var(--color-text-heading)' }}>Rate</th>
                                        <th className="text-right pb-1 font-medium" style={{ color: 'var(--color-text-heading)' }}>Rating</th>
                                        <th className="text-right pb-1 font-medium" style={{ color: 'var(--color-text-heading)' }}>Perks</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {suggestionFilteredHotels.map((h) => (
                                        <tr key={h.id} style={{ borderBottom: '1px solid var(--color-divider)' }}>
                                          <td className="py-1.5 truncate max-w-[120px]">{h.name}</td>
                                          <td className="py-1.5 text-right font-medium" style={{ color: 'var(--color-text-heading)' }}>${h.price}</td>
                                          <td className="py-1.5 text-right">{h.guestRating}</td>
                                          <td className="py-1.5 text-right">{h.amenities.length} included</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </>
                              )}
                              {activeSuggestion === "Hotels with pools under $200" && (
                                <>
                                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                                    {suggestionFilteredHotels.length === 0
                                      ? "No hotels with pools under $200 are currently available."
                                      : <>Found <strong style={{ color: 'var(--color-text-heading)' }}>{suggestionFilteredHotels.length} hotel{suggestionFilteredHotels.length !== 1 ? 's' : ''} with pools under $200</strong>. Great for families who want the kids to burn off energy after games.</>
                                    }
                                  </p>
                                  <p className="text-[10px] mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                                    Both options include free WiFi. The Lambton Inn is the host hotel with extra tournament perks.
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Chat input inside Top Finds */}
                <div className="mt-auto shrink-0 pt-2 rounded-b-[10px] overflow-hidden">
                  <AiChat overlayOpen={chatOverlayOpen} onOverlayChange={handleChatOverlayChange} />
                </div>
              </div>

              {activeSuggestion ? null : filteredHotels.length === 0 ? (
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
                    onClick={() => setSelectedHotelId(selectedHotelId === hotel.id ? null : hotel.id)}
                  />
                ))
              )}
            </div>
            {/* Spacer for mobile floating chat bar */}
            {!activeSuggestion && <div className="h-20 md:hidden" />}
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
                  selectedHotelId={selectedHotelId}
                  onHotelSelect={(hotel) => setSelectedHotelId(hotel?.id || null)}
                />

                {/* Hotel info card + Chat input inside map */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[640px] z-[60] hidden md:block">
                  {/* Selected hotel info card — rich preview */}
                  <AnimatePresence>
                    {selectedHotelId && !chatOverlayOpen && (() => {
                      const hotel = hotels.find((h) => h.id === selectedHotelId);
                      if (!hotel) return null;
                      const amenityIcons: Record<string, { icon: typeof Coffee; label: string }> = {
                        breakfast: { icon: Coffee, label: "Breakfast" },
                        wifi: { icon: Wifi, label: "WiFi" },
                        parking: { icon: CircleParking, label: "Parking" },
                        pool: { icon: Waves, label: "Pool" },
                      };
                      const ratingLabel = hotel.guestRating >= 9 ? "Exceptional" : hotel.guestRating >= 8.5 ? "Excellent" : hotel.guestRating >= 8 ? "Very Good" : "Good";
                      const photos = [hotel.image, ...(hotel.roomImages || [])];
                      return (
                        <motion.div
                          key="hotel-info"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="rounded-2xl overflow-hidden"
                          style={{ backgroundColor: 'var(--color-card-bg)' }}
                        >
                          <div className="flex">
                            {/* Left: all content */}
                            <div className="flex-1 min-w-0">
                              {/* Header: name, location, rating, close */}
                              <div className="p-4 pb-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <h4 className="text-[14px] font-semibold truncate" style={{ color: 'var(--color-text-heading)' }}>
                                      {hotel.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                                      <span style={{ color: 'var(--color-text-secondary)' }}>{hotel.location}</span>
                                      {hotel.isHostHotel && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-medium flex items-center gap-0.5">
                                          <Star className="w-2.5 h-2.5 fill-purple-400" />
                                          Host Hotel
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-[11px] px-1.5 py-0.5 rounded font-medium bg-emerald-500/15 text-emerald-400">
                                      {hotel.guestRating}
                                    </span>
                                    <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{ratingLabel}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Photo row */}
                              <div className="flex gap-1.5 px-4">
                                {photos.map((src, i) => (
                                  <div key={i} className="flex-1 h-[80px] rounded-lg overflow-hidden min-w-0">
                                    <img src={src} alt={`${hotel.name} photo ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                  </div>
                                ))}
                              </div>

                              {/* Blurb + amenities */}
                              <div className="p-4 pt-2">
                                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                                  "{hotel.blurb}"
                                </p>
                                <div className="flex items-center gap-3 mt-2 text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-orange-400" />
                                    {hotel.distance}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Car className="w-3 h-3" />
                                    {hotel.driveTime}
                                  </span>
                                  <span style={{ color: 'var(--color-divider)' }}>|</span>
                                  {hotel.amenities.map((amenity) => {
                                    const info = amenityIcons[amenity];
                                    if (!info) return null;
                                    const AmenIcon = info.icon;
                                    return (
                                      <span key={amenity} className="flex items-center gap-0.5">
                                        <AmenIcon className="w-3 h-3" />
                                        {info.label}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Right price column — full height, matches feed card */}
                            <div className="shrink-0 flex flex-col items-end w-[160px] my-4 pl-3 pr-4 border-l" style={{ borderColor: 'var(--color-divider)' }}>
                              <button
                                onClick={() => setSelectedHotelId(null)}
                                className="w-6 h-6 flex items-center justify-center rounded-full transition-colors mb-auto -mt-1"
                                style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-chip-bg)' }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-divider)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-chip-bg)'; }}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <div className="text-right leading-tight">
                                {hotel.badges.length > 0 && (
                                  <span
                                    className={`inline-block text-[10px] px-2 py-0.5 rounded-full mb-1 ${
                                      hotel.badges[0] === "Best deal"
                                        ? "bg-emerald-50 text-emerald-600"
                                        : hotel.badges[0] === "Premium" || hotel.badges[0] === "Luxury pick"
                                        ? "bg-amber-50 text-amber-600"
                                        : "bg-sky-50 text-sky-600"
                                    }`}
                                  >
                                    {hotel.badges[0]}
                                  </span>
                                )}
                                {hotel.originalPrice && (
                                  <span className="text-xs line-through block" style={{ color: 'var(--color-text-secondary)' }}>
                                    ${hotel.originalPrice}
                                  </span>
                                )}
                                <span className="text-xl font-medium" style={{ color: 'var(--color-text-heading)' }}>${hotel.price}</span>
                                <p className="text-[10px] mb-3" style={{ color: 'var(--color-text-secondary)' }}>Average rate</p>
                                {hotel.roomsLeft && hotel.roomsLeft <= 10 && (
                                  <p className="text-[9px] text-orange-400 font-medium mb-2">
                                    {hotel.roomsLeft} rooms left
                                  </p>
                                )}
                              </div>
                              <button
                                className="w-full px-3 py-2 rounded-[6px] text-xs font-medium text-center transition-all"
                                style={{ backgroundColor: 'var(--color-action)', color: 'var(--color-action-text)' }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-action-hover)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-action)'; }}
                              >
                                View Hotel
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>
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