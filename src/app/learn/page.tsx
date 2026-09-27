import type { Metadata } from "next";
import LanguagePicker from "@/components/LanguagePicker";
import { LANGUAGES } from "@/lib/languages";

export const metadata: Metadata = {
  title: "All languages",
  description: `Choose from ${LANGUAGES.length} language courses — free five-minute lessons with audio, flashcards and quizzes.`,
};

export default function LanguagesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">All languages</h1>
      <p className="mt-2 mb-6 text-ink-600">
        {LANGUAGES.length} courses, each with the same 100 everyday phrases in 10 short lessons.
      </p>
      <LanguagePicker />
    </div>
  );
}
