import type { Metadata } from "next";
import type { ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Mail,
  MapPin,
  Phone,
  Shield,
  UserRound,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import {
  getCopPersonBySlug,
  getCopPersonnel,
} from "@/lib/cop-personnel";

type PersonnelDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PersonnelDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const person = await getCopPersonBySlug(slug);

  if (!person) {
    return {
      title: "Personnel Not Found",
    };
  }

  return {
    title: `${person.districtLeader} | COP Personnel`,
    description: `${person.district} District, ${person.area} Area, ${person.region}`,
  };
}

function DetailItem({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex min-h-24 gap-4 bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-blue-50 text-blue-800">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
          {label}
        </p>
        <p className="mt-2 break-words text-base font-bold leading-6 text-slate-950">
          {value || "Not listed"}
        </p>
      </div>
    </div>
  );

  if (!href || !value) {
    return content;
  }

  return (
    <a href={href} className="block transition hover:-translate-y-0.5 hover:shadow-lg">
      {content}
    </a>
  );
}

export default async function PersonnelDetailPage({
  params,
}: PersonnelDetailPageProps) {
  const { slug } = await params;
  const [person, personnel] = await Promise.all([
    getCopPersonBySlug(slug),
    getCopPersonnel(),
  ]);

  if (!person) {
    notFound();
  }

  const currentIndex = personnel.findIndex((item) => item.slug === person.slug);
  const previous = currentIndex > 0 ? personnel[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < personnel.length - 1
      ? personnel[currentIndex + 1]
      : null;

  return (
    <main className="min-h-screen bg-[#F7FAFC] text-slate-950">
      <Navbar />
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 pt-32 sm:px-6 lg:px-8">
        <Link
          href="/personnel"
          className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-blue-800 transition hover:text-yellow-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Personnel
        </Link>

        <div className="mt-8 overflow-hidden bg-white shadow-xl ring-1 ring-slate-200">
          <div className="h-2 bg-gradient-to-r from-blue-800 via-yellow-500 to-emerald-600" />
          <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="bg-slate-950 p-8 text-white sm:p-10">
              <div className="relative h-28 w-28 overflow-hidden rounded-full bg-white p-4 shadow-2xl">
                <Image
                  src="/cop.png"
                  alt="COP Logo"
                  fill
                  sizes="112px"
                  className="object-contain p-4"
                />
              </div>
              <p className="mt-8 text-xs font-black uppercase tracking-[0.28em] text-yellow-400">
                COP Personnel
              </p>
              <h1 className="mt-3 text-4xl font-black leading-tight tracking-normal sm:text-5xl">
                {person.districtLeader}
              </h1>
              <p className="mt-4 text-lg font-bold text-blue-100">
                {person.district} District
              </p>
              <div className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm font-semibold text-slate-200">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-yellow-400" />
                  <span>{person.region}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-yellow-400" />
                  <span>{person.area} Area</span>
                </div>
                <div className="flex items-center gap-3">
                  <UserRound className="h-4 w-4 text-yellow-400" />
                  <span>Area Head: {person.areaLeader}</span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem icon={Shield} label="Region" value={person.region} />
                <DetailItem icon={Building2} label="Area" value={person.area} />
                <DetailItem icon={UserRound} label="Area Head" value={person.areaLeader} />
                <DetailItem icon={Building2} label="District" value={person.district} />
                <DetailItem
                  icon={UserRound}
                  label="District Leader"
                  value={person.districtLeader}
                />
                <DetailItem
                  icon={Phone}
                  label="Phone"
                  value={person.phone}
                  href={person.phone ? `tel:${person.phone}` : undefined}
                />
                <DetailItem
                  icon={Mail}
                  label="Email"
                  value={person.email}
                  href={person.email ? `mailto:${person.email}` : undefined}
                />
                <DetailItem icon={MapPin} label="Address" value={person.address} />
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                {previous ? (
                  <Link
                    href={`/personnel/${previous.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-black text-slate-600 transition hover:text-blue-800"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Link>
                ) : (
                  <span />
                )}

                {next ? (
                  <Link
                    href={`/personnel/${next.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-black text-slate-600 transition hover:text-blue-800"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
