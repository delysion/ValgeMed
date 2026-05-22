import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';

const svg = readFileSync(join(process.cwd(), 'public/icons/logo.svg'));

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon.png', size: 32 },
];

async function generate() {
  for (const { name, size } of sizes) {
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(join(process.cwd(), 'public/icons', name));
    console.log(`Generated ${name} (${size}x${size})`);
  }
  console.log('Done!');
}

generate().catch(console.error);
