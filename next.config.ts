import type { NextConfig } from "next";

// The first version of Feliglot was a Gulf Arabic course with its own lesson
// addresses; send anyone with an old link to the Gulf Arabic course.
const OLD_GULF_LESSONS = ["greetings", "everyday", "questions", "taxi", "shopping", "home"];

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/.well-known/assetlinks.json", destination: "/api/assetlinks" }];
  },
  async headers() {
    return [
      // The service worker must never be cached, or updates would be stuck.
      { source: "/sw.js", headers: [{ key: "cache-control", value: "no-cache" }] },
    ];
  },
  async redirects() {
    return [
      ...OLD_GULF_LESSONS.map((slug) => ({ source: `/learn/${slug}`, destination: "/learn/ar-gulf", permanent: true })),
      { source: "/phrasebook", destination: "/translate", permanent: true },
    ];
  },
};

export default nextConfig;
