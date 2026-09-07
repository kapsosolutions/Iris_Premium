import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public');
const svgPath = path.join(PUBLIC_DIR, 'hero.svg');

try {
  const content = fs.readFileSync(svgPath, 'utf8');
  const idx = content.indexOf('base64,');

  if (idx !== -1) {
    const endIdx = content.indexOf('"', idx);
    const rawBase64 = content.substring(idx + 7, endIdx).replace(/\s+/g, '');
    const buffer = Buffer.from(rawBase64, 'base64');
    fs.writeFileSync(path.join(PUBLIC_DIR, 'hero.jpg'), buffer);
    console.log(`🎉 SUCCESS! Extracted hero.jpg (${buffer.length} bytes) to public/hero.jpg`);
  } else {
    console.log('base64, substring not found');
  }
} catch (err) {
  console.error('Error:', err.message);
}
