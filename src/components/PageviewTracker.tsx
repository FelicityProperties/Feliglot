"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageview } from "@/lib/track";

// Pages that are only useful online, or are personal, aren't saved for offline use.
const NOT_OFFLINE = /^\/(admin|account|api)(\/|$)/;

// Counts one page view per page change (anonymous; see lib/track.ts), and
// asks the service worker to save pages reached by in-app links for offline
// use (a full page load is saved by the worker itself).
export default function PageviewTracker() {
  const path = usePathname();
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (!path || path === last.current) return;
    const firstLoad = last.current === null;
    const referrer = firstLoad ? document.referrer : "";
    last.current = path;
    trackPageview(path, referrer);
    if (!firstLoad && !NOT_OFFLINE.test(path)) {
      navigator.serviceWorker?.controller?.postMessage({ type: "save-page", path: location.pathname + location.search });
    }
  }, [path]);
  return null;
}
