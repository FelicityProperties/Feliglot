// Checks every language file in public/content against the shared course.
// Usage: node scripts/validate-content.mjs [--l2] [code ...]   (no codes = all)
//   --l2  check the Level 2 drafts in public/content/l2/<code>.json against
//         the Level 2 phrases only (they are merged in by scripts/merge-l2.mjs)
// Exit code 1 on any error. Warnings are printed but do not fail.
import { readFileSync, existsSync } from "node:fs";
import { UNITS } from "../src/lib/curriculum.ts";
import { LANGUAGES } from "../src/lib/languages.ts";

const L2 = process.argv.includes("--l2");
const root = new URL(L2 ? "../public/content/l2/" : "../public/content/", import.meta.url);
const wanted = process.argv.slice(2).filter((a) => a !== "--l2");
// English is generated from the curriculum, so it has no Level 2 draft.
const pool = L2 ? LANGUAGES.filter((l) => l.code !== "en") : LANGUAGES;
const langs = wanted.length ? pool.filter((l) => wanted.includes(l.code)) : pool;
if (wanted.length && langs.length !== wanted.length) {
  console.error("Unknown language code in:", wanted.join(" "));
  process.exit(1);
}

const units = L2 ? UNITS.filter((u) => u.level === 2) : UNITS;
const concepts = units.flatMap((u) => u.concepts);
const ids = concepts.map((c) => c.id);
const en = Object.fromEntries(concepts.map((c) => [c.id, c.en]));
let errors = 0;
let warnings = 0;
const err = (code, msg) => (errors++, console.error(`✗ ${code}: ${msg}`));
const warn = (code, msg) => (warnings++, console.warn(`! ${code}: ${msg}`));

const LATIN = /[A-Za-z]/;
const RTL_CHARS = /[֐-ࣿ]/;

for (const lang of langs) {
  const file = new URL(`${lang.code}.json`, root);
  if (!existsSync(file)) {
    err(lang.code, "content file missing");
    continue;
  }
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    err(lang.code, `invalid JSON: ${e.message}`);
    continue;
  }
  if (data.code !== lang.code) err(lang.code, `"code" is ${JSON.stringify(data.code)}`);
  const phrases = data.phrases ?? {};
  const keys = Object.keys(phrases);
  for (const id of ids) if (!(id in phrases)) err(lang.code, `missing ${id}`);
  for (const k of keys) if (!ids.includes(k)) err(lang.code, `unknown concept ${k}`);

  for (const id of ids) {
    const p = phrases[id];
    if (!p) continue;
    const allowed = new Set(["text", "roman", "note"]);
    for (const f of Object.keys(p)) if (!allowed.has(f)) err(lang.code, `${id}: unexpected field "${f}"`);
    if (typeof p.text !== "string" || !p.text.trim()) {
      err(lang.code, `${id}: empty text`);
      continue;
    }
    if (p.text !== p.text.trim()) err(lang.code, `${id}: text has leading/trailing spaces`);
    if (lang.romanization) {
      if (typeof p.roman !== "string" || !p.roman.trim()) err(lang.code, `${id}: missing roman`);
      else if (!LATIN.test(p.roman)) err(lang.code, `${id}: roman has no Latin letters`);
    } else if (p.roman !== undefined) {
      err(lang.code, `${id}: roman given for a Latin-script language`);
    }
    if (p.note !== undefined && (typeof p.note !== "string" || !p.note.trim())) err(lang.code, `${id}: empty note`);
    if (p.note && p.note.length > 160) warn(lang.code, `${id}: note is long (${p.note.length} chars)`);
    const hasBlank = en[id].includes("…");
    if (hasBlank !== p.text.includes("…")) err(lang.code, `${id}: "…" placeholder mismatch`);
    if (lang.romanization && hasBlank && typeof p.roman === "string" && !p.roman.includes("…"))
      err(lang.code, `${id}: "…" missing from roman`);
    if (lang.dir === "rtl" && !RTL_CHARS.test(p.text)) err(lang.code, `${id}: RTL language but no RTL script`);
    if (lang.romanization && LATIN.test(p.text.replace(/…/g, ""))) warn(lang.code, `${id}: Latin letters inside non-Latin text: ${p.text}`);
    if (lang.code !== "en" && p.text.toLowerCase() === en[id].toLowerCase())
      warn(lang.code, `${id}: identical to English (${p.text}) — fine only if that is really what is said`);
  }
  // Duplicate texts inside one unit: the quiz never offers them as rival
  // options, but flag them so a reviewer can confirm they are really the same.
  for (const u of units) {
    const seen = new Map();
    for (const c of u.concepts) {
      const t = phrases[c.id]?.text?.toLowerCase();
      if (!t) continue;
      if (seen.has(t)) warn(lang.code, `${u.slug}: ${seen.get(t)} and ${c.id} are identical (${t})`);
      else seen.set(t, c.id);
    }
  }
}

console.log(`${langs.length} language(s) checked: ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
