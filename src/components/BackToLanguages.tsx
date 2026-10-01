"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function BackToLanguages() {
  const { t } = useT();
  return (
    <Link
      href="/learn"
      className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-sand-300 bg-card shadow-soft"
      aria-label={t("app.languages.title")}
    >
      <ArrowLeft size={20} aria-hidden className="rtl:-scale-x-100" />
    </Link>
  );
}
