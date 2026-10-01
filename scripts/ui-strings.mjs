// Site-text translations (public/ui/<language>.json).
//   node scripts/ui-strings.mjs export      → prints the English source as JSON
//   node scripts/ui-strings.mjs check       → checks every translation file
// A translation must have the same keys and the same {placeholders} as the
// English; counts ({n}) may use any plural forms of its own language.
import { readFileSync, readdirSync } from "node:fs";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url, { alias: { "@": new URL("../src", import.meta.url).pathname } });
const { EN } = await jiti.import("../src/lib/ui/index.ts");
const { LANGUAGES } = await jiti.import("../src/lib/languages.ts");

const mode = process.argv[2];
if (mode === "export") {
  process.stdout.write(JSON.stringify(EN, null, 2) + "\n");
  process.exit(0);
}

const FORMS = new Set(["zero", "one", "two", "few", "many", "other"]);
const holes = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");
let errors = 0;
let warnings = 0;
const err = (m) => (errors++, console.log("✗ " + m));
const warn = (m) => (warnings++, console.log("! " + m));

const dir = new URL("../public/ui/", import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
for (const l of LANGUAGES) if (l.code !== "en" && !files.includes(`${l.code}.json`)) err(`${l.code}: no translation file`);
for (const f of files) {
  const code = f.replace(/\.json$/, "");
  let d;
  try {
    d = JSON.parse(readFileSync(new URL(f, dir), "utf8"));
  } catch (e) {
    err(`${code}: not valid JSON (${e.message})`);
    continue;
  }
  for (const k of Object.keys(EN)) if (!(k in d)) err(`${code}: missing ${k}`);
  for (const [k, v] of Object.entries(d)) {
    if (!(k in EN)) {
      warn(`${code}: unknown key ${k}`);
      continue;
    }
    // The English "other" form carries every placeholder a count sentence uses.
    const want = holes(typeof EN[k] === "string" ? EN[k] : EN[k].other);
    if (typeof v === "string") {
      if (!v.trim()) err(`${code}: ${k} is empty`);
      if (holes(v) !== want) err(`${code}: ${k} placeholders {${holes(v)}} ≠ {${want}}`);
    } else if (v && typeof v === "object") {
      if (typeof v.other !== "string") err(`${code}: ${k} plural has no "other"`);
      for (const [form, s] of Object.entries(v)) {
        if (!FORMS.has(form)) err(`${code}: ${k} has unknown plural form "${form}"`);
        else if (typeof s !== "string" || !s.trim()) err(`${code}: ${k}.${form} is empty`);
        // {n} may be left out of a form ("a phrase"); everything else must match.
        else if (holes(s).split(",").filter((x) => x && x !== "n").join() !== want.split(",").filter((x) => x && x !== "n").join())
          err(`${code}: ${k}.${form} placeholders {${holes(s)}} ≠ {${want}}`);
      }
    } else err(`${code}: ${k} has the wrong type`);
  }
}
console.log(`${files.length} translation file(s): ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
