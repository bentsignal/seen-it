// Generate PNG icons from SVG
// Run with: bun scripts/generate-icons.ts

import sharp from "sharp";
import { mkdirSync } from "fs";

const sizes = [16, 32, 48, 128];

function createSvgIcon(size: number): Buffer {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#ef4444"/>
  <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.5}" font-weight="bold">S</text>
</svg>`;
  return Buffer.from(svg);
}

async function generateIcons() {
  mkdirSync("public/icons", { recursive: true });

  for (const size of sizes) {
    const svg = createSvgIcon(size);
    await sharp(svg).png().toFile(`public/icons/icon${size}.png`);
    console.log(`Generated icon${size}.png`);
  }

  console.log("\nAll icons generated successfully!");
}

generateIcons().catch(console.error);
