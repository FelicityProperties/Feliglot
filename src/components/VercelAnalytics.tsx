"use client";

import { Analytics } from "@vercel/analytics/next";
import { optedOut } from "@/lib/track";

// Vercel's page-view counter, with the same opt-out as our own counting:
// browsers that send Do Not Track or Global Privacy Control aren't counted.
export default function VercelAnalytics() {
  return <Analytics beforeSend={(event) => (optedOut() ? null : event)} />;
}
