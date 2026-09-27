// English is the course's source language, so its content file is generated
// straight from the curriculum rather than translated.
import { writeFileSync } from "node:fs";
import { UNITS } from "../src/lib/curriculum.ts";

const phrases = {};
for (const c of UNITS.flatMap((u) => u.concepts)) phrases[c.id] = { text: c.en };
writeFileSync(
  new URL("../public/content/en.json", import.meta.url),
  JSON.stringify({ code: "en", phrases }, null, 2) + "\n",
);
console.log("wrote public/content/en.json");
