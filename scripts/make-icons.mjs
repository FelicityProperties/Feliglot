// Builds every PNG/ICO app icon from src/app/icon.svg (the favicon).
// Run: node scripts/make-icons.mjs
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const svg = readFileSync("src/app/icon.svg", "utf8");
// Full-bleed square (no rounded corners): phones apply their own mask.
const square = svg.replace('rx="14"', 'rx="0"');
// Maskable: face shrunk into the centre 80% "safe zone" on a full teal square.
const maskable = square
  .replace(/(<path d="M13)/, '<g transform="translate(32 34) scale(0.78) translate(-32 -34)">$1')
  .replace("</svg>", "</g></svg>");

const png = (src, size) => sharp(Buffer.from(src), { density: 72 * (size / 64) * 2 }).resize(size, size).png().toBuffer();

writeFileSync("public/icons/icon-192.png", await png(square, 192));
writeFileSync("public/icons/icon-512.png", await png(square, 512));
writeFileSync("public/icons/maskable-512.png", await png(maskable, 512));
writeFileSync("public/icons/apple-touch-icon.png", await png(square, 180));
writeFileSync("docs/play-store/icon-512.png", await sharp(await png(square, 512)).ensureAlpha().png().toBuffer());

// favicon.ico with 16, 32 and 48 px PNG images inside.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((s) => png(svg, s)));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(s, e);
  header.writeUInt8(s, e + 1);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(images[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += images[i].length;
});
writeFileSync("src/app/favicon.ico", Buffer.concat([header, ...images]));
console.log("icons written");
