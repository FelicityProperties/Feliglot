import type { Metadata } from "next";
import Link from "next/link";
import Feli from "@/components/Feli";

export const metadata: Metadata = { title: "You're offline", robots: { index: false } };

// Shown by the service worker when a page isn't available offline.
export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <div className="flex justify-center">
        <Feli mood="sleep" size={140} />
      </div>
      <h1 className="mt-4 text-3xl font-black">You&apos;re offline</h1>
      <p className="mt-2 text-ink-600">Lessons you&apos;ve opened before still work. Reconnect to open new ones.</p>
      <Link href="/learn" className="btn-primary mt-6">
        My languages
      </Link>
    </div>
  );
}
