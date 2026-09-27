"use client";

import { useState } from "react";
import Link from "next/link";
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
        <label htmlFor="lang-search" className="sr-only">
          Find a language
        </label>
        <input
          id="lang-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find a language — e.g. Japanese, Swahili, हिन्दी"
          className="w-full rounded-2xl border border-sand-300 bg-white px-5 py-3 text-base outline-none focus:border-teal-600"
        />
        <label htmlFor="lang-region" className="sr-only">
          Region
        </label>
        <select
          id="lang-region"
          value={region}
          onChange={(e) => setRegion(e.target.value as Region | "All")}
          className="rounded-2xl border border-sand-300 bg-white px-4 py-3 text-base"
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

      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((l) => {
          const done = progress.done[l.code]?.length ?? 0;
          return (
            <li key={l.code}>
              <Link
                href={`/learn/${l.code}`}
                className="flex h-full flex-col rounded-2xl border border-sand-200 bg-white p-4 transition hover:border-teal-600 hover:shadow-sm"
              >
                <span dir={l.dir} lang={l.speech} className="truncate text-xl font-semibold text-ink-900">
                  {l.nativeName}
                </span>
                <span className="mt-0.5 text-sm text-ink-600">{l.name}</span>
                <span className="mt-2 text-xs text-ink-500">
                  {l.code === speak
                    ? "You speak this"
                    : done
                      ? `${done} of ${UNITS.length} lessons done`
                      : "Start learning →"}
                </span>
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
