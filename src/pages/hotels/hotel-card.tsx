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
  MessageCircle,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@eventconnect/dec";
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
  onDiscuss,
}: {
  hotel: Hotel;
  isActive: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
  /** Open the Booking Assistant scoped to this hotel. */
  onDiscuss?: (hotel: Hotel) => void;
}) {
  return (
    <motion.div
      layout
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={onClick}
      style={{
        backgroundColor: 'var(--color-card-bg)',
        borderColor: isActive ? (hotel.isHostHotel ? '#a855f7' : 'var(--color-action)') : 'var(--color-card-border)',
      }}
      className="group relative border rounded-[10px] cursor-pointer transition-all duration-200"
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.borderColor = hotel.isHostHotel ? '#a855f7' : 'var(--color-action)';
        onHover?.();
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.borderColor = 'var(--color-card-border)';
        onLeave?.();
      }}
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
              onDiscuss?.(hotel);
            }}
            style={{
              backgroundColor: 'var(--color-card-bg)',
              opacity: 0.8,
              transition: 'background-color 180ms ease, opacity 180ms ease, transform 180ms ease',
            }}
            className="group/discuss absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full backdrop-blur-sm"
            title="Discuss this hotel with Booking Assistant"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-action)';
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-card-bg)';
              e.currentTarget.style.opacity = '0.8';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <MessageCircle
              className="w-3.5 h-3.5 transition-colors text-[color:var(--color-text-primary)] group-hover/discuss:!text-white"
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
          </div>
          <Button
            onClick={(e) => e.stopPropagation()}
            variant="destructive"
            size="sm"
            className="w-full mb-0.5"
          >
            View Hotel
          </Button>
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
              onDiscuss?.(hotel);
            }}
            style={{
              backgroundColor: 'var(--color-card-bg)',
              opacity: 0.8,
              transition: 'background-color 180ms ease, opacity 180ms ease, transform 180ms ease',
            }}
            className="group/discuss absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm"
            title="Discuss this hotel with Booking Assistant"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-action)';
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-card-bg)';
              e.currentTarget.style.opacity = '0.8';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <MessageCircle
              className="w-4 h-4 transition-colors text-[color:var(--color-text-primary)] group-hover/discuss:!text-white"
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
                <span className="text-[10px] line-through block" style={{ color: 'var(--color-text-secondary)' }}>
                  ${hotel.originalPrice}
                </span>
              )}
              <span className="text-xl font-medium" style={{ color: 'var(--color-text-heading)' }}>${hotel.price}</span>
              <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Average rate</p>
            </div>
            <Button
              onClick={(e) => e.stopPropagation()}
              variant="destructive"
              size="sm"
            >
              View Hotel
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}