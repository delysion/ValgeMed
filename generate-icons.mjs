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

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="50%" stop-color="#312e81"/>
      <stop offset="100%" stop-color="#1e3a5f"/>
    </linearGradient>
    <linearGradient id="pulse" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#a78bfa"/>
      <stop offset="50%" stop-color="#c4b5fd"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g opacity="0.04" stroke="#fff" stroke-width="1">
    <line x1="0" y1="126" x2="1200" y2="126"/>
    <line x1="0" y1="252" x2="1200" y2="252"/>
    <line x1="0" y1="378" x2="1200" y2="378"/>
    <line x1="0" y1="504" x2="1200" y2="504"/>
    <line x1="240" y1="0" x2="240" y2="630"/>
    <line x1="480" y1="0" x2="480" y2="630"/>
    <line x1="720" y1="0" x2="720" y2="630"/>
    <line x1="960" y1="0" x2="960" y2="630"/>
  </g>
  <g transform="translate(344, 50) scale(1.2)">
    <path d="M140 140 L256 380" stroke="url(#pulse)" stroke-width="28" stroke-linecap="round" fill="none"/>
    <path d="M372 140 L256 380" stroke="url(#pulse)" stroke-width="28" stroke-linecap="round" fill="none"/>
  </g>
  <text x="600" y="510" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="700" letter-spacing="10" fill="#c4b5fd">VALGEMED</text>
  <text x="600" y="565" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="22" letter-spacing="3" fill="#818cf8" opacity="0.8">a quiet command system for serious medical students</text>
</svg>`;

async function generate() {
  for (const { name, size } of sizes) {
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(join(process.cwd(), 'public/icons', name));
    console.log(`Generated ${name} (${size}x${size})`);
  }

  await sharp(Buffer.from(ogSvg))
    .png()
    .toFile(join(process.cwd(), 'public/icons/og-image.png'));
  console.log('Generated og-image.png (1200x630)');

  console.log('Done!');
}

generate().catch(console.error);
