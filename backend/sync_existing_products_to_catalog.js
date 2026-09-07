import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import { syncProductToMetaCatalog } from './services/catalogService.js';

dotenv.config();

async function syncExistingProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🌱 Connected to MongoDB Atlas!');

    const products = await Product.find();
    console.log(`Found ${products.length} products in MongoDB.`);

    for (const prod of products) {
      if (!prod.bottleSize) {
        if (prod.name.includes('500ml')) prod.bottleSize = '500ml Custom Label';
        else if (prod.name.includes('250ml')) prod.bottleSize = '250ml VIP Mini';
        else if (prod.name.includes('1000ml')) prod.bottleSize = '1000ml Executive Pitcher';
        else prod.bottleSize = '750ml Heavy Glass Reserve';
      }

      if (!prod.retailerId) {
        prod.retailerId = `iris_prod_${prod._id}`;
      }

      await prod.save();
      console.log(`✅ Updated Product "${prod.name}" (Bottle Size: ${prod.bottleSize})`);

      await syncProductToMetaCatalog(prod);
    }

    console.log('\n🎉 All products updated with Bottle Size & synced to Meta Commerce Catalog!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error syncing existing products:', err);
    process.exit(1);
  }
}

syncExistingProducts();
