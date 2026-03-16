"use client";

import { ChevronRight, LocationIcon, PhoneIcon } from "./Icons";

function ReservationCard() {
  return (
    <div className="border border-border-disabled rounded-lg p-3 flex items-center gap-3">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-md bg-gray-200 overflow-hidden flex-shrink-0">
        <img
          src="https://www.figma.com/api/mcp/asset/0fc175e7-aaf0-48d7-8292-7b54fc047b39"
          alt="Hotel Room"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-text-subdued">Reserved for C. Wilson</p>
            <p className="text-sm font-medium text-text-DEFAULT">2 Queen Beds – Non Smoking</p>
          </div>
          <span className="bg-success-light text-xs px-2 py-0.5 rounded-full text-text-DEFAULT flex-shrink-0">Confirmed</span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-text-subdued">
          <span>Check in/Out Dates</span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-sm font-medium">Fri, Mar 30</span>
          <span className="text-gray-400">→</span>
          <span className="text-sm font-medium">Tue, Apr 3</span>
          <span className="text-xs text-text-subdued ml-2 hidden sm:inline">#92871349</span>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 hidden sm:block flex-shrink-0" />
    </div>
  );
}

function HotelPill({ label, color = "orange" }: { label: string; color?: string }) {
  const colorMap: Record<string, string> = {
    orange: "bg-orange-500 text-white",
    green: "bg-green-100 text-green-800",
    blue: "bg-blue-100 text-blue-800",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${colorMap[color] || colorMap.blue}`}>
      {label}
    </span>
  );
}

function RoomBlockRow({ name, blockName, expiry, roomsLeft }: { name: string; blockName: string; expiry: string; roomsLeft: string }) {
  return (
    <div className="border border-border-disabled rounded-lg p-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-DEFAULT">{name}</p>
          <p className="text-xs text-text-subdued mt-0.5">{blockName}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-xs text-red-600 font-medium">{expiry}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-3">
          <p className="text-xs text-red-600">{roomsLeft}</p>
          <button className="mt-1 bg-brand-primary text-white text-sm font-medium px-4 py-1.5 rounded hover:bg-blue-700">
            Book Rooms
          </button>
        </div>
      </div>
    </div>
  );
}

function ReservationSummaryRow({ initials, count, label, teamName }: { initials: string; count: string; label: string; teamName: string }) {
  return (
    <div className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
      <div className="w-6 h-6 rounded bg-avatars-surface flex items-center justify-center flex-shrink-0">
        <span className="text-[9px] font-bold">{initials}</span>
      </div>
      <div className="flex items-center gap-1 ml-3 flex-1 min-w-0">
        <span className="text-sm font-medium">{count} {label}</span>
        <span className="text-xs text-text-subdued">by {teamName}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
    </div>
  );
}

function HotelCard({ name, address, phone, pills, roomBlocks, reservations, hasDatePicker = false }: {
  name: string;
  address: string;
  phone: string;
  pills: { label: string; color: string }[];
  roomBlocks?: { name: string; blockName: string; expiry: string; roomsLeft: string }[];
  reservations?: { initials: string; count: string; label: string; teamName: string }[];
  hasDatePicker?: boolean;
}) {
  return (
    <div className="border border-border-disabled rounded-lg overflow-hidden bg-white">
      <div className="p-4">
        <div className="flex gap-3">
          <div className="w-20 h-20 rounded-md bg-gray-200 overflow-hidden flex-shrink-0">
            <img
              src="https://www.figma.com/api/mcp/asset/0fc175e7-aaf0-48d7-8292-7b54fc047b39"
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-base font-medium text-text-DEFAULT">{name}</h4>
            <div className="flex items-center gap-1 mt-1">
              <LocationIcon className="w-4 h-4 text-text-subdued flex-shrink-0" />
              <span className="text-sm text-brand-primary truncate">{address}</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <PhoneIcon className="w-4 h-4 text-text-subdued flex-shrink-0" />
              <span className="text-sm text-brand-primary">{phone}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {pills.map((pill, i) => (
            <HotelPill key={i} label={pill.label} color={pill.color} />
          ))}
        </div>
      </div>

      {roomBlocks && roomBlocks.length > 0 && (
        <div className="px-4 pb-3 flex flex-col gap-2">
          {roomBlocks.map((block, i) => (
            <RoomBlockRow key={i} {...block} />
          ))}
        </div>
      )}

      {hasDatePicker && (
        <div className="px-4 pb-3">
          <p className="text-sm font-medium mb-2">Browse available rooms</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 border border-border-subdued rounded px-3 py-2">
              <p className="text-xs text-text-subdued">Check-in Date</p>
              <p className="text-sm font-medium">Mar 30, 2025</p>
            </div>
            <div className="flex-1 border border-border-subdued rounded px-3 py-2">
              <p className="text-xs text-text-subdued">Check-out Date</p>
              <p className="text-sm font-medium">Mar 30, 2025</p>
            </div>
            <button className="bg-brand-primary text-white text-sm font-medium px-4 py-2 rounded hover:bg-blue-700 whitespace-nowrap">
              View Available Rooms
            </button>
          </div>
        </div>
      )}

      {reservations && reservations.length > 0 && (
        <div className="border-t border-border-disabled">
          {reservations.map((res, i) => (
            <ReservationSummaryRow key={i} {...res} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TeamHotels() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium text-text-DEFAULT">Your Team Hotels</h2>
        <button className="text-sm text-brand-primary hover:underline">View all</button>
      </div>

      {/* My Reservations */}
      <div className="mb-6">
        <h3 className="text-base font-medium mb-3">My Reservations</h3>
        <ReservationCard />
      </div>

      {/* Room Blocks */}
      <div className="mb-4">
        <h3 className="text-base font-medium mb-3">Room Blocks</h3>
      </div>

      <div className="flex flex-col gap-4">
        <HotelCard
          name="Sheraton Hamilton Hotel"
          address="116 King St W, Hamilton, Ontario, L8P4V3"
          phone="(905) 529-5515"
          pills={[
            { label: "Recommended", color: "orange" },
            { label: "Rooms Available", color: "green" },
            { label: "$94 Savings", color: "green" },
            { label: "Close to venue", color: "green" },
          ]}
          roomBlocks={[
            { name: "Room, 2 Queen Beds, Non Smoking", blockName: "Georgetown Bluedogs's block", expiry: "Expires in 6 days • Mon, Dec 22 @ 7:00 PM", roomsLeft: "1 room(s) left!" },
            { name: "Room, 1 King Bed, Non Smoking", blockName: "Georgetown Bluedogs's block 2", expiry: "Expires in 6 days • Mon, Dec 22 @ 7:00 PM", roomsLeft: "1 room(s) left!" },
          ]}
          reservations={[
            { initials: "GB", count: "10", label: "reservations", teamName: "Georgetown Bluedogs" },
          ]}
        />

        <HotelCard
          name="Holiday Inn Burlington Hotel & Conference Centre, an IHG Hotel"
          address="116 King St W, Hamilton, Ontario, L8P4V3"
          phone="(905) 529-5515"
          pills={[
            { label: "Close to venue", color: "green" },
            { label: "$29 Savings", color: "green" },
          ]}
          hasDatePicker
          reservations={[
            { initials: "PF", count: "1", label: "room block previously held", teamName: "Prospects Fite" },
            { initials: "GB", count: "1", label: "reservation", teamName: "Georgetown Bluedogs" },
            { initials: "PF", count: "12", label: "reservations", teamName: "Prospects Fite" },
          ]}
        />
      </div>
    </section>
  );
}
