import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const sampleProducts = [
  {
    name: 'Iris Glass Reserve carafe',
    category: 'Hotels & Resorts',
    badge: 'LUXURY HOSPITALITY',
    bottleSize: '750 ml',
    price: 45,
    description: 'Heavy flint glass carafe with 24K gold foil branding for luxury suites & dining.',
    mainImage: 'https://res.cloudinary.com/zavohueh/image/upload/v1787489559/iris_glass_bottle_reserve_1787489559152.jpg',
    active: true
  },
  {
    name: 'Iris Wedding Monogram Bottle',
    category: 'Marriages / Weddings',
    badge: 'WEDDING COLLECTION',
    bottleSize: '500 ml',
    price: 35,
    description: 'Custom monogram & couple name foil embossed glass bottle for grand receptions.',
    mainImage: 'https://res.cloudinary.com/zavohueh/image/upload/v1787489574/iris_wedding_bottle_1787489574629.jpg',
    active: true
  },
  {
    name: 'Iris Fine Dining Water Bottle',
    category: 'Restaurants & Cafes',
    badge: 'FINE DINING',
    bottleSize: '750 ml',
    price: 40,
    description: 'Custom restaurant logo artesian water vessel with high clarity finish.',
    mainImage: 'https://res.cloudinary.com/zavohueh/image/upload/v1787489597/iris_matte_black_bottle_1787489597869.jpg',
    active: true
  },
  {
    name: 'Iris Corporate Summit Edition',
    category: 'Corporates & Summits',
    badge: 'CORPORATE GIFTING',
    bottleSize: '500 ml',
    price: 30,
    description: 'Bulk corporate branded spring water for leadership summits & VIP client meets.',
    mainImage: 'https://res.cloudinary.com/zavohueh/image/upload/v1787489586/iris_corporate_bottle_1787489586903.jpg',
    active: true
  },
  {
    name: 'Iris Family Celebration Bottle',
    category: 'Family Functions',
    badge: 'CELEBRATION',
    bottleSize: '500 ml',
    price: 28,
    description: 'Custom family function & anniversary special edition water bottles.',
    mainImage: 'https://res.cloudinary.com/zavohueh/image/upload/v1787489574/iris_wedding_bottle_1787489574629.jpg',
    active: true
  },
  {
    name: 'Iris Bus Travel Hydration Pack',
    category: 'Bus Travels',
    badge: 'TRAVEL PACK',
    bottleSize: '250 ml',
    price: 15,
    description: 'Convenient travel size pure artesian water bottles for luxury buses.',
    mainImage: 'https://res.cloudinary.com/zavohueh/image/upload/v1787489586/iris_corporate_bottle_1787489586903.jpg',
    active: true
  },
  {
    name: 'Iris Hygienic Care Bottle',
    category: 'Hospitals',
    badge: 'PURE HYGIENE',
    bottleSize: '500 ml',
    price: 20,
    description: 'Sterilized medical grade artesian spring water for private hospital wards.',
    mainImage: 'https://res.cloudinary.com/zavohueh/image/upload/v1787489559/iris_glass_bottle_reserve_1787489559152.jpg',
    active: true
  },
  {
    name: 'Iris Mall Retail Branded Bottle',
    category: 'Shopping Malls',
    badge: 'RETAIL BRANDED',
    bottleSize: '500 ml',
    price: 25,
    description: 'Custom shopping mall logo bottled water for shoppers & lounge areas.',
    mainImage: 'https://res.cloudinary.com/zavohueh/image/upload/v1787489597/iris_matte_black_bottle_1787489597869.jpg',
    active: true
  },
  {
    name: 'Iris House Pure Water Carafe',
    category: 'House Purpose',
    badge: 'HOME LUXURY',
    bottleSize: '1000 ml',
    price: 50,
    description: '1 Litre pure artesian spring water carafe for luxury home dining tables.',
    mainImage: 'https://res.cloudinary.com/zavohueh/image/upload/v1787489559/iris_glass_bottle_reserve_1787489559152.jpg',
    active: true
  },
  {
    name: 'Iris Campaign Event Bottle',
    category: 'Political Events',
    badge: 'CAMPAIGN EDITION',
    bottleSize: '250 ml',
    price: 12,
    description: 'Bulk campaign event & rally custom branded water bottles.',
    mainImage: 'https://res.cloudinary.com/zavohueh/image/upload/v1787489586/iris_corporate_bottle_1787489586903.jpg',
    active: true
  },
  {
    name: 'Iris VIP Jewelry Lounge Carafe',
    category: 'Jewelry Shops',
    badge: 'VIP HOSPITALITY',
    bottleSize: '500 ml',
    price: 45,
    description: 'Gold foil embossed water bottle for high-value jewelry showroom clients.',
    mainImage: 'https://res.cloudinary.com/zavohueh/image/upload/v1787489597/iris_matte_black_bottle_1787489597869.jpg',
    active: true
  },
  {
    name: 'Iris Auto Showroom Welcome Bottle',
    category: 'Car / Bike Showrooms',
    badge: 'SHOWROOM VIP',
    bottleSize: '500 ml',
    price: 32,
    description: 'Custom automotive brand logo water bottle for test drive customers.',
    mainImage: 'https://res.cloudinary.com/zavohueh/image/upload/v1787489586/iris_corporate_bottle_1787489586903.jpg',
    active: true
  },
  {
    name: 'Iris Event Catering Pack',
    category: 'Caterings & Events',
    badge: 'BULK CATERING',
    bottleSize: '500 ml',
    price: 22,
    description: 'Bulk event catering hydration bottles with custom caterer branding.',
    mainImage: 'https://res.cloudinary.com/zavohueh/image/upload/v1787489574/iris_wedding_bottle_1787489574629.jpg',
    active: true
  },
  {
    name: 'Iris Local Outlet Branded Bottle',
    category: 'Small Shops & Outlets',
    badge: 'OUTLET SPECIAL',
    bottleSize: '250 ml',
    price: 14,
    description: 'Branded water bottles for boutique stores & local business outlets.',
    mainImage: 'https://res.cloudinary.com/zavohueh/image/upload/v1787489586/iris_corporate_bottle_1787489586903.jpg',
    active: true
  },
  {
    name: 'Iris Campus Festival Bottle',
    category: 'Schools & Colleges',
    badge: 'CAMPUS EDITION',
    bottleSize: '500 ml',
    price: 18,
    description: 'Custom college fest & sports meet hydration water bottles.',
    mainImage: 'https://res.cloudinary.com/zavohueh/image/upload/v1787489574/iris_wedding_bottle_1787489574629.jpg',
    active: true
  },
  {
    name: 'Iris Grand Festival Celebration Pack',
    category: 'Festivals & Celebrations',
    badge: 'FESTIVAL SPECIAL',
    bottleSize: '500 ml',
    price: 30,
    description: 'Festive design custom water bottles for Diwali, New Year & grand galas.',
    mainImage: 'https://res.cloudinary.com/zavohueh/image/upload/v1787489597/iris_matte_black_bottle_1787489597869.jpg',
    active: true
  }
];

async function seedCategoryProducts() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🌱 Connected to MongoDB Atlas!');

    console.log('Clearing old product catalog...');
    await Product.deleteMany({});

    console.log('Seeding 16 Category Products into MongoDB Atlas...');
    await Product.insertMany(sampleProducts);

    console.log('🎉 SUCCESS! All 16 Category Products seeded successfully into MongoDB Atlas!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err.message);
    process.exit(1);
  }
}

seedCategoryProducts();
