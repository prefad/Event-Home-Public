export interface EventData {
  title: string;
  associationName: string;
  owner: string;
  date: string;
  location: { venue: string; address: string };
  paymentOptions: string[];
  paymentPlans: string[];
  details: { welcome: string; goal: string; whatsNext: string };
  rulesAndRegulations: string;
  paymentInfo: string;
  accommodations: string;
  sponsors: Sponsor[];
}

export interface Sponsor { name: string; logo: string }
export interface DivisionGroup { sport: string; gender: string; divisionCount: number; divisions: Division[] }
export interface Division { name: string; tiers: Tier[] }
export interface Tier { name: string; deadline: string; price: string; badges: Badge[]; spotsLeft?: number }
export interface Badge { label: string; variant: 'early-bird' | 'players-only' | 'spots-left' | 'waitlist' | 'closing-soon' | 'sold-out' }

export const eventData: EventData = {
  title: "Presidents Day on the Beach",
  associationName: "Weekend Hockey",
  owner: "Weekend Hockey Events",
  date: "February 13th – 16th, 2026",
  location: { venue: "Florida Panthers IceDen", address: "3299 Sportsplex Dr, Coral Springs, FL 33065" },
  paymentOptions: ["Credit Card", "E-Transfer", "Check"],
  paymentPlans: ["Deposit", "Instalments", "Pay Later"],
  details: {
    welcome: "Welcome to Presidents Day on the Beach 2026! Join us in sunny Fort Lauderdale for one of the premier youth hockey tournaments of the season. This Presidents Day Weekend event brings together teams from across North America for an unforgettable tournament experience — competitive hockey during the day, and the warmth of South Florida when you're off the ice. Whether your team is AAA, AA, A, or B level, there's a division for you.",
    goal: "Our goal is to deliver an outstanding tournament experience for players, coaches, and families alike. We're committed to providing top-tier ice facilities, professional officiating, and a well-organized event from start to finish. Beyond the rink, we want families to enjoy everything Fort Lauderdale has to offer — from the beach to world-class dining and attractions. Hockey should be fun, and a weekend in South Florida makes it even better.",
    whatsNext: "Once registered, teams will receive a confirmation email with tournament details including schedule release timelines, hotel accommodation partners, and local area guides. Game schedules are typically released 7–10 days before the tournament. All games will be played at state-of-the-art ice facilities in the greater Fort Lauderdale area. Teams are guaranteed a minimum of 4 games. Champions in each division will receive custom championship banners and individual player awards.",
  },
  rulesAndRegulations: "All games will be played under USA Hockey rules with the following tournament-specific modifications:\n\n1. All players must have a valid USA Hockey or Hockey Canada registration for the 2025–2026 season. Proof of registration is required at check-in.\n2. Teams must submit official rosters no later than 7 days prior to the tournament start date. Roster changes after submission require tournament director approval.\n3. Game format: Three 15-minute stop-time periods for all age groups. 8U divisions play 12-minute periods with modified ice.\n4. Tie-breaking procedure during round-robin play: Head-to-head record, goal differential (max +/- 5 per game), goals against, goals for.\n5. All players must wear full equipment including neck guards. Referees have the authority to remove any player not properly equipped.",
  paymentInfo: "Full team registration fees are due at the time of registration. A 50% deposit option is available — the remaining balance must be paid no later than January 15, 2026. Refund policy: Full refund (less $50 processing fee) if cancelled before December 1, 2025. 50% refund if cancelled before January 1, 2026. No refunds after January 1, 2026. All payments are processed securely through our registration portal.",
  accommodations: "We have partnered with Stay to Play Sports to offer discounted hotel rates for all participating teams. Fort Lauderdale offers a wide range of accommodations from beachfront resorts to family-friendly hotels near the rink facilities. Teams are encouraged to book early as Presidents Day Weekend is a popular travel period in South Florida. Our hotel partners include properties in Fort Lauderdale Beach, Coral Springs, and Sunrise — all within a short drive of our tournament venues. Shuttle service is available from select partner hotels.",
  sponsors: [{ name: "Weekend Hockey", logo: "WH" }, { name: "USA Hockey", logo: "USAH" }, { name: "FL Panthers", logo: "FLA" }],
};

export const divisionGroups: DivisionGroup[] = [
  {
    sport: "Ice Hockey", gender: "Boys", divisionCount: 14,
    divisions: [
      { name: "8U Boys AA", tiers: [
        { name: "Early Bird", deadline: "Open Until: Nov 30, 2025 at 11:59pm EST", price: "$1,295.00 USD", badges: [{ label: "Early Bird", variant: "early-bird" }] },
        { name: "General", deadline: "Open Until: Jan 31, 2026 at 11:59pm EST", price: "$1,495.00 USD", badges: [] },
      ]},
      { name: "10U Boys AAA", tiers: [
        { name: "Early Bird", deadline: "Open Until: Nov 30, 2025 at 11:59pm EST", price: "$1,595.00 USD", badges: [{ label: "Early Bird", variant: "early-bird" }] },
        { name: "General", deadline: "Open Until: Jan 31, 2026 at 11:59pm EST", price: "$1,795.00 USD", badges: [] },
      ]},
      { name: "10U Boys AA", tiers: [
        { name: "Early Bird", deadline: "Open Until: Nov 30, 2025 at 11:59pm EST", price: "$1,395.00 USD", badges: [{ label: "Early Bird", variant: "early-bird" }] },
        { name: "General", deadline: "Open Until: Jan 31, 2026 at 11:59pm EST", price: "$1,595.00 USD", badges: [] },
      ]},
      { name: "10U Boys A/B", tiers: [
        { name: "General", deadline: "Open Until: Jan 31, 2026 at 11:59pm EST", price: "$1,295.00 USD", badges: [], spotsLeft: 3 },
      ]},
      { name: "12U Boys AAA", tiers: [
        { name: "Early Bird", deadline: "Open Until: Nov 30, 2025 at 11:59pm EST", price: "$1,695.00 USD", badges: [{ label: "Early Bird", variant: "early-bird" }] },
        { name: "General", deadline: "Open Until: Jan 31, 2026 at 11:59pm EST", price: "$1,895.00 USD", badges: [] },
      ]},
      { name: "12U Boys AA", tiers: [
        { name: "General", deadline: "Open Until: Jan 31, 2026 at 11:59pm EST", price: "$1,595.00 USD", badges: [] },
      ]},
      { name: "12U Boys A/B", tiers: [
        { name: "General", deadline: "Open Until: Jan 31, 2026 at 11:59pm EST", price: "$1,395.00 USD", badges: [{ label: "Closing Soon", variant: "closing-soon" }] },
      ]},
      { name: "14U Boys AAA", tiers: [
        { name: "General", deadline: "Open Until: Jan 31, 2026 at 11:59pm EST", price: "$1,895.00 USD", badges: [] },
      ]},
      { name: "14U Boys AA", tiers: [
        { name: "General", deadline: "Open Until: Jan 31, 2026 at 11:59pm EST", price: "$1,695.00 USD", badges: [{ label: "Waitlist", variant: "waitlist" }] },
      ]},
      { name: "14U Boys A/B", tiers: [
        { name: "General", deadline: "Open Until: Jan 31, 2026 at 11:59pm EST", price: "$1,495.00 USD", badges: [] },
      ]},
      { name: "16U Boys AAA", tiers: [
        { name: "General", deadline: "Open Until: Jan 31, 2026 at 11:59pm EST", price: "$1,995.00 USD", badges: [], spotsLeft: 2 },
      ]},
      { name: "16U Boys AA", tiers: [
        { name: "General", deadline: "Open Until: Jan 31, 2026 at 11:59pm EST", price: "$1,795.00 USD", badges: [] },
      ]},
      { name: "18U Boys AAA", tiers: [
        { name: "General", deadline: "Open Until: Jan 31, 2026 at 11:59pm EST", price: "$1,995.00 USD", badges: [] },
      ]},
      { name: "18U Boys AA", tiers: [
        { name: "General", deadline: "Open Until: Jan 31, 2026 at 11:59pm EST", price: "$1,795.00 USD", badges: [], spotsLeft: 1 },
      ]},
    ],
  },
  {
    sport: "Ice Hockey", gender: "Girls", divisionCount: 8,
    divisions: [
      { name: "10U Girls AA", tiers: [
        { name: "Early Bird", deadline: "Open Until: Nov 30, 2025 at 11:59pm EST", price: "$1,395.00 USD", badges: [{ label: "Early Bird", variant: "early-bird" }] },
        { name: "General", deadline: "Open Until: Jan 31, 2026 at 11:59pm EST", price: "$1,595.00 USD", badges: [] },
      ]},
      { name: "10U Girls A/B", tiers: [
        { name: "General", deadline: "Open Until: Jan 31, 2026 at 11:59pm EST", price: "$1,295.00 USD", badges: [] },
      ]},
      { name: "12U Girls AAA", tiers: [
        { name: "Early Bird", deadline: "Open Until: Nov 30, 2025 at 11:59pm EST", price: "$1,695.00 USD", badges: [{ label: "Early Bird", variant: "early-bird" }] },
        { name: "General", deadline: "Open Until: Jan 31, 2026 at 11:59pm EST", price: "$1,895.00 USD", badges: [] },
      ]},
      { name: "12U Girls AA", tiers: [
        { name: "General", deadline: "Open Until: Jan 31, 2026 at 11:59pm EST", price: "$1,595.00 USD", badges: [], spotsLeft: 3 },
      ]},
      { name: "14U Girls AAA", tiers: [
        { name: "General", deadline: "Open Until: Jan 31, 2026 at 11:59pm EST", price: "$1,895.00 USD", badges: [{ label: "Closing Soon", variant: "closing-soon" }] },
      ]},
      { name: "14U Girls AA", tiers: [
        { name: "General", deadline: "Open Until: Jan 31, 2026 at 11:59pm EST", price: "$1,695.00 USD", badges: [] },
      ]},
      { name: "16U Girls AA", tiers: [
        { name: "General", deadline: "Open Until: Jan 31, 2026 at 11:59pm EST", price: "$1,795.00 USD", badges: [{ label: "Waitlist", variant: "waitlist" }] },
      ]},
      { name: "18U Girls AA", tiers: [
        { name: "General", deadline: "Open Until: Jan 31, 2026 at 11:59pm EST", price: "$1,795.00 USD", badges: [] },
      ]},
    ],
  },
];
