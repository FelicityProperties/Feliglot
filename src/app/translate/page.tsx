import type { Metadata } from "next";
import Translator from "@/components/Translator";
import { LANGUAGES } from "@/lib/languages";

export const metadata: Metadata = {
  title: "Translate & learn",
  description: `Translate between ${LANGUAGES.length} languages and learn how to say it — with pronunciation and a word-by-word breakdown.`,
};

export default function TranslatePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow">Feliglot Translate</p>
      <h1 className="mt-1 text-4xl font-black tracking-tight">Translate with context, not guesswork.</h1>
      <p className="mt-2 mb-6 text-ink-600">Don&apos;t just get the translation — learn how to say it, word by word.</p>
      <Translator />
    </div>
  );
}
