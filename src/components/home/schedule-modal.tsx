"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";

import Image from "next/image";

interface Event {
  id: number;
  title: string;
  start: string;
  end: string;
  category: string;
  description: string;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
}

const Typewriter = ({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) => {
  const characters = text.split("");

  return (
    <motion.span className={className}>
      {characters.map((char, i) => (
        <motion.span
          key={`${text}-${i}`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.1,
            delay: delay + i * 0.03,
            ease: "easeIn"
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

export function ScheduleModal({ isOpen, onClose, events }: ScheduleModalProps) {
  const sortedEvents = [...events].sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime());

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-white overflow-y-auto custom-scrollbar scroll-smooth"
        >
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-yellow-50/50 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-blue-50/30 rounded-full blur-[100px]" />
            <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/felt.png')]" />
          </div>

          <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 py-8 md:px-16 md:py-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-xl">
                <Image 
                  src="/cop.png" 
                  alt="COP Logo" 
                  fill 
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-1">Global Events</span>
                <span className="text-sm font-black text-[#0F172A] tracking-tighter">The Church of Pentecost</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-14 h-14 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all group shadow-sm bg-white"
            >
              <X className="w-6 h-6 text-slate-400 group-hover:text-[#0F172A] group-hover:rotate-90 transition-all duration-500" />
            </button>
          </div>

          <div className="relative z-10">
            {sortedEvents.map((event) => (
              <section
                key={event.id}
                className="min-h-screen flex items-center justify-center px-8 md:px-24 py-32 border-b border-slate-50 relative overflow-hidden"
              >
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 0.04, scale: 1 }}
                    viewport={{ margin: "-200px" }}
                    transition={{ duration: 1.5 }}
                    className="text-[25rem] md:text-[45rem] font-black text-[#0F172A] leading-none select-none"
                  >
                    {format(parseISO(event.start), 'MM')}
                  </motion.span>
                </div>

                <div className="max-w-6xl w-full flex flex-col md:flex-row items-center gap-16 md:gap-32">

                  <div className="shrink-0 text-center md:text-right w-full md:w-auto">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      className="flex flex-col"
                    >
                      <span className="text-2xl md:text-3xl font-black text-yellow-500 uppercase tracking-[0.5em] mb-4">
                        {format(parseISO(event.start), 'MMMM')}
                      </span>
                      <span className="text-8xl md:text-[11rem] font-black text-[#0F172A] tracking-tighter leading-none">
                        {format(parseISO(event.start), 'dd')}
                      </span>
                    </motion.div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="flex items-center justify-center md:justify-start gap-4 mb-10"
                    >
                      <span className="px-5 py-2 rounded-xl bg-blue-50 text-blue-600 text-[11px] font-black uppercase tracking-[0.3em]">
                        {event.category}
                      </span>
                      <div className="w-12 h-px bg-slate-200" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Annual Session</span>
                    </motion.div>

                    <h2 className="text-5xl md:text-[6.5rem] font-black text-[#0F172A] tracking-tighter leading-[0.9] mb-12 flex items-center">
                      <Typewriter text={event.title} delay={0.2} />
                    </h2>

                    <p className="text-slate-500 text-lg md:text-2xl font-medium leading-relaxed max-w-2xl mb-16">
                      <Typewriter
                        text={event.description || `Join the Global Pentecost Family for this ${event.category.toLowerCase()}. A time of deep spiritual reflection and divine empowerment at The Church of Pentecost.`}
                        delay={1}
                        className="inline-block"
                      />
                    </p>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-12">
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="flex items-center gap-4"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Timeframe</span>
                          <span className="text-sm font-black text-[#0F172A]">
                            {format(parseISO(event.start), 'MMM d')} — {format(parseISO(event.end), 'MMM d')}
                          </span>
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 1.7 }}
                        className="flex items-center gap-4"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Location</span>
                          <span className="text-sm font-black text-[#0F172A]">PCC - Ghana</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                </div>
              </section>
            ))}
          </div>

          <div className="py-32 bg-slate-50 text-center relative z-20">
            <button
              onClick={onClose}
              className="px-16 py-6 rounded-3xl bg-[#0F172A] text-white font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-2xl shadow-blue-900/20"
            >
              Back to Calendar
            </button>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
