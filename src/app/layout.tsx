import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "@fontsource-variable/nunito";
import "@fontsource-variable/noto-sans";
import AccountLink from "@/components/AccountLink";
import AppShell from "@/components/AppShell";
import BottomNav from "@/components/BottomNav";
import Feli from "@/components/Feli";
import HeaderStats from "@/components/HeaderStats";
import PageviewTracker from "@/components/PageviewTracker";
import SpeakSelect from "@/components/SpeakSelect";
import VercelAnalytics from "@/components/VercelAnalytics";
import { LANGUAGES } from "@/lib/languages";
import "./globals.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://feliglot.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Feliglot — Learn any language, from the one you speak", template: "%s · Feliglot" },
  description: `Free five-minute lessons in ${LANGUAGES.length} languages. Hear every phrase, practise with flashcards, speak and type your answers, and review just before you'd forget — from the language you already speak.`,
  applicationName: "Feliglot",
  openGraph: { siteName: "Feliglot", type: "website" },
  appleWebApp: { capable: true, title: "Feliglot", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0e2523" },
  ],
  viewportFit: "cover",
};

const NAV = [
  { href: "/learn", label: "Languages" },
  { href: "/review", label: "Review" },
  { href: "/translate", label: "Translate" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-xl focus:bg-card focus:p-3">
          Skip to content
        </a>
        <header className="sticky top-0 z-30 border-b border-sand-300 bg-background/90 backdrop-blur-md">
          <div className="px-safe mx-auto flex max-w-6xl items-center justify-between gap-3 py-2.5">
            <Link href="/" className="flex items-center gap-2 font-display text-2xl font-black text-primary">
              <Feli size={34} decorative />
              Feliglot
            </Link>
            <nav aria-label="Sections" className="hidden items-center gap-6 font-display font-extrabold text-ink-700 md:flex">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="hover:text-primary">
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <HeaderStats />
              <span className="hidden sm:inline">
                <AccountLink />
              </span>
            </div>
          </div>
          <div className="px-safe mx-auto flex max-w-6xl items-center justify-between gap-3 pb-2.5">
            <SpeakSelect compact />
            <AppShell />
          </div>
        </header>
        {/* The bottom tab bar shows below md, the header links from md up. */}
        <main id="main" className="px-safe mx-auto max-w-6xl pt-6 pb-28 sm:pt-10 md:pb-16">
          {children}
        </main>
        <footer className="px-safe mx-auto max-w-6xl border-t border-sand-300 pt-8 pb-28 text-sm text-ink-500 md:pb-10">
          <p>
            Feliglot is a Felicity project. Course phrases were written and checked by AI and are waiting on review by
            native speakers — if something sounds off, tell us.
          </p>
          <p className="mt-3 flex gap-4">
            <Link href="/privacy" className="underline hover:text-primary">
              Privacy
            </Link>
            <Link href="/terms" className="underline hover:text-primary">
              Terms
            </Link>
          </p>
        </footer>
        <BottomNav />
        <PageviewTracker />
        <VercelAnalytics />
      </body>
    </html>
  );
}
