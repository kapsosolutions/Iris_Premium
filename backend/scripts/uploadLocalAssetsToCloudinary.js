import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'zavohueh',
  api_key: process.env.CLOUDINARY_API_KEY || '214628577377841',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'dJOyJ-snjH08vk3EFbQ-qP7e-TA'
});

const PUBLIC_ASSETS_DIR = path.join(__dirname, '..', '..', 'public', 'assets');

const imageFiles = [
  'iris_reserve.jpg',
  'iris_wedding.jpg',
  'iris_matte_black.jpg',
  'iris_corporate.jpg'
];

async function uploadAll() {
  console.log('☁️ Uploading local bottle images to Cloudinary (zavohueh)...');
  const uploadedUrls = {};

  for (const filename of imageFiles) {
    const filePath = path.join(PUBLIC_ASSETS_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      continue;
    }

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'iris_premium_bottles',
        public_id: path.parse(filename).name,
        overwrite: true
      });

      console.log(`✅ Uploaded "${filename}" -> ${result.secure_url}`);
      uploadedUrls[filename] = result.secure_url;
    } catch (err) {
      console.error(`❌ Error uploading "${filename}":`, err.message);
    }
  }

  console.log('\n========================================');
  console.log('Uploaded Cloudinary URLs:');
  console.log(uploadedUrls);
  console.log('========================================\n');
}

uploadAll();
