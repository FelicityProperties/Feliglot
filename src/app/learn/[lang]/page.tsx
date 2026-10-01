import type { Metadata } from "next";
import { notFound } from "next/navigation";
import T, { LangName } from "@/components/T";
import UnitGrid from "@/components/UnitGrid";
import BackToLanguages from "@/components/BackToLanguages";
import { CONCEPTS, UNITS } from "@/lib/curriculum";
import { loadContent } from "@/lib/content";
import { LANGUAGES, getLanguage } from "@/lib/languages";
import type { UiKey } from "@/lib/ui";

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
        <BackToLanguages />
        <div className="min-w-0">
          <p className="text-xs text-ink-500">
            <T k="app.course.learning" />
          </p>
          <h1 className="text-3xl leading-tight font-black tracking-tight break-words">
            <LangName code={l.code} />{" "}
            {l.nativeName !== l.name && (
              <span dir={l.dir} lang={l.speech} className="text-primary">
                {l.nativeName}
              </span>
            )}
          </h1>
        </div>
      </div>
      <p className="mt-3 mb-6 max-w-2xl text-ink-600">
        {l.tagline ? (
          <T k={`app.tagline.${l.code}` as UiKey} />
        ) : (
          <T k="app.course.intro" vars={{ phrases: CONCEPTS.length, lessons: UNITS.length }} />
        )}
        {l.romanization && (
          <>
            {" "}
            <T k="app.course.romanized" />
          </>
        )}
      </p>
      <UnitGrid lang={l.code} dir={l.dir} previews={previews} />
    </div>
  );
}
