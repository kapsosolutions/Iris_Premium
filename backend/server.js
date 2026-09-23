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
import brandRoutes from './routes/brands.js';

import Product from './models/Product.js';
import FlowAsset from './models/FlowAsset.js';
import ContactSettings from './models/ContactSettings.js';
import Brand from './models/Brand.js';

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

    // 4. Seed Initial Brands if empty
    const brandCount = await Brand.countDocuments();
    if (brandCount === 0) {
      console.log('🏷️ Seeding initial client brands...');
      await Brand.insertMany([
        { name: 'Mahindra', imageUrl: '/uploads/brands/1.png', order: 1, active: true },
        { name: 'HR Restaurant', imageUrl: '/uploads/brands/2.png', order: 2, active: true },
        { name: 'SSA Biriyani', imageUrl: '/uploads/brands/3.png', order: 3, active: true },
        { name: 'Hotel Riyaz Family Restaurant', imageUrl: '/uploads/brands/4.png', order: 4, active: true },
        { name: 'Barkaas Arabic Restaurant', imageUrl: '/uploads/brands/5.png', order: 5, active: true },
        { name: 'Ford', imageUrl: '/uploads/brands/6.png', order: 6, active: true },
        { name: 'Sairam Mallareddy Family Dhaba', imageUrl: '/uploads/brands/7.png', order: 7, active: true },
        { name: 'Royalaseema Restaurant', imageUrl: '/uploads/brands/8.png', order: 8, active: true },
        { name: 'Nellore Spice Multicuisine', imageUrl: '/uploads/brands/9.png', order: 9, active: true },
        { name: 'Sri Simhapuri Glass & Plywoods', imageUrl: '/uploads/brands/10.png', order: 10, active: true }
      ]);
      console.log('✅ 10 initial client brands seeded.');
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
app.use('/api/brands', brandRoutes);

// System Status Report Helper
function getStatusReport() {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  return {
    project: {
      name: 'Iris Premium Bottling Co. — Backend API',
      status: 'OPERATIONAL',
      version: '1.0.0',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    },
    database: {
      provider: 'MongoDB Atlas',
      status: dbStatusMap[dbState] || 'unknown',
      connected: dbState === 1
    },
    services: {
      cloudinary: {
        configured: Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
        status: process.env.CLOUDINARY_CLOUD_NAME ? 'active' : 'unconfigured',
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || null
      },
      metaWhatsApp: {
        configured: Boolean(process.env.META_ACCESS_TOKEN && process.env.WABA_ID),
        status: process.env.META_ACCESS_TOKEN ? 'active' : 'unconfigured',
        wabaId: process.env.WABA_ID || null,
        catalogId: process.env.META_CATALOG_ID || null
      }
    },
    endpoints: {
      root: { path: '/', method: 'GET', description: 'System and endpoint status', status: 'ACTIVE' },
      health: { path: '/health', method: 'GET', description: 'Health check probe', status: 'ACTIVE' },
      whatsappWebhook: { path: '/api/whatsapp/webhook', methods: ['GET', 'POST'], description: 'Meta WhatsApp webhook & message handler', status: 'ACTIVE' },
      whatsappFlowEndpoint: { path: '/api/whatsapp/flow-endpoint', methods: ['GET', 'POST'], description: 'Meta interactive flow data exchange', status: 'ACTIVE' },
      products: { path: '/api/products', methods: ['GET', 'POST', 'PUT', 'DELETE'], description: 'Product catalogue management & Meta sync', status: 'ACTIVE' },
      brands: { path: '/api/brands', methods: ['GET', 'POST', 'PUT', 'DELETE'], description: 'Client & partner brand logos management', status: 'ACTIVE' },
      orders: { path: '/api/orders', methods: ['GET', 'POST', 'PUT', 'DELETE'], description: 'Customer orders and invoice handling', status: 'ACTIVE' },
      flowAssets: { path: '/api/flow-assets', methods: ['GET', 'POST', 'PUT'], description: 'Meta flow banners and dropdown icons', status: 'ACTIVE' },
      leads: { path: '/api/leads', methods: ['GET', 'POST'], description: 'Customer leads and quotes capture', status: 'ACTIVE' },
      crm: { path: '/api/crm', methods: ['GET', 'POST'], description: 'WhatsApp live chat CRM & conversation management', status: 'ACTIVE' },
      contact: { path: '/api/contact', methods: ['GET', 'PUT'], description: 'Plant address, telephone and support details', status: 'ACTIVE' },
      adminAuth: { path: '/api/admin', methods: ['POST', 'GET'], description: 'Admin authentication and session validation', status: 'ACTIVE' },
      uploads: { path: '/uploads', method: 'GET', description: 'Static assets & locally uploaded documents/images', status: 'ACTIVE' }
    }
  };
}

// Root URL & Health Check — Returns Live Project Status & Endpoint Status in JSON
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(getStatusReport());
});

app.get('/health', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(getStatusReport());
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Iris Premium Backend Server running at http://localhost:${PORT}`);
});
