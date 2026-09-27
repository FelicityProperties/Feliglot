import { readFileSync } from "node:fs";
import path from "node:path";
import type { LangContent } from "./types";

// Content files double as the public JSON the browser fetches for the
// "I speak" language, so there is a single copy of every phrase.
const cache = new Map<string, LangContent>();

export function loadContent(code: string): LangContent {
  const hit = cache.get(code);
  if (hit) return hit;
  const file = path.join(process.cwd(), "public", "content", `${code}.json`);
  const data = JSON.parse(readFileSync(file, "utf8")) as LangContent;
  cache.set(code, data);
  return data;
}
