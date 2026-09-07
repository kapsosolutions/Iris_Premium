import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FlowAsset from './models/FlowAsset.js';

dotenv.config();

const DEFAULT_1TO1_LOGO = 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png';

const FOUR_ICONS = [
  { key: 'icon_book_order', title: '🏷️ 1:1 Square Logo Icon — "Book Order" Option' },
  { key: 'icon_my_orders', title: '🏷️ 1:1 Square Logo Icon — "My Orders" Option' },
  { key: 'icon_track_order', title: '🏷️ 1:1 Square Logo Icon — "Track Order" Option' },
  { key: 'icon_contact_us', title: '🏷️ 1:1 Square Logo Icon — "Contact Us" Option' }
];

async function seedFourIcons() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🌱 Connected to MongoDB Atlas!');

    for (const item of FOUR_ICONS) {
      await FlowAsset.findOneAndUpdate(
        { assetKey: item.key },
        {
          assetKey: item.key,
          title: item.title,
          imageUrl: DEFAULT_1TO1_LOGO
        },
        { upsert: true, new: true }
      );
      console.log(`✅ Seeded 1:1 icon for "${item.key}"`);
    }

    console.log('\n🎉 All 4 1:1 option icons seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding 4 icons:', err);
    process.exit(1);
  }
}

seedFourIcons();
