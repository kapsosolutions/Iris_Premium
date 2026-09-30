import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import FlowAsset from './models/FlowAsset.js';
import { urlToBase64 } from './services/imageBase64.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

const WABA_ID = process.env.WABA_ID;
const TOKEN = process.env.META_ACCESS_TOKEN;
const GRAPH = 'https://graph.facebook.com/v21.0';

if (!WABA_ID || !TOKEN) {
  console.error('❌ Error: WABA_ID and META_ACCESS_TOKEN are required in backend/.env');
  process.exit(1);
}

const CATEGORY_ITEMS_META = [
  { id: 'purpose_all', assetKey: 'icon_book_order', title: 'All Bottle Models', description: 'View entire artesian spring water collection' },
  { id: 'purpose_weddings', assetKey: 'purpose_icon_weddings', title: 'Marriages / Weddings', description: 'Personalized wedding monogram bottles' },
  { id: 'purpose_family', assetKey: 'purpose_icon_family', title: 'Family Functions', description: 'Custom celebration water bottles' },
  { id: 'purpose_hotels', assetKey: 'purpose_icon_hotels', title: 'Hotels & Resorts', description: 'Luxury hospitality artesian glass carafes' },
  { id: 'purpose_restaurants', assetKey: 'purpose_icon_restaurants', title: 'Restaurants & Cafes', description: 'Fine dining custom artesian spring water' },
  { id: 'purpose_bus', assetKey: 'purpose_icon_bus', title: 'Bus Travels', description: 'Convenient travel hydration bottles' },
  { id: 'purpose_hospitals', assetKey: 'purpose_icon_hospitals', title: 'Hospitals', description: 'Hygienic pure artesian spring water' },
  { id: 'purpose_malls', assetKey: 'purpose_icon_malls', title: 'Shopping Malls', description: 'Custom branded retail shopping bottles' },
  { id: 'purpose_house', assetKey: 'purpose_icon_house', title: 'House Purpose', description: 'Premium household artesian water' },
  { id: 'purpose_political', assetKey: 'purpose_icon_political', title: 'Political Events', description: 'Campaign event branded water bottles' },
  { id: 'purpose_jewelry', assetKey: 'purpose_icon_jewelry', title: 'Jewelry Shops', description: 'VIP client luxury welcome bottles' },
  { id: 'purpose_car', assetKey: 'purpose_icon_car', title: 'Car / Bike Showrooms', description: 'Showroom customer hospitality bottles' },
  { id: 'purpose_corporates', assetKey: 'purpose_icon_corporates', title: 'Corporates & Summits', description: 'Custom logo bulk corporate event bottles' },
  { id: 'purpose_caterings', assetKey: 'purpose_icon_caterings', title: 'Caterings & Events', description: 'Bulk catering event hydration' },
  { id: 'purpose_small_shops', assetKey: 'purpose_icon_small_shops', title: 'Small Shops & Outlets', description: 'Local shop retail water bottles' },
  { id: 'purpose_schools', assetKey: 'purpose_icon_schools', title: 'Schools & Colleges', description: 'Campus event hydration bottles' },
  { id: 'purpose_festivals', assetKey: 'purpose_icon_festivals', title: 'Festivals & Celebrations', description: 'Festival & grand celebration bottles' }
];

const DEFAULT_1TO1 = 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png';

export async function publishCategoryFlowWithImages() {
  console.log('Connecting to MongoDB Atlas...');
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  console.log('🌱 Connected to MongoDB Atlas!');

  console.log('Fetching FlowAsset documents for category icons...');
  const assets = await FlowAsset.find();
  const assetMap = new Map();
  for (const a of assets) {
    assetMap.set(a.assetKey, a.imageUrl);
  }

  console.log('Converting all 17 category icons to 1:1 base64 thumbnails (100x100, jpg quality 85)...');
  const dataSource = await Promise.all(
    CATEGORY_ITEMS_META.map(async (item) => {
      const imgUrl = assetMap.get(item.assetKey) || DEFAULT_1TO1;
      let b64 = '';
      try {
        b64 = await urlToBase64(imgUrl, { width: 100, height: 100, quality: 85, crop: 'fill', format: 'jpg' });
      } catch (e) {
        console.warn(`Failed to convert ${item.assetKey}:`, e.message);
      }

      const option = {
        id: item.id,
        title: item.title,
        description: item.description
      };
      if (b64) {
        option.image = b64;
      }
      return option;
    })
  );

  console.log(`Generated ${dataSource.length} options (with images: ${dataSource.filter(d => d.image).length})`);

  // Build the Flow JSON matching Meta Flows version 6.3 spec
  const flowObj = {
    version: "6.3",
    routing_model: {
      CATEGORY_MENU: []
    },
    screens: [
      {
        id: "CATEGORY_MENU",
        title: "Select Bottle Purpose / Event",
        terminal: true,
        success: true,
        layout: {
          type: "SingleColumnLayout",
          children: [
            {
              type: "RadioButtonsGroup",
              name: "selected_category",
              label: "Select Bottle Purpose / Event",
              required: true,
              "media-size": "regular",
              "data-source": dataSource
            },
            {
              type: "Footer",
              label: "View Matching Products",
              "on-click-action": {
                name: "complete",
                payload: {
                  selected_category: "${form.selected_category}"
                }
              }
            }
          ]
        }
      }
    ]
  };

  // Save flow JSON to backend/flows/iris_category_flow.json
  const flowPath = path.join(__dirname, 'flows', 'iris_category_flow.json');
  fs.writeFileSync(flowPath, JSON.stringify(flowObj, null, 2), 'utf8');
  console.log(`💾 Saved updated category flow to ${flowPath}`);

  // Create new flow in Meta WABA
  const flowName = `Iris Premium - Category Selection Flow ${Date.now()}`;
  console.log(`\n1. Creating Flow on Meta WABA: "${flowName}"...`);
  const createRes = await axios.post(
    `${GRAPH}/${WABA_ID}/flows`,
    {
      name: flowName,
      categories: ['OTHER']
    },
    {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const flowId = createRes.data.id;
  console.log(`✅ Flow Created on Meta! Flow ID: ${flowId}`);

  // Upload asset
  console.log(`2. Uploading Flow JSON asset to Flow ID ${flowId}...`);
  const form = new FormData();
  form.append('file', Buffer.from(JSON.stringify(flowObj)), { filename: 'flow.json', contentType: 'application/json' });
  form.append('name', 'flow.json');
  form.append('asset_type', 'FLOW_JSON');

  const assetRes = await axios.post(`${GRAPH}/${flowId}/assets`, form, {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      ...form.getHeaders()
    }
  });

  if (assetRes.data?.validation_errors?.length > 0) {
    console.error('❌ Validation Errors from Meta:', assetRes.data.validation_errors);
    throw new Error('Meta Flow validation failed: ' + JSON.stringify(assetRes.data.validation_errors));
  }
  console.log('✅ Flow JSON Asset Uploaded and Validated Successfully!');

  // Publish flow
  console.log(`3. Publishing Flow ID ${flowId}...`);
  const pubRes = await axios.post(`${GRAPH}/${flowId}/publish`, {}, {
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  });
  console.log('🎉 Flow Published Successfully!', pubRes.data);

  // Persist active category flow ID to MongoDB so all servers read it dynamically
  try {
    await FlowAsset.findOneAndUpdate(
      { assetKey: 'active_category_flow_id' },
      { title: 'Active Category Flow ID', imageUrl: 'https://whatsapp.com', textContent: flowId },
      { upsert: true, new: true }
    );
    console.log(`🌱 Saved active_category_flow_id=${flowId} in MongoDB!`);
  } catch (dbErr) {
    console.warn('Warning: Could not save active_category_flow_id to DB:', dbErr.message);
  }

  // Update .env if file exists (local development)
  if (fs.existsSync(envPath)) {
    try {
      let envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('META_FLOW_CATEGORY_ID=')) {
        envContent = envContent.replace(/META_FLOW_CATEGORY_ID=.*/g, `META_FLOW_CATEGORY_ID=${flowId}`);
      } else {
        envContent += `\nMETA_FLOW_CATEGORY_ID=${flowId}\n`;
      }
      fs.writeFileSync(envPath, envContent, 'utf8');
    } catch (e) {
      console.warn('Could not write to .env:', e.message);
    }
  }
  process.env.META_FLOW_CATEGORY_ID = flowId;
  console.log(`📝 Updated META_FLOW_CATEGORY_ID=${flowId} in process.env!`);

  return { success: true, flowId, flowName };
}

// If executed directly from CLI
if (process.argv[1] && process.argv[1].endsWith('publish_category_flow_live.js')) {
  publishCategoryFlowWithImages()
    .then((res) => {
      console.log('DONE!', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Publish Error:', err?.response?.data || err);
      process.exit(1);
    });
}
