import type { EventData, DivisionGroup } from './eventData';

export const previewEventData: EventData = {
  title: "Sample Tournament 2026",
  associationName: "Organization Name",
  owner: "Organization Events",
  date: "March 20th – 22nd, 2026",
  location: { venue: "Example Sports Arena", address: "123 Main Street, Anytown, USA 12345" },
  paymentOptions: ["Credit Card", "E-Transfer", "Check"],
  paymentPlans: ["Deposit", "Instalments", "Pay Later"],
  details: {
    welcome: "Welcome to Sample Tournament 2026! Join us for one of the premier youth tournaments of the season. This event brings together teams from across the region for an exciting tournament experience. Whether your team is competitive or recreational, there's a division for everyone. We look forward to seeing you there.",
    goal: "Our goal is to deliver an outstanding tournament experience for players, coaches, and families alike. We're committed to providing excellent facilities, professional officiating, and a well-organized event from start to finish. Beyond the competition, we want families to enjoy everything the local area has to offer.",
    whatsNext: "Once registered, teams will receive a confirmation email with tournament details including schedule release timelines, accommodation partners, and local area guides. Game schedules are typically released 7–10 days before the tournament. Teams are guaranteed a minimum of 4 games. Champions in each division will receive awards and recognition.",
  },
  rulesAndRegulations: "All games will be played under standard rules with the following tournament-specific modifications:\n\n1. All players must have a valid registration for the current season. Proof of registration is required at check-in.\n2. Teams must submit official rosters no later than 7 days prior to the tournament start date.\n3. Game format: Three 15-minute stop-time periods for all age groups.\n4. Tie-breaking procedure: Head-to-head record, goal differential, goals against, goals for.\n5. All players must wear full equipment. Referees have the authority to remove any player not properly equipped.",
  paymentInfo: "Full team registration fees are due at the time of registration. A 50% deposit option is available — the remaining balance must be paid no later than 30 days before the event. Refund policy: Full refund (less processing fee) if cancelled before 60 days out. 50% refund if cancelled before 30 days out. No refunds within 30 days of the event. All payments are processed securely through our registration portal.",
  accommodations: "We have partnered with local hotels to offer discounted rates for all participating teams. A wide range of accommodations are available from full-service hotels to family-friendly options near the venue. Teams are encouraged to book early as rooms fill up quickly. Shuttle service is available from select partner hotels.",
  sponsors: [{ name: "Sponsor A", logo: "SA" }, { name: "Sponsor B", logo: "SB" }, { name: "Sponsor C", logo: "SC" }],
};

export const previewDivisionGroups: DivisionGroup[] = [
  {
    sport: "Sport", gender: "Division A", divisionCount: 6,
    divisions: [
      { name: "8U Tier 1", tiers: [
        { name: "Early Bird", deadline: "Open Until: Dec 31, 2025 at 11:59pm", price: "$495.00 USD", badges: [{ label: "Early Bird", variant: "early-bird" }] },
        { name: "General", deadline: "Open Until: Feb 28, 2026 at 11:59pm", price: "$595.00 USD", badges: [] },
      ]},
      { name: "10U Tier 1", tiers: [
        { name: "Early Bird", deadline: "Open Until: Dec 31, 2025 at 11:59pm", price: "$595.00 USD", badges: [{ label: "Early Bird", variant: "early-bird" }] },
        { name: "General", deadline: "Open Until: Feb 28, 2026 at 11:59pm", price: "$695.00 USD", badges: [] },
      ]},
      { name: "10U Tier 2", tiers: [
        { name: "General", deadline: "Open Until: Feb 28, 2026 at 11:59pm", price: "$495.00 USD", badges: [], spotsLeft: 3 },
      ]},
      { name: "12U Tier 1", tiers: [
        { name: "Early Bird", deadline: "Open Until: Dec 31, 2025 at 11:59pm", price: "$695.00 USD", badges: [{ label: "Early Bird", variant: "early-bird" }] },
        { name: "General", deadline: "Open Until: Feb 28, 2026 at 11:59pm", price: "$795.00 USD", badges: [] },
      ]},
      { name: "12U Tier 2", tiers: [
        { name: "General", deadline: "Open Until: Feb 28, 2026 at 11:59pm", price: "$595.00 USD", badges: [{ label: "Closing Soon", variant: "closing-soon" }] },
      ]},
      { name: "14U Tier 1", tiers: [
        { name: "General", deadline: "Open Until: Feb 28, 2026 at 11:59pm", price: "$795.00 USD", badges: [{ label: "Waitlist", variant: "waitlist" }] },
      ]},
    ],
  },
  {
    sport: "Sport", gender: "Division B", divisionCount: 4,
    divisions: [
      { name: "10U Open", tiers: [
        { name: "Early Bird", deadline: "Open Until: Dec 31, 2025 at 11:59pm", price: "$495.00 USD", badges: [{ label: "Early Bird", variant: "early-bird" }] },
        { name: "General", deadline: "Open Until: Feb 28, 2026 at 11:59pm", price: "$595.00 USD", badges: [] },
      ]},
      { name: "12U Open", tiers: [
        { name: "General", deadline: "Open Until: Feb 28, 2026 at 11:59pm", price: "$595.00 USD", badges: [], spotsLeft: 2 },
      ]},
      { name: "14U Open", tiers: [
        { name: "General", deadline: "Open Until: Feb 28, 2026 at 11:59pm", price: "$695.00 USD", badges: [] },
      ]},
      { name: "16U Open", tiers: [
        { name: "General", deadline: "Open Until: Feb 28, 2026 at 11:59pm", price: "$795.00 USD", badges: [], spotsLeft: 1 },
      ]},
    ],
  },
];
