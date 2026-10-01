import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "@fontsource-variable/nunito";
import "@fontsource-variable/noto-sans";
import AccountLink from "@/components/AccountLink";
import AppShell from "@/components/AppShell";
import BottomNav from "@/components/BottomNav";
import Feli from "@/components/Feli";
import HeaderNav from "@/components/HeaderNav";
import HeaderStats from "@/components/HeaderStats";
import HtmlLang from "@/components/HtmlLang";
import PageviewTracker from "@/components/PageviewTracker";
import SpeakSelect from "@/components/SpeakSelect";
import T from "@/components/T";
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
  // Setting icons here drops the automatic icon.svg link, so it is listed again.
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/icons/apple-touch-icon.png",
    other: [{ rel: "mask-icon", url: "/favicon-mono.svg", color: "#00796b" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0e2523" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-xl focus:bg-card focus:p-3">
          <T k="app.skip" />
        </a>
        <header className="sticky top-0 z-30 border-b border-sand-300 bg-background/90 backdrop-blur-md">
          <div className="px-safe mx-auto flex max-w-6xl items-center justify-between gap-3 py-2.5">
            <Link href="/" className="flex items-center gap-2 font-display text-2xl font-black text-primary">
              <Feli size={34} decorative />
              Feliglot
            </Link>
            <HeaderNav />
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
            <T k="app.footer.about" />
          </p>
          <p className="mt-3 flex gap-4">
            <Link href="/privacy" className="underline hover:text-primary">
              <T k="app.footer.privacy" />
            </Link>
            <Link href="/terms" className="underline hover:text-primary">
              <T k="app.footer.terms" />
            </Link>
          </p>
        </footer>
        <BottomNav />
        <HtmlLang />
        <PageviewTracker />
        <VercelAnalytics />
      </body>
    </html>
  );
}
