"use client";

import { useState } from "react";
import Link from "next/link";
import { ALL_PHRASES } from "@/lib/lessons";
import SpeakButton from "./SpeakButton";

function normalise(s: string) {
  return s.toLowerCase().replace(/['’?!.,/()-]/g, " ").replace(/\s+/g, " ").trim();
}

export default function Phrasebook() {
  const [q, setQ] = useState("");
  const query = normalise(q);
  const results = query
    ? ALL_PHRASES.filter((p) => normalise(`${p.en} ${p.say} ${p.note ?? ""}`).includes(query) || p.ar.includes(q.trim()))
    : ALL_PHRASES;

  return (
    <div>
      <label htmlFor="search" className="sr-only">
        Search phrases
      </label>
      <input
        id="search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Type in English, e.g. “how much” or “stop here”"
        className="w-full rounded-2xl border border-sand-300 bg-white px-5 py-4 text-lg outline-none focus:border-teal-600"
        autoFocus
      />
      <p className="mt-3 text-sm text-ink-500">
        {results.length} {results.length === 1 ? "phrase" : "phrases"}
      </p>
      <ul className="mt-3 divide-y divide-sand-200 rounded-2xl border border-sand-200 bg-white">
        {results.map((p) => (
          <li key={p.lessonSlug + p.ar} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="font-semibold text-ink-900">{p.en}</p>
              <p className="text-teal-700">{p.say}</p>
              <Link href={`/learn/${p.lessonSlug}`} className="text-xs text-ink-500 hover:underline">
                {p.lesson}
              </Link>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <span dir="rtl" lang="ar" className="font-arabic text-xl text-ink-900">
                {p.ar}
              </span>
              <SpeakButton text={p.ar} />
            </div>
          </li>
        ))}
      </ul>
      {results.length === 0 && (
        <p className="mt-6 text-center text-ink-600">
          Not in the phrasebook yet — more phrases are on the way.
        </p>
      )}
    </div>
  );
}
