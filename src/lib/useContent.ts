"use client";

import { useEffect, useState } from "react";
import type { LangContent } from "./types";

// Loads a language's phrases in the browser (for the "I speak" language and
// the translator). Results are shared across components and page changes.
const cache = new Map<string, Promise<LangContent>>();

export function fetchContent(code: string): Promise<LangContent> {
  let p = cache.get(code);
  if (!p) {
    p = fetch(`/content/${encodeURIComponent(code)}.json`).then((r) => {
      if (!r.ok) throw new Error(`content ${code}: ${r.status}`);
      return r.json() as Promise<LangContent>;
    });
    // A failed load should be retried next time, not remembered.
    p.catch(() => cache.delete(code));
    cache.set(code, p);
  }
  return p;
}

type State = { code: string | null; content: LangContent | null; failed: boolean };

export function useContent(code: string | null): { content: LangContent | null; failed: boolean; retry: () => void } {
  const [state, setState] = useState<State>({ code: null, content: null, failed: false });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!code) return;
    let live = true;
    fetchContent(code)
      .then((c) => live && setState({ code, content: c, failed: false }))
      .catch(() => live && setState({ code, content: null, failed: true }));
    return () => {
      live = false;
    };
  }, [code, attempt]);
  // Never hand back a previous language's phrases (or error) while the next one loads.
  const current = state.code === code;
  return {
    content: current ? state.content : null,
    failed: current && state.failed,
    retry: () => {
      setState({ code: null, content: null, failed: false });
      setAttempt((n) => n + 1);
    },
  };
}
