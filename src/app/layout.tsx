import type { Metadata, Viewport } from "next";
import Link from "next/link";
import AccountLink from "@/components/AccountLink";
import HeaderStats from "@/components/HeaderStats";
import SpeakSelect from "@/components/SpeakSelect";
import { LANGUAGES } from "@/lib/languages";
import "./globals.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://feliglot.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Feliglot — Learn any language, from any language", template: "%s · Feliglot" },
  description: `Free five-minute lessons in ${LANGUAGES.length} languages. Hear every phrase, practise with flashcards, pass a quick quiz — and learn from the language you already speak.`,
  applicationName: "Feliglot",
  openGraph: { siteName: "Feliglot", type: "website" },
};

export const viewport: Viewport = { themeColor: "#0b6d63" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-10 border-b border-sand-200 bg-sand-50/90 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
            <Link href="/" className="text-xl font-bold tracking-tight text-ink-900">
              Feli<span className="text-teal-700">glot</span>
            </Link>
            <div className="flex items-center gap-4 text-sm font-medium text-ink-700">
              <Link href="/learn" className="hover:text-teal-700">
                Languages
              </Link>
              <Link href="/translate" className="hover:text-teal-700">
                Translate
              </Link>
              <HeaderStats />
              <AccountLink />
            </div>
            <div className="w-full sm:w-auto">
              <SpeakSelect compact />
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">{children}</main>
        <footer className="mx-auto max-w-5xl border-t border-sand-200 px-4 py-8 text-sm text-ink-500">
          <p>
            Feliglot is a Felicity project. Course phrases were written and checked by AI and are waiting on review by
            native speakers — if something sounds off, tell us.
          </p>
        </footer>
      </body>
    </html>
  );
}
