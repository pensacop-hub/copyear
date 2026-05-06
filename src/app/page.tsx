import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/home/hero";
import { CalendarSection } from "@/components/home/calendar-section";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-yellow-400/30 font-sans">
      <Navbar />
      <Hero />
      <CalendarSection />
    </main>
  );
}
