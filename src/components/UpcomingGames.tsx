"use client";

interface GameProps {
  name: string;
  dateTime: string;
  homeTeam: { name: string; initials: string; hasLogo?: boolean; logoUrl?: string };
  awayTeam: { name: string; initials: string; hasLogo?: boolean; logoUrl?: string };
  venue: string;
  field: string;
  address: string;
}

function TeamAvatar({ team }: { team: GameProps["homeTeam"] }) {
  if (team.hasLogo && team.logoUrl) {
    return (
      <div className="w-12 h-12 rounded border border-border-subdued overflow-hidden bg-white">
        <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain" />
      </div>
    );
  }
  return (
    <div className="w-12 h-12 rounded-lg bg-avatars-surface border border-border-subdued flex items-center justify-center">
      <span className="text-base font-medium">{team.initials}</span>
    </div>
  );
}

function GameCard({ name, dateTime, homeTeam, awayTeam, venue, field, address }: GameProps) {
  return (
    <div className="border-b border-border-subdued last:border-b-0 py-6">
      <div className="text-center">
        <p className="text-sm font-medium text-text-DEFAULT">{name}</p>
        <p className="text-xs font-medium text-text-DEFAULT">{dateTime}</p>
      </div>
      <div className="flex items-start justify-center py-2 gap-0 mt-2">
        <div className="flex flex-col items-center flex-1 gap-2">
          <TeamAvatar team={homeTeam} />
          <p className="text-sm font-medium text-text-DEFAULT text-center">{homeTeam.name}</p>
        </div>
        <div className="flex flex-col items-center justify-center pt-2">
          <span className="text-base font-bold text-text-dark-subdued">VS</span>
        </div>
        <div className="flex flex-col items-center flex-1 gap-2">
          <TeamAvatar team={awayTeam} />
          <p className="text-sm font-medium text-text-DEFAULT text-center">{awayTeam.name}</p>
        </div>
      </div>
      <div className="text-center mt-2">
        <p className="text-xs font-medium text-text-DEFAULT">{venue} &bull; {field}</p>
        <p className="text-xs text-text-DEFAULT">{address}</p>
      </div>
    </div>
  );
}

export default function UpcomingGames() {
  const games: GameProps[] = [
    {
      name: "Game Name",
      dateTime: "Fri, Mar 31, 2025 @ 10:00 AM",
      homeTeam: { name: "Georgetown Bluedogs", initials: "GB" },
      awayTeam: { name: "Yellow Tigers", initials: "YT", hasLogo: true, logoUrl: "https://www.figma.com/api/mcp/asset/64d76d1d-d2d3-42d1-8704-58d992cbc383" },
      venue: "Ballparks of America",
      field: "Field #1",
      address: "99 Dundas St • Branson, Missouri",
    },
    {
      name: "Game Name",
      dateTime: "Fri, Mar 31, 2025 @ 2:00 PM",
      homeTeam: { name: "Orange Boys", initials: "OB", hasLogo: true, logoUrl: "https://www.figma.com/api/mcp/asset/9b3bd79a-a99f-4f95-9a11-6a3fe9980708" },
      awayTeam: { name: "Georgetown Bluedogs", initials: "GB" },
      venue: "Ballparks of America",
      field: "Field #2",
      address: "99 Dundas St • Branson, Missouri",
    },
  ];

  return (
    <div className="bg-white border border-border-DEFAULT rounded-lg overflow-hidden">
      <div className="border-b border-border-DEFAULT p-4">
        <h3 className="text-base font-medium text-black">Upcoming Games</h3>
      </div>
      <div className="px-4">
        {games.map((game, i) => (
          <GameCard key={i} {...game} />
        ))}
      </div>
      <div className="border-t border-border-DEFAULT">
        <button className="w-full py-4 text-sm font-medium text-brand-primary text-center hover:bg-gray-50">
          Go to Schedule
        </button>
      </div>
    </div>
  );
}
