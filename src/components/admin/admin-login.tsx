"use client";

import { FormEvent, useState, useTransition } from "react";
import Image from "next/image";
import { Loader2, LockKeyhole } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Unable to enter admin dashboard.");
        return;
      }

      router.push(searchParams.get("next") || "/admin");
      router.refresh();
    });
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-[#F7FAFC] px-4 py-16 text-slate-950">
      <form onSubmit={submit} className="w-full max-w-md bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          <div className="relative h-14 w-14 overflow-hidden bg-slate-50 ring-1 ring-slate-200">
            <Image src="/cop.png" alt="COP Logo" fill sizes="56px" className="object-contain p-2" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-800">
              Secure CMS
            </p>
            <h1 className="mt-1 text-2xl font-black">Admin Access</h1>
          </div>
        </div>

        <label className="mt-6 block">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Admin Email
          </span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="mt-2 h-12 w-full border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none transition focus:border-blue-400 focus:bg-white"
            autoComplete="email"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Password
          </span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="mt-2 h-12 w-full border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none transition focus:border-blue-400 focus:bg-white"
            autoComplete="current-password"
          />
        </label>

        {error && (
          <div className="mt-4 bg-red-50 px-4 py-3 text-sm font-black text-red-700 ring-1 ring-red-100">
            {error}
          </div>
        )}

        <button
          disabled={isPending}
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 bg-blue-800 text-sm font-black text-white transition hover:bg-blue-950 disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
          Enter Dashboard
        </button>
      </form>
    </section>
  );
}
