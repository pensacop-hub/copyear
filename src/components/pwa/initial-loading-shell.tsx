"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

function ShellBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-slate-200 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/75 before:to-transparent ${className}`}
    />
  );
}

export function InitialLoadingShell() {
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      shellRef.current?.classList.add("opacity-0", "pointer-events-none");
      shellRef.current?.setAttribute("aria-hidden", "true");
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      ref={shellRef}
      className="fixed inset-0 z-[300] overflow-hidden bg-[#F7FAFC] px-5 text-slate-950 transition-opacity duration-500"
      aria-label="Loading COP Year"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-blue-100/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-10 bottom-0 h-40 rounded-full bg-yellow-100/50 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center py-12 text-center">
        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-white/70 blur-xl" />
          <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-blue-950/10 ring-1 ring-slate-200">
            <Image src="/cop.png" alt="COP Logo" fill priority sizes="96px" className="object-contain p-4" />
          </div>
        </div>

        <p className="mt-7 text-xs font-black uppercase tracking-[0.28em] text-blue-800">
          The Church of Pentecost
        </p>
        <h1 className="mt-3 text-4xl font-black leading-none tracking-normal text-slate-950 sm:text-5xl">
          COP Year
        </h1>

        <div className="mt-8 w-full max-w-md space-y-3">
          <ShellBlock className="mx-auto h-4 w-72 rounded-full" />
          <ShellBlock className="mx-auto h-4 w-56 rounded-full" />
        </div>

        <div className="mt-10 grid w-full max-w-lg grid-cols-3 gap-3">
          <div className="rounded-3xl border border-blue-100 bg-white/85 p-3 shadow-sm">
            <ShellBlock className="mx-auto h-8 w-12 rounded-full" />
            <ShellBlock className="mx-auto mt-3 h-3 w-16 rounded-full" />
          </div>
          <div className="rounded-3xl border border-yellow-100 bg-white/85 p-3 shadow-sm">
            <ShellBlock className="mx-auto h-8 w-12 rounded-full" />
            <ShellBlock className="mx-auto mt-3 h-3 w-16 rounded-full" />
          </div>
          <div className="rounded-3xl border border-emerald-100 bg-white/85 p-3 shadow-sm">
            <ShellBlock className="mx-auto h-8 w-12 rounded-full" />
            <ShellBlock className="mx-auto mt-3 h-3 w-16 rounded-full" />
          </div>
        </div>

        <div className="mt-8 flex w-full max-w-md items-center gap-3 rounded-[1.75rem] border border-slate-200 bg-white/90 p-3 shadow-xl shadow-blue-950/5">
          <ShellBlock className="h-10 w-10 flex-none rounded-2xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <ShellBlock className="h-3 w-full rounded-full" />
            <ShellBlock className="h-3 w-2/3 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
