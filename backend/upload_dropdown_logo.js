import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import FlowAsset from './models/FlowAsset.js';
import { uploadToCloudinary } from './services/cloudinaryService.js';

dotenv.config();

const LOGO_PATH = 'C:/Users/Admin/Desktop/Prodution/dropdown_logo.png';

async function uploadLogo() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🌱 Connected to MongoDB Atlas!');

    console.log('Reading file:', LOGO_PATH);
    const fileBuffer = fs.readFileSync(LOGO_PATH);

    console.log('Uploading 1:1 Dropdown Logo to Cloudinary...');
    const uploadResult = await uploadToCloudinary(fileBuffer, 'iris_flow_images');
    console.log('✅ Uploaded to Cloudinary successfully! URL:', uploadResult.secure_url);

    // Save/Update in FlowAsset DB
    const assetKey = 'choose_service_row_icon';
    const updated = await FlowAsset.findOneAndUpdate(
      { assetKey },
      {
        assetKey,
        title: '🏷️ 1:1 Choose Service Dropdown Row Logo Icon',
        imageUrl: uploadResult.secure_url
      },
      { upsert: true, new: true }
    );

    console.log('✅ Registered FlowAsset in MongoDB:', updated);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error uploading dropdown logo:', err);
    process.exit(1);
  }
}

uploadLogo();
