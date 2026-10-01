import type { Metadata } from "next";
import T from "@/components/T";
import Translator from "@/components/Translator";
import { LANGUAGES } from "@/lib/languages";

export const metadata: Metadata = {
  title: "Translate & learn",
  description: `Translate between ${LANGUAGES.length} languages and learn how to say it — with pronunciation and a word-by-word breakdown.`,
};

export default function TranslatePage() {
  return (
    <div className="mx-auto max-w-5xl">
      <p className="eyebrow">
        <T k="account.translate.eyebrow" />
      </p>
      <h1 className="mt-1 text-4xl font-black tracking-tight">
        <T k="account.translate.title" />
      </h1>
      <p className="mt-2 mb-6 text-ink-600">
        <T k="account.translate.intro" />
      </p>
      <Translator />
    </div>
  );
}
