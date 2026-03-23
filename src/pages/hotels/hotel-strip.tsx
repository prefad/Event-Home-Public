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
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] rounded-t-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="w-3.5 h-3.5 text-gray-900" />}
              <span className="text-sm text-gray-900">{label}</span>
              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                {hotels.length} result{hotels.length !== 1 ? "s" : ""}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Horizontal scrollable cards */}
          <div className="flex gap-3 px-4 pb-4 overflow-x-auto scrollbar-hide">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="w-[200px] min-w-[200px] bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer group"
                onMouseEnter={() => onHotelHover?.(hotel.id)}
                onMouseLeave={() => onHotelLeave?.()}
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
                  <p className="text-[12px] text-gray-900 truncate">{hotel.name}</p>
                  <p className="text-[13px] text-gray-900 mt-1">
                    ${hotel.price}
                    <span className="text-[10px] text-gray-400">/night</span>
                    {hotel.originalPrice && (
                      <span className="text-[10px] text-gray-400 line-through ml-1.5">
                        ${hotel.originalPrice}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <StarRating rating={hotel.hotelRating} />
                    <span className="text-[10px] text-gray-500">
                      {hotel.guestRating}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5">
                    <MapPin className="w-2.5 h-2.5 text-gray-400" />
                    <span className="text-[10px] text-gray-400">
                      {hotel.distance} · {hotel.driveTime}
                    </span>
                  </div>
                  {hotel.amenities.length > 0 && (
                    <p className="text-[10px] text-gray-400 mt-1 truncate">
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
                  <button className="w-full flex items-center justify-center gap-1 py-1.5 text-[11px] text-brand hover:text-brand-hover border-t border-gray-100 transition-colors">
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