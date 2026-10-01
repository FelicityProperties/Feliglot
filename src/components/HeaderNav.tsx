"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";

// The header's section links (from md up; phones use the bottom tab bar).
const NAV = [
  { href: "/learn", label: "app.nav.languages" },
  { href: "/review", label: "app.nav.review" },
  { href: "/translate", label: "app.nav.translate" },
] as const;

export default function HeaderNav() {
  const { t } = useT();
  return (
    <nav aria-label={t("app.nav.sections")} className="hidden items-center gap-6 font-display font-extrabold text-ink-700 md:flex">
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} className="hover:text-primary">
          {t(n.label)}
        </Link>
      ))}
    </nav>
  );
}
