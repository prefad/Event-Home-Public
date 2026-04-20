import { useState, useMemo, useEffect, useRef, useCallback, memo } from "react";
import FloatingToolbar from "../components/FloatingToolbar";
import { hotels, Hotel } from "./hotels/hotel-data";
import {
  MapPin,
  ChevronDown,
  DollarSign,
  Waves,
  Sparkles,
  Star,
  X,
  Car,
  Coffee,
  Wifi,
  CircleParking,
  Send,
  MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@eventconnect/dec";
import { HotelCard } from "./hotels/hotel-card";
import { MapPanel } from "./hotels/map-panel";
import { FilterBar } from "./hotels/filter-bar";
import { AiChat, type Message as AiChatMessage } from "./hotels/ai-chat";
import Vector16 from "./hotels/Vector-16-985";
import Vector from "./hotels/Vector";
import TopBar from "../components/TopBar";
import EventHeader from "../components/EventHeader";

// ---------- Static constants (module-level, never rebuilt) ----------

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Guest Rating" },
  { value: "distance", label: "Distance to Venue" },
] as const;

const AMENITY_ICONS: Record<string, { icon: typeof Coffee; label: string }> = {
  breakfast: { icon: Coffee, label: "Breakfast" },
  wifi: { icon: Wifi, label: "WiFi" },
  parking: { icon: CircleParking, label: "Parking" },
  pool: { icon: Waves, label: "Pool" },
};

const getRatingLabel = (r: number) =>
  r >= 9 ? "Exceptional" : r >= 8.5 ? "Excellent" : r >= 8 ? "Very Good" : "Good";

// Pre-computed counts from the static hotels dataset
const POOL_UNDER_200_COUNT = hotels.filter(
  (h) => h.amenities.includes("pool") && h.price <= 200
).length;
const TOP_RATED_COUNT = hotels.filter((h) => h.guestRating >= 4.5).length;

const SUGGESTION_PILLS = [
  {
    icon: MapPin,
    label: "Closest hotels to the venue",
    subtitle: "Walk or short drive",
    iconBg: "bg-blue-500 text-white",
    activeColor: "#3b82f6",
    pillBg: "rgba(59,130,246,0.10)",
  },
  {
    icon: Star,
    label: "Top rated by guests",
    subtitle: `${TOP_RATED_COUNT} highly rated`,
    iconBg: "bg-amber-500 text-white",
    activeColor: "#f59e0b",
    pillBg: "rgba(245,158,11,0.10)",
  },
  {
    icon: DollarSign,
    label: "Best value for my group",
    subtitle: "Top 3 lowest rates",
    iconBg: "bg-emerald-500 text-white",
    activeColor: "#10b981",
    pillBg: "rgba(16,185,129,0.10)",
  },
  {
    icon: Waves,
    label: "Hotels with pools under $200",
    subtitle: `${POOL_UNDER_200_COUNT} option${POOL_UNDER_200_COUNT !== 1 ? "s" : ""} available`,
    iconBg: "bg-cyan-500 text-white",
    activeColor: "#06b6d4",
    pillBg: "rgba(6,182,212,0.10)",
  },
] as const;

type SuggestionLabel = (typeof SUGGESTION_PILLS)[number]["label"];

// Keyword → response table for the Top Finds chat (pure, module-level)
const TOP_FINDS_RESPONSES: { keywords: string[]; text: string }[] = [
  {
    keywords: ["pool", "swim"],
    text: "The Hilton Garden Inn ($189/night) and Best Western Plus ($142/night) both have pools. The Hilton also includes breakfast.",
  },
  {
    keywords: ["close", "near", "walk"],
    text: "Quality Suites Downtown is the closest at just 0.5 mi — walkable to the venue. Holiday Inn Express is next at 0.9 mi.",
  },
  {
    keywords: ["cheap", "budget", "afford"],
    text: "The best value options are Lambton Inn at $140/night (host hotel with dining discount) and Fairfield Inn at $180/night.",
  },
  {
    keywords: ["breakfast"],
    text: "Hotels with complimentary breakfast: Holiday Inn Express ($235), Fairfield Inn ($180), Best Western ($200), and Comfort Inn ($250).",
  },
  {
    keywords: ["parking"],
    text: "Free parking is available at Holiday Inn Express, Best Western, Lambton Inn, Quality Suites, Waterfront Hotel, and Point Edward Casino.",
  },
];

const DEFAULT_TOP_FINDS_RESPONSE =
  "I can help you find the perfect hotel for the tournament! Try asking about pricing, amenities, or proximity to the venue.";

function getTopFindsResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const entry of TOP_FINDS_RESPONSES) {
    if (entry.keywords.some((k) => lower.includes(k))) return entry.text;
  }
  return DEFAULT_TOP_FINDS_RESPONSE;
}

// Filter logic driven by an active suggestion pill
function applySuggestionFilter(
  allHotels: Hotel[],
  fallback: Hotel[],
  label: string | null
): Hotel[] {
  if (!label) return fallback;
  switch (label) {
    case "Hotels with pools under $200":
      return allHotels.filter((h) => h.amenities.includes("pool") && h.price <= 200);
    case "Closest hotels to the venue":
      return [...allHotels]
        .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
        .slice(0, 3);
    case "Top rated by guests":
      return allHotels
        .filter((h) => h.guestRating >= 4.5)
        .sort((a, b) => b.guestRating - a.guestRating);
    case "Best value for my group":
      return [...allHotels].sort((a, b) => a.price - b.price).slice(0, 3);
    default:
      return fallback;
  }
}

// Memoized HotelCard wrapper — skips re-render when parent re-renders for
// reasons unrelated to this specific card (e.g. suggestion pill toggles).
// Requires stable onHoverChange/onLeave/onSelect refs from the parent (useCallback).
const MemoHotelCard = memo(function MemoHotelCard({
  hotel,
  isActive,
  onHoverChange,
  onLeave,
  onSelect,
  onDiscuss,
}: {
  hotel: Hotel;
  isActive: boolean;
  onHoverChange: (id: string) => void;
  onLeave: () => void;
  onSelect: (hotel: Hotel) => void;
  onDiscuss?: (hotel: Hotel) => void;
}) {
  const handleHover = useCallback(() => onHoverChange(hotel.id), [hotel.id, onHoverChange]);
  const handleClick = useCallback(() => onSelect(hotel), [hotel, onSelect]);
  return (
    <HotelCard
      hotel={hotel}
      isActive={isActive}
      onHover={handleHover}
      onLeave={onLeave}
      onClick={handleClick}
      onDiscuss={onDiscuss}
    />
  );
});

/**
 * Rich Booking-Assistant response card. Renders when an assistant message
 * in the Top Finds chat carries a `hotel` reference — shows a condensed
 * hotel card (image, rating, stats, amenities, callouts, summary, CTAs)
 * inside the chat bubble instead of plain text. Makes the assistant feel
 * like it's surfacing a real tool result rather than just a paragraph.
 */
function HotelDetailCard({ hotel, summary }: { hotel: Hotel; summary: string }) {
  const ratingLabel = getRatingLabel(hotel.guestRating);
  const savings = hotel.originalPrice ? hotel.originalPrice - hotel.price : 0;
  const lowInventory = hotel.roomsLeft && hotel.roomsLeft <= 10;

  return (
    <div
      className="max-w-[92%] rounded-2xl rounded-bl-sm shadow-sm overflow-hidden"
      style={{
        backgroundColor: 'var(--color-chat-assistant-bg)',
        color: 'var(--color-chat-assistant-text)',
        border: '1px solid var(--color-card-border)',
      }}
    >
      {/* Header with thumbnail */}
      <div className="flex gap-3 p-3">
        <div className="relative w-[68px] h-[68px] rounded-lg overflow-hidden shrink-0">
          <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
          {hotel.isHostHotel && (
            <div className="absolute top-1 left-1 bg-purple-600 text-white text-[8px] px-1 py-0.5 rounded flex items-center gap-0.5">
              <span>★</span>
              <span>Host</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium truncate" style={{ color: 'var(--color-text-heading)' }}>
            {hotel.name}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            {hotel.location}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                hotel.guestRating >= 9
                  ? "bg-emerald-500/15 text-emerald-400"
                  : hotel.guestRating >= 8
                  ? "bg-blue-500/15 text-blue-400"
                  : "bg-white/10"
              }`}
            >
              {hotel.guestRating}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
              {ratingLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Stat chips */}
      <div className="flex gap-1.5 px-3 pb-2 flex-wrap">
        <span
          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
          style={{ backgroundColor: 'var(--color-icon-bg)', color: 'var(--color-text-secondary)' }}
        >
          <MapPin className="w-2.5 h-2.5 text-orange-400" />
          {hotel.distance}
        </span>
        <span
          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
          style={{ backgroundColor: 'var(--color-icon-bg)', color: 'var(--color-text-secondary)' }}
        >
          <Car className="w-2.5 h-2.5" />
          {hotel.driveTime}
        </span>
        <span
          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: 'var(--color-icon-bg)', color: 'var(--color-text-heading)' }}
        >
          <DollarSign className="w-2.5 h-2.5" />
          {hotel.price}
          {hotel.originalPrice && (
            <span className="line-through opacity-50 ml-0.5 font-normal">${hotel.originalPrice}</span>
          )}
          <span className="opacity-60 font-normal">/night</span>
        </span>
      </div>

      {/* Amenities */}
      {hotel.amenities.length > 0 && (
        <div className="flex items-center gap-1 px-3 pb-2">
          {hotel.amenities.map((a) => {
            const config = AMENITY_ICONS[a];
            if (!config) return null;
            const Icon = config.icon;
            return (
              <div
                key={a}
                className="w-5 h-5 flex items-center justify-center rounded"
                style={{ backgroundColor: 'var(--color-icon-bg)', color: 'var(--color-text-secondary)' }}
                title={config.label}
              >
                <Icon className="w-3 h-3" />
              </div>
            );
          })}
        </div>
      )}

      {/* Callouts */}
      {(savings > 0 || lowInventory || hotel.isHostHotel) && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {savings > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium hotel-badge-deal">
              Save ${savings}/night
            </span>
          )}
          {lowInventory && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
              Only {hotel.roomsLeft} rooms left
            </span>
          )}
          {hotel.isHostHotel && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(168,85,247,0.15)', color: '#c084fc' }}>
              Tournament perks
            </span>
          )}
        </div>
      )}

      {/* Summary text */}
      <div
        className="px-3 py-2.5 text-[12.5px] leading-relaxed"
        style={{ borderTop: '1px solid var(--color-divider)' }}
      >
        {summary}
      </div>

      {/* CTAs */}
      <div className="flex gap-1.5 px-3 pb-3">
        <button
          className="flex-1 text-[11px] px-2.5 py-1.5 rounded-[6px] font-medium transition-colors"
          style={{ backgroundColor: 'var(--color-action)', color: 'var(--color-action-text)' }}
        >
          View rooms
        </button>
        <button
          className="flex-1 text-[11px] px-2.5 py-1.5 rounded-[6px] font-medium transition-colors"
          style={{ backgroundColor: 'var(--color-icon-bg)', color: 'var(--color-text-heading)' }}
        >
          Compare
        </button>
        <button
          className="text-[11px] px-2.5 py-1.5 rounded-[6px] font-medium transition-colors"
          style={{ backgroundColor: 'var(--color-icon-bg)', color: 'var(--color-text-heading)' }}
          title="Save to shortlist"
        >
          Shortlist
        </button>
      </div>
    </div>
  );
}

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
  const [activeSuggestion, setActiveSuggestion] = useState<SuggestionLabel | null>(null);
  // When set, the Top Finds panel opens in "discuss a specific hotel" mode —
  // no suggestion pill is highlighted; the panel shows the rich hotel detail
  // card as the initial assistant message. Entered by clicking the comment
  // icon on any main hotel card.
  const [discussedHotelId, setDiscussedHotelId] = useState<string | null>(null);
  // Booking Assistant "open" state — drives the outer chrome (header, border,
  // pills card expansion, inline chat input). Stays true until the user clicks
  // the X. Clicking "Clear" on a sub-block only clears activeSuggestion /
  // discussedHotelId — it does NOT close the Booking Assistant.
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  // Assistant messages may carry a `hotel` reference — when present, the
  // message renders as a rich hotel-detail card (thumbnail + stats + amenities
  // + summary + CTAs) instead of a plain text bubble.
  type TopFindsMsg =
    | { role: "user"; text: string }
    | { role: "assistant"; text: string; hotel?: Hotel };
  const [topFindsMessages, setTopFindsMessages] = useState<TopFindsMsg[]>([]);
  const [topFindsInput, setTopFindsInput] = useState("");
  const [topFindsTyping, setTopFindsTyping] = useState(false);
  // Lifted AiChat state — shared between the bottom-bar and full-overlay renders
  // so messages typed in the bottom bar survive when React remounts AiChat in the
  // overlay position.
  const [aiChatMessages, setAiChatMessages] = useState<AiChatMessage[]>([]);
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiChatTyping, setAiChatTyping] = useState(false);
  const topFindsEndRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const sendTopFindsPrompt = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTopFindsMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setTopFindsTyping(true);
    setTimeout(() => {
      setTopFindsMessages((prev) => [
        ...prev,
        { role: "assistant", text: getTopFindsResponse(trimmed) },
      ]);
      setTopFindsTyping(false);
      setTimeout(
        () => topFindsEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    }, 800 + Math.random() * 800);
  }, []);

  const handleTopFindsSend = useCallback(() => {
    const text = topFindsInput.trim();
    if (!text) return;
    setTopFindsInput("");
    sendTopFindsPrompt(text);
  }, [topFindsInput, sendTopFindsPrompt]);

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

  const handleFilterToggle = useCallback((filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setActiveFilters([]);
    setPriceRange([100, 500]);
    setSearchQuery("");
    setMaxDistance(null);
  }, []);

  const handleToggleViewMode = useCallback(() => {
    setViewMode((v) => (v === "list" ? "map" : "list"));
  }, []);

  const handleHotelHover = useCallback((id: string) => setActiveHotelId(id), []);
  const handleHotelLeave = useCallback(() => setActiveHotelId(null), []);
  const handleHotelSelect = useCallback(
    (hotel: Hotel | null) => setSelectedHotelId(hotel?.id || null),
    []
  );
  const handleCloseDetailCard = useCallback(() => setSelectedHotelId(null), []);

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
  const suggestionFilteredHotels = useMemo(
    () => applySuggestionFilter(hotels, filteredHotels, activeSuggestion),
    [activeSuggestion, filteredHotels]
  );

  // Selected hotel — memoized O(1)-ish lookup so detail card doesn't re-scan every render
  const selectedHotel = useMemo(
    () => (selectedHotelId ? hotels.find((h) => h.id === selectedHotelId) ?? null : null),
    [selectedHotelId]
  );

  const handleSuggestionClick = useCallback((label: SuggestionLabel) => {
    setActiveSuggestion((current) => (current === label ? null : label));
    setDiscussedHotelId(null);
    setTopFindsMessages([]);
    setSelectedHotelId(null);
    setChatOverlayOpen(false);
    setBookingOpen(true);
  }, []);

  const handleChatOverlayChange = useCallback((open: boolean) => {
    setChatOverlayOpen(open);
  }, []);

  // The Top Finds sub-block (the expanded content area below the pills: hotel
  // strip, canned AI response, or discussed-hotel rich card) is open whenever
  // a suggestion pill is active OR a specific hotel is being discussed.
  const subBlockOpen =
    !!activeSuggestion ||
    !!discussedHotelId ||
    topFindsMessages.length > 0 ||
    topFindsTyping;
  // The outer Booking Assistant chrome (bordered container, header, X button,
  // expanded pills card, inline chat input) tracks `bookingOpen`. Alias kept as
  // `isTopFindsOpen` because the rest of the file uses that name everywhere.
  const isTopFindsOpen = bookingOpen;

  // Map overlay opens when either full chat, a suggestion, or a hotel
  // discussion is active.
  const mapOverlayOpen = chatOverlayOpen || isTopFindsOpen;
  const mapHotels = activeSuggestion
    ? suggestionFilteredHotels
    : discussedHotelId
    ? hotels.filter((h) => h.id === discussedHotelId)
    : filteredHotels;

  // Close Top Finds if the full chat opens (used to live inline in the AiChat callback)
  const handleAiChatOverlayChange = useCallback(
    (open: boolean) => {
      if (open) {
        if (activeSuggestion) setActiveSuggestion(null);
        if (discussedHotelId) setDiscussedHotelId(null);
        if (bookingOpen) setBookingOpen(false);
      }
      handleChatOverlayChange(open);
    },
    [activeSuggestion, discussedHotelId, bookingOpen, handleChatOverlayChange]
  );

  const handleHotelCardClick = useCallback((hotel: Hotel) => {
    setSelectedHotelId((current) => (current === hotel.id ? null : hotel.id));
  }, []);

  /**
   * Build a contextual Booking-Assistant follow-up when a user picks one of
   * the Top Finds hotel cards. Mentions the pick by name, pulls the most
   * relevant data point (walkability, savings, host-hotel perks, etc.) for
   * whichever suggestion pill is active, then offers a next step.
   */
  const buildHotelFollowUp = useCallback(
    (hotel: Hotel, suggestion: SuggestionLabel | null): string => {
      // The rich HotelDetailCard already surfaces name, price, rating,
      // distance, drive time, amenities, savings, low inventory, and
      // host status as structured chips. The summary text focuses on
      // the NARRATIVE — why it's a good pick + a helpful next-step CTA.
      const walkable = parseFloat(hotel.distance) <= 0.6;

      switch (suggestion) {
        case "Closest hotels to the venue":
          return walkable
            ? "Walkable on game days, so you can skip parking hassle. Want me to compare it against the other two closest options side-by-side?"
            : "Short enough to avoid traffic on early-morning game days. Want me to compare it against the other two closest options side-by-side?";
        case "Top rated by guests":
          return hotel.guestRating >= 9
            ? "One of the highest-rated rooms in the block for this tournament. Want to see recent guest reviews, or check availability for your dates?"
            : "A solid choice for comfort at this price point. Want to see recent guest reviews, or check availability for your dates?";
        case "Best value for my group":
          return hotel.originalPrice
            ? `Over a 3-night stay, that's $${(hotel.originalPrice - hotel.price) * 3} saved per room. Want me to estimate the total for your full group?`
            : "Strong group rate for the amenities included. Want me to estimate the total for your full group?";
        case "Hotels with pools under $200":
          return hotel.amenities.includes("breakfast")
            ? "Pool access with breakfast included — good for families who want the kids to burn off energy after games. Want me to check family suite availability?"
            : "Pool access at a budget-friendly rate. Want me to look at other pool options nearby, or check family suites here?";
        default:
          return "Want me to pull up more detail, check availability for your dates, or compare this against similar hotels?";
      }
    },
    []
  );

  /**
   * Called when a user clicks one of the horizontal hotel cards in the Top
   * Finds results strip. Selection toggles as before — but when the user is
   * SELECTING (not deselecting), we also push a user-side message + typing
   * state + contextual assistant response into the Top Finds chat, so the
   * Booking Assistant feels like a real conversation that reacts to the
   * user's picks. Deselection stays silent.
   *
   * IMPORTANT: all side effects (setTopFindsMessages, setTopFindsTyping,
   * setTimeout) must run OUTSIDE the setState updater. In React StrictMode
   * the updater is invoked twice, and any side effects inside it fire twice
   * → duplicate user messages + duplicate assistant replies.
   */
  const handleTopFindsCardSelect = useCallback(
    (hotel: Hotel) => {
      const isDeselecting = selectedHotelId === hotel.id;
      if (isDeselecting) {
        setSelectedHotelId(null);
        return;
      }

      setSelectedHotelId(hotel.id);
      setTopFindsMessages((prev) => [
        ...prev,
        { role: "user", text: `Tell me more about ${hotel.name}` },
      ]);
      setTopFindsTyping(true);
      const response = buildHotelFollowUp(hotel, activeSuggestion);
      setTimeout(() => {
        setTopFindsMessages((prev) => [
          ...prev,
          { role: "assistant", text: response, hotel },
        ]);
        setTopFindsTyping(false);
        setTimeout(
          () => topFindsEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          100
        );
      }, 600 + Math.random() * 500);
    },
    [selectedHotelId, activeSuggestion, buildHotelFollowUp]
  );

  /**
   * Called from the comment icon on a main hotel card. Opens the Top Finds
   * sidebar panel in "discuss" mode (no pill selected) and seeds the chat
   * with a user question + a rich HotelDetailCard response about that hotel.
   * If the user clicks the comment icon on a hotel they're already
   * discussing, it closes the panel.
   */
  const handleDiscussHotel = useCallback(
    (hotel: Hotel) => {
      if (discussedHotelId === hotel.id && !activeSuggestion) {
        setDiscussedHotelId(null);
        setTopFindsMessages([]);
        setSelectedHotelId(null);
        return;
      }
      setActiveSuggestion(null);
      setDiscussedHotelId(hotel.id);
      setSelectedHotelId(hotel.id);
      setChatOverlayOpen(false);
      setBookingOpen(true);
      setTopFindsMessages([]);
      setTopFindsTyping(true);
      const response = buildHotelFollowUp(hotel, null);
      setTimeout(() => {
        setTopFindsMessages([
          { role: "assistant", text: response, hotel },
        ]);
        setTopFindsTyping(false);
        setTimeout(
          () => topFindsEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          100
        );
      }, 500);
    },
    [discussedHotelId, activeSuggestion, buildHotelFollowUp]
  );

  return (
    <>
      <style>{`
        .hotels-feed button.border,
        .hotels-feed button[class*="border-gray"],
        .hotels-feed button[class*="border-brand"] {
          border-style: solid;
        }
        /* Table rows inside the AI response inherit a tint somewhere
           (probably from DEC's bundled preflight giving tr a bg). Force
           transparent so the header row reads flat against the chat bubble. */
        .hotels-feed table,
        .hotels-feed thead,
        .hotels-feed tbody,
        .hotels-feed tr,
        .hotels-feed th,
        .hotels-feed td {
          background-color: transparent !important;
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
            onViewModeToggle={handleToggleViewMode}
            maxDistance={maxDistance}
            onMaxDistanceChange={setMaxDistance}
          />
        </div>

        {/* Content area */}
        <div className="flex-1 flex md:overflow-hidden pr-0 md:pr-5 pb-0 md:pb-5 relative" style={{ backgroundColor: 'var(--color-page-bg)' }}>
          {/* Hotel list — on mobile: only in list mode; on desktop: always visible as sidebar.
              Plain div (no motion.layout): the header drawer resizes the ancestor via CSS
              `height` transition, and flex handles the reflow in perfect lockstep. A
              Framer-Motion layout animation here would FLIP-snapshot on re-render and drift
              out of phase with the CSS clock, causing the column to lag behind the map. */}
          <div
            className={`relative rounded-[10px] flex flex-col overflow-hidden ${
              viewMode === "map"
                ? "hidden md:block md:w-[640px] md:min-w-[640px]"
                : "w-full md:w-[640px] md:min-w-[640px]"
            }`}
          >
            {/* Full chat view — replaces sidebar content when open */}
            {chatOverlayOpen ? (
              <div className="flex-1 flex flex-col min-h-0">
                <AiChat
                  overlayOpen={chatOverlayOpen}
                  onOverlayChange={handleChatOverlayChange}
                  messages={aiChatMessages}
                  onMessagesChange={setAiChatMessages}
                  inputValue={aiChatInput}
                  onInputValueChange={setAiChatInput}
                  isTyping={aiChatTyping}
                  onIsTypingChange={setAiChatTyping}
                />
              </div>
            ) : (<>
            {/* Main content column */}
            <div className="px-4 pt-0 flex flex-col flex-1 min-h-0 overflow-y-auto scrollbar-hide">
              {/* Top Finds block — grows to fill when suggestion active.
                  border and rounded-[16px] are always present so toggling active
                  doesn't snap content by 1px (border width) or 6px (corner radius).
                  Only borderColor animates, matched to the inner fade curve. */}
              <div
                className={`flex flex-col border rounded-[16px] ${isTopFindsOpen ? 'flex-1 min-h-0 overflow-hidden' : ''}`}
                style={{
                  borderColor: isTopFindsOpen ? 'var(--color-divider)' : 'transparent',
                  transition: 'border-color 250ms cubic-bezier(0.25, 0.1, 0.25, 1)',
                }}
              >
              {/* Booking Assistant header — inside bordered container */}
              <AnimatePresence>
              {isTopFindsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden shrink-0"
                >
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-divider)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 shrink-0 text-brand">
                      <Vector16 />
                    </div>
                    <div>
                      <span className="text-sm" style={{ color: 'var(--color-text-heading)' }}>Booking Assistant</span>
                      <span className="text-[9px] text-brand bg-brand-light px-1.5 py-0.5 rounded-full ml-2">AI</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveSuggestion(null);
                      setDiscussedHotelId(null);
                      setTopFindsMessages([]);
                      setBookingOpen(false);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-[6px] transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                </motion.div>
              )}
              </AnimatePresence>
              {/* Top finds pills — flex column so results below fill remaining height.
                  Outer wrapper stays padding-less so blocks inside the opened Booking
                  Assistant go FULL width of the Top Finds container. Inner pills card's
                  own `px-4 py-3` matches the results inner div's `px-4`, so pills CONTENT
                  and results CONTENT share the same 16px indent from the Top Finds
                  border. Only the inner pills-card border fades out on activate so the
                  content-inside-a-card look disappears without shifting anything. */}
              <div className={`flex flex-col ${isTopFindsOpen ? 'flex-1 min-h-0' : ''}`}>
              <div
                className="flex flex-col rounded-[10px] border shrink-0 px-4 py-3"
                style={{
                  borderColor: isTopFindsOpen ? 'transparent' : 'var(--color-card-border)',
                  transition: 'border-color 250ms cubic-bezier(0.25, 0.1, 0.25, 1)',
                }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-text-heading)' }} />
                  <span className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--color-text-heading)' }}>Top finds</span>
                </div>
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
                          backgroundColor: pill.pillBg,
                          borderColor: isActive ? pill.activeColor : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = pill.activeColor;
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.borderColor = 'transparent';
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
              </div>

              {/* Persistent Top Finds bottom divider — always shown when the
                  Booking Assistant is open. Acts as the visual boundary between
                  the pills header and whatever sits below (greeting state, sub-
                  block hotel strip, or free-form chat messages). */}
              {isTopFindsOpen && (
                <div
                  style={{ borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: 'var(--color-divider)' }}
                />
              )}
              {/* Empty / greeting state — shown inside the Booking Assistant
                  open state only when no sub-block is active (transitional state
                  after Clear, or before any pill/discuss has been triggered).
                  Content below invites a follow-up question with designed
                  quick-prompt cards. */}
              {isTopFindsOpen && !subBlockOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1], delay: 0.05 }}
                    className="px-4 pt-5 pb-[calc(1.25rem+64px)] flex-1 min-h-0 flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-10 h-10 mb-2 text-brand">
                      <Vector16 />
                    </div>
                    <h3 className="text-[14px] font-medium mb-1" style={{ color: 'var(--color-text-heading)' }}>
                      How else can I help?
                    </h3>
                    <p className="text-[12px] mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                      Ask about rates, amenities, or logistics — or try one of these
                    </p>
                    <div className="grid grid-cols-2 gap-2 w-full max-w-[420px]">
                      {[
                        {
                          icon: Coffee,
                          label: 'Free breakfast',
                          subtitle: '4 hotels included',
                          iconBg: 'bg-orange-500 text-white',
                          pillBg: 'rgba(249,115,22,0.10)',
                          hoverColor: '#f97316',
                          prompt: 'Which hotels include breakfast?',
                        },
                        {
                          icon: CircleParking,
                          label: 'Free parking',
                          subtitle: '6 hotels included',
                          iconBg: 'bg-indigo-500 text-white',
                          pillBg: 'rgba(99,102,241,0.10)',
                          hoverColor: '#6366f1',
                          prompt: 'Which hotels offer free parking?',
                        },
                        {
                          icon: MapPin,
                          label: 'Walking distance',
                          subtitle: 'Closest to venue',
                          iconBg: 'bg-blue-500 text-white',
                          pillBg: 'rgba(59,130,246,0.10)',
                          hoverColor: '#3b82f6',
                          prompt: 'Which hotels are walkable to the venue?',
                        },
                        {
                          icon: DollarSign,
                          label: 'Budget picks',
                          subtitle: 'Under $200/night',
                          iconBg: 'bg-emerald-500 text-white',
                          pillBg: 'rgba(16,185,129,0.10)',
                          hoverColor: '#10b981',
                          prompt: 'What are the cheapest hotels?',
                        },
                      ].map((chip) => {
                        const ChipIcon = chip.icon;
                        return (
                          <button
                            key={chip.label}
                            onClick={() => sendTopFindsPrompt(chip.prompt)}
                            className="flex items-center gap-2.5 pl-2 pr-3 py-2 rounded-xl border transition-all duration-200 shrink-0 cursor-pointer hover:shadow-md text-left"
                            style={{
                              backgroundColor: chip.pillBg,
                              borderColor: 'transparent',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = chip.hoverColor;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'transparent';
                            }}
                          >
                            <div className={`w-7 h-7 min-w-7 min-h-7 rounded-lg flex items-center justify-center ${chip.iconBg}`}>
                              <ChipIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] truncate" style={{ color: 'var(--color-text-heading)' }}>
                                {chip.label}
                              </p>
                              <p className="text-[9px] truncate" style={{ color: 'var(--color-text-secondary)' }}>
                                {chip.subtitle}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </>
              )}

              {/* Inline results when a suggestion is active — below Top Finds block.
                  Opacity-only (no y translate). A y transform compounds with the
                  outer block's border/radius/flex-1 class swap and reads visually
                  as a diagonal / left shift on close. */}
                <AnimatePresence>
                  {subBlockOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                      className="flex-1 min-h-0 flex flex-col"
                    >
                      <div className="px-4 pt-3 pb-4 flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                        {/* Header row — label + Clear button. Renders for
                            suggestion-pill mode AND discuss-mode (hotel comment-
                            icon route), but NOT for free-form chat (no pill, no
                            discussed hotel) — those messages flow directly below
                            the persistent Top Finds divider. Clear only removes
                            the sub-block; it leaves the Booking Assistant chat
                            open. */}
                        {(activeSuggestion || discussedHotelId) && (() => {
                          const discussedHotel = discussedHotelId
                            ? hotels.find((h) => h.id === discussedHotelId)
                            : null;
                          const pill = activeSuggestion
                            ? SUGGESTION_PILLS.find((p) => p.label === activeSuggestion)
                            : null;
                          const SuggIcon = pill?.icon;
                          return (
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                {SuggIcon ? (
                                  <SuggIcon className="w-3.5 h-3.5 shrink-0" style={{ color: pill?.activeColor }} />
                                ) : null}
                                <span className="text-[13px] font-medium truncate" style={{ color: 'var(--color-text-heading)' }}>
                                  {activeSuggestion ?? (discussedHotel ? discussedHotel.name : '')}
                                </span>
                                {activeSuggestion && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0" style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-chip-bg)' }}>
                                    {suggestionFilteredHotels.length}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setActiveSuggestion(null);
                                  setDiscussedHotelId(null);
                                  setTopFindsMessages([]);
                                }}
                                className="text-[11px] px-2.5 py-0.5 rounded-full border transition-colors shrink-0 ml-2"
                                style={{ color: 'var(--color-text-secondary)', borderColor: 'var(--color-card-border)' }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-heading)'; e.currentTarget.style.borderColor = 'var(--color-text-secondary)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.borderColor = 'var(--color-card-border)'; }}
                              >
                                Clear
                              </button>
                            </div>
                          );
                        })()}
                        {activeSuggestion && (
                        <>
                        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-5">
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
                                onClick={() => setSelectedHotelId((current) => (current === hotel.id ? null : hotel.id))}
                              >
                                <div className="relative h-[90px] overflow-hidden">
                                  <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                  {hotel.badges.length > 0 && (
                                    <span className="absolute top-1.5 left-1.5 text-[8px] px-1.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm font-medium">
                                      {hotel.badges[0]}
                                    </span>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDiscussHotel(hotel);
                                    }}
                                    style={{
                                      backgroundColor: 'var(--color-card-bg)',
                                      opacity: 0.8,
                                      transition: 'background-color 180ms ease, opacity 180ms ease, transform 180ms ease',
                                    }}
                                    className="group/discuss absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full backdrop-blur-sm"
                                    title="Discuss this hotel with Booking Assistant"
                                    onMouseEnter={(e) => {
                                      e.stopPropagation();
                                      e.currentTarget.style.backgroundColor = 'var(--color-action)';
                                      e.currentTarget.style.opacity = '1';
                                      e.currentTarget.style.transform = 'scale(1.08)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.stopPropagation();
                                      e.currentTarget.style.backgroundColor = 'var(--color-card-bg)';
                                      e.currentTarget.style.opacity = '0.8';
                                      e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                  >
                                    <MessageCircle className="w-3 h-3 transition-colors text-[color:var(--color-text-primary)] group-hover/discuss:!text-white" />
                                  </button>
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
                        <div className="flex gap-2 mt-5">
                          <div className="w-6 h-6 shrink-0 mt-0.5 text-brand">
                            <Vector16 />
                          </div>
                          <div className="max-w-[80%]">
                            <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm shadow-sm text-[13px] leading-relaxed" style={{ backgroundColor: 'var(--color-chat-assistant-bg)', color: 'var(--color-chat-assistant-text)' }}>
                              {activeSuggestion === "Closest hotels to the venue" && (
                                <>
                                  <p>
                                    Here are the <strong style={{ color: 'var(--color-text-heading)' }}>3 closest hotels</strong> to the venue. Quality Suites is walkable at just 0.5 mi — no car needed on game days.
                                  </p>
                                  <table className="w-full mt-2 text-[12px]">
                                    <thead>
                                      <tr style={{ borderBottom: '1px solid var(--color-divider)', backgroundColor: 'transparent' }}>
                                        <th className="text-left pb-1 font-medium" style={{ backgroundColor: 'transparent', color: 'var(--color-text-heading)' }}>Hotel</th>
                                        <th className="text-right pb-1 font-medium" style={{ color: 'var(--color-text-heading)' }}>Distance</th>
                                        <th className="text-right pb-1 font-medium" style={{ color: 'var(--color-text-heading)' }}>Drive</th>
                                        <th className="text-right pb-1 font-medium" style={{ color: 'var(--color-text-heading)' }}>Price</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {suggestionFilteredHotels.map((h, idx) => (
                                        <tr key={h.id} style={{ borderBottom: '1px solid var(--color-divider)' }}>
                                          <td className="py-1.5 truncate max-w-[120px]">{idx === 0 ? '🥇 ' : idx === 1 ? '🥈 ' : idx === 2 ? '🥉 ' : ''}{h.name}</td>
                                          <td className="py-1.5 text-right">{h.distance}</td>
                                          <td className="py-1.5 text-right">{h.driveTime}</td>
                                          <td className="py-1.5 text-right font-medium" style={{ color: 'var(--color-text-heading)' }}>${h.price}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  <p className="mt-2 text-[12px] opacity-70">
                                    Tip: Quality Suites is the best pick for walkability. Holiday Inn is the best all-rounder with breakfast and pool included.
                                  </p>
                                </>
                              )}
                              {activeSuggestion === "Top rated by guests" && (
                                <>
                                  <p>
                                    These hotels all scored <strong style={{ color: 'var(--color-text-heading)' }}>8.5+ guest ratings</strong>.
                                  </p>
                                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                                    <div
                                      className="rounded-[10px] px-2.5 py-2 border"
                                      style={{ borderColor: 'rgba(245,158,11,0.35)', backgroundColor: 'rgba(245,158,11,0.08)' }}
                                    >
                                      <div className="flex items-center gap-1 mb-0.5">
                                        <Star className="w-3 h-3" style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                                        <span className="text-[13px] font-semibold" style={{ color: 'var(--color-text-heading)' }}>9.4</span>
                                        <span className="text-[9px] px-1 py-0.5 rounded ml-auto" style={{ color: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.15)' }}>Top pick</span>
                                      </div>
                                      <p className="text-[11px] font-medium leading-tight" style={{ color: 'var(--color-text-heading)' }}>
                                        Waterfront Hotel & Spa
                                      </p>
                                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                                        Spa · waterfront views
                                      </p>
                                    </div>
                                    <div
                                      className="rounded-[10px] px-2.5 py-2 border"
                                      style={{ borderColor: 'rgba(16,185,129,0.35)', backgroundColor: 'rgba(16,185,129,0.08)' }}
                                    >
                                      <div className="flex items-center gap-1 mb-0.5">
                                        <Star className="w-3 h-3" style={{ color: '#10b981', fill: '#10b981' }} />
                                        <span className="text-[13px] font-semibold" style={{ color: 'var(--color-text-heading)' }}>9.2</span>
                                        <span className="text-[9px] px-1 py-0.5 rounded ml-auto" style={{ color: '#10b981', backgroundColor: 'rgba(16,185,129,0.15)' }}>Best value</span>
                                      </div>
                                      <p className="text-[11px] font-medium leading-tight" style={{ color: 'var(--color-text-heading)' }}>
                                        Holiday Inn Express
                                      </p>
                                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                                        $235 · amenities included
                                      </p>
                                    </div>
                                  </div>
                                </>
                              )}
                              {activeSuggestion === "Best value for my group" && (
                                <>
                                  <p>
                                    Here are the <strong style={{ color: 'var(--color-text-heading)' }}>3 lowest group rates</strong> locked in for the tournament. The Lambton Inn at $140/night is the standout — it's the host hotel with dedicated check-in and dining discounts.
                                  </p>
                                  <table className="w-full mt-2 text-[12px]">
                                    <thead>
                                      <tr style={{ borderBottom: '1px solid var(--color-divider)', backgroundColor: 'transparent' }}>
                                        <th className="text-left pb-1 font-medium" style={{ backgroundColor: 'transparent', color: 'var(--color-text-heading)' }}>Hotel</th>
                                        <th className="text-right pb-1 font-medium" style={{ color: 'var(--color-text-heading)' }}>Rate</th>
                                        <th className="text-right pb-1 font-medium" style={{ color: 'var(--color-text-heading)' }}>Rating</th>
                                        <th className="text-right pb-1 font-medium" style={{ color: 'var(--color-text-heading)' }}>Perks</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {suggestionFilteredHotels.map((h, idx) => (
                                        <tr key={h.id} style={{ borderBottom: '1px solid var(--color-divider)' }}>
                                          <td className="py-1.5 truncate max-w-[120px]">{idx === 0 ? '🥇 ' : idx === 1 ? '🥈 ' : idx === 2 ? '🥉 ' : ''}{h.name}</td>
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
                                  {suggestionFilteredHotels.length === 0 ? (
                                    <p>No hotels with pools under $200 are currently available.</p>
                                  ) : (
                                    <>
                                      <p>
                                        Found <strong style={{ color: 'var(--color-text-heading)' }}>{suggestionFilteredHotels.length} hotel{suggestionFilteredHotels.length !== 1 ? 's' : ''} with pools under $200</strong>. Great for families who want the kids to burn off energy after games.
                                      </p>
                                      <div className="mt-2.5 flex flex-col gap-2">
                                        {suggestionFilteredHotels.slice(0, 2).map((h, idx) => (
                                          <div
                                            key={h.id}
                                            className="rounded-[10px] px-2.5 py-2 border flex items-center gap-2"
                                            style={{ borderColor: 'rgba(6,182,212,0.35)', backgroundColor: 'rgba(6,182,212,0.08)' }}
                                          >
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-cyan-500 text-white shrink-0">
                                              <Waves className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <div className="flex items-center gap-1.5">
                                                <p className="text-[11px] font-medium truncate" style={{ color: 'var(--color-text-heading)' }}>
                                                  {h.name}
                                                </p>
                                                {idx === 0 && (
                                                  <span className="text-[9px] px-1 py-0.5 rounded shrink-0" style={{ color: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.15)' }}>Host hotel</span>
                                                )}
                                              </div>
                                              <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                                                Pool · free WiFi{idx === 0 ? ' · tournament perks' : ''}
                                              </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                              <p className="text-[13px] font-semibold" style={{ color: 'var(--color-text-heading)' }}>${h.price}</p>
                                              <p className="text-[9px]" style={{ color: 'var(--color-text-secondary)' }}>/night</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        </>
                        )}
                        {/* Inline messages in Top Finds */}
                        {topFindsMessages.map((msg, i) => {
                          const isAssistant = msg.role === "assistant";
                          const richHotel = isAssistant && "hotel" in msg ? msg.hotel : undefined;
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                              className={`flex ${isAssistant ? "justify-start" : "justify-end"} mt-3`}
                            >
                              {isAssistant && (
                                <div className="w-6 h-6 shrink-0 mr-2 mt-0.5 text-brand">
                                  <Vector16 />
                                </div>
                              )}
                              {richHotel ? (
                                <HotelDetailCard hotel={richHotel} summary={msg.text} />
                              ) : (
                                <div
                                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                                    isAssistant ? "rounded-bl-sm shadow-sm" : "rounded-br-sm"
                                  }`}
                                  style={
                                    isAssistant
                                      ? { backgroundColor: 'var(--color-chat-assistant-bg)', color: 'var(--color-chat-assistant-text)' }
                                      : { backgroundColor: '#ffffff', color: '#000000' }
                                  }
                                >
                                  {msg.text}
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                        {topFindsTyping && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex justify-start mt-3"
                          >
                            <div className="w-6 h-6 shrink-0 mr-2 mt-0.5 text-brand">
                              <Vector16 />
                            </div>
                            <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1" style={{ backgroundColor: 'var(--color-chat-assistant-bg)' }}>
                              <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0ms]" style={{ backgroundColor: 'var(--color-text-secondary)' }} />
                              <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:150ms]" style={{ backgroundColor: 'var(--color-text-secondary)' }} />
                              <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:300ms]" style={{ backgroundColor: 'var(--color-text-secondary)' }} />
                            </div>
                          </motion.div>
                        )}
                        <div ref={topFindsEndRef} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
              </div>

              {/* Chat input + sort bar — sticky at top when feed is visible; pinned to bottom when Top Finds expanded */}
              <div
                className={`shrink-0 z-10 ${isTopFindsOpen ? 'mt-auto pt-2' : 'mt-2 pb-2 sticky top-0'}`}
                style={{ backgroundColor: 'var(--color-page-bg)' }}
              >
                {isTopFindsOpen ? (
                  // Inline Top Finds chat input — messages render inside the bordered block above
                  <div
                    className="flex items-center gap-2 rounded-[10px] pl-2.5 pr-2.5 py-2 transition-all"
                    style={{ backgroundColor: 'var(--color-input-bg)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--color-input-border)' }}
                  >
                    <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                      <div className="w-5 h-[22px]">
                        <Vector />
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Ask Booking Assistant anything..."
                      value={topFindsInput}
                      onChange={(e) => setTopFindsInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleTopFindsSend();
                        }
                      }}
                      className="flex-1 bg-transparent text-base placeholder-gray-500 outline-none min-w-0"
                      style={{ color: 'var(--color-text-heading)' }}
                    />
                    <button
                      onClick={handleTopFindsSend}
                      disabled={!topFindsInput.trim()}
                      className="w-9 h-9 flex items-center justify-center rounded-xl transition-all shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: topFindsInput.trim() ? 'var(--color-action)' : 'var(--color-chip-bg)',
                        color: topFindsInput.trim() ? 'var(--color-action-text)' : 'var(--color-text-secondary)',
                      }}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <AiChat
                    overlayOpen={chatOverlayOpen}
                    onOverlayChange={handleAiChatOverlayChange}
                    messages={aiChatMessages}
                    onMessagesChange={setAiChatMessages}
                    inputValue={aiChatInput}
                    onInputValueChange={setAiChatInput}
                    isTyping={aiChatTyping}
                    onIsTypingChange={setAiChatTyping}
                  />
                )}
                {!isTopFindsOpen && (
                  <div className="px-0 pt-4 pb-1 flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--color-text-heading)' }}>
                      {filteredHotels.length} results
                    </span>
                  <div className="flex items-center gap-3">
                    {/* Sort dropdown — DEC's DropdownMenu + RadioGroup for
                        proper a11y (arrow-key nav, Esc to close) and the
                        design-system visual: popover border/shadow, active
                        item indicator, typography. */}
                    <DropdownMenu open={showSort} onOpenChange={setShowSort}>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="flex items-center gap-1.5 text-sm transition-colors"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          <span className="hidden sm:inline">Sort by{" "}</span>
                          <span style={{ color: 'var(--color-text-heading)' }}>
                            {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
                          </span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform ${showSort ? "rotate-180" : ""}`}
                            style={{ color: 'var(--color-text-heading)' }}
                          />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[200px]">
                        <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                          {SORT_OPTIONS.map((opt) => (
                            <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                  </div>
                )}
              </div>

              {/* Hotel feed */}
              {!isTopFindsOpen && (
              <div className="flex flex-col gap-3">
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
                  <MemoHotelCard
                    key={hotel.id}
                    hotel={hotel}
                    isActive={activeHotelId === hotel.id}
                    onHoverChange={handleHotelHover}
                    onLeave={handleHotelLeave}
                    onSelect={handleHotelCardClick}
                    onDiscuss={handleDiscussHotel}
                  />
                ))
              )}
              </div>
              )}

            {/* Spacer for mobile floating chat bar */}
            {!isTopFindsOpen && <div className="h-20 md:hidden" />}
            </div>
            </>
            )}
          </div>

          {/* Map panel — on mobile: only in map mode; on desktop: always visible.
              Plain div for the same reason as the sidebar: let flex + the drawer's
              CSS height transition drive the reflow so map and column move in sync. */}
          <div
            className={`flex-1 flex flex-col relative overflow-hidden rounded-r-xl ${
              viewMode === "map" ? "block" : "hidden md:flex"
            }`}
          >
            {/* Map area — always visible now, chat is in sidebar */}
              <div className="flex-1 relative overflow-hidden rounded-tr-xl">
                <MapPanel
                  hotels={mapHotels}
                  activeHotelId={activeHotelId}
                  onHotelHover={handleHotelHover}
                  onHotelLeave={handleHotelLeave}
                  overlayOpen={mapOverlayOpen}
                  selectedHotelId={selectedHotelId}
                  onHotelSelect={handleHotelSelect}
                />

                {/* Hotel info card inside map. `inset-x-0 mx-auto` centres
                    inside the positioned map container without relying on
                    transforms, so nothing drifts when motion.div animates
                    ancestor widths. `max-w-full` lets it shrink if the map
                    column narrows below 640px. */}
                <div className="absolute bottom-4 inset-x-0 mx-auto w-[640px] max-w-full z-[60] hidden md:block">
                  {/* Selected hotel info card — rich preview */}
                  <AnimatePresence>
                    {selectedHotel && !chatOverlayOpen && (() => {
                      const hotel = selectedHotel;
                      const ratingLabel = getRatingLabel(hotel.guestRating);
                      const photos = hotel.roomImages ? [hotel.image, ...hotel.roomImages] : [hotel.image];
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
                                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
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
                                    const info = AMENITY_ICONS[amenity];
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
                                onClick={handleCloseDetailCard}
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
                                        ? "hotel-badge-deal"
                                        : hotel.badges[0] === "Premium" || hotel.badges[0] === "Luxury pick"
                                        ? "hotel-badge-premium"
                                        : "hotel-badge-host"
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
                              <Button variant="destructive" size="sm" className="w-full">
                                View Hotel
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>
                </div>
              </div>

            {/* Desktop AI chat overlay removed — chat now lives in sidebar */}
          </div>
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