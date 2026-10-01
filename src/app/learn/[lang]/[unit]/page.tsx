import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { X } from "lucide-react";
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
  // A missing phrase would break the lesson, so it fails the build instead.
  const missing = u.concepts.filter((c) => !content.phrases[c.id]?.text).map((c) => c.id);
  if (missing.length) throw new Error(`${l.code}/${u.slug}: no phrase for ${missing.join(", ")} (run npm run check:content)`);
  const phrases: LessonPhrase[] = u.concepts.map((c) => ({ id: c.id, en: c.en, ...content.phrases[c.id] }));
  const next = UNITS[UNITS.indexOf(u) + 1];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4">
        <Link
          href={`/learn/${l.code}`}
          className="grid h-12 w-12 place-items-center rounded-2xl border border-sand-300 bg-card shadow-soft"
          aria-label={`Close lesson, back to the ${l.name} course`}
        >
          <X size={20} aria-hidden />
        </Link>
        <div className="min-w-0">
          <p className="text-xs text-ink-500">
            {l.name} · Level {u.level} · Lesson {UNITS.indexOf(u) + 1}
          </p>
          <h1 className="text-xl leading-tight font-black tracking-tight break-words sm:text-2xl">
            <span aria-hidden>{u.emoji}</span> {u.title}
          </h1>
        </div>
        <span className="rounded-xl bg-sand-100 px-2.5 py-1.5 text-xs font-bold text-ink-600">{u.concepts.length} phrases</span>
      </div>
      <LessonPlayer
        lang={{ code: l.code, name: l.name, nativeName: l.nativeName, speech: l.speech, dir: l.dir }}
        unit={u.slug}
        title={u.title}
        phrases={phrases}
        next={next ? { slug: next.slug, title: next.title } : undefined}
      />
    </div>
  );
}
