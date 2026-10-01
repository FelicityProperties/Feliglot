import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import UnitGrid from "@/components/UnitGrid";
import { ArrowLeft } from "lucide-react";
import { CONCEPTS, UNITS } from "@/lib/curriculum";
import { loadContent } from "@/lib/content";
import { LANGUAGES, getLanguage } from "@/lib/languages";

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGUAGES.map((l) => ({ lang: l.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const l = getLanguage(lang);
  if (!l) return {};
  return {
    title: `Learn ${l.name}`,
    description: `Learn ${l.name} (${l.nativeName}) free: ${CONCEPTS.length} everyday phrases in ${UNITS.length} five-minute lessons, with audio, flashcards, speaking practice and reviews.`,
  };
}

export default async function CoursePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = getLanguage(lang);
  if (!l) notFound();
  const content = loadContent(l.code);
  // A taste of each lesson: its first three phrases in the language itself.
  const previews = Object.fromEntries(
    UNITS.map((u) => [
      u.slug,
      u.concepts
        .slice(0, 3)
        .map((c) => content.phrases[c.id]?.text)
        .filter(Boolean)
        .join(" · "),
    ]),
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/learn" className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-sand-300 bg-card shadow-soft" aria-label="All languages">
          <ArrowLeft size={20} aria-hidden />
        </Link>
        <div className="min-w-0">
          <p className="text-xs text-ink-500">Learning</p>
          <h1 className="text-3xl leading-tight font-black tracking-tight break-words">
            {l.name}{" "}
            {l.nativeName !== l.name && (
              <span dir={l.dir} lang={l.speech} className="text-primary">
                {l.nativeName}
              </span>
            )}
          </h1>
        </div>
      </div>
      <p className="mt-3 mb-6 max-w-2xl text-ink-600">
        {l.tagline ?? `${CONCEPTS.length} everyday ${l.name} phrases in ${UNITS.length} short lessons.`}
        {l.romanization && " Every phrase is also written in Latin letters so you can read it from day one."}
      </p>
      <UnitGrid lang={l.code} dir={l.dir} previews={previews} />
    </div>
  );
}
