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
const FLOW_1_ID = process.env.META_FLOW_CHOOSE_SERVICE_ID || '1137012078787664';
let FLOW_2_ID = process.env.META_FLOW_CATEGORY_ID;

const DEFAULT_BANNER = 'https://res.cloudinary.com/zavohueh/image/upload/v1787906868/iris_flow_images/n814gvf5xw27dq2lkd1j.png';
const DEFAULT_1TO1 = 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png';
const FALLBACK_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function publishBothFlows() {
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

    // ==========================================
    // 2. PUBLISH FLOW 1 (Original Welcome Service Flow)
    // ==========================================
    console.log(`\n==========================================`);
    console.log(`1. Uploading & Publishing FLOW 1 (Welcome Service Flow)...`);
    console.log(`Flow 1 ID: ${FLOW_1_ID}`);

    const flow1Path = path.join(process.cwd(), 'flows', 'iris_choose_service_flow.json');
    const flow1Obj = JSON.parse(fs.readFileSync(flow1Path, 'utf8'));

    if (bannerB64) {
      flow1Obj.screens[0].data.welcome_banner.__example__ = bannerB64;
    }
    flow1Obj.screens[0].data.services.__example__ = [
      { id: 'book_order', title: 'Book Order', description: 'Browse bottle catalog & 24K gold foil', image: bookB64 || FALLBACK_B64 },
      { id: 'my_orders', title: 'My Orders', description: 'View history & custom proof status', image: myOrdersB64 || FALLBACK_B64 },
      { id: 'track_order', title: 'Track Order', description: 'Live dispatch timeline', image: trackB64 || FALLBACK_B64 },
      { id: 'contact_us', title: 'Contact Us', description: 'Plant address & Google Maps', image: contactB64 || FALLBACK_B64 }
    ];

    const form1 = new FormData();
    form1.append('file', Buffer.from(JSON.stringify(flow1Obj)), { filename: 'flow.json', contentType: 'application/json' });
    form1.append('name', 'flow.json');
    form1.append('asset_type', 'FLOW_JSON');

    await axios.post(`https://graph.facebook.com/v21.0/${FLOW_1_ID}/assets`, form1, {
      headers: { 'Authorization': `Bearer ${TOKEN}`, ...form1.getHeaders() }
    });
    console.log('✅ Flow 1 Asset Uploaded Successfully!');

    await axios.post(`https://graph.facebook.com/v21.0/${FLOW_1_ID}/publish`, {}, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    console.log('🎉 SUCCESS! Flow 1 (Original Welcome Service Flow) Published Live!');

    // ==========================================
    // 3. CREATE OR GET FLOW 2 (Dedicated Category Flow)
    // ==========================================
    console.log(`\n==========================================`);
    console.log(`2. Setting up FLOW 2 (Dedicated Category Selection Flow)...`);

    if (!FLOW_2_ID) {
      console.log('Creating new Flow on Meta WABA for Category Selection...');
      const createRes = await axios.post(`https://graph.facebook.com/v21.0/${WABA_ID}/flows`, {
        name: `Iris Bottle Category Flow ${Date.now()}`,
        categories: ['OTHER']
      }, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });

      FLOW_2_ID = createRes.data.id;
      console.log(`✅ Flow 2 Created on Meta WABA with Flow ID: ${FLOW_2_ID}`);

      // Append META_FLOW_CATEGORY_ID to .env
      const envPath = path.join(process.cwd(), '.env');
      let envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('META_FLOW_CATEGORY_ID=')) {
        envContent = envContent.replace(/META_FLOW_CATEGORY_ID=.*/g, `META_FLOW_CATEGORY_ID=${FLOW_2_ID}`);
      } else {
        envContent += `\nMETA_FLOW_CATEGORY_ID=${FLOW_2_ID}\n`;
      }
      fs.writeFileSync(envPath, envContent);
      process.env.META_FLOW_CATEGORY_ID = FLOW_2_ID;
      console.log(`📝 Saved META_FLOW_CATEGORY_ID=${FLOW_2_ID} in .env!`);
    } else {
      console.log(`Flow 2 ID found: ${FLOW_2_ID}`);
    }

    // 4. Publish Flow 2 with 1:1 Base64 Image Icons
    const flow2Path = path.join(process.cwd(), 'flows', 'iris_category_flow.json');
    const flow2Obj = JSON.parse(fs.readFileSync(flow2Path, 'utf8'));

    const categoryImages = {
      purpose_all: bookB64 || FALLBACK_B64,
      purpose_weddings: weddingsB64 || FALLBACK_B64,
      purpose_family: familyB64 || FALLBACK_B64,
      purpose_hotels: hotelsB64 || FALLBACK_B64,
      purpose_restaurants: restaurantsB64 || FALLBACK_B64,
      purpose_bus: busB64 || FALLBACK_B64,
      purpose_hospitals: hospitalsB64 || FALLBACK_B64,
      purpose_malls: mallsB64 || FALLBACK_B64,
      purpose_house: houseB64 || FALLBACK_B64,
      purpose_political: politicalB64 || FALLBACK_B64,
      purpose_jewelry: jewelryB64 || FALLBACK_B64,
      purpose_car: carB64 || FALLBACK_B64,
      purpose_corporates: corporatesB64 || FALLBACK_B64,
      purpose_caterings: cateringsB64 || FALLBACK_B64,
      purpose_small_shops: smallShopsB64 || FALLBACK_B64,
      purpose_schools: schoolsB64 || FALLBACK_B64,
      purpose_festivals: festivalsB64 || FALLBACK_B64
    };

    const dataSource = flow2Obj.screens[0].layout.children[0]['data-source'];
    if (Array.isArray(dataSource)) {
      dataSource.forEach(item => {
        if (categoryImages[item.id]) {
          item.image = categoryImages[item.id];
        }
      });
    }

    const form2 = new FormData();
    form2.append('file', Buffer.from(JSON.stringify(flow2Obj)), { filename: 'flow.json', contentType: 'application/json' });
    form2.append('name', 'flow.json');
    form2.append('asset_type', 'FLOW_JSON');

    await axios.post(`https://graph.facebook.com/v21.0/${FLOW_2_ID}/assets`, form2, {
      headers: { 'Authorization': `Bearer ${TOKEN}`, ...form2.getHeaders() }
    });
    console.log('✅ Flow 2 Asset Uploaded Successfully!');

    await axios.post(`https://graph.facebook.com/v21.0/${FLOW_2_ID}/publish`, {}, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    console.log('🎉 SUCCESS! Flow 2 (Dedicated Category Flow) Published Live!');

    console.log(`\n==========================================`);
    console.log(`🚀 BOTH FLOWS PUBLISHED LIVE ON META WABA!`);
    console.log(`Flow 1 (Welcome Flow ID):  ${FLOW_1_ID}`);
    console.log(`Flow 2 (Category Flow ID): ${FLOW_2_ID}`);
    console.log(`==========================================\n`);

    process.exit(0);

  } catch (err) {
    console.error('❌ Meta Publish Error:', err?.response?.data || err.message);
    process.exit(1);
  }
}

publishBothFlows();
