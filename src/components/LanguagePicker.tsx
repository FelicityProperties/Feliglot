"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { LANGUAGES, REGIONS, type Region } from "@/lib/languages";
import { useProgress, useSpeakLanguage } from "@/lib/store";
import { UNITS } from "@/lib/curriculum";
import { fold } from "@/lib/fold";

export default function LanguagePicker({ limit }: { limit?: number }) {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState<Region | "All">("All");
  const speak = useSpeakLanguage();
  const progress = useProgress();

  const query = fold(q);
  const list = LANGUAGES.filter(
    (l) =>
      (region === "All" || l.region === region) &&
      (!query || fold([l.name, l.nativeName, l.code, ...(l.aliases ?? [])].join(" ")).includes(query)),
  );
  // Courses the learner has started come first; the language they already
  // speak goes last (it stays findable, e.g. English for new visitors).
  const rank = (code: string) => (code === speak ? 2 : (progress.done[code]?.length ?? 0) > 0 ? 0 : 1);
  list.sort((a, b) => rank(a.code) - rank(b.code));
  const preview = Boolean(limit && !query && region === "All");
  const shown = preview ? list.filter((l) => l.code !== speak).slice(0, limit) : list;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex h-14 w-full items-center gap-3 rounded-2xl border border-sand-300 bg-card px-4 shadow-soft focus-within:border-primary">
          <Search size={20} className="shrink-0 text-ink-500" aria-hidden />
          <span className="sr-only">Find a language</span>
          <input
            id="lang-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search — e.g. Japanese, Swahili, हिन्दी"
            className="w-full bg-transparent text-base outline-none"
          />
        </label>
        <label htmlFor="lang-region" className="sr-only">
          Region
        </label>
        <select
          id="lang-region"
          value={region}
          onChange={(e) => setRegion(e.target.value as Region | "All")}
          className="h-14 rounded-2xl border border-sand-300 bg-card px-4 text-base shadow-soft"
        >
          <option value="All">All regions</option>
          {REGIONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>

      <p className="sr-only" role="status">
        {query || region !== "All" ? `${list.length} ${list.length === 1 ? "language" : "languages"} found` : ""}
      </p>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((l) => {
          const done = progress.done[l.code]?.length ?? 0;
          return (
            <li key={l.code}>
              <Link
                href={`/learn/${l.code}`}
                className="grid h-full min-h-24 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-3xl border border-sand-300 bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:border-primary"
              >
                <span dir={l.dir} lang={l.speech} className="max-w-28 truncate font-display text-2xl font-bold text-primary">
                  {l.nativeName}
                </span>
                <span className="flex min-w-0 flex-col">
                  <strong className="truncate font-display text-lg text-ink-900">{l.name}</strong>
                  <small className="text-ink-500">
                    {l.code === speak ? "You speak this" : done ? `${done} of ${UNITS.length} lessons done` : "Start learning"}
                  </small>
                </span>
                <ChevronRight size={18} className="text-ink-500" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
      {list.length === 0 && (
        <p className="mt-6 text-center text-ink-600">No course for that language yet — more are on the way.</p>
      )}
      {preview && (
        <p className="mt-6 text-center">
          <Link href="/learn" className="btn-secondary">
            See all {LANGUAGES.length} languages
          </Link>
        </p>
      )}
    </div>
  );
}
