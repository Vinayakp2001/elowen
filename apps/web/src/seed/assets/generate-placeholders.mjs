/**
 * One-time generator for committed placeholder assets.
 *
 * The seed script requires a valid local image file for every entry in
 * data/media.ts (Req 10.3 — no network calls). This script uses `sharp` (an
 * existing project dependency) to render a real, valid 800x800 JPEG for each
 * expected filename. Run it once with `node generate-placeholders.mjs` from
 * this directory; the generated .jpg files are committed to the repo.
 *
 * Using sharp (rather than an embedded base64 blob) guarantees the output is
 * a genuine JPEG that Payload's upload pipeline (image-size + sharp) accepts.
 */
import path from "path"
import { fileURLToPath } from "url"
import sharp from "sharp"

const dirname = path.dirname(fileURLToPath(import.meta.url))

// filename → [r, g, b] tint so the placeholders are visually distinguishable.
const files = {
  "category-rings.jpg": [201, 185, 154],
  "category-necklaces.jpg": [184, 151, 90],
  "category-earrings.jpg": [210, 196, 170],
  "category-bracelets.jpg": [168, 146, 112],
  "collection-aurora-hero.jpg": [60, 55, 48],
  "collection-essentials-hero.jpg": [120, 110, 95],
  "product-aurora-ring-1.jpg": [230, 220, 200],
  "product-aurora-ring-2.jpg": [225, 214, 193],
  "product-celeste-necklace-1.jpg": [205, 210, 225],
  "product-luna-earrings-1.jpg": [235, 225, 215],
  "product-seren-bracelet-1.jpg": [215, 215, 220],
  "product-verena-ring-1.jpg": [228, 212, 180],
  "product-isolde-necklace-1.jpg": [220, 200, 160],
  "product-maren-earrings-1.jpg": [232, 220, 190],
  "product-thea-bracelet-1.jpg": [200, 200, 205],
  "hero-main.jpg": [40, 38, 34],
  "campaign-banner.jpg": [70, 60, 50],
  "brand-story.jpg": [150, 135, 110],
}

for (const [file, [r, g, b]] of Object.entries(files)) {
  const target = path.join(dirname, file)
  await sharp({
    create: { width: 800, height: 800, channels: 3, background: { r, g, b } },
  })
    .jpeg({ quality: 80 })
    .toFile(target)
  console.log(`wrote: ${file}`)
}

console.log("done")
