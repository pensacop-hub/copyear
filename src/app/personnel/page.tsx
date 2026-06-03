import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/personnel/hero";
import { PersonnelDirectory } from "@/components/personnel/personnel-directory";
import { getCopPersonnel } from "@/lib/cop-personnel";

export const dynamic = "force-dynamic";

export default async function PersonnelPage() {
  const personnel = await getCopPersonnel();

  return (
    <main className="min-h-screen bg-[#F7FAFC]">
      <Navbar />
      <Hero />
      <PersonnelDirectory personnel={personnel} />
    </main>
  );
}
