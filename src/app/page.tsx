import Link from "next/link";
import SpeakButton from "@/components/SpeakButton";
import { LESSONS } from "@/lib/lessons";

export default function Home() {
  const phraseCount = LESSONS.reduce((n, l) => n + l.phrases.length, 0);
  return (
    <div>
      <section className="py-8 text-center sm:py-16">
        <p className="text-sm font-medium uppercase tracking-widest text-teal-700">Everyday Gulf Arabic</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink-900 sm:text-6xl">
          Speak Dubai, <br className="hidden sm:block" />
          not the textbook.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-ink-600">
          Most apps teach formal Arabic nobody says out loud. Feliglot teaches the words you hear in the taxi,
          the shop and your building — in five-minute lessons, spoken for you.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/learn/greetings" className="btn-primary">
            Start the first lesson →
          </Link>
          <Link href="/phrasebook" className="btn-secondary">
            Look up a phrase
          </Link>
        </div>
        <div className="mx-auto mt-12 inline-flex flex-col items-center gap-2 rounded-3xl border border-sand-200 bg-white px-10 py-6">
          <span dir="rtl" lang="ar" className="font-arabic text-4xl">
            شلونك؟
          </span>
          <span className="text-lg font-semibold text-teal-700">shlonak?</span>
          <span className="text-ink-600">How are you?</span>
          <SpeakButton text="شلونك؟" />
        </div>
      </section>

      <section className="grid gap-6 border-t border-sand-200 py-12 sm:grid-cols-3">
        {[
          ["👂", "Hear it", "Every phrase is spoken aloud. Tap and listen as many times as you like."],
          ["🃏", "Practise it", "Flashcards, then a quick quiz. Pass it and the lesson is done."],
          ["🗣️", "Say it", "Written the way it sounds, in plain English letters. No alphabet needed to start."],
        ].map(([icon, title, body]) => (
          <div key={title}>
            <p className="text-3xl" aria-hidden>
              {icon}
            </p>
            <h2 className="mt-2 text-lg font-semibold">{title}</h2>
            <p className="mt-1 text-ink-600">{body}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl bg-ink-900 p-8 text-center text-white">
        <h2 className="text-2xl font-semibold">
          {LESSONS.length} lessons · {phraseCount} phrases · free
        </h2>
        <p className="mt-2 text-white/70">Greetings, taxis, shops, and your home and building.</p>
        <Link href="/learn" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 font-medium text-ink-900">
          See all lessons
        </Link>
      </section>
    </div>
  );
}
