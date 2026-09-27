import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import UnitGrid from "@/components/UnitGrid";
import { UNITS } from "@/lib/curriculum";
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
    description: `Learn ${l.name} (${l.nativeName}) free: 100 everyday phrases in 10 five-minute lessons, with audio, flashcards and quizzes.`,
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
    <div>
      <Link href="/learn" className="text-sm text-ink-500 hover:text-teal-700">
        ← All languages
      </Link>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">
        <span dir={l.dir} lang={l.speech}>
          {l.nativeName}
        </span>
        {l.nativeName !== l.name && <span className="ml-3 text-2xl font-medium text-ink-500">{l.name}</span>}
      </h1>
      <p className="mt-2 mb-8 max-w-2xl text-ink-600">
        {l.tagline ?? `100 everyday ${l.name} phrases in 10 short lessons.`}
        {l.romanization && " Every phrase is also written in Latin letters so you can read it from day one."}
      </p>
      <UnitGrid lang={l.code} dir={l.dir} previews={previews} />
    </div>
  );
}
