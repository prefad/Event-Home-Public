import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Star, MapPin, ExternalLink, LucideIcon } from "lucide-react";
import { Hotel } from "./hotel-data";

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <div className="flex items-center gap-px">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`f${i}`} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
      ))}
      {halfStar && (
        <div className="relative w-2.5 h-2.5">
          <Star className="w-2.5 h-2.5 text-gray-200 absolute" />
          <div className="overflow-hidden w-[5px] absolute">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
          </div>
        </div>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`e${i}`} className="w-2.5 h-2.5 text-gray-200" />
      ))}
    </div>
  );
}

interface HotelStripProps {
  hotels: Hotel[];
  label: string;
  icon?: LucideIcon;
  isOpen: boolean;
  onClose: () => void;
  onHotelHover?: (id: string) => void;
  onHotelLeave?: () => void;
}

export function HotelStrip({ hotels, label, icon: Icon, isOpen, onClose, onHotelHover, onHotelLeave }: HotelStripProps) {
  const [closeHover, setCloseHover] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 z-30 backdrop-blur-sm border-t shadow-[0_-4px_20px_rgba(0,0,0,0.08)] rounded-t-xl"
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="w-3.5 h-3.5" style={{ color: 'var(--color-text-heading)' }} />}
              <span className="text-sm" style={{ color: 'var(--color-text-heading)' }}>{label}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-icon-bg)' }}>
                {hotels.length} result{hotels.length !== 1 ? "s" : ""}
              </span>
            </div>
            <button
              onClick={onClose}
              onMouseEnter={() => setCloseHover(true)}
              onMouseLeave={() => setCloseHover(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
              style={{
                color: closeHover ? 'var(--color-text-heading)' : 'var(--color-text-secondary)',
                backgroundColor: closeHover ? 'var(--color-icon-bg)' : 'transparent',
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Horizontal scrollable cards */}
          <div className="flex gap-3 px-4 pb-4 overflow-x-auto scrollbar-hide">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="w-[200px] min-w-[200px] rounded-xl border overflow-hidden transition-all cursor-pointer group"
                style={{
                  backgroundColor: 'var(--color-card-bg)',
                  borderColor: hoveredCard === hotel.id ? 'var(--color-card-border-hover, var(--color-card-border))' : 'var(--color-card-border)',
                  boxShadow: hoveredCard === hotel.id ? '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)' : 'none',
                }}
                onMouseEnter={() => { setHoveredCard(hotel.id); onHotelHover?.(hotel.id); }}
                onMouseLeave={() => { setHoveredCard(null); onHotelLeave?.(); }}
              >
                {/* Image */}
                <div className="relative h-[120px] overflow-hidden">
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {hotel.badges.length > 0 && (
                    <span className="absolute top-2 left-2 text-[9px] px-1.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200/50">
                      {hotel.badges[0]}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-2.5">
                  <p className="text-[12px] truncate" style={{ color: 'var(--color-text-heading)' }}>{hotel.name}</p>
                  <p className="text-[13px] mt-1" style={{ color: 'var(--color-text-heading)' }}>
                    ${hotel.price}
                    <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>/night</span>
                    {hotel.originalPrice && (
                      <span className="text-[10px] line-through ml-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                        ${hotel.originalPrice}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <StarRating rating={hotel.hotelRating} />
                    <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                      {hotel.guestRating}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5">
                    <MapPin className="w-2.5 h-2.5" style={{ color: 'var(--color-text-secondary)' }} />
                    <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                      {hotel.distance} · {hotel.driveTime}
                    </span>
                  </div>
                  {hotel.amenities.length > 0 && (
                    <p className="text-[10px] mt-1 truncate" style={{ color: 'var(--color-text-secondary)' }}>
                      {hotel.amenities
                        .map((a) =>
                          a === "breakfast"
                            ? "Breakfast"
                            : a === "wifi"
                            ? "WiFi"
                            : a === "parking"
                            ? "Parking"
                            : a === "pool"
                            ? "Pool"
                            : a
                        )
                        .join(" · ")}
                    </p>
                  )}
                </div>

                {/* CTA */}
                <div className="px-2.5 pb-2.5">
                  <button className="w-full flex items-center justify-center gap-1 py-1.5 text-[11px] text-brand hover:text-brand-hover border-t transition-colors" style={{ borderColor: 'var(--color-divider)' }}>
                    View Details
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}