import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FlowAsset from './models/FlowAsset.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('🌱 Connected to MongoDB Atlas!');
    const assets = await FlowAsset.find();
    console.log(`\n📋 Found ${assets.length} FlowAsset(s) in MongoDB database:\n`);
    assets.forEach(a => {
      console.log(`AssetKey: "${a.assetKey}"`);
      console.log(`Title: "${a.title}"`);
      console.log(`ImageUrl: "${a.imageUrl}"`);
      console.log(`TextContent: "${a.textContent}"`);
      console.log('--------------------------------------------------');
    });
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ DB Error:', err);
    process.exit(1);
  });
