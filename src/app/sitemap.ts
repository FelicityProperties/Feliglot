import type { MetadataRoute } from "next";
import { UNITS } from "@/lib/curriculum";
import { LANGUAGES } from "@/lib/languages";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://feliglot.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, priority: 1 },
    { url: `${SITE}/learn`, priority: 0.9 },
    { url: `${SITE}/translate`, priority: 0.8 },
    ...LANGUAGES.flatMap((l) => [
      { url: `${SITE}/learn/${l.code}`, priority: 0.8 },
      ...UNITS.map((u) => ({ url: `${SITE}/learn/${l.code}/${u.slug}`, priority: 0.5 })),
    ]),
  ];
}
