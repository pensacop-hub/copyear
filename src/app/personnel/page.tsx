import { Hero } from "@/components/personnel/hero";
import { Navbar } from "@/components/layout/navbar";

export default function PersonnelPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <Hero />
    </main>
  );
}
