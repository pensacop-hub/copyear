import { Navbar } from "@/components/layout/navbar";
import { CalendarSection } from "@/components/home/calendar-section";
import { EventHero } from "@/components/home/event-hero";
import { getCopCalendarEvents } from "@/lib/cop-calendar";

export const dynamic = "force-dynamic";

export default async function Home() {
  const events = await getCopCalendarEvents();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-yellow-400/30 font-sans overflow-x-hidden">
      <Navbar />

      <EventHero />

      <CalendarSection events={events} />
    </main>
  );
}
