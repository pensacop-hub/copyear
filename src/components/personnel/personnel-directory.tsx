"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Mail,
  MapPin,
  Phone,
  Search,
  Users,
  X,
} from "lucide-react";
import type { CopPersonnel } from "@/lib/cop-personnel";

type PersonnelDirectoryProps = {
  personnel: CopPersonnel[];
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function searchableValue(person: CopPersonnel) {
  return normalize(
    [
      person.region,
      person.area,
      person.areaLeader,
      person.district,
      person.districtLeader,
      person.phone,
      person.email,
      person.address,
    ].join(" "),
  );
}

export function PersonnelDirectory({ personnel }: PersonnelDirectoryProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalize(query.trim());

  const filteredPersonnel = useMemo(() => {
    if (!normalizedQuery) {
      return personnel;
    }

    const terms = normalizedQuery.split(/\s+/).filter(Boolean);

    return personnel.filter((person) => {
      const haystack = searchableValue(person);
      return terms.every((term) => haystack.includes(term));
    });
  }, [normalizedQuery, personnel]);

  const regions = useMemo(
    () => new Set(personnel.map((person) => person.region)).size,
    [personnel],
  );

  const areas = useMemo(
    () => new Set(personnel.map((person) => person.area)).size,
    [personnel],
  );

  const areaHeads = useMemo(
    () => new Set(personnel.map((person) => person.areaLeader).filter(Boolean)).size,
    [personnel],
  );

  return (
    <section className="relative -mt-6 bg-[#F7FAFC] text-slate-950">
      <div className="mx-auto flex min-h-[92vh] w-full max-w-7xl flex-col px-4 pb-12 pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 border-t border-slate-200 pt-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden bg-white p-2 shadow-lg ring-1 ring-slate-200">
                <Image
                  src="/cop.png"
                  alt="COP Logo"
                  fill
                  sizes="48px"
                  className="object-contain p-2"
                />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-600">
                  The Church of Pentecost
                </p>
                <p className="text-sm font-bold text-slate-500">COP Personnel</p>
              </div>
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
              Personnel Directory
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Browse districts, leaders, contact details, and addresses in the same order as the master church structure sheet.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-2xl border border-blue-100 bg-white p-3 shadow-sm shadow-blue-950/5 sm:p-4">
              <p className="text-2xl font-black text-slate-950">{areaHeads}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Area Heads
              </p>
            </div>
            <div className="rounded-2xl border border-yellow-100 bg-white p-3 shadow-sm shadow-yellow-950/5 sm:p-4">
              <p className="text-2xl font-black text-slate-950">{regions}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Regions
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm shadow-emerald-950/5 sm:p-4">
              <p className="text-2xl font-black text-slate-950">{areas}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Areas
              </p>
            </div>
          </div>
        </div>

        <div className="sticky top-4 z-40 mt-7 rounded-[1.75rem] border border-slate-200 bg-white/90 p-2 shadow-2xl shadow-blue-950/10 backdrop-blur">
          <div className="flex min-h-14 items-center gap-3 rounded-[1.35rem] bg-slate-50 px-3 ring-1 ring-inset ring-slate-100">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-blue-800 text-white shadow-lg shadow-blue-900/20">
              <Search className="h-5 w-5" />
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by leader, district, area, region, phone, email, or address"
              className="h-12 w-full bg-transparent text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400"
              aria-label="Search COP personnel"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="flex h-9 w-9 flex-none items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:text-blue-800"
                aria-label="Clear personnel search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="hidden whitespace-nowrap rounded-xl bg-white px-3 py-2 text-sm font-black text-blue-800 ring-1 ring-slate-200 sm:block">
              {filteredPersonnel.length} shown
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPersonnel.map((person) => (
            <Link
              key={person.slug}
              href={`/personnel/${person.slug}`}
              className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm shadow-slate-950/5 ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-950/10 hover:ring-blue-200"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-800 via-yellow-500 to-emerald-600" />
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 flex-none overflow-hidden rounded-full bg-slate-50 p-2 shadow-inner ring-1 ring-slate-200">
                  <Image
                    src="/cop.png"
                    alt="COP Logo"
                    fill
                    sizes="64px"
                    className="object-contain p-2"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-800">
                    <span className="truncate">{person.region}</span>
                  </div>
                  <h2 className="mt-2 text-xl font-black leading-tight tracking-normal text-slate-950">
                    {person.districtLeader}
                  </h2>
                  <p className="mt-1 text-sm font-bold text-slate-500">{person.district} District</p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 flex-none text-blue-800" />
                  <span className="min-w-0 truncate">
                    {person.area} Area, headed by {person.areaLeader}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 flex-none text-blue-800" />
                  <span>{person.phone || "No phone listed"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 flex-none text-blue-800" />
                  <span className="min-w-0 truncate">{person.email || "No email listed"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 flex-none text-blue-800" />
                  <span className="min-w-0 truncate">{person.address || "No address listed"}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                  View details
                </span>
                <ArrowRight className="h-5 w-5 text-yellow-600 transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>

        {filteredPersonnel.length === 0 && (
          <div className="mt-10 flex flex-col items-center justify-center border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Users className="h-10 w-10 text-slate-300" />
            <h2 className="mt-4 text-xl font-black text-slate-950">No personnel found</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try a leader name, district, area, region, phone number, email, or postal address.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
