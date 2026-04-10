import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Hotel } from "./hotel-data";
import { X, Star, MapPin, Plus, Minus, Car } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";
import { hotels as allHotels } from "./hotel-data";

function PriceMarker({
  hotel,
  isActive,
  onHover,
  onLeave,
  onClick,
}: {
  hotel: Hotel;
  isActive: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="absolute"
      style={{
        left: `${hotel.mapPosition.x}%`,
        top: `${hotel.mapPosition.y}%`,
        transform: "translate(-50%, -100%)",
        zIndex: isActive ? 50 : 10,
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      <div
        className={`relative cursor-pointer transition-all duration-200 ${
          isActive ? "scale-125" : "hover:scale-110"
        }`}
      >
        {hotel.isHostHotel ? (
          <div
            className={`flex items-center gap-1 px-2 py-1.5 rounded-full shadow-lg transition-colors ${
              isActive
                ? "bg-purple-600 text-white shadow-purple-600/30"
                : "bg-purple-500 text-white hover:bg-purple-600"
            }`}
          >
            <Star className="w-3 h-3 fill-white" />
            <span className="text-xs whitespace-nowrap font-medium">${hotel.price}</span>
          </div>
        ) : (
          <div
            className={`px-2.5 py-1.5 rounded-full shadow-lg text-xs font-medium whitespace-nowrap transition-colors ${
              isActive
                ? "shadow-lg"
                : "border"
            }`}
            style={isActive ? {
              backgroundColor: 'var(--color-action)',
              color: 'var(--color-action-text)',
            } : {
              backgroundColor: '#ffffff',
              color: '#1a1a2e',
              borderColor: '#e0e0e0',
            }}
          >
            ${hotel.price}
          </div>
        )}
        {/* Pin tail */}
        <div className="flex justify-center">
          <div
            className={`w-2 h-2 rotate-45 -mt-1 transition-colors ${
              isActive
                ? hotel.isHostHotel
                  ? "bg-purple-600"
                  : ""
                : hotel.isHostHotel
                ? "bg-purple-500"
                : "border-b border-r"
            }`}
            style={isActive && !hotel.isHostHotel ? {
              backgroundColor: 'var(--color-action)',
            } : !isActive && !hotel.isHostHotel ? {
              backgroundColor: '#ffffff',
              borderColor: 'var(--color-card-border)',
            } : undefined}
          />
        </div>
      </div>
    </motion.div>
  );
}

function HotelPopup({ hotel, onClose }: { hotel: Hotel; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      className="absolute z-50 w-64 rounded-xl shadow-2xl border overflow-hidden"
      style={{
        left: `${hotel.mapPosition.x}%`,
        top: `${hotel.mapPosition.y}%`,
        transform: `translate(${hotel.mapPosition.x > 60 ? '-100%' : '10px'}, -110%)`,
        backgroundColor: 'var(--color-card-bg)',
        borderColor: 'var(--color-divider)',
      }}
    >
      <div className="relative h-32">
        <ImageWithFallback
          src={hotel.image}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        {hotel.badges.length > 0 && (
          <div className="absolute bottom-2 left-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-sm">
              {hotel.badges[0]}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm" style={{ color: 'var(--color-text-heading)' }}>{hotel.name}</h4>
            <div className="flex items-center gap-1 mt-1">
              <div className="flex items-center gap-0.5 text-[10px] bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded">
                {hotel.guestRating}
              </div>
              <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                {hotel.guestRating >= 9 ? "Excellent" : hotel.guestRating >= 8 ? "Very Good" : "Good"}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg" style={{ color: 'var(--color-text-heading)' }}>${hotel.price}</span>
            <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>/night</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
          <span className="flex items-center gap-0.5">
            <MapPin className="w-3 h-3 text-orange-500" />
            {hotel.distance}
          </span>
          <span>from venue</span>
        </div>
        <button className="w-full mt-3 py-2 text-xs rounded-lg transition-colors" style={{ backgroundColor: 'var(--color-action)', color: 'var(--color-action-text)' }}>
          View Rooms
        </button>
      </div>
    </motion.div>
  );
}

export function MapPanel({
  hotels,
  activeHotelId,
  onHotelHover,
  onHotelLeave,
  overlayOpen,
  selectedHotelId,
  onHotelSelect,
}: {
  hotels: Hotel[];
  activeHotelId: string | null;
  onHotelHover: (id: string) => void;
  onHotelLeave: () => void;
  overlayOpen?: boolean;
  selectedHotelId?: string | null;
  onHotelSelect?: (hotel: Hotel | null) => void;
}) {
  const [_selectedHotel, _setSelectedHotel] = useState<Hotel | null>(null);
  const selectedHotel = selectedHotelId
    ? hotels.find((h) => h.id === selectedHotelId) || allHotels.find((h) => h.id === selectedHotelId) || null
    : _selectedHotel;
  const setSelectedHotel = (hotel: Hotel | null) => {
    if (onHotelSelect) onHotelSelect(hotel);
    else _setSelectedHotel(hotel);
  };

  // Compute zoom/pan transform to fit filtered hotels in visible area
  const mapTransform = useMemo(() => {
    // When a hotel is selected, center the map on the midpoint between hotel and venue
    if (selectedHotel) {
      const hotelPos = selectedHotel.mapPosition;
      const venuePos = { x: 50, y: 50 };
      const cx = (hotelPos.x + venuePos.x) / 2;
      const cy = (hotelPos.y + venuePos.y) / 2;
      // Zoom to show both hotel and venue with generous padding
      const rangeX = Math.abs(hotelPos.x - venuePos.x) + 40;
      const rangeY = Math.abs(hotelPos.y - venuePos.y) + 50; // extra vertical for info card
      const scaleX = 100 / rangeX;
      const scaleY = 100 / rangeY;
      const scale = Math.min(scaleX, scaleY, 1.8);
      // Shift center up to account for info card at bottom
      const targetY = 40;
      return { scale, translateX: 50 - scale * cx, translateY: targetY - scale * cy };
    }

    const isFiltered = hotels.length < allHotels.length && hotels.length > 0;
    if (!isFiltered) {
      return { scale: 1, translateX: 0, translateY: 0 };
    }

    // Include venue position (50%, 50%) in the bounding box so hotels are shown relative to venue
    const venuePos = { x: 50, y: 50 };
    const allPoints = [...hotels.map((h) => h.mapPosition), venuePos];

    const padding = 15; // percentage padding around bounding box
    const minX = Math.min(...allPoints.map((p) => p.x));
    const maxX = Math.max(...allPoints.map((p) => p.x));
    const minY = Math.min(...allPoints.map((p) => p.y));
    const maxY = Math.max(...allPoints.map((p) => p.y));

    const rangeX = Math.max(maxX - minX + padding * 2, 25);
    const rangeY = Math.max(maxY - minY + padding * 2, 25);

    const scaleX = 100 / rangeX;
    const scaleY = 100 / rangeY;
    const scale = Math.min(scaleX, scaleY, 2.5);

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    // When overlay is open, shift the target center upward so pins sit above the overlay
    const targetY = overlayOpen ? 30 : 50;

    const translateX = 50 - scale * cx;
    const translateY = targetY - scale * cy;

    return { scale, translateX, translateY };
  }, [hotels, overlayOpen, selectedHotel]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl" style={{ backgroundColor: 'var(--color-map-bg)' }}>
      {/* Transformable map content layer */}
      <motion.div
        className="absolute inset-0"
        animate={{
          scale: mapTransform.scale,
          x: `${mapTransform.translateX}%`,
          y: `${mapTransform.translateY}%`,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        style={{ transformOrigin: "0% 0%" }}
      >
      {/* Map background simulation with grid and roads */}
      <div className="absolute inset-0">
        {/* Water body */}
        <div className="absolute top-0 right-0 w-[40%] h-[35%] rounded-bl-[120px] opacity-60" style={{ backgroundColor: 'var(--color-map-water)' }} />
        <div className="absolute bottom-0 right-0 w-[25%] h-[20%] rounded-tl-[80px] opacity-40" style={{ backgroundColor: 'var(--color-map-water)' }} />
        
        {/* Roads */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          {/* Main horizontal roads */}
          <line x1="0" y1="30%" x2="100%" y2="30%" stroke="var(--color-map-road)" strokeWidth="3" />
          <line x1="0" y1="55%" x2="100%" y2="55%" stroke="var(--color-map-road)" strokeWidth="3" />
          <line x1="0" y1="80%" x2="100%" y2="80%" stroke="var(--color-map-road)" strokeWidth="2" />
          {/* Main vertical roads */}
          <line x1="25%" y1="0" x2="25%" y2="100%" stroke="var(--color-map-road)" strokeWidth="3" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="var(--color-map-road)" strokeWidth="3" />
          <line x1="75%" y1="0" x2="75%" y2="100%" stroke="var(--color-map-road)" strokeWidth="2" />
          {/* Diagonal road */}
          <line x1="10%" y1="90%" x2="90%" y2="10%" stroke="var(--color-map-road)" strokeWidth="2" opacity="0.5" />
          {/* Minor roads */}
          <line x1="0" y1="45%" x2="40%" y2="45%" stroke="var(--color-map-road-minor)" strokeWidth="1.5" />
          <line x1="60%" y1="68%" x2="100%" y2="68%" stroke="var(--color-map-road-minor)" strokeWidth="1.5" />
          <line x1="38%" y1="0" x2="38%" y2="50%" stroke="var(--color-map-road-minor)" strokeWidth="1.5" />
        </svg>

        {/* Route line from selected hotel to venue — realistic road path, UNDER venue pin */}
        {selectedHotel && (() => {
          const hx = selectedHotel.mapPosition.x;
          const hy = selectedHotel.mapPosition.y;
          const vx = 50; // venue x
          const vy = 50; // venue y

          // Pre-computed realistic routes per hotel (like Google Maps with multiple turns)
          const routes: Record<string, number[][]> = {
            "1": [[35,25],[35,30],[38,30],[38,45],[50,45],[50,50]], // Holiday Inn Express
            "2": [[55,45],[50,45],[50,50]], // Best Western Plus
            "3": [[72,55],[75,55],[75,50],[50,50]], // Lambton Inn (Host)
            "4": [[45,70],[45,68],[38,68],[38,55],[50,55],[50,50]], // Fairfield Inn
            "5": [[80,20],[80,30],[75,30],[75,45],[50,45],[50,50]], // Point Edward Casino
            "6": [[20,60],[25,60],[25,55],[38,55],[38,50],[50,50]], // Comfort Inn
            "7": [[30,40],[30,45],[38,45],[38,50],[50,50]], // Quality Suites
            "8": [[65,80],[65,68],[50,68],[50,55],[50,50]], // Waterfront Hotel
          };

          const route = routes[selectedHotel.id] || [[hx,hy],[hx,vy],[vx,vy]];
          const d = route.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

          // Place tag at midpoint of the longest segment (most visually centered)
          let longestIdx = 0;
          let longestLen = 0;
          for (let i = 1; i < route.length; i++) {
            const dx = route[i][0] - route[i-1][0];
            const dy = route[i][1] - route[i-1][1];
            const len = Math.sqrt(dx*dx + dy*dy);
            if (len > longestLen) { longestLen = len; longestIdx = i - 1; }
          }
          const midX = (route[longestIdx][0] + route[longestIdx + 1][0]) / 2;
          const midY = (route[longestIdx][1] + route[longestIdx + 1][1]) / 2;

          return (
            <>
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ zIndex: 2 }}>
                {/* Route shadow for depth */}
                <path
                  d={d}
                  fill="none"
                  stroke="rgba(249,115,22,0.15)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Main route line with flowing animation */}
                <path
                  d={d}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="-16"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </path>
              </svg>
              {/* Drive time tag at route midpoint */}
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${midX}%`,
                  top: `${midY}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 3,
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="flex items-center gap-1 px-2 py-1 rounded-full shadow-lg text-[10px] font-medium whitespace-nowrap"
                  style={{
                    backgroundColor: 'var(--color-card-bg)',
                    color: 'var(--color-text-secondary)',
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: 'var(--color-card-border)',
                  }}
                >
                  <Car className="w-3 h-3" style={{ color: '#f97316' }} />
                  <span>{selectedHotel.driveTime}</span>
                </motion.div>
              </div>
            </>
          );
        })()}

        {/* Green areas (parks) */}
        <div className="absolute left-[5%] top-[8%] w-24 h-16 rounded-2xl opacity-50" style={{ backgroundColor: 'var(--color-map-park)' }} />
        <div className="absolute left-[60%] top-[60%] w-32 h-20 rounded-3xl opacity-40" style={{ backgroundColor: 'var(--color-map-park)' }} />
        
        {/* Venue marker */}
        <div
          className="absolute flex flex-col items-center"
          style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 6 }}
        >
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center animate-pulse">
            <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
              <Star className="w-3 h-3 text-white fill-white" />
            </div>
          </div>
          <span className="mt-1 text-[9px] px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap backdrop-blur-sm" style={{ backgroundColor: 'var(--color-card-bg)', opacity: 0.9, color: 'var(--color-text-primary)' }}>
            Venue
          </span>
        </div>
      </div>

      {/* Price markers — hide non-selected when a hotel is focused */}
      <AnimatePresence>
        {hotels.map((hotel) => {
          // When a hotel is selected, only show that hotel's pin
          if (selectedHotel && hotel.id !== selectedHotel.id) return null;
          return (
            <PriceMarker
              key={hotel.id}
              hotel={hotel}
              isActive={activeHotelId === hotel.id || selectedHotel?.id === hotel.id}
              onHover={() => onHotelHover(hotel.id)}
              onLeave={onHotelLeave}
              onClick={() => setSelectedHotel(selectedHotel?.id === hotel.id ? null : hotel)}
            />
          );
        })}
      </AnimatePresence>
      </motion.div>

      {/* Map controls */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1">
        <button className="w-9 h-9 rounded-[8px] shadow-md flex items-center justify-center hover:shadow-lg transition-all" style={{ backgroundColor: 'var(--color-card-bg)', color: 'var(--color-text-secondary)' }}>
          <Plus className="w-4 h-4" strokeWidth={2} />
        </button>
        <button className="w-9 h-9 rounded-[8px] shadow-md flex items-center justify-center hover:shadow-lg transition-all" style={{ backgroundColor: 'var(--color-card-bg)', color: 'var(--color-text-secondary)' }}>
          <Minus className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      {/* Map legend */}
      <div className="absolute top-4 left-4 backdrop-blur-sm rounded-lg shadow-md px-3 py-2 flex items-center gap-4 text-[10px]" style={{ backgroundColor: 'var(--color-card-bg)', opacity: 0.9, color: 'var(--color-text-primary)' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-orange-500 flex items-center justify-center">
            <Star className="w-2 h-2 text-white fill-white" />
          </div>
          Venue
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          Host Hotel
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }} />
          Hotels
        </div>
      </div>
    </div>
  );
}