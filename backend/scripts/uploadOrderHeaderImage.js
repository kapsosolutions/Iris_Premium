import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'zavohueh',
  api_key: process.env.CLOUDINARY_API_KEY || '214628577377841',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'dJOyJ-snjH08vk3EFbQ-qP7e-TA'
});

async function uploadHeader() {
  try {
    const imagePath = path.join(__dirname, '..', '..', 'public', 'order_header.jpg');
    console.log('📤 Uploading order header banner image to Cloudinary...', imagePath);
    
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'iris_order_headers',
      public_id: 'order_request_header_banner',
      overwrite: true
    });

    console.log('✅ Cloudinary Upload Success!');
    console.log('🌐 Header Image URL:', result.secure_url);

    // Save URL to backend/.env as META_ORDER_HEADER_IMAGE_URL
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('META_ORDER_HEADER_IMAGE_URL=')) {
      envContent = envContent.replace(/META_ORDER_HEADER_IMAGE_URL=.*/g, `META_ORDER_HEADER_IMAGE_URL=${result.secure_url}`);
    } else {
      envContent += `\nMETA_ORDER_HEADER_IMAGE_URL=${result.secure_url}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated META_ORDER_HEADER_IMAGE_URL in backend/.env!');
  } catch (err) {
    console.error('❌ Cloudinary Upload Failed:', err);
  }
}

uploadHeader();
