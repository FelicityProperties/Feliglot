import type { Metadata } from "next";
import Link from "next/link";
import Feli from "@/components/Feli";
import T from "@/components/T";

export const metadata: Metadata = { title: "You're offline", robots: { index: false } };

// Shown by the service worker when a page isn't available offline.
export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <div className="flex justify-center">
        <Feli mood="sleep" size={140} />
      </div>
      <h1 className="mt-4 text-3xl font-black">
        <T k="app.offline.title" />
      </h1>
      <p className="mt-2 text-ink-600">
        <T k="app.offline.body" />
      </p>
      <Link href="/learn" className="btn-primary mt-6">
        <T k="app.offline.button" />
      </Link>
    </div>
  );
}
