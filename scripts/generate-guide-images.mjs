import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const API_KEY = process.env.OPENAI_API_KEY;
const OUT_DIR = fileURLToPath(new URL('../public/assets/images', import.meta.url));

const images = [
  {
    filename: 'ghid-cum-alegi-masina-de-spalat-rufe.webp',
    prompt: 'A clean, modern photograph of a bright laundry room with a white front-loading washing machine, neatly folded towels, and a basket of colorful clothes. Natural light from a window, minimal Scandinavian interior design. Professional product photography style, editorial quality, warm tones.',
  },
  {
    filename: 'capacitate-masina-de-spalat-7kg-8kg.webp',
    prompt: 'Top-down flat lay photograph comparing two piles of laundry on a clean white surface. One smaller pile labeled concept for 7kg, one larger pile for 8kg. Colorful cotton clothes, towels, bed sheets neatly arranged. Clean minimal photography, soft shadows, editorial style.',
  },
  {
    filename: 'consum-energie-masina-spalat-clasa-a.webp',
    prompt: 'A modern washing machine in a bright kitchen with a visible EU energy label showing class A rating. Clean minimal interior, white and light wood tones. The energy label is prominent. Professional editorial photography, warm natural lighting.',
  },
  {
    filename: 'masina-de-spalat-cu-uscator-slim.webp',
    prompt: 'A compact washer-dryer combo machine installed in a small modern apartment bathroom niche. The space is tight but well-organized, showing how the slim machine fits perfectly. White tiles, modern fixtures, clean and bright. Editorial interior photography style.',
  },
  {
    filename: 'intretinere-masina-de-spalat-rufe.webp',
    prompt: 'Close-up photograph of someone cleaning a washing machine filter and wiping the rubber door gasket. Clean hands, modern white washing machine, cleaning cloth. Bright laundry room background. Professional how-to photography style, sharp focus on the maintenance action.',
  },
];

async function generateImage(prompt, filename) {
  console.log(`Generating: ${filename}`);

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size: '1536x1024',
      quality: 'high',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`  FAIL: ${err}`);
    return;
  }

  const data = await res.json();
  const b64 = data.data[0].b64_json;
  const buffer = Buffer.from(b64, 'base64');

  // Convert to webp with sharp
  const sharp = (await import('sharp')).default;
  await sharp(buffer)
    .resize(1200, 600, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile(`${OUT_DIR}/${filename}`);

  console.log(`  OK: ${filename}`);
}

for (const img of images) {
  await generateImage(img.prompt, img.filename);
}

console.log('\nDone!');
