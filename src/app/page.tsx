import GlobalHeader from "@/components/GlobalHeader";
import SidebarNav from "@/components/SidebarNav";
import Registrations from "@/components/Registrations";
import TeamHotels from "@/components/TeamHotels";
import EventMerchandise from "@/components/EventMerchandise";
import PaymentsDues from "@/components/PaymentsDues";
import BulletinBoard from "@/components/BulletinBoard";
import UpcomingGames from "@/components/UpcomingGames";

export default function EventDashboard() {
  return (
    <div className="min-h-screen bg-white">
      <GlobalHeader />

      <div className="flex">
        {/* Left Sidebar Nav - visible on large screens */}
        <SidebarNav />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex justify-center py-6">
          <div className="w-full max-w-[1200px] px-4 lg:px-12">
            <div className="flex gap-6">
              {/* Left Column - Main Content */}
              <div className="flex-1 min-w-0 flex flex-col gap-8">
                {/* Registrations */}
                <Registrations />

                {/* Team Hotels */}
                <TeamHotels />

                {/* Event Merchandise */}
                <EventMerchandise />

                {/* Mobile/Tablet: Payments, Bulletin Board, Upcoming Games stack below */}
                <div className="xl:hidden flex flex-col gap-6">
                  <PaymentsDues />
                  <BulletinBoard />
                  <UpcomingGames />
                </div>
              </div>

              {/* Right Column - Sidebar widgets (Desktop only) */}
              <div className="hidden xl:flex flex-col gap-6 w-[295px] flex-shrink-0">
                <PaymentsDues />
                <BulletinBoard />
                <UpcomingGames />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
