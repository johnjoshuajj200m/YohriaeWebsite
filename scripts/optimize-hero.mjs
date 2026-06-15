/**
 * Generates responsive WebP hero images for LCP preload (run before build).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const source = path.join(root, "src/assets/PHOTO-2026-06-13-18-17-48.jpg");
const outDir = path.join(root, "public/images");

const variants = [
  { name: "hero-640.webp", width: 640, quality: 72 },
  { name: "hero-960.webp", width: 960, quality: 74 },
  { name: "hero-1280.webp", width: 1280, quality: 76 },
  { name: "hero-1920.webp", width: 1920, quality: 78 },
  { name: "hero-1280.jpg", width: 1280, quality: 82, format: "jpeg" },
];

await mkdir(outDir, { recursive: true });

const meta = {};
for (const { name, width, quality, format = "webp" } of variants) {
  const dest = path.join(outDir, name);
  let pipeline = sharp(source).rotate().resize({ width, withoutEnlargement: true });
  if (format === "jpeg") {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  } else {
    pipeline = pipeline.webp({ quality, effort: 4 });
  }
  const info = await pipeline.toFile(dest);
  meta[name] = { width: info.width, height: info.height, bytes: info.size };
  console.log(`[optimize-hero] ${name} → ${(info.size / 1024).toFixed(1)} KB (${info.width}x${info.height})`);
}

await writeFile(
  path.join(outDir, "hero-meta.json"),
  JSON.stringify(meta, null, 2),
);
