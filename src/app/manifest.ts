import type { MetadataRoute } from "next";

// Lets people add Feliglot to their phone's home screen like an app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Feliglot",
    short_name: "Feliglot",
    description: "Learn any language, from any language.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf8f3",
    theme_color: "#0b6d63",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
