"use client";

import { ChevronDown } from "./Icons";

export default function GlobalHeader() {
  return (
    <header className="bg-white border-b border-gray-200">
      {/* Association Bar */}
      <div className="flex items-center justify-between px-4 lg:px-12 py-2">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-text-DEFAULT">Ballparks of America</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 border border-border-subdued rounded px-2 py-1.5 bg-white hover:bg-gray-50">
            <div className="w-6 h-6 rounded bg-avatars-team-five flex items-center justify-center">
              <span className="text-[9px] font-bold text-white tracking-wider uppercase">CW</span>
            </div>
            <span className="text-sm font-bold text-text-DEFAULT hidden sm:inline">C. Wilson</span>
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Event Header */}
      <div className="flex items-center justify-between px-4 lg:px-12 py-4 lg:py-6">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-md border border-border-DEFAULT overflow-hidden bg-white flex-shrink-0">
            <img
              src="https://www.figma.com/api/mcp/asset/17bb1d78-04ef-4b83-8217-36ccf655ecfb"
              alt="Event Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-base lg:text-xl font-medium text-text-DEFAULT leading-tight">
              Game 7: Spring RING Classic TURF
            </h1>
            <div className="flex flex-wrap items-center gap-2 lg:gap-3 mt-0.5 lg:mt-1">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-text-subdued" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
                <span className="text-sm font-medium text-text-subdued">Mar 31 - Apr 2, 2025</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-text-subdued" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                <span className="text-sm font-medium text-text-subdued">Branson, Missouri</span>
              </div>
            </div>
          </div>
        </div>
        <button className="hidden md:flex flex-col items-center gap-0.5 px-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          <div className="flex items-center">
            <span className="text-sm font-medium">Share</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Event Nav */}
      <div className="hidden md:flex items-center gap-1 px-4 lg:px-10 pb-4 overflow-x-auto">
        <button className="flex items-center gap-1 px-3 py-2 rounded-md bg-brand-primary-light text-brand-primary text-sm font-medium whitespace-nowrap">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
          My Event
        </button>
        {["Event Details", "Hotels", "Event Store", "Schedule & Standings", "Who's Playing", "Bulletin Board"].map((item) => (
          <button
            key={item}
            className="px-3 py-2 rounded-md text-sm font-medium text-text-DEFAULT hover:bg-gray-100 whitespace-nowrap"
          >
            {item}
          </button>
        ))}
      </div>
    </header>
  );
}
