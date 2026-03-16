"use client";

import { DashboardIcon, RegistrationsIcon, AccommodationsIcon, PaymentsIcon, OrdersIcon } from "./Icons";

const navItems = [
  { label: "Event Dashboard", icon: DashboardIcon, active: true },
  { label: "Registrations", icon: RegistrationsIcon },
  { label: "Accommodations", icon: AccommodationsIcon },
  { label: "Payments & Dues", icon: PaymentsIcon, badge: "99+" },
  { label: "Orders", icon: OrdersIcon },
];

export default function SidebarNav() {
  return (
    <nav className="hidden lg:block w-[232px] flex-shrink-0 pt-2 pl-12 pr-2">
      <p className="text-xs font-medium text-text-DEFAULT py-2 border-b border-black/10">
        Welcome, FirstName!
      </p>
      <div className="flex flex-col gap-1 mt-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`flex items-center gap-1 w-full p-2 rounded-md text-sm font-medium text-left ${
              item.active
                ? "bg-brand-primary-light text-brand-primary"
                : "text-text-DEFAULT hover:bg-gray-100"
            }`}
          >
            <item.icon className={`w-6 h-6 ${item.active ? "text-brand-primary" : "text-text-DEFAULT"}`} />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="bg-notification text-white text-xs font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      <button className="mt-2 w-full border border-border-neutral rounded text-sm font-medium text-brand-primary text-center py-2 hover:bg-gray-50">
        New Registration
      </button>
    </nav>
  );
}
