"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Users } from "lucide-react";
import { PersonnelAdminDashboard } from "@/components/admin/personnel-admin-dashboard";
import { CalendarAdminDashboard } from "@/components/admin/calendar-admin-dashboard";
import type { CopPersonnel } from "@/lib/cop-personnel";
import type { CopCalendarEvent } from "@/lib/cop-calendar";

type UnifiedAdminCmsProps = {
  personnel: CopPersonnel[];
  events: CopCalendarEvent[];
};

export function UnifiedAdminCms({ personnel, events }: UnifiedAdminCmsProps) {
  const [section, setSection] = useState<"personnel" | "calendar">("personnel");

  return (
    <section className="min-h-screen bg-[#F7FAFC] px-4 pb-12 pt-32 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 border-b border-slate-200 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden bg-white shadow-sm ring-1 ring-slate-200">
              <Image src="/cop.png" alt="COP Logo" fill sizes="56px" className="object-contain p-2" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-800">
                Admin CMS
              </p>
              <h1 className="text-3xl font-black tracking-normal sm:text-4xl">
                Church Management
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSection("personnel")}
              className={`inline-flex h-11 items-center gap-2 px-4 text-sm font-black transition ${section === "personnel" ? "bg-blue-800 text-white" : "border border-slate-200 bg-white text-slate-700"}`}
            >
              <Users className="h-4 w-4" />
              Personnel
            </button>
            <button
              onClick={() => setSection("calendar")}
              className={`inline-flex h-11 items-center gap-2 px-4 text-sm font-black transition ${section === "calendar" ? "bg-blue-800 text-white" : "border border-slate-200 bg-white text-slate-700"}`}
            >
              <CalendarDays className="h-4 w-4" />
              Calendar
            </button>
            <Link
              href="/personnel"
              className="inline-flex h-11 items-center border border-slate-200 bg-white px-4 text-sm font-black text-slate-700"
            >
              Public Site
            </Link>
          </div>
        </div>

        <div className="mt-8">
          {section === "personnel" ? (
            <PersonnelAdminDashboard initialPersonnel={personnel} embedded />
          ) : (
            <CalendarAdminDashboard initialEvents={events} embedded />
          )}
        </div>
      </div>
    </section>
  );
}
