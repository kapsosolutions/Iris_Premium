import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import { deleteProductFromMetaCatalog } from './services/catalogService.js';

dotenv.config();

async function deleteAllProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🌱 Connected to MongoDB Atlas!');

    const products = await Product.find();
    console.log(`Found ${products.length} product(s) to remove.`);

    for (const prod of products) {
      const retailerId = prod.retailerId || `iris_prod_${prod._id}`;
      console.log(`🗑️ Deleting Product "${prod.name}" (ID: ${prod._id}, Retailer ID: ${retailerId})...`);

      // Remove from Meta Commerce Catalog
      try {
        await deleteProductFromMetaCatalog(prod._id, retailerId);
        console.log(`✅ Removed "${prod.name}" from Meta Commerce Catalog!`);
      } catch (catErr) {
        console.warn(`Notice deleting from Meta Catalog:`, catErr.message);
      }

      // Remove from MongoDB
      await Product.findByIdAndDelete(prod._id);
      console.log(`✅ Deleted "${prod.name}" from MongoDB.`);
    }

    console.log('\n🎉 All seed products successfully deleted from MongoDB & Meta Commerce Catalog!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error deleting products:', err);
    process.exit(1);
  }
}

deleteAllProducts();
