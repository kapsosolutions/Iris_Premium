import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const CATALOG_ID = process.env.META_CATALOG_ID || '1588495739954554';
const TOKEN = process.env.META_ACCESS_TOKEN;
const GRAPH = 'https://graph.facebook.com/v21.0';

const sampleProducts = [
  {
    retailer_id: 'iris_reserve_750',
    name: '750ml Heavy Glass Reserve',
    description: 'Flint heavy crystal glass with 24K gold foil waterproof label for premier hotels.',
    price: 9500, // 95.00 INR (in paise/cents)
    currency: 'INR',
    image_url: 'https://res.cloudinary.com/zavohueh/image/upload/v1/iris_premium/iris_reserve.jpg',
    brand: 'Iris Premium',
    availability: 'in stock',
    condition: 'new'
  },
  {
    retailer_id: 'iris_wedding_500',
    name: '500ml Monogram Wedding Glass',
    description: 'Custom rose gold & silver monogram embossed labels for royal reception tables.',
    price: 8500, // 85.00 INR
    currency: 'INR',
    image_url: 'https://res.cloudinary.com/zavohueh/image/upload/v1/iris_premium/iris_wedding.jpg',
    brand: 'Iris Premium',
    availability: 'in stock',
    condition: 'new'
  },
  {
    retailer_id: 'iris_matte_black_330',
    name: '330ml VIP Matte Black Label',
    description: 'Sleek matte black tactile finish bottle with metallic gold foil typography for VIPs.',
    price: 7500, // 75.00 INR
    currency: 'INR',
    image_url: 'https://res.cloudinary.com/zavohueh/image/upload/v1/iris_premium/iris_matte_black.jpg',
    brand: 'Iris Premium',
    availability: 'in stock',
    condition: 'new'
  },
  {
    retailer_id: 'iris_corporate_500',
    name: '500ml Corporate Premium PET',
    description: '100% Recyclable BPA-free heavy PET bottle with metallic brand logo label.',
    price: 4500, // 45.00 INR
    currency: 'INR',
    image_url: 'https://res.cloudinary.com/zavohueh/image/upload/v1/iris_premium/iris_corporate.jpg',
    brand: 'Iris Premium',
    availability: 'in stock',
    condition: 'new'
  }
];

async function syncCatalog() {
  console.log(`🛍️ Syncing Products to Meta Commerce Catalog ID: ${CATALOG_ID}...`);

  for (const item of sampleProducts) {
    try {
      const response = await axios.post(
        `${GRAPH}/${CATALOG_ID}/products`,
        item,
        {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`✅ Synced Product "${item.name}" (ID: ${item.retailer_id}) -> Meta Catalog! Response ID:`, response.data.id);
    } catch (error) {
      console.error(`⚠️ Catalog Sync Warning for "${item.name}":`, error?.response?.data || error.message);
    }
  }

  console.log('🎉 Meta Catalog Sync Attempt Finished!');
}

syncCatalog();
