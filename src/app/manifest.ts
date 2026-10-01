import type { MetadataRoute } from "next";
import { LANGUAGES } from "@/lib/languages";

// Makes Feliglot installable (home screen, desktop) and is the basis for the
// Play Store app, which wraps this site in a Trusted Web Activity.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Feliglot — Learn any language",
    short_name: "Feliglot",
    description: `Learn any of ${LANGUAGES.length} languages from the one you speak: five-minute lessons, speaking practice and reviews.`,
    start_url: "/learn?source=app",
    scope: "/",
    display: "standalone",
    background_color: "#fdf8f3",
    theme_color: "#00705e",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Review", short_name: "Review", url: "/review?source=shortcut", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Translate", short_name: "Translate", url: "/translate?source=shortcut", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
