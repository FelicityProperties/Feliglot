"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useT } from "@/lib/i18n";
import { track } from "@/lib/track";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

// Registers the offline-ready service worker (production only) and offers
// an "Install app" button when the browser supports installing the site.
export default function AppShell() {
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const { t } = useT();

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallEvent);
    };
    const onInstalled = () => {
      setInstallEvent(null);
      track("install");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!installEvent) return null;
  return (
    <button
      onClick={async () => {
        await installEvent.prompt();
        await installEvent.userChoice.catch(() => null);
        setInstallEvent(null);
      }}
      className="chip text-primary"
    >
      <Download size={16} aria-hidden /> {t("app.install")}
    </button>
  );
}
