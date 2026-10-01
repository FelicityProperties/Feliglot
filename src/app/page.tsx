import Link from "next/link";
import { ArrowRight, BookOpen, Brain, Flame, Headphones, Languages, Mic } from "lucide-react";
import Feli from "@/components/Feli";
import LanguagePicker from "@/components/LanguagePicker";
import T from "@/components/T";
import { CONCEPTS, UNITS } from "@/lib/curriculum";
import { LANGUAGES } from "@/lib/languages";

const HELLO: { t: string; l: string; rtl?: boolean; pos: string; delay: string }[] = [
  { t: "Hola", l: "es", pos: "top-[6%] left-[6%]", delay: "0s" },
  { t: "مرحبا", l: "ar", rtl: true, pos: "top-[14%] right-[2%]", delay: ".4s" },
  { t: "你好", l: "zh", pos: "top-[46%] left-0", delay: ".8s" },
  { t: "नमस्ते", l: "hi", pos: "bottom-[14%] right-[2%]", delay: "1.1s" },
  { t: "Привет", l: "ru", pos: "bottom-[3%] left-[14%]", delay: ".2s" },
  { t: "Jambo", l: "sw", pos: "top-[40%] right-0", delay: ".9s" },
  { t: "こんにちは", l: "ja", pos: "top-[1%] right-[36%]", delay: ".6s" },
];

export default function Home() {
  const n = LANGUAGES.length;
  return (
    <div>
      <section className="-mx-4 -mt-6 grid items-center gap-8 overflow-hidden bg-gradient-to-br from-background to-sand-100 px-5 py-10 sm:-mt-10 sm:px-8 sm:py-16 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <p className="eyebrow">
            <T k="app.home.eyebrow" />
          </p>
          <h1 className="mt-4 text-[2.9rem] leading-[0.95] font-black tracking-tight text-ink-900 sm:text-7xl">
            <T k="app.home.title1" />
            <br />
            <span className="text-primary">
              <T k="app.home.title2" />
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600">
            <T k="app.home.intro" />
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#pick" className="btn-primary">
              <T k="app.home.choose" /> <ArrowRight size={19} aria-hidden className="rtl:-scale-x-100" />
            </a>
            <Link href="/translate" className="btn-secondary">
              <T k="app.home.translate" />
            </Link>
          </div>
          <dl className="mt-10 flex justify-between gap-6 sm:justify-start sm:gap-12">
            {(
              [
                [String(n), "app.home.stat.languages"],
                [(n * (n - 1)).toLocaleString("en-US"), "app.home.stat.pairs"],
                ["app.home.stat.free", "app.home.stat.everyone"],
              ] as const
            ).map(([v, l]) => (
              <div key={l} className="flex flex-col-reverse">
                <dt className="text-xs tracking-widest text-ink-500 uppercase">
                  <T k={l} />
                </dt>
                <dd className="font-display text-2xl font-black text-ink-900 sm:text-3xl">{v === "app.home.stat.free" ? <T k={v} /> : v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative mx-auto grid h-[360px] w-full max-w-[460px] place-items-center sm:h-[480px]" aria-hidden>
          <div className="absolute h-[280px] w-[280px] rounded-full border-2 border-dashed border-primary/30 bg-primary-soft sm:h-[400px] sm:w-[400px]" />
          {HELLO.map((h) => (
            <span
              key={h.l}
              lang={h.l}
              dir={h.rtl ? "rtl" : "ltr"}
              className={`float absolute z-10 rounded-2xl border border-sand-300 bg-card px-4 py-2 text-sm font-extrabold shadow-soft sm:text-base ${h.pos}`}
              style={{ animationDelay: h.delay }}
            >
              {h.t}
            </span>
          ))}
          <Feli size={240} className="float relative drop-shadow-xl" decorative />
        </div>
      </section>

      <section id="pick" className="scroll-mt-32 py-14">
        <p className="eyebrow">
          <T k="app.home.pick.eyebrow" />
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          <T k="app.home.pick.title" />
        </h2>
        <p className="mt-2 mb-6 text-ink-600">
          <T k="app.home.pick.body" />
        </p>
        <LanguagePicker limit={12} />
      </section>

      <section className="-mx-4 bg-sand-100 px-5 py-14 sm:px-8">
        <p className="eyebrow">
          <T k="app.home.how.eyebrow" />
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          <T k="app.home.how.title" />
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {(
            [
              [Headphones, "hear"],
              [BookOpen, "practise"],
              [Flame, "keep"],
            ] as const
          ).map(([I, key], i) => (
            <div key={key} className="relative border-t border-sand-300 pt-6">
              <span className="absolute top-4 right-2 font-display text-3xl font-black text-sand-200 rtl:right-auto rtl:left-2">0{i + 1}</span>
              <I size={36} className="text-primary" aria-hidden />
              <h3 className="mt-4 text-2xl font-extrabold">
                <T k={`app.home.how.${key}.title`} />
              </h3>
              <p className="mt-1 text-ink-600">
                <T k={`app.home.how.${key}.body`} />
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-14">
        <p className="eyebrow">
          <T k="app.home.why.eyebrow" />
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          <T k="app.home.why.title" />
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {(
            [
              [Languages, "own"],
              [Mic, "speak"],
              [Brain, "remember"],
              [BookOpen, "content"],
            ] as const
          ).map(([I, key]) => (
            <div key={key} className="panel flex gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
                <I size={24} aria-hidden />
              </span>
              <div>
                <h3 className="text-lg font-extrabold">
                  <T k={`app.home.why.${key}.title`} vars={{ phrases: CONCEPTS.length, lessons: UNITS.length }} />
                </h3>
                <p className="mt-1 text-ink-600">
                  <T k={`app.home.why.${key}.body`} vars={{ n }} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl bg-primary px-6 py-10 text-on-primary sm:px-10">
        <div className="max-w-lg">
          <h2 className="text-3xl font-black">
            <T k="app.home.cta.title" />
          </h2>
          <p className="mt-2 opacity-90">
            <T k="app.home.cta.body" />
          </p>
          <Link href="/learn" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-card px-5 font-display font-extrabold text-primary">
            <T k="app.home.cta.button" /> <ArrowRight size={18} aria-hidden className="rtl:-scale-x-100" />
          </Link>
        </div>
        <Feli mood="cheer" size={150} className="absolute -right-4 -bottom-6 hidden sm:block rtl:right-auto rtl:-left-4" decorative />
      </section>
    </div>
  );
}
