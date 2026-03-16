"use client";

import { ChevronRight, UsersIcon, BedIcon, DoubleBedIcon, ClipboardIcon } from "./Icons";

interface RegistrationCardProps {
  teamInitials: string;
  teamName: string;
  division: string;
  classLabel: string;
  rank: string;
  status: string;
  players: number;
  reservations: number;
  roomBlocks: number;
  surveys: string;
}

function InfoChip({ icon: Icon, label, value }: { icon: React.ComponentType<{className?: string}>, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4 bg-brand-primary-ultra-light rounded-lg pl-2 pr-1 py-1">
      <div className="flex items-center gap-1">
        <Icon className="w-6 h-6 text-text-DEFAULT" />
        <span className="text-sm font-medium text-text-DEFAULT">{label}</span>
      </div>
      <div className="flex items-center">
        <span className="text-sm font-medium text-text-DEFAULT">{value}</span>
        <ChevronRight className="w-6 h-6 text-gray-400" />
      </div>
    </div>
  );
}

function RegistrationCard({ teamInitials, teamName, division, classLabel, rank, status, players, reservations, roomBlocks, surveys }: RegistrationCardProps) {
  return (
    <div className="bg-white border border-border-disabled rounded-lg shadow-card p-4">
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-lg bg-avatars-surface border border-border-subdued flex items-center justify-center flex-shrink-0">
            <span className="text-base font-medium text-black">{teamInitials}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-base font-medium text-text-DEFAULT">{teamName}</span>
              <div className="flex items-center gap-2">
                <span className="bg-surface-pressed text-xs font-medium px-1 py-0.5 rounded text-text-DEFAULT">{classLabel}</span>
                <span className="bg-ranks-platinum text-xs font-medium px-1 py-0.5 rounded text-text-DEFAULT">{rank}</span>
              </div>
            </div>
            <p className="text-sm text-text-DEFAULT">{division}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="bg-success-light text-xs px-2 py-0.5 rounded-full text-text-DEFAULT">{status}</span>
          <ChevronRight className="w-6 h-6 text-gray-400 hidden sm:block" />
        </div>
      </div>

      {/* Desktop Info Chips (horizontal) */}
      <div className="hidden md:flex flex-wrap gap-2 mt-4">
        <InfoChip icon={UsersIcon} label="Players" value={`${players}`} />
        <InfoChip icon={BedIcon} label="Reservations" value={`${reservations}`} />
        <InfoChip icon={DoubleBedIcon} label="Room Blocks" value={`${roomBlocks}`} />
        <InfoChip icon={ClipboardIcon} label="Surveys" value={surveys} />
      </div>

      {/* Mobile Info Chips (vertical list) */}
      <div className="md:hidden flex flex-col gap-2 mt-4">
        {[
          { icon: UsersIcon, label: "Players", value: `${players}` },
          { icon: BedIcon, label: "Reservations", value: `${reservations}` },
          { icon: DoubleBedIcon, label: "Room Blocks", value: `${roomBlocks}` },
          { icon: ClipboardIcon, label: "Surveys", value: surveys },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-1">
              <item.icon className="w-6 h-6 text-text-DEFAULT" />
              <span className="text-sm font-medium text-text-DEFAULT">{item.label}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-text-DEFAULT">{item.value}</span>
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Registrations() {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-medium text-black">Registrations</h2>
        <button className="text-sm text-brand-primary hover:underline">View all registrations</button>
      </div>
      <div className="flex flex-col gap-2">
        <RegistrationCard
          teamInitials="GB"
          teamName="Georgetown Bluedogs"
          division="U18 Spring Division A"
          classLabel="U18"
          rank="Platinum"
          status="Approved"
          players={12}
          reservations={11}
          roomBlocks={1}
          surveys="1/1"
        />
        <RegistrationCard
          teamInitials="PF"
          teamName="Prospects Fite"
          division="U18 Spring Division A"
          classLabel="U18"
          rank="Platinum"
          status="Approved"
          players={12}
          reservations={12}
          roomBlocks={0}
          surveys="22/22"
        />
      </div>
    </section>
  );
}
