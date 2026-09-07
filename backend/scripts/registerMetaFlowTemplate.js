import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const WABA_ID = process.env.WABA_ID || '1403552485021692';
const APP_ID = process.env.APP_ID || '4564195660518860';
const TOKEN = process.env.META_ACCESS_TOKEN;
const FLOW_ID = process.env.META_FLOW_CHOOSE_SERVICE_ID || '1137012078787664';
const GRAPH_URL = `https://graph.facebook.com/v21.0`;

async function registerFlowTemplate() {
  console.log(`🚀 Creating Resumable Upload Session on Meta Graph API...`);
  let headerHandle = '';

  try {
    const imagePath = path.join(__dirname, '..', '..', 'public', 'order_header.jpg');
    const fileStats = fs.statSync(imagePath);
    
    // 1. Create upload session
    const sessionRes = await axios.post(`${GRAPH_URL}/${APP_ID}/uploads`, null, {
      params: {
        file_length: fileStats.size,
        file_type: 'image/jpeg',
        access_token: TOKEN
      }
    });

    const uploadSessionId = sessionRes.data.id;
    console.log('✅ Created Upload Session ID:', uploadSessionId);

    // 2. Upload file bytes
    const fileData = fs.readFileSync(imagePath);
    const fileUploadRes = await axios.post(`${GRAPH_URL}/${uploadSessionId}`, fileData, {
      headers: {
        'Authorization': `OAuth ${TOKEN}`,
        'file_offset': '0',
        'Content-Type': 'image/jpeg'
      }
    });

    headerHandle = fileUploadRes.data.h;
    console.log('✅ Obtained Meta Sample Header Handle (h):', headerHandle);
  } catch (uploadErr) {
    console.error('❌ Resumable Upload Error:', uploadErr?.response?.data || uploadErr.message);
  }

  if (!headerHandle) {
    console.error('Cannot proceed without valid Meta header handle');
    return;
  }

  // 3. Register Meta Template with IMAGE Header + FLOW CTA Button
  console.log(`🚀 Submitting Template 'order_requested_flow' to Meta WABA (${WABA_ID})...`);

  const templatePayload = {
    name: 'order_requested_flow',
    category: 'UTILITY',
    allow_category_change: true,
    language: 'en_US',
    components: [
      {
        type: 'HEADER',
        format: 'IMAGE',
        example: {
          header_handle: [headerHandle]
        }
      },
      {
        type: 'BODY',
        text: 'Hello {{1}}, thank you for choosing Iris Premium! Your order request for {{2}} (Quantity: {{3}} bottles for {{4}}) has been received by our concierge team. We will review your proof and contact you shortly.',
        example: {
          body_text: [['Ramesh', 'Iris Hotel', '500', 'Hospitality Banquet']]
        }
      },
      {
        type: 'FOOTER',
        text: 'IRIS PREMIUM CUSTOMISED LABEL WATER'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'FLOW',
            text: 'Choose Service',
            flow_id: FLOW_ID,
            flow_action: 'navigate',
            navigate_screen: 'SERVICE_MENU'
          }
        ]
      }
    ]
  };

  try {
    const res = await axios.post(`${GRAPH_URL}/${WABA_ID}/message_templates`, templatePayload, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🎉 SUCCESS! Meta Template with IMAGE Header & FLOW CTA Button Created!', res.data);
  } catch (err) {
    console.error('⚠️ Template Creation Result:', err?.response?.data || err.message);
  }
}

registerFlowTemplate();
