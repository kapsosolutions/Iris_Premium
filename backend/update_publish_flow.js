import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data';
import mongoose from 'mongoose';
import FlowAsset from './models/FlowAsset.js';
import { urlToBase64 } from './services/imageBase64.js';

dotenv.config();

const WABA_ID = process.env.WABA_ID;
const TOKEN = process.env.META_ACCESS_TOKEN;
const FLOW_ID = process.env.META_FLOW_CHOOSE_SERVICE_ID || '1137012078787664';

const DEFAULT_BANNER = 'https://res.cloudinary.com/zavohueh/image/upload/v1787906868/iris_flow_images/n814gvf5xw27dq2lkd1j.png';
const DEFAULT_1TO1 = 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png';
const FALLBACK_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function updateAndPublishFlow() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🌱 Connected to MongoDB Atlas!');

    // 1. Fetch images from MongoDB
    const getAssetUrl = async (key, fallback) => {
      const a = await FlowAsset.findOne({ assetKey: key });
      return a?.imageUrl || fallback;
    };

    const bannerUrl = await getAssetUrl('choose_service_header', DEFAULT_BANNER);
    const bookUrl = await getAssetUrl('icon_book_order', DEFAULT_1TO1);
    const myOrdersUrl = await getAssetUrl('icon_my_orders', DEFAULT_1TO1);
    const trackUrl = await getAssetUrl('icon_track_order', DEFAULT_1TO1);
    const contactUrl = await getAssetUrl('icon_contact_us', DEFAULT_1TO1);

    // Purpose icons
    const weddingsUrl = await getAssetUrl('purpose_icon_weddings', DEFAULT_1TO1);
    const familyUrl = await getAssetUrl('purpose_icon_family', DEFAULT_1TO1);
    const hotelsUrl = await getAssetUrl('purpose_icon_hotels', DEFAULT_1TO1);
    const restaurantsUrl = await getAssetUrl('purpose_icon_restaurants', DEFAULT_1TO1);
    const busUrl = await getAssetUrl('purpose_icon_bus', DEFAULT_1TO1);
    const hospitalsUrl = await getAssetUrl('purpose_icon_hospitals', DEFAULT_1TO1);
    const mallsUrl = await getAssetUrl('purpose_icon_malls', DEFAULT_1TO1);
    const houseUrl = await getAssetUrl('purpose_icon_house', DEFAULT_1TO1);
    const politicalUrl = await getAssetUrl('purpose_icon_political', DEFAULT_1TO1);
    const jewelryUrl = await getAssetUrl('purpose_icon_jewelry', DEFAULT_1TO1);
    const carUrl = await getAssetUrl('purpose_icon_car', DEFAULT_1TO1);
    const corporatesUrl = await getAssetUrl('purpose_icon_corporates', DEFAULT_1TO1);
    const cateringsUrl = await getAssetUrl('purpose_icon_caterings', DEFAULT_1TO1);
    const smallShopsUrl = await getAssetUrl('purpose_icon_small_shops', DEFAULT_1TO1);
    const schoolsUrl = await getAssetUrl('purpose_icon_schools', DEFAULT_1TO1);
    const festivalsUrl = await getAssetUrl('purpose_icon_festivals', DEFAULT_1TO1);

    console.log('\nConverting banner URL & 1:1 logo URLs to Base64 strings...');
    const safeConvert = async (url, opts) => {
      try {
        const b64 = await urlToBase64(url, opts);
        return b64 || FALLBACK_B64;
      } catch (e) {
        return FALLBACK_B64;
      }
    };

    const [
      bannerB64, bookB64, myOrdersB64, trackB64, contactB64,
      weddingsB64, familyB64, hotelsB64, restaurantsB64, busB64,
      hospitalsB64, mallsB64, houseB64, politicalB64, jewelryB64,
      carB64, corporatesB64, cateringsB64, smallShopsB64, schoolsB64, festivalsB64
    ] = await Promise.all([
      safeConvert(bannerUrl, { width: 1600, height: 200, quality: 90, crop: 'fill', format: 'jpg' }),
      safeConvert(bookUrl, { width: 100, height: 100, quality: 90, crop: 'fill', format: 'jpg' }),
      safeConvert(myOrdersUrl, { width: 100, height: 100, quality: 90, crop: 'fill', format: 'jpg' }),
      safeConvert(trackUrl, { width: 100, height: 100, quality: 90, crop: 'fill', format: 'jpg' }),
      safeConvert(contactUrl, { width: 100, height: 100, quality: 90, crop: 'fill', format: 'jpg' }),
      safeConvert(weddingsUrl, { width: 100, height: 100, quality: 90, crop: 'fill', format: 'jpg' }),
      safeConvert(familyUrl, { width: 100, height: 100, quality: 90, crop: 'fill', format: 'jpg' }),
      safeConvert(hotelsUrl, { width: 100, height: 100, quality: 90, crop: 'fill', format: 'jpg' }),
      safeConvert(restaurantsUrl, { width: 100, height: 100, quality: 90, crop: 'fill', format: 'jpg' }),
      safeConvert(busUrl, { width: 100, height: 100, quality: 90, crop: 'fill', format: 'jpg' }),
      safeConvert(hospitalsUrl, { width: 100, height: 100, quality: 90, crop: 'fill', format: 'jpg' }),
      safeConvert(mallsUrl, { width: 100, height: 100, quality: 90, crop: 'fill', format: 'jpg' }),
      safeConvert(houseUrl, { width: 100, height: 100, quality: 90, crop: 'fill', format: 'jpg' }),
      safeConvert(politicalUrl, { width: 100, height: 100, quality: 90, crop: 'fill', format: 'jpg' }),
      safeConvert(jewelryUrl, { width: 100, height: 100, quality: 90, crop: 'fill', format: 'jpg' }),
      safeConvert(carUrl, { width: 100, height: 100, quality: 90, crop: 'fill', format: 'jpg' }),
      safeConvert(corporatesUrl, { width: 100, height: 100, quality: 90, crop: 'fill', format: 'jpg' }),
      safeConvert(cateringsUrl, { width: 100, height: 100, quality: 90, crop: 'fill', format: 'jpg' }),
      safeConvert(smallShopsUrl, { width: 100, height: 100, quality: 90, crop: 'fill', format: 'jpg' }),
      safeConvert(schoolsUrl, { width: 100, height: 100, quality: 90, crop: 'fill', format: 'jpg' }),
      safeConvert(festivalsUrl, { width: 100, height: 100, quality: 90, crop: 'fill', format: 'jpg' })
    ]);

    // 2. Load Flow JSON
    const flowJsonPath = path.join(process.cwd(), 'flows', 'iris_choose_service_flow.json');
    const flowObj = JSON.parse(fs.readFileSync(flowJsonPath, 'utf8'));

    // Inject valid Base64 string for banner example on Screen 0
    if (bannerB64) {
      flowObj.screens[0].data.welcome_banner.__example__ = bannerB64;
    }

    // Inject base64 examples for services on Screen 0
    flowObj.screens[0].data.services.__example__ = [
      { id: 'book_order', title: 'Book Order', description: 'Browse bottle catalog & 24K gold foil', image: bookB64 || FALLBACK_B64 },
      { id: 'my_orders', title: 'My Orders', description: 'View history & custom proof status', image: myOrdersB64 || FALLBACK_B64 },
      { id: 'track_order', title: 'Track Order', description: 'Live dispatch timeline', image: trackB64 || FALLBACK_B64 },
      { id: 'contact_us', title: 'Contact Us', description: 'Plant address & Google Maps', image: contactB64 || FALLBACK_B64 }
    ];

    // Inject base64 examples for all 16 exact website Purpose options on Screen 0
    flowObj.screens[0].data.purposes.__example__ = [
      { id: 'purpose_all', title: 'All Bottle Models', description: 'View entire artesian spring water collection', image: bookB64 || FALLBACK_B64 },
      { id: 'purpose_weddings', title: 'Marriages / Weddings', description: 'Personalized wedding monogram bottles', image: weddingsB64 || FALLBACK_B64 },
      { id: 'purpose_family', title: 'Family Functions', description: 'Custom celebration water bottles', image: familyB64 || FALLBACK_B64 },
      { id: 'purpose_hotels', title: 'Hotels & Resorts', description: 'Luxury hospitality artesian glass carafes', image: hotelsB64 || FALLBACK_B64 },
      { id: 'purpose_restaurants', title: 'Restaurants & Cafes', description: 'Fine dining custom artesian spring water', image: restaurantsB64 || FALLBACK_B64 },
      { id: 'purpose_bus', title: 'Bus Travels', description: 'Convenient travel hydration bottles', image: busB64 || FALLBACK_B64 },
      { id: 'purpose_hospitals', title: 'Hospitals', description: 'Hygienic pure artesian spring water', image: hospitalsB64 || FALLBACK_B64 },
      { id: 'purpose_malls', title: 'Shopping Malls', description: 'Custom branded retail shopping bottles', image: mallsB64 || FALLBACK_B64 },
      { id: 'purpose_house', title: 'House Purpose', description: 'Premium household artesian water', image: houseB64 || FALLBACK_B64 },
      { id: 'purpose_political', title: 'Political Events', description: 'Campaign event branded water bottles', image: politicalB64 || FALLBACK_B64 },
      { id: 'purpose_jewelry', title: 'Jewelry Shops', description: 'VIP client luxury welcome bottles', image: jewelryB64 || FALLBACK_B64 },
      { id: 'purpose_car', title: 'Car / Bike Showrooms', description: 'Showroom customer hospitality bottles', image: carB64 || FALLBACK_B64 },
      { id: 'purpose_corporates', title: 'Corporates & Summits', description: 'Custom logo bulk corporate event bottles', image: corporatesB64 || FALLBACK_B64 },
      { id: 'purpose_caterings', title: 'Caterings & Events', description: 'Bulk catering event hydration', image: cateringsB64 || FALLBACK_B64 },
      { id: 'purpose_small_shops', title: 'Small Shops & Outlets', description: 'Local shop retail water bottles', image: smallShopsB64 || FALLBACK_B64 },
      { id: 'purpose_schools', title: 'Schools & Colleges', description: 'Campus event hydration bottles', image: schoolsB64 || FALLBACK_B64 },
      { id: 'purpose_festivals', title: 'Festivals & Celebrations', description: 'Festival & grand celebration bottles', image: festivalsB64 || FALLBACK_B64 }
    ];

    // Configure Endpoint URI on Meta Flow
    const endpointUri = 'https://e5a9-2409-40f0-5052-f94a-dcd3-d3ca-9fc7-2ad5.ngrok-free.app/api/whatsapp/flow-endpoint';
    console.log(`\nSetting endpoint_uri: ${endpointUri} on Flow ID: ${FLOW_ID}...`);
    try {
      await axios.post(`https://graph.facebook.com/v21.0/${FLOW_ID}`, {
        endpoint_uri: endpointUri
      }, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      console.log('✅ Endpoint URI configured on Meta Flow ID!');
    } catch (e) {
      console.warn('Endpoint config warning:', e?.response?.data || e.message);
    }

    console.log(`\nUploading Single-Screen Dynamic Flow JSON asset to Meta Graph API for Flow ID: ${FLOW_ID}...`);
    const form = new FormData();
    form.append('file', Buffer.from(JSON.stringify(flowObj)), { filename: 'flow.json', contentType: 'application/json' });
    form.append('name', 'flow.json');
    form.append('asset_type', 'FLOW_JSON');

    const assetRes = await axios.post(`https://graph.facebook.com/v21.0/${FLOW_ID}/assets`, form, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        ...form.getHeaders()
      }
    });

    console.log('✅ Flow JSON Asset Uploaded Successfully!', assetRes.data);
    console.log('🎉 Single-Screen Dynamic Flow asset is ready for testing!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Meta Flow Process Error:', err?.response?.data || err.message);
    process.exit(1);
  }
}

updateAndPublishFlow();
