import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Feliglot — Speak Dubai",
  description:
    "Learn the everyday Arabic people actually speak in Dubai. Short lessons, real phrases, spoken out loud. A Felicity project.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b border-sand-200 bg-sand-50/90 backdrop-blur">
          <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-ink-900">
              Feli<span className="text-teal-700">glot</span>
            </Link>
            <div className="flex gap-5 text-sm font-medium text-ink-700">
              <Link href="/learn" className="hover:text-teal-700">
                Lessons
              </Link>
              <Link href="/phrasebook" className="hover:text-teal-700">
                Phrasebook
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-10">{children}</main>
        <footer className="mx-auto max-w-4xl px-4 pb-10 text-sm text-ink-500">
          Feliglot is a Felicity project. Phrases are still waiting on a check by a native Emirati
          speaker — if something sounds off, it may be us, not you.
        </footer>
      </body>
    </html>
  );
}
