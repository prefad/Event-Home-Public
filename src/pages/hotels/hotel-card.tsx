import { useState } from "react";
import {
  Star,
  MapPin,
  Car,
  Coffee,
  Wifi,
  ParkingCircle,
  Waves,
  AlertCircle,
  Trophy,
  Heart,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { Hotel } from "./hotel-data";
import { ImageWithFallback } from "./ImageWithFallback";

const amenityIcons: Record<string, { icon: React.ElementType; label: string }> = {
  breakfast: { icon: Coffee, label: "Breakfast" },
  wifi: { icon: Wifi, label: "WiFi" },
  parking: { icon: ParkingCircle, label: "Parking" },
  pool: { icon: Waves, label: "Pool" },
};

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < fullStars
              ? "fill-amber-400 text-amber-400"
              : i === fullStars && hasHalf
              ? "fill-amber-400/50 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export function HotelCard({
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
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{
        backgroundColor: 'var(--color-card-bg)',
        ...((!isActive && !hotel.isHostHotel) ? { borderColor: 'var(--color-card-border)' } : {}),
      }}
      className={`group relative rounded-[10px] cursor-pointer transition-all duration-200 ${
        isActive
          ? "ring-2 ring-brand shadow-lg shadow-brand/10"
          : hotel.isHostHotel
          ? "ring-2 ring-purple-500"
          : "border hover:shadow-lg hover:border-gray-300"
      }`}
    >
      {/* Host Hotel Bar */}
      {hotel.isHostHotel && (
        <div className="flex items-center gap-1.5 bg-purple-600 text-white px-4 py-2 rounded-t-[10px]">
          <Trophy className="w-3.5 h-3.5" />
          <span className="text-[11px] tracking-wide uppercase">Host Hotel</span>
        </div>
      )}

      {/* ===== DESKTOP: three-column horizontal layout (md+) ===== */}
      <div className="hidden md:flex p-3 gap-3">
        {/* Image */}
        <div className="relative w-[130px] h-[130px] rounded-lg overflow-hidden shrink-0">
          <ImageWithFallback
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLiked(!liked);
            }}
            style={{ backgroundColor: 'var(--color-card-bg)', opacity: 0.8 }}
            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full backdrop-blur-sm hover:opacity-100 transition-colors"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                liked ? "fill-red-500 text-red-500" : ""
              }`}
              {...(!liked ? { style: { color: 'var(--color-text-primary)' } } : {})}
            />
          </button>
        </div>

        {/* Content — middle section */}
        <div className="flex-1 min-w-0 flex flex-col justify-between overflow-hidden">
          <div>
            <h3 className="text-[15px] truncate pr-1" style={{ color: 'var(--color-text-heading)' }}>
              {hotel.name}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{hotel.location}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <StarRating rating={hotel.hotelRating} />
              <div
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] ${
                  hotel.guestRating >= 9
                    ? "bg-emerald-50 text-emerald-700"
                    : hotel.guestRating >= 8
                    ? "bg-blue-50 text-blue-700"
                    : ""
                }`}
                {...(hotel.guestRating < 8 ? { style: { backgroundColor: 'var(--color-icon-bg)', color: 'var(--color-text-secondary)' } } : {})}
              >
                <span>{hotel.guestRating}</span>
              </div>
              {hotel.isStaffOnly && (
                <div className="flex items-center gap-1 text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                  <Shield className="w-3 h-3" />
                  Staff Only
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                {hotel.amenities.map((a) => {
                  const config = amenityIcons[a];
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
              <span style={{ color: 'var(--color-divider)' }}>|</span>
              <span className="flex items-center gap-0.5 text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                <MapPin className="w-3 h-3 text-orange-500" />
                {hotel.distance}
              </span>
              <span className="flex items-center gap-0.5 text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="mr-1" style={{ color: 'var(--color-divider)' }}>|</span>
                <Car className="w-3 h-3" />
                {hotel.driveTime}
              </span>
            </div>
          </div>
          {hotel.roomsLeft && hotel.roomsLeft <= 10 && (
            <span className="flex items-center gap-0.5 text-[10px] text-red-500 mt-2">
              <AlertCircle className="w-3 h-3" />
              {hotel.roomsLeft} rooms left
            </span>
          )}
        </div>

        {/* Price column — right side with divider */}
        <div className="border-l pl-3 shrink-0 flex flex-col items-end justify-end w-[110px]" style={{ borderColor: 'var(--color-divider)' }}>
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
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="w-full px-3 py-2 rounded-[6px] text-xs text-center transition-all bg-brand hover:bg-brand-hover text-white mb-0.5"
          >
            View Hotel
          </button>
        </div>
      </div>

      {/* ===== MOBILE: vertical stacked layout (<md) ===== */}
      <div className="flex flex-col md:hidden">
        {/* Image — full width */}
        <div className={`relative w-full h-[180px] overflow-hidden ${hotel.isHostHotel ? "" : "rounded-t-[10px]"}`}>
          <ImageWithFallback
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLiked(!liked);
            }}
            style={{ backgroundColor: 'var(--color-card-bg)', opacity: 0.8 }}
            className="absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm hover:opacity-100 transition-colors"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                liked ? "fill-red-500 text-red-500" : ""
              }`}
              {...(!liked ? { style: { color: 'var(--color-text-primary)' } } : {})}
            />
          </button>
        </div>

        {/* Content below image */}
        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-base truncate" style={{ color: 'var(--color-text-heading)' }}>
                {hotel.name}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{hotel.location}</p>
            </div>
          </div>

          {/* Ratings */}
          <div className="flex items-center gap-2 mt-2">
            <StarRating rating={hotel.hotelRating} />
            <div
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] ${
                hotel.guestRating >= 9
                  ? "bg-emerald-50 text-emerald-700"
                  : hotel.guestRating >= 8
                  ? "bg-blue-50 text-blue-700"
                  : ""
              }`}
              {...(hotel.guestRating < 8 ? { style: { backgroundColor: 'var(--color-icon-bg)', color: 'var(--color-text-secondary)' } } : {})}
            >
              <span>{hotel.guestRating}</span>
            </div>
            {hotel.isStaffOnly && (
              <div className="flex items-center gap-1 text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                <Shield className="w-3 h-3" />
                Staff Only
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="flex items-center gap-2 mt-2.5">
            <div className="flex items-center gap-1">
              {hotel.amenities.map((a) => {
                const config = amenityIcons[a];
                if (!config) return null;
                const Icon = config.icon;
                return (
                  <div
                    key={a}
                    className="w-6 h-6 flex items-center justify-center rounded"
                    style={{ backgroundColor: 'var(--color-icon-bg)', color: 'var(--color-text-secondary)' }}
                    title={config.label}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                );
              })}
            </div>
            <span style={{ color: 'var(--color-divider)' }}>|</span>
            <span className="flex items-center gap-0.5 text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
              <MapPin className="w-3 h-3 text-orange-500" />
              {hotel.distance}
            </span>
          </div>

          {/* Bottom row: price + CTA */}
          <div className="flex items-end justify-between mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-divider)' }}>
            <div>
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
                <span className="text-[10px] line-through block" style={{ color: 'var(--color-text-secondary)' }}>
                  ${hotel.originalPrice}
                </span>
              )}
              <span className="text-xl font-medium" style={{ color: 'var(--color-text-heading)' }}>${hotel.price}</span>
              <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Average rate</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="px-5 py-2.5 rounded-[6px] text-xs text-center transition-all bg-brand hover:bg-brand-hover text-white"
            >
              View Hotel
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}