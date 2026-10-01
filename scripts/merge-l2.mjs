// Folds the Level 2 drafts (public/content/l2/<code>.json) into each
// language's main content file, keeping curriculum order, then removes the
// drafts. Run after every draft passes `node scripts/validate-content.mjs --l2`.
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { CONCEPTS } from "../src/lib/curriculum.ts";
import { LANGUAGES } from "../src/lib/languages.ts";

const dir = new URL("../public/content/", import.meta.url);
let merged = 0;
for (const l of LANGUAGES) {
  const draft = new URL(`l2/${l.code}.json`, dir);
  if (!existsSync(draft)) continue;
  const main = JSON.parse(readFileSync(new URL(`${l.code}.json`, dir), "utf8"));
  const extra = JSON.parse(readFileSync(draft, "utf8")).phrases;
  const all = { ...main.phrases, ...extra };
  const phrases = {};
  for (const c of CONCEPTS) if (all[c.id]) phrases[c.id] = all[c.id];
  writeFileSync(new URL(`${l.code}.json`, dir), JSON.stringify({ code: l.code, phrases }, null, 2) + "\n");
  rmSync(draft);
  merged++;
}
console.log(`merged Level 2 into ${merged} language file(s)`);
