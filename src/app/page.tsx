import Link from "next/link";
import LanguagePicker from "@/components/LanguagePicker";
import { LANGUAGES } from "@/lib/languages";
import { CONCEPTS, UNITS } from "@/lib/curriculum";

const HELLO = [
  { t: "Hola", l: "es-ES" },
  { t: "Bonjour", l: "fr-FR" },
  { t: "مرحبا", l: "ar-SA", rtl: true },
  { t: "你好", l: "zh-CN" },
  { t: "नमस्ते", l: "hi-IN" },
  { t: "Привет", l: "ru-RU" },
  { t: "こんにちは", l: "ja-JP" },
  { t: "Jambo", l: "sw-KE" },
];

export default function Home() {
  const n = LANGUAGES.length;
  return (
    <div>
      <section className="py-6 text-center sm:py-12">
        <ul className="mb-6 flex flex-wrap justify-center gap-2" aria-label="Hello in several languages">
          {HELLO.map((h) => (
            <li key={h.l} lang={h.l} dir={h.rtl ? "rtl" : "ltr"} className="rounded-full bg-white px-3 py-1 text-sm text-ink-700 shadow-sm">
              {h.t}
            </li>
          ))}
        </ul>
        <h1 className="text-4xl font-bold tracking-tight text-ink-900 sm:text-6xl">
          Learn any language.
          <br />
          <span className="text-teal-700">From the one you speak.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-600">
          {n} languages, five minutes a lesson. Hear every phrase spoken, practise with flashcards, pass a quick quiz —
          with every meaning shown in your own language, not just English.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="#pick" className="btn-primary">
            Choose a language →
          </Link>
          <Link href="/translate" className="btn-secondary">
            Translate something
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-4 border-y border-sand-200 py-8 text-center">
        <div>
          <p className="text-3xl font-bold text-ink-900">{n}</p>
          <p className="text-sm text-ink-600">languages</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-ink-900">{(n * (n - 1)).toLocaleString("en-US")}</p>
          <p className="text-sm text-ink-600">language pairs</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-ink-900">{CONCEPTS.length}</p>
          <p className="text-sm text-ink-600">phrases per course, {UNITS.length} lessons</p>
        </div>
      </section>

      <section id="pick" className="scroll-mt-28 py-10">
        <h2 className="text-2xl font-bold tracking-tight">What do you want to learn?</h2>
        <p className="mt-1 mb-5 text-ink-600">Set “I speak” at the top and every meaning appears in your language.</p>
        <LanguagePicker limit={12} />
      </section>

      <section className="grid gap-6 border-t border-sand-200 py-10 sm:grid-cols-3">
        {[
          ["👂", "Hear it", "Every phrase can be spoken aloud by your device, as often as you like."],
          ["🃏", "Practise it", "Flashcards, then a quiz both ways: what it means, and how to say it."],
          ["🔥", "Keep it", "Points for every right answer and a daily streak to keep you coming back."],
        ].map(([icon, title, body]) => (
          <div key={title}>
            <p className="text-3xl" aria-hidden>
              {icon}
            </p>
            <h3 className="mt-2 text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-ink-600">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
