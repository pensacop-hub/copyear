"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users, Sparkles, Clock } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, startOfDay, parseISO, startOfWeek, endOfWeek } from "date-fns";
import { ScheduleModal } from "./schedule-modal";

const EVENTS = [
  { id: 1, title: 'PENSA GHANA CONFERENCE - PCC', start: '2026-01-01', end: '2026-01-04', category: 'Conference', color: 'blue' },
  { id: 2, title: "GLOBAL ALL MINISTERS' AND WIVES' CONFERENCE", start: '2026-01-20', end: '2026-01-23', category: 'Conference', color: 'blue' },
  { id: 3, title: 'BIBLE AWARENESS WEEK', start: '2026-03-03', end: '2026-03-08', category: 'Awareness', color: 'yellow' },
  { id: 4, title: 'EXECUTIVE COUNCIL SESSION 1', start: '2026-03-17', end: '2026-03-21', category: 'Council', color: 'slate' },
  { id: 5, title: 'EASTER CONVENTIONS', start: '2026-04-02', end: '2026-04-05', category: 'Convention', color: 'blue' },
  { id: 6, title: 'EXECUTIVE COUNCIL SESSION 2', start: '2026-04-13', end: '2026-04-19', category: 'Council', color: 'slate' },
  { id: 7, title: 'GENERAL COUNCIL MEETINGS', start: '2026-04-22', end: '2026-04-24', category: 'Council', color: 'slate' },
  { id: 8, title: "WOMEN'S MINISTRY WEEK-LONG ACTIVITIES", start: '2026-05-04', end: '2026-05-10', category: 'Ministry', color: 'yellow' },
  { id: 9, title: 'PENTECOST WEEK', start: '2026-05-19', end: '2026-05-24', category: 'Week', color: 'blue' },
  { id: 10, title: 'PEMEM WEEK-LONG ACTIVITIES', start: '2026-06-16', end: '2026-06-21', category: 'Ministry', color: 'yellow' },
  { id: 11, title: 'PENTSOS AWARENESS WEEKEND', start: '2026-08-14', end: '2026-08-16', category: 'Awareness', color: 'blue' },
  { id: 12, title: "CHILDREN'S MINISTRY WEEK-LONG ACTIVITIES", start: '2026-09-08', end: '2026-09-13', category: 'Ministry', color: 'yellow' },
  { id: 13, title: "YOUTH MINISTRY WEEK-LONG ACTIVITIES", start: '2026-09-22', end: '2026-09-27', category: 'Ministry', color: 'yellow' },
  { id: 14, title: 'GPCC WEEK', start: '2026-10-06', end: '2026-10-10', category: 'Week', color: 'slate' },
  { id: 15, title: 'OUTREACH DAY', start: '2026-10-11', end: '2026-10-11', category: 'Outreach', color: 'blue' },
  { id: 16, title: "HEADS' PRAYER SESSION", start: '2026-11-09', end: '2026-11-15', category: 'Prayer', color: 'slate' },
  { id: 17, title: 'HEAD OFFICE MANAGEMENT AND STAFF RETREAT', start: '2026-12-09', end: '2026-12-11', category: 'Retreat', color: 'yellow' },
  { id: 18, title: 'CHRISTMAS CONVENTION', start: '2026-12-24', end: '2026-12-27', category: 'Convention', color: 'blue' },
];

export function CalendarSection() {
  const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), 0, 1));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventsForDay = (day: Date) => {
    return EVENTS.filter(event => {
      const start = parseISO(event.start);
      const end = parseISO(event.end);
      return isWithinInterval(startOfDay(day), { start: startOfDay(start), end: startOfDay(end) });
    });
  };

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <>
      <section id="calendar" className="py-24 md:py-40 bg-[#FBFBFE] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-200/20 rounded-full blur-[140px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] -z-10" />

        <div className="absolute top-40 -left-20 w-[400px] h-[400px] border-[40px] border-yellow-400/5 rounded-full -z-10" />
        <div className="absolute -bottom-20 right-1/4 w-[300px] h-[300px] rotate-45 border-[2px] border-yellow-400/10 -z-10" />

        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">

          <div className="mb-20 md:mb-24 max-w-4xl md:text-center mx-auto">
            <h2 className="text-[28px] sm:text-5xl md:text-7xl font-black text-[#0F172A] tracking-tighter leading-[1.1] mb-6 whitespace-nowrap">
              Church Activity <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-800 to-blue-900">Calendar</span>
            </h2>
            <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
              Explore our scheduled conventions, sessions, and awareness weeks for the year. Click on highlighted dates to view event details.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">

            <div className="bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white shadow-[0_32px_64px_-16px_rgba(15,23,42,0.06)] p-6 md:p-12 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-100/40 rounded-full blur-3xl -z-10" />

              <div className="flex justify-between items-center mb-16">
                <div>
                  <h3 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tighter">
                    {format(currentMonth, 'MMMM')}
                  </h3>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={prevMonth}
                    className="w-12 h-12 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center justify-center hover:bg-blue-50 hover:border-blue-100 transition-all active:scale-90"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-400" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="w-12 h-12 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center justify-center hover:bg-blue-50 hover:border-blue-100 transition-all active:scale-90"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-10">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center">
                    <span className={`text-[10px] font-black tracking-widest ${i === 0 || i === 6 ? 'text-yellow-500' : 'text-slate-300'}`}>
                      {day}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 md:gap-4">
                {daysInMonth.map((day) => {
                  const events = getEventsForDay(day);
                  const hasEvent = events.length > 0;
                  const isSelected = selectedDay && isSameDay(day, selectedDay);
                  const isCurrentMonth = isSameMonth(day, currentMonth);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => hasEvent && setSelectedDay(day)}
                      disabled={!hasEvent}
                      className={`
                      relative group aspect-square flex flex-col items-center justify-center rounded-2xl md:rounded-[2rem] transition-all duration-500
                      ${!isCurrentMonth ? 'opacity-0 pointer-events-none' : ''} 
                      ${hasEvent
                          ? isSelected
                            ? 'bg-blue-600 text-white shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)] z-10 scale-105'
                            : 'bg-slate-50 hover:bg-white text-[#0F172A] border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/50'
                          : 'text-slate-200 bg-transparent'
                        }
                    `}
                    >
                      <span className={`text-lg md:text-3xl font-black tracking-tighter ${isSelected ? 'text-white' : hasEvent ? 'text-[#0F172A]' : 'text-slate-200'}`}>
                        {format(day, 'd')}
                      </span>
                      {hasEvent && !isSelected && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          {events.length > 1 && <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-4 border-white shadow-sm" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-6 h-full">

              <div className="bg-[#0F172A] rounded-[2.5rem] p-8 md:p-10 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.15)] relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-3xl" />

                <div className="mb-8 pb-6 border-b border-white/10 relative z-10">
                  <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-4">Event Details</h4>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black text-white tracking-tighter">
                      {selectedDay ? format(selectedDay, 'dd') : '--'}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-yellow-400 uppercase tracking-widest leading-none">
                        {selectedDay ? format(selectedDay, 'MMM') : 'Select'}
                      </span>
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Activity View</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10">
                  <AnimatePresence mode="wait">
                    {selectedDay && selectedEvents.length > 0 ? (
                      <div className="space-y-6">
                        {selectedEvents.map(event => (
                          <div key={event.id} className="group relative">
                            <div className="flex flex-col gap-3">
                              <span className="text-[9px] font-black text-blue-300 uppercase tracking-[0.3em]">
                                {event.category}
                              </span>
                              <h5 className="text-xl font-black text-white leading-tight tracking-tight group-hover:text-yellow-400 transition-colors">
                                {event.title}
                              </h5>
                              <div className="flex items-center gap-2 mt-1 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 self-start">
                                <Clock className="w-3 h-3 text-yellow-500" />
                                <span className="text-[10px] font-bold text-white/60">
                                  {format(parseISO(event.start), 'MMM d')} — {format(parseISO(event.end), 'MMM d')}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center opacity-30 text-center">
                        <CalendarIcon className="w-8 h-8 text-white mb-4" />
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white">Select a marked date</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] border border-slate-100 flex-1 relative overflow-hidden flex flex-col">
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl -z-10" />

                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Upcoming Feed</h4>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
                  </div>
                </div>

                <div className="space-y-6 flex-1">
                  {EVENTS.filter(e => parseISO(e.start) > startOfDay(new Date())).slice(0, 2).map((event, i) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group"
                    >
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm shrink-0">
                          <span className="text-xs font-black text-[#0F172A] leading-none">{format(parseISO(event.start), 'dd')}</span>
                          <span className="text-[8px] font-black text-blue-600 uppercase mt-1">{format(parseISO(event.start), 'MMM')}</span>
                        </div>
                        <div className="flex flex-col">
                          <h5 className="text-sm font-black text-[#0F172A] leading-snug group-hover:text-blue-600 transition-colors">
                            {event.title}
                          </h5>
                          <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{event.category}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={() => setIsScheduleOpen(true)}
                  className="mt-8 w-full py-4 rounded-2xl bg-[#0F172A] text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-900 transition-all flex items-center justify-center gap-3 group"
                >
                  Full {new Date().getFullYear()} Schedule
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        events={EVENTS}
      />
    </>
  );
}
