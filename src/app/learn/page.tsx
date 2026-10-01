import type { Metadata } from "next";
import LanguagePicker from "@/components/LanguagePicker";
import T from "@/components/T";
import { CONCEPTS, UNITS } from "@/lib/curriculum";
import { LANGUAGES } from "@/lib/languages";

export const metadata: Metadata = {
  title: "All languages",
  description: `Choose from ${LANGUAGES.length} language courses — free five-minute lessons with audio, flashcards and quizzes.`,
};

export default function LanguagesPage() {
  return (
    <div>
      <p className="eyebrow">
        <T k="app.home.pick.eyebrow" />
      </p>
      <h1 className="mt-1 text-4xl font-black tracking-tight">
        <T k="app.languages.title" />
      </h1>
      <p className="mt-2 mb-6 text-ink-600">
        <T k="app.languages.intro" vars={{ courses: LANGUAGES.length, phrases: CONCEPTS.length, lessons: UNITS.length }} />
      </p>
      <LanguagePicker />
    </div>
  );
}
