"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Download, ShieldCheck, WifiOff, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const dismissedKey = "cop-pwa-install-dismissed";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() =>
    typeof window === "undefined" ? true : localStorage.getItem(dismissedKey) === "true",
  );
  const [isOffline, setIsOffline] = useState(() =>
    typeof navigator === "undefined" ? false : !navigator.onLine,
  );
  const [isInstalled, setIsInstalled] = useState(() =>
    typeof window === "undefined" ? false : isStandalone(),
  );

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // The app still works online if registration fails.
      });
    }

    function updateOnlineState() {
      setIsOffline(!navigator.onLine);
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setDismissed(localStorage.getItem(dismissedKey) === "true");
    }

    function handleInstalled() {
      setIsInstalled(true);
      setInstallPrompt(null);
      localStorage.setItem(dismissedKey, "true");
    }

    window.addEventListener("online", updateOnlineState);
    window.addEventListener("offline", updateOnlineState);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("online", updateOnlineState);
      window.removeEventListener("offline", updateOnlineState);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const iosInstallText = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /iphone|ipad|ipod/i.test(navigator.userAgent) && !isInstalled;
  }, [isInstalled]);

  async function installApp() {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setIsInstalled(true);
      localStorage.setItem(dismissedKey, "true");
    }

    setInstallPrompt(null);
  }

  function dismiss() {
    localStorage.setItem(dismissedKey, "true");
    setDismissed(true);
  }

  if (isInstalled || dismissed || (!installPrompt && !isOffline && !iosInstallText)) {
    return null;
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-[200] mx-auto max-w-3xl rounded-[1.75rem] border border-white/60 bg-slate-950/95 p-3 text-white shadow-2xl shadow-blue-950/30 backdrop-blur md:bottom-5">
      <div className="flex items-start gap-3">
        <div className="relative h-12 w-12 flex-none overflow-hidden rounded-2xl bg-white p-2">
          <Image src="/cop.png" alt="COP Logo" fill sizes="48px" className="object-contain p-2" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-black">Install COP Year Portal</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-1 text-[11px] font-black text-emerald-200">
              {isOffline ? <WifiOff className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
              Offline ready
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-300">
            Add it to your device for faster access offline. Portal can still open when the network is unavailable.
          </p>
          {iosInstallText && (
            <p className="mt-2 text-xs font-bold text-yellow-200">
              On iPhone or iPad, use Share, then Add to Home Screen.
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {installPrompt && (
              <button
                type="button"
                onClick={installApp}
                className="inline-flex h-10 items-center gap-2 rounded-2xl bg-white px-4 text-xs font-black text-slate-950 transition hover:bg-yellow-100"
              >
                <Download className="h-4 w-4" />
                Install App
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex h-10 items-center rounded-2xl border border-white/15 px-4 text-xs font-black text-slate-200 transition hover:bg-white/10"
            >
              Not Now
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install banner"
          className="flex h-9 w-9 flex-none items-center justify-center rounded-2xl bg-white/10 text-slate-200 transition hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
