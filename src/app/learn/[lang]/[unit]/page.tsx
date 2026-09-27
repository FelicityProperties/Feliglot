import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LessonPlayer from "@/components/LessonPlayer";
import { UNITS, getUnit } from "@/lib/curriculum";
import { loadContent } from "@/lib/content";
import { LANGUAGES, getLanguage } from "@/lib/languages";
import type { LessonPhrase } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGUAGES.flatMap((l) => UNITS.map((u) => ({ lang: l.code, unit: u.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; unit: string }> }): Promise<Metadata> {
  const { lang, unit } = await params;
  const l = getLanguage(lang);
  const u = getUnit(unit);
  if (!l || !u) return {};
  return {
    title: `${u.title} in ${l.name}`,
    description: `${u.blurb} Learn ${u.concepts.length} ${l.name} phrases with audio, flashcards and a quick quiz.`,
  };
}

export default async function UnitPage({ params }: { params: Promise<{ lang: string; unit: string }> }) {
  const { lang, unit } = await params;
  const l = getLanguage(lang);
  const u = getUnit(unit);
  if (!l || !u) notFound();
  const content = loadContent(l.code);
  const phrases: LessonPhrase[] = u.concepts.map((c) => ({ id: c.id, en: c.en, ...content.phrases[c.id] }));
  const next = UNITS[UNITS.indexOf(u) + 1];

  return (
    <div>
      <Link href={`/learn/${l.code}`} className="text-sm text-ink-500 hover:text-teal-700">
        ← {l.name} course
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        <span aria-hidden>{u.emoji}</span> {u.title}
        <span className="ml-2 text-xl font-medium text-ink-500">· {l.name}</span>
      </h1>
      <p className="mt-2 mb-8 text-ink-600">{u.blurb}</p>
      <LessonPlayer
        lang={{ code: l.code, name: l.name, nativeName: l.nativeName, speech: l.speech, dir: l.dir }}
        unit={u.slug}
        phrases={phrases}
        next={next ? { slug: next.slug, title: next.title } : undefined}
      />
    </div>
  );
}
