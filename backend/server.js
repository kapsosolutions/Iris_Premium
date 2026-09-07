import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import whatsappRoutes from './routes/whatsapp.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import flowAssetRoutes from './routes/flowAssets.js';
import adminAuthRoutes from './routes/adminAuth.js';
import contactRoutes from './routes/contact.js';
import leadRoutes from './routes/leads.js';
import whatsappCrmRoutes from './routes/whatsappCrm.js';

import Product from './models/Product.js';
import FlowAsset from './models/FlowAsset.js';
import ContactSettings from './models/ContactSettings.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/invoices', express.static(path.join(__dirname, 'uploads/invoices')));

// Database Connection & Auto Seed
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('🌱 Connected to MongoDB Atlas successfully!');
    await seedDatabase();
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

async function seedDatabase() {
  try {
    // Product seeding disabled to respect user deletion of products.

    // 2. Seed Initial Flow Assets if empty
    const assetCount = await FlowAsset.countDocuments();
    if (assetCount === 0) {
      console.log('🖼️ Seeding initial flow assets...');
      await FlowAsset.insertMany([
        {
          assetKey: 'choose_service_header',
          title: 'Choose Service Header Image',
          imageUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787627656/iris_premium_bottles/iris_reserve.jpg'
        },
        {
          assetKey: 'catalog_header',
          title: 'Catalogue List Header Image',
          imageUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787627656/iris_premium_bottles/iris_reserve.jpg'
        },
        {
          assetKey: 'my_orders_header',
          title: 'My Orders Header Image',
          imageUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787627656/iris_premium_bottles/iris_wedding.jpg'
        },
        {
          assetKey: 'track_order_header',
          title: 'Track Order Header Image',
          imageUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787627656/iris_premium_bottles/iris_matte_black.jpg'
        },
        {
          assetKey: 'contact_header',
          title: 'Contact Us Header Image',
          imageUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787627656/iris_premium_bottles/iris_corporate.jpg'
        }
      ]);
      console.log('✅ Flow assets seeded.');
    }

    // 3. Seed Contact Settings if empty
    const contactCount = await ContactSettings.countDocuments();
    if (contactCount === 0) {
      console.log('📞 Seeding initial contact settings...');
      await ContactSettings.create({
        officeAddress: 'Iris Premium Bottling Plant, 100 Alpine Spring Way, Nellore, Andhra Pradesh',
        phoneNumbers: ['+91 98765 43210', '+91 800 474 7900'],
        whatsappNumber: '+91 98765 43210',
        email: 'concierge@irispremium.com',
        googleMapsUrl: 'https://www.google.com/maps/place/Iris+premium/@14.3879365,79.9383584,711m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3a4cf3007401bc1f:0x7a372ed8b7f3ef23!8m2!3d14.3879365!4d79.9383584!16s%2Fg%2F11z8ncf7r7'
      });
    }

  } catch (err) {
    console.error('Database seed error:', err.message);
  }
}

// Routes
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/flow-assets', flowAssetRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/crm', whatsappCrmRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Iris Premium Backend API', timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Iris Premium Backend Server running at http://localhost:${PORT}`);
});
