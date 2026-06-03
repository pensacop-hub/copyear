"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Loader2, Plus, Save, Search } from "lucide-react";
import type { CopCalendarEvent, CopCalendarEventInput } from "@/lib/cop-calendar";

type CalendarAdminDashboardProps = {
  initialEvents: CopCalendarEvent[];
  embedded?: boolean;
};

const colors = ["blue", "yellow", "slate", "emerald"];

function toInput(event: CopCalendarEvent): CopCalendarEventInput {
  return {
    title: event.title,
    start: event.start,
    end: event.end,
    category: event.category,
    color: event.color,
    description: event.description,
  };
}

function blankInput(): CopCalendarEventInput {
  return {
    title: "",
    start: "",
    end: "",
    category: "",
    color: "blue",
    description: "",
  };
}

export function CalendarAdminDashboard({ initialEvents, embedded = false }: CalendarAdminDashboardProps) {
  const [events, setEvents] = useState(initialEvents);
  const [selectedId, setSelectedId] = useState(initialEvents[0]?.id ?? 0);
  const [form, setForm] = useState(initialEvents[0] ? toInput(initialEvents[0]) : blankInput());
  const [newForm, setNewForm] = useState<CopCalendarEventInput>(blankInput());
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, startSaving] = useTransition();
  const [isCreating, startCreating] = useTransition();

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedId) ?? events[0],
    [events, selectedId],
  );

  const filteredEvents = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) {
      return events;
    }

    return events.filter((event) =>
      [event.title, event.category, event.start, event.end, event.color, event.description]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }, [events, query]);

  function selectEvent(event: CopCalendarEvent) {
    setSelectedId(event.id);
    setForm(toInput(event));
    setMessage("");
    setError("");
  }

  function saveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedEvent) {
      return;
    }

    setMessage("");
    setError("");

    startSaving(async () => {
      const response = await fetch(`/api/admin/calendar/${selectedEvent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Unable to save calendar event.");
        return;
      }

      const updated = payload.event as CopCalendarEvent;
      setEvents((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setSelectedId(updated.id);
      setForm(toInput(updated));
      setMessage("Calendar event saved");
    });
  }

  function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    startCreating(async () => {
      const response = await fetch("/api/admin/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Unable to create calendar event.");
        return;
      }

      const created = payload.event as CopCalendarEvent;
      setEvents((current) => [...current, created]);
      setSelectedId(created.id);
      setForm(toInput(created));
      setNewForm(blankInput());
      setMessage("New calendar event added");
    });
  }

  return (
    <section className={`${embedded ? "bg-transparent px-0 pb-0 pt-0" : "min-h-screen bg-[#F7FAFC] px-4 pb-12 pt-32 sm:px-6 lg:px-8"} text-slate-950`}>
      <div className="mx-auto max-w-7xl">
        {!embedded && <div className="flex flex-col gap-5 border-b border-slate-200 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-800">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-normal sm:text-4xl">
              Calendar CMS
            </h1>
          </div>
          <div className="flex gap-2">
            <Link className="border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700" href="/admin/personnel">
              Personnel
            </Link>
            <Link className="bg-slate-950 px-4 py-3 text-sm font-black text-white" href="/admin/calendar">
              Calendar
            </Link>
          </div>
        </div>}

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <div className="bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-100 p-4">
              <div className="flex h-12 items-center gap-3 border border-slate-200 bg-slate-50 px-4">
                <Search className="h-5 w-5 text-blue-800" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search calendar events"
                  className="h-full w-full bg-transparent text-sm font-bold outline-none"
                />
              </div>
            </div>

            <div className="max-h-[680px] overflow-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="sticky top-0 bg-slate-950 text-white">
                  <tr>
                    <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.16em]">#</th>
                    <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.16em]">Title</th>
                    <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.16em]">Start</th>
                    <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.16em]">End</th>
                    <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.16em]">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr
                      key={event.id}
                      onClick={() => selectEvent(event)}
                      className={`cursor-pointer border-b border-slate-100 transition hover:bg-blue-50 ${event.id === selectedId ? "bg-yellow-50" : "bg-white"}`}
                    >
                      <td className="px-4 py-3 font-black text-blue-800">{event.sortOrder}</td>
                      <td className="px-4 py-3 font-bold">{event.title}</td>
                      <td className="px-4 py-3 text-slate-600">{event.start}</td>
                      <td className="px-4 py-3 text-slate-600">{event.end}</td>
                      <td className="px-4 py-3 text-slate-600">{event.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
          <form onSubmit={saveEvent} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-800">
                  Edit Event
                </p>
                <h2 className="mt-1 text-xl font-black">{selectedEvent?.title}</h2>
              </div>
              <CalendarDays className="h-5 w-5 text-yellow-600" />
            </div>

            <div className="grid gap-4">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Title</span>
                <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="mt-2 h-11 w-full border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-400 focus:bg-white" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Start</span>
                  <input type="date" value={form.start} onChange={(event) => setForm((current) => ({ ...current, start: event.target.value }))} className="mt-2 h-11 w-full border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-400 focus:bg-white" />
                </label>
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">End</span>
                  <input type="date" value={form.end} onChange={(event) => setForm((current) => ({ ...current, end: event.target.value }))} className="mt-2 h-11 w-full border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-400 focus:bg-white" />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Category</span>
                  <input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="mt-2 h-11 w-full border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-400 focus:bg-white" />
                </label>
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Color</span>
                  <select value={form.color} onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))} className="mt-2 h-11 w-full border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-400 focus:bg-white">
                    {colors.map((color) => <option key={color} value={color}>{color}</option>)}
                  </select>
                </label>
              </div>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  rows={5}
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold outline-none focus:border-blue-400 focus:bg-white"
                />
              </label>
            </div>

            <button disabled={isSaving} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 bg-blue-800 px-5 text-sm font-black text-white transition hover:bg-blue-950 disabled:opacity-60">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Event
            </button>

            {(message || error) && (
              <div className={`mt-4 flex items-center gap-3 px-4 py-3 text-sm font-black ${error ? "bg-red-50 text-red-700 ring-1 ring-red-100" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"}`}>
                <CheckCircle2 className="h-5 w-5" />
                {error || message}
              </div>
            )}
          </form>

          <form onSubmit={createEvent} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-800">
                  New Event
                </p>
                <h2 className="mt-1 text-xl font-black">Add Calendar Entry</h2>
              </div>
              <Plus className="h-5 w-5 text-yellow-600" />
            </div>

            <div className="grid gap-4">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Title</span>
                <input value={newForm.title} onChange={(event) => setNewForm((current) => ({ ...current, title: event.target.value }))} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-400 focus:bg-white" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Start</span>
                  <input type="date" value={newForm.start} onChange={(event) => setNewForm((current) => ({ ...current, start: event.target.value }))} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-400 focus:bg-white" />
                </label>
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">End</span>
                  <input type="date" value={newForm.end} onChange={(event) => setNewForm((current) => ({ ...current, end: event.target.value }))} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-400 focus:bg-white" />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Category</span>
                  <input value={newForm.category} onChange={(event) => setNewForm((current) => ({ ...current, category: event.target.value }))} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-400 focus:bg-white" />
                </label>
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Color</span>
                  <select value={newForm.color} onChange={(event) => setNewForm((current) => ({ ...current, color: event.target.value }))} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-400 focus:bg-white">
                    {colors.map((color) => <option key={color} value={color}>{color}</option>)}
                  </select>
                </label>
              </div>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Description</span>
                <textarea value={newForm.description} onChange={(event) => setNewForm((current) => ({ ...current, description: event.target.value }))} rows={5} className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold outline-none focus:border-blue-400 focus:bg-white" />
              </label>
            </div>

            <button disabled={isCreating} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-blue-950 disabled:opacity-60">
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Event
            </button>
          </form>
          </div>
        </div>
      </div>
    </section>
  );
}
