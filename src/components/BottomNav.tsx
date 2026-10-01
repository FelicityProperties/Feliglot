"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Languages, RotateCcw, UserRound } from "lucide-react";
import { useT } from "@/lib/i18n";
import { dueCards } from "@/lib/progress";
import { useProgress, useToday } from "@/lib/store";

// App-style tab bar on phones (and in the installed app).
const TABS = [
  { href: "/learn", label: "app.tab.learn", icon: BookOpen, match: (p: string) => p === "/" || p.startsWith("/learn") },
  { href: "/review", label: "app.tab.review", icon: RotateCcw, match: (p: string) => p.startsWith("/review") },
  { href: "/translate", label: "app.tab.translate", icon: Languages, match: (p: string) => p.startsWith("/translate") },
  { href: "/account", label: "app.tab.profile", icon: UserRound, match: (p: string) => p.startsWith("/account") },
] as const;

export default function BottomNav() {
  const path = usePathname() ?? "/";
  const progress = useProgress();
  const today = useToday();
  const due = today ? dueCards(progress, today).length : 0;
  const { t } = useT();
  return (
    <nav
      aria-label={t("app.nav.main")}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-sand-300 bg-background/95 px-safe pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-4">
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match(path);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center gap-0.5 py-2 text-xs font-bold ${active ? "text-primary" : "text-ink-500"}`}
              >
                <Icon size={22} strokeWidth={active ? 2.6 : 2} aria-hidden />
                {t(label)}
                {href === "/review" && due > 0 && (
                  <span className="absolute top-1 left-1/2 ml-2 rounded-full bg-accent px-1.5 text-[10px] leading-4 font-extrabold text-on-accent">
                    {due}
                    <span className="sr-only"> {t("app.tab.due")}</span>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
