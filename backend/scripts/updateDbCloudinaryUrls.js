import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import Product from '../models/Product.js';
import FlowAsset from '../models/FlowAsset.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const URLS = {
  reserve: 'https://res.cloudinary.com/zavohueh/image/upload/v1/iris_premium/iris_reserve.jpg',
  wedding: 'https://res.cloudinary.com/zavohueh/image/upload/v1/iris_premium/iris_wedding.jpg',
  matte_black: 'https://res.cloudinary.com/zavohueh/image/upload/v1787627493/iris_premium_bottles/iris_matte_black.jpg',
  corporate: 'https://res.cloudinary.com/zavohueh/image/upload/v1787627496/iris_premium_bottles/iris_corporate.jpg'
};

async function updateDb() {
  console.log('🔄 Connecting to MongoDB Atlas to update all product image URLs...');
  await mongoose.connect(MONGODB_URI);

  // Clear & re-seed products with verified Cloudinary URLs
  await Product.deleteMany({});

  await Product.insertMany([
    {
      name: '750ml Heavy Glass Reserve',
      category: 'Fine Dining & Hospitality',
      badge: 'FLAGSHIP VESSEL',
      description: 'Flint heavy crystal glass with 24K gold foil waterproof label. Crafted for 5-star banquet tables and ice bucket service.',
      price: 95,
      mainImage: URLS.reserve,
      galleryImages: [URLS.reserve, URLS.wedding],
      variants: [
        { size: '750ml', labelFinish: '24K Embossed Gold Foil', price: 95, mainImage: URLS.reserve },
        { size: '500ml', labelFinish: 'Spot UV Gloss', price: 75, mainImage: URLS.reserve }
      ],
      active: true
    },
    {
      name: '500ml Monogram Wedding Glass',
      category: 'Luxury Weddings & Events',
      badge: 'ROYAL WEDDING SELECTION',
      description: 'Custom rose gold & silver monogram embossed labels for royal reception tables. Zero peeling after 48h in ice buckets.',
      price: 85,
      mainImage: URLS.wedding,
      galleryImages: [URLS.wedding, URLS.reserve],
      variants: [
        { size: '500ml', labelFinish: 'Rose Gold Metallic Foil', price: 85, mainImage: URLS.wedding },
        { size: '330ml', labelFinish: 'Custom Monogram Foil', price: 65, mainImage: URLS.wedding }
      ],
      active: true
    },
    {
      name: '330ml VIP Matte Black Label',
      category: 'Private Aviation & Galas',
      badge: 'EXECUTIVE VIP',
      description: 'Sleek matte black tactile finish bottle with metallic gold foil typography. Designed for executive suites and private jets.',
      price: 75,
      mainImage: URLS.matte_black,
      galleryImages: [URLS.matte_black],
      variants: [
        { size: '330ml', labelFinish: 'Matte Black Velvet Foil', price: 75, mainImage: URLS.matte_black }
      ],
      active: true
    },
    {
      name: '500ml Corporate Premium PET',
      category: 'Corporate Conventions',
      badge: 'EXECUTIVE CONVENTIONS',
      description: '100% Recyclable BPA-free heavy PET bottle with metallic brand logo label. Ideal for high-volume corporate summits.',
      price: 45,
      mainImage: URLS.corporate,
      galleryImages: [URLS.corporate],
      variants: [
        { size: '500ml', labelFinish: 'Waterproof Metallic Vinyl', price: 45, mainImage: URLS.corporate }
      ],
      active: true
    }
  ]);

  console.log('✅ Products updated in MongoDB with working Cloudinary URLs!');

  // Update FlowAssets
  await FlowAsset.deleteMany({});
  await FlowAsset.insertMany([
    { assetKey: 'welcome_banner', title: 'WhatsApp Welcome Flow Banner Image', imageUrl: URLS.reserve },
    { assetKey: 'choose_service_header', title: 'Choose Service Header Image', imageUrl: URLS.reserve },
    { assetKey: 'catalog_header', title: 'Catalog List Header Image', imageUrl: URLS.wedding },
    { assetKey: 'my_orders_header', title: 'My Orders Header Image', imageUrl: URLS.matte_black },
    { assetKey: 'track_order_header', title: 'Track Order Header Image', imageUrl: URLS.corporate },
    { assetKey: 'contact_header', title: 'Contact Us Header Image', imageUrl: URLS.reserve }
  ]);

  console.log('✅ FlowAssets updated in MongoDB with working Cloudinary URLs!');
  process.exit(0);
}

updateDb().catch(err => {
  console.error(err);
  process.exit(1);
});
