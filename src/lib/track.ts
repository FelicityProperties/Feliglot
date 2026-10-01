"use client";

// First-party, cookie-free analytics for the owner dashboard. Nothing here
// identifies a visitor: the server counts unique visitors with a hash that
// changes every day, and nothing is sent when the browser asks not to be
// tracked (Do Not Track / Global Privacy Control).

export function optedOut(): boolean {
  const n = navigator as Navigator & { globalPrivacyControl?: boolean };
  return n.doNotTrack === "1" || n.globalPrivacyControl === true;
}

function send(body: Record<string, unknown>) {
  if (typeof window === "undefined" || optedOut()) return;
  try {
    void fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function trackPageview(path: string, referrer: string) {
  send({ type: "pageview", path, referrer });
}

// Learning events: lesson_passed, review_done, translate_ai, install …
export function track(name: string, data: { lang?: string; name?: string; value?: number } = {}) {
  send({ type: "event", event: name, path: location.pathname, lang: data.lang, label: data.name, value: data.value });
}
