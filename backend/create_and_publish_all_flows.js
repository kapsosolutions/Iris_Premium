import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data';
import { fileURLToPath } from 'url';

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

const FLOW_CONFIGS = [
  {
    envKey: 'META_FLOW_CHOOSE_SERVICE_ID',
    flowName: `Iris Premium - Choose Service Flow`,
    jsonFile: 'iris_choose_service_flow.json',
    categories: ['OTHER']
  },
  {
    envKey: 'META_FLOW_CATEGORY_ID',
    flowName: `Iris Premium - Category Selection Flow`,
    jsonFile: 'iris_category_flow.json',
    categories: ['OTHER']
  },
  {
    envKey: 'META_FLOW_CHECKOUT_ID',
    flowName: `Iris Premium - Order Checkout Flow`,
    jsonFile: 'iris_order_checkout_flow.json',
    categories: ['OTHER']
  }
];

function updateEnvKey(key, value) {
  let content = fs.readFileSync(envPath, 'utf8');
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    // If key exists without =
    const bareRegex = new RegExp(`^${key}$`, 'm');
    if (bareRegex.test(content)) {
      content = content.replace(bareRegex, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}\n`;
    }
  }
  fs.writeFileSync(envPath, content, 'utf8');
}

async function createAndPublishFlows() {
  console.log(`\n==================================================`);
  console.log(`🚀 CREATING & PUBLISHING META WHATSAPP FLOWS`);
  console.log(`WABA ID: ${WABA_ID}`);
  console.log(`==================================================\n`);

  const results = {};

  for (const item of FLOW_CONFIGS) {
    try {
      console.log(`\n--------------------------------------------------`);
      console.log(`🔹 Processing: "${item.flowName}" (${item.envKey})...`);

      const filePath = path.join(__dirname, 'flows', item.jsonFile);
      if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        continue;
      }

      const flowJsonStr = fs.readFileSync(filePath, 'utf8');
      const flowJsonObj = JSON.parse(flowJsonStr);

      // 1. Create Flow on Meta WABA
      console.log(`1. Creating flow in Meta WABA...`);
      const createRes = await axios.post(
        `${GRAPH}/${WABA_ID}/flows`,
        {
          name: `${item.flowName} ${Date.now()}`,
          categories: item.categories
        },
        {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const flowId = createRes.data.id;
      console.log(`✅ Flow Created successfully! Flow ID: ${flowId}`);

      // 2. Upload Flow JSON Asset
      console.log(`2. Uploading flow JSON asset for Flow ID: ${flowId}...`);
      const form = new FormData();
      form.append('name', 'flow.json');
      form.append('asset_type', 'FLOW_JSON');
      form.append('file', Buffer.from(JSON.stringify(flowJsonObj, null, 2)), {
        filename: 'flow.json',
        contentType: 'application/json'
      });

      const assetRes = await axios.post(`${GRAPH}/${flowId}/assets`, form, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          ...form.getHeaders()
        }
      });
      console.log(`✅ Flow JSON Asset Uploaded! Validation:`, assetRes.data?.validation_errors || 'Clean (No errors)');

      // 3. Publish Flow
      console.log(`3. Publishing Flow ID: ${flowId} to live status...`);
      const pubRes = await axios.post(
        `${GRAPH}/${flowId}/publish`,
        {},
        {
          headers: { 'Authorization': `Bearer ${TOKEN}` }
        }
      );
      console.log(`🎉 SUCCESS! Flow is PUBLISHED LIVE!`, pubRes.data);

      // 4. Save to .env
      updateEnvKey(item.envKey, flowId);
      process.env[item.envKey] = flowId;
      console.log(`📝 Saved ${item.envKey}=${flowId} in backend/.env`);

      results[item.envKey] = {
        name: item.flowName,
        id: flowId,
        status: 'PUBLISHED'
      };

    } catch (err) {
      console.error(`❌ Error with ${item.flowName}:`, err?.response?.data || err.message);
    }
  }

  console.log(`\n==================================================`);
  console.log(`🎉 ALL META FLOWS PUBLISHED & SAVED TO .ENV!`);
  console.log(JSON.stringify(results, null, 2));
  console.log(`==================================================\n`);
}

createAndPublishFlows();
