import { useState, useRef, useEffect } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Coffee,
  Wifi,
  ParkingCircle,
  Waves,
  ArrowUpDown,
  Search,
  MapPin,
  Users,
  Minus,
  Plus,
  Map,
  List,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FilterBarProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
  activeFilters: string[];
  onFilterToggle: (filter: string) => void;
  onClearFilters: () => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode?: "list" | "map";
  onViewModeToggle?: () => void;
  maxDistance: number | null;
  onMaxDistanceChange: (d: number | null) => void;
}

const amenityFilters = [
  { id: "breakfast", label: "Free Breakfast", icon: Coffee },
  { id: "wifi", label: "Free WiFi", icon: Wifi },
  { id: "parking", label: "Free Parking", icon: ParkingCircle },
  { id: "pool", label: "Pool", icon: Waves },
];

const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Guest Rating" },
  { value: "distance", label: "Distance to Venue" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(date: Date | null) {
  if (!date) return null;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateFull(date: Date | null) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function isSameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isInRange(date: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false;
  return date > start && date < end;
}

interface DatePickerProps {
  checkIn: Date | null;
  checkOut: Date | null;
  onSelect: (checkIn: Date | null, checkOut: Date | null) => void;
  onClose: () => void;
}

function DatePickerDropdown({ checkIn, checkOut, onSelect, onClose }: DatePickerProps) {
  const [viewDate, setViewDate] = useState(() => checkIn ? new Date(checkIn.getFullYear(), checkIn.getMonth(), 1) : new Date(2026, 2, 1));
  const [selecting, setSelecting] = useState<"checkin" | "checkout">(checkIn ? "checkout" : "checkin");

  const month1 = { year: viewDate.getFullYear(), month: viewDate.getMonth() };
  const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  const month2 = { year: nextMonth.getFullYear(), month: nextMonth.getMonth() };

  const handleDayClick = (date: Date) => {
    if (selecting === "checkin") {
      onSelect(date, null);
      setSelecting("checkout");
    } else {
      if (checkIn && date > checkIn) {
        onSelect(checkIn, date);
      } else {
        onSelect(date, null);
        setSelecting("checkout");
      }
    }
  };

  const renderMonth = (year: number, month: number) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const isCheckIn = isSameDay(date, checkIn);
      const isCheckOut = isSameDay(date, checkOut);
      const inRange = isInRange(date, checkIn, checkOut);
      const isPast = date < today;

      cells.push(
        <button
          key={d}
          disabled={isPast}
          onClick={() => handleDayClick(date)}
          className={`w-8 h-8 rounded-full text-xs flex items-center justify-center transition-all relative ${
            isPast
              ? "cursor-not-allowed"
              : isCheckIn || isCheckOut
              ? ""
              : inRange
              ? "bg-brand-light text-brand"
              : ""
          }`}
          style={
            isPast
              ? { color: 'var(--color-text-secondary)', opacity: 0.5 }
              : isCheckIn || isCheckOut
              ? { backgroundColor: 'var(--color-action)', color: 'var(--color-action-text)' }
              : !inRange
              ? { color: 'var(--color-text-primary)' }
              : undefined
          }
          onMouseEnter={(e) => { if (!isPast && !(isCheckIn || isCheckOut) && !inRange) e.currentTarget.style.backgroundColor = 'var(--color-hover-bg)'; }}
          onMouseLeave={(e) => { if (!isPast && !(isCheckIn || isCheckOut) && !inRange) e.currentTarget.style.backgroundColor = ''; }}
        >
          {d}
        </button>
      );
    }
    return cells;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="absolute top-full mt-2 left-0 sm:left-0 right-0 sm:right-auto rounded-xl shadow-2xl border p-4 z-40 max-h-[80vh] overflow-y-auto"
      style={{ minWidth: "min(580px, calc(100vw - 32px))", backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-divider)' }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        {[month1, month2].map((m, idx) => (
          <div key={idx} className="w-full sm:w-[260px]">
            <div className="flex items-center justify-between mb-3">
              {idx === 0 ? (
                <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="w-7 h-7 flex items-center justify-center rounded-full" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-hover-bg)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}>
                  <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                </button>
              ) : <div className="w-7" />}
              <span className="text-sm" style={{ color: 'var(--color-text-heading)' }}>{MONTHS[m.month]} {m.year}</span>
              {idx === 1 ? (
                <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="w-7 h-7 flex items-center justify-center rounded-full" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-hover-bg)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}>
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                </button>
              ) : <div className="w-7" />}
            </div>
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {DAYS.map((day) => (
                <div key={day} className="w-8 h-6 flex items-center justify-center text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {renderMonth(m.year, m.month)}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-divider)' }}>
        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {checkIn && checkOut
            ? `${formatDateFull(checkIn)} → ${formatDateFull(checkOut)}`
            : checkIn
            ? `Check-in: ${formatDateFull(checkIn)} — select check-out`
            : "Select check-in date"}
        </div>
        <div className="flex gap-2">
          <button onClick={() => { onSelect(null, null); setSelecting("checkin"); }} className="px-3 py-1.5 text-xs" style={{ color: 'var(--color-text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}>Clear</button>
          <button onClick={onClose} className="px-3 py-1.5 text-xs rounded-[6px] transition-colors" style={{ backgroundColor: 'var(--color-action)', color: 'var(--color-action-text)' }}>Done</button>
        </div>
      </div>
    </motion.div>
  );
}

interface GuestsDropdownProps {
  rooms: number;
  adults: number;
  children: number;
  onUpdate: (rooms: number, adults: number, children: number) => void;
  onClose: () => void;
}

function GuestsDropdown({ rooms, adults, children, onUpdate, onClose }: GuestsDropdownProps) {
  const items = [
    { label: "Rooms", value: rooms, min: 1, max: 8, onChange: (v: number) => onUpdate(v, adults, children) },
    { label: "Adults", value: adults, min: 1, max: 16, onChange: (v: number) => onUpdate(rooms, v, children) },
    { label: "Children", value: children, min: 0, max: 8, onChange: (v: number) => onUpdate(rooms, adults, v) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="absolute top-full mt-2 left-0 rounded-xl shadow-2xl border p-4 z-40 w-[260px]"
      style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-divider)' }}
    >
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{item.label}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => item.onChange(Math.max(item.min, item.value - 1))}
                disabled={item.value <= item.min}
                className="w-7 h-7 flex items-center justify-center rounded-full border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                style={{ borderColor: 'var(--color-input-border)', color: 'var(--color-text-secondary)' }}
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm w-4 text-center" style={{ color: 'var(--color-text-heading)' }}>{item.value}</span>
              <button
                onClick={() => item.onChange(Math.min(item.max, item.value + 1))}
                disabled={item.value >= item.max}
                className="w-7 h-7 flex items-center justify-center rounded-full border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                style={{ borderColor: 'var(--color-input-border)', color: 'var(--color-text-secondary)' }}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="w-full mt-4 px-3 py-2 text-xs rounded-[6px] transition-colors" style={{ backgroundColor: 'var(--color-action)', color: 'var(--color-action-text)' }}>
        Done
      </button>
    </motion.div>
  );
}

export function FilterBar({
  sortBy,
  onSortChange,
  activeFilters,
  onFilterToggle,
  onClearFilters,
  priceRange,
  onPriceRangeChange,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeToggle,
  maxDistance,
  onMaxDistanceChange,
}: FilterBarProps) {
  const [showSort, setShowSort] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuests, setShowGuests] = useState(false);
  const [showDistance, setShowDistance] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [checkIn, setCheckIn] = useState<Date | null>(new Date(2026, 2, 19));
  const [checkOut, setCheckOut] = useState<Date | null>(new Date(2026, 2, 21));
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);

  const hasFilters = activeFilters.length > 0 || priceRange[0] > 100 || priceRange[1] < 500 || maxDistance !== null;

  const guestSummary = `${rooms} room${rooms > 1 ? "s" : ""}, ${adults + childrenCount} guest${adults + childrenCount > 1 ? "s" : ""}`;

  return (
    <div className="space-y-3">
      {/* Filter chips row */}
      <div className="flex items-center gap-0 min-w-0">
        {/* Scrollable filters */}
        <div className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto pb-1 -mb-1 md:flex-wrap md:overflow-x-visible md:pb-0 md:mb-0 scrollbar-hide">
          {/* Search + Dates + Guests pill */}
          <div className="relative flex items-stretch rounded-full border shrink-0" style={{ backgroundColor: 'var(--color-chip-bg)', borderColor: 'var(--color-chip-border)' }}>
            {/* Hotel search — icon only, expands on click */}
            <div className="flex items-stretch border-r" style={{ borderColor: 'var(--color-chip-border)' }}>
              {showSearch ? (
                <div className="flex items-center gap-1.5 px-4 py-2">
                  <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-heading)' }} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search hotels..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="bg-transparent text-sm placeholder:text-gray-400 focus:outline-none w-[120px]"
                    style={{ color: 'var(--color-input-text)' }}
                  />
                  <button
                    onClick={() => { onSearchChange(''); setShowSearch(false); }}
                    className="shrink-0 transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setShowSearch(true); setTimeout(() => searchInputRef.current?.focus(), 50); }}
                  className="flex items-center px-4 py-2 transition-colors rounded-l-full"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-card-border)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                >
                  <Search className="w-4 h-4" style={{ color: 'var(--color-text-heading)' }} />
                </button>
              )}
            </div>

            {/* Dates */}
            <div className="relative flex items-stretch border-r" style={{ borderColor: 'var(--color-chip-border)' }}>
              <button
                onClick={() => { setShowDatePicker(!showDatePicker); setShowGuests(false); }}
                className="flex items-center gap-1.5 px-4 py-2 transition-colors text-left"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-card-border)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
              >
                <Calendar className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-heading)' }} />
                <div className="flex items-center gap-1.5">
                  <span className="text-sm whitespace-nowrap" style={{ color: 'var(--color-text-heading)' }}>
                    {checkIn ? formatDate(checkIn) : "Check-in"}
                  </span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>–</span>
                  <span className="text-sm whitespace-nowrap" style={{ color: 'var(--color-text-heading)' }}>
                    {checkOut ? formatDate(checkOut) : "Check-out"}
                  </span>
                </div>
              </button>
              <AnimatePresence>
                {showDatePicker && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowDatePicker(false)} />
                    <DatePickerDropdown
                      checkIn={checkIn}
                      checkOut={checkOut}
                      onSelect={(ci, co) => { setCheckIn(ci); setCheckOut(co); }}
                      onClose={() => setShowDatePicker(false)}
                    />
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Guests */}
            <div className="relative flex items-stretch">
              <button
                onClick={() => { setShowGuests(!showGuests); setShowDatePicker(false); }}
                className="flex items-center gap-1.5 px-4 py-2 transition-colors text-left rounded-r-full"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-card-border)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
              >
                <Users className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-heading)' }} />
                <span className="text-sm whitespace-nowrap" style={{ color: 'var(--color-text-heading)' }}>{guestSummary}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showGuests ? "rotate-180" : ""}`} style={{ color: 'var(--color-text-heading)' }} />
              </button>
              <AnimatePresence>
                {showGuests && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowGuests(false)} />
                    <GuestsDropdown
                      rooms={rooms}
                      adults={adults}
                      children={childrenCount}
                      onUpdate={(r, a, c) => { setRooms(r); setAdults(a); setChildrenCount(c); }}
                      onClose={() => setShowGuests(false)}
                    />
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Price range */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowPrice(!showPrice)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm border transition-colors whitespace-nowrap cursor-pointer ${
                priceRange[0] > 100 || priceRange[1] < 500
                  ? "bg-brand-light text-brand border-brand/20"
                  : ""
              }`}
              style={priceRange[0] <= 100 && priceRange[1] >= 500 ? { backgroundColor: 'var(--color-chip-bg)', borderColor: 'var(--color-chip-border)', color: 'var(--color-chip-text)' } : undefined}
              onMouseEnter={(e) => { if (priceRange[0] <= 100 && priceRange[1] >= 500) e.currentTarget.style.backgroundColor = 'var(--color-card-border)'; }}
              onMouseLeave={(e) => { if (priceRange[0] <= 100 && priceRange[1] >= 500) e.currentTarget.style.backgroundColor = 'var(--color-chip-bg)'; }}
            >
              ${priceRange[0]} - ${priceRange[1]}
              <ChevronDown className={`w-3 h-3 transition-transform ${showPrice ? "rotate-180" : ""}`} style={{ color: 'var(--color-text-heading)' }} />
            </button>
            <AnimatePresence>
              {showPrice && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowPrice(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full mt-1 left-0 rounded-xl shadow-xl border p-4 z-40 min-w-[240px]"
                    style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-divider)' }}
                  >
                    <p className="text-xs mb-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>Price per night</p>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1">
                        <label className="text-[10px] uppercase" style={{ color: 'var(--color-text-secondary)' }}>Min</label>
                        <input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => onPriceRangeChange([parseInt(e.target.value) || 0, priceRange[1]])}
                          className="w-full mt-0.5 px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand"
                          style={{ borderColor: 'var(--color-input-border)', color: 'var(--color-text-heading)', backgroundColor: 'var(--color-card-bg)' }}
                        />
                      </div>
                      <span className="mt-4" style={{ color: 'var(--color-text-secondary)' }}>-</span>
                      <div className="flex-1">
                        <label className="text-[10px] uppercase" style={{ color: 'var(--color-text-secondary)' }}>Max</label>
                        <input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value) || 500])}
                          className="w-full mt-0.5 px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand"
                          style={{ borderColor: 'var(--color-input-border)', color: 'var(--color-text-heading)', backgroundColor: 'var(--color-card-bg)' }}
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={500}
                      value={priceRange[1]}
                      onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                      style={{ accentColor: 'var(--color-action)' }}
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Amenity toggles */}
          {amenityFilters.map((f) => {
            const isActive = activeFilters.includes(f.id);
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                onClick={() => onFilterToggle(f.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm border transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? "border-transparent"
                    : ""
                }`}
                style={isActive ? { backgroundColor: 'var(--color-action)', color: 'var(--color-action-text)' } : { backgroundColor: 'var(--color-chip-bg)', borderColor: 'var(--color-chip-border)', color: 'var(--color-chip-text)' }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-card-border)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = isActive ? 'var(--color-action)' : 'var(--color-chip-bg)'; }}
              >
                <Icon className="w-3 h-3" />
                {f.label}
              </button>
            );
          })}

          {/* Distance filter */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowDistance(!showDistance)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm border transition-colors whitespace-nowrap cursor-pointer ${
                maxDistance !== null
                  ? "bg-brand-light text-brand border-brand/20"
                  : ""
              }`}
              style={maxDistance === null ? { backgroundColor: 'var(--color-chip-bg)', borderColor: 'var(--color-chip-border)', color: 'var(--color-chip-text)' } : undefined}
              onMouseEnter={(e) => { if (maxDistance === null) e.currentTarget.style.backgroundColor = 'var(--color-card-border)'; }}
              onMouseLeave={(e) => { if (maxDistance === null) e.currentTarget.style.backgroundColor = 'var(--color-chip-bg)'; }}
            >
              <MapPin className="w-3 h-3" />
              {maxDistance !== null ? `Within ${maxDistance} km` : "Distance"}
              <ChevronDown className={`w-3 h-3 transition-transform ${showDistance ? "rotate-180" : ""}`} style={{ color: 'var(--color-text-heading)' }} />
            </button>
            <AnimatePresence>
              {showDistance && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowDistance(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full mt-1 left-0 rounded-xl shadow-xl border py-1 z-40 min-w-[200px]"
                    style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-divider)' }}
                  >
                    <p className="px-3 pt-2 pb-1.5 text-[10px] uppercase" style={{ color: 'var(--color-text-secondary)' }}>Max distance to venue</p>
                    {[
                      { value: null, label: "Any distance" },
                      { value: 1, label: "Within 1 km" },
                      { value: 2, label: "Within 2 km" },
                      { value: 5, label: "Within 5 km" },
                      { value: 10, label: "Within 10 km" },
                      { value: 20, label: "Within 20 km" },
                    ].map((opt) => (
                      <button
                        key={String(opt.value)}
                        onClick={() => {
                          onMaxDistanceChange(opt.value);
                          setShowDistance(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                          maxDistance === opt.value ? "text-brand bg-brand-light/50" : ""
                        }`}
                        style={maxDistance !== opt.value ? { color: 'var(--color-text-primary)' } : undefined}
                        onMouseEnter={(e) => { if (maxDistance !== opt.value) e.currentTarget.style.backgroundColor = 'var(--color-hover-bg)'; }}
                        onMouseLeave={(e) => { if (maxDistance !== opt.value) e.currentTarget.style.backgroundColor = ''; }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Clear all */}
          {hasFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 px-2 py-1.5 text-xs hover:text-red-500 transition-colors whitespace-nowrap shrink-0"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>

        {/* Sticky Map button — mobile only */}
        {viewMode && onViewModeToggle && (
          <div className="md:hidden shrink-0 flex items-center pl-2 ml-0 relative">
            {/* Divider */}
            <div className="w-px h-5 mr-2" style={{ backgroundColor: 'var(--color-divider)' }} />
            <button
              onClick={onViewModeToggle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs transition-colors whitespace-nowrap"
              style={{ backgroundColor: 'var(--color-text-heading)', color: 'var(--color-card-bg)' }}
            >
              {viewMode === "list" ? (
                <>
                  <Map className="w-3.5 h-3.5" />
                  Map
                </>
              ) : (
                <>
                  <List className="w-3.5 h-3.5" />
                  List
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}