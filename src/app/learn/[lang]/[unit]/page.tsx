import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LessonPlayer, { LessonHeader } from "@/components/LessonPlayer";
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
  // A missing phrase would break the lesson, so it fails the build instead.
  const missing = u.concepts.filter((c) => !content.phrases[c.id]?.text).map((c) => c.id);
  if (missing.length) throw new Error(`${l.code}/${u.slug}: no phrase for ${missing.join(", ")} (run npm run check:content)`);
  const phrases: LessonPhrase[] = u.concepts.map((c) => ({ id: c.id, en: c.en, ...content.phrases[c.id] }));
  const next = UNITS[UNITS.indexOf(u) + 1];

  return (
    <div className="mx-auto max-w-3xl">
      <LessonHeader code={l.code} unit={u.slug} emoji={u.emoji} level={u.level} number={UNITS.indexOf(u) + 1} count={u.concepts.length} />
      <LessonPlayer
        lang={{ code: l.code, name: l.name, nativeName: l.nativeName, speech: l.speech, dir: l.dir }}
        unit={u.slug}
        phrases={phrases}
        next={next ? { slug: next.slug, title: next.title } : undefined}
      />
    </div>
  );
}
