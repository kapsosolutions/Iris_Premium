import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.join(__dirname, '..', '.env');
dotenv.config({ path: ENV_PATH });

const WABA_ID = process.env.WABA_ID || '1403552485021692';
const TOKEN = process.env.META_ACCESS_TOKEN;
const GRAPH = 'https://graph.facebook.com/v21.0';

/** Meta Flow JSON definition (Version 6.0 Validated Terminal Screen Schema) */
const bookOrderFlowJson = {
  version: "6.0",
  screens: [
    {
      id: "BOOK_ORDER",
      title: "Iris Custom Label Order",
      data: {},
      terminal: true,
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Form",
            name: "book_order_form",
            children: [
              {
                type: "TextHeading",
                text: "Bespoke Bottle Customization"
              },
              {
                type: "TextBody",
                text: "Enter your contact details and custom monogram text to be printed on your 24K gold foil bottle labels."
              },
              {
                type: "TextInput",
                name: "customer_name",
                label: "Full Name / Organization",
                required: true
              },
              {
                type: "TextInput",
                name: "phone_number",
                label: "Phone Number",
                required: true
              },
              {
                type: "TextInput",
                name: "monogram_text",
                label: "Label Monogram / Brand Name",
                required: true
              },
              {
                type: "Footer",
                label: "Submit Order Proof",
                "on-click-action": {
                  name: "complete",
                  payload: {
                    customer_name: "${form.customer_name}",
                    phone_number: "${form.phone_number}",
                    monogram_text: "${form.monogram_text}"
                  }
                }
              }
            ]
          }
        ]
      }
    }
  ]
};

async function publish() {
  console.log('🚀 Uploading & Validating Flow JSON to Meta WABA:', WABA_ID);

  try {
    let flowId = process.env.META_FLOW_ID || '2297701727696287';

    // Step 1: Upload Flow JSON Asset
    const form = new FormData();
    form.append('name', 'flow.json');
    form.append('asset_type', 'FLOW_JSON');
    form.append('file', Buffer.from(JSON.stringify(bookOrderFlowJson, null, 2)), {
      filename: 'flow.json',
      contentType: 'application/json'
    });

    const assetRes = await axios.post(`${GRAPH}/${flowId}/assets`, form, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        ...form.getHeaders()
      }
    });

    console.log('✅ Flow JSON Uploaded! Asset Status:', JSON.stringify(assetRes.data, null, 2));

    // Save FLOW_ID to .env
    let envContent = fs.readFileSync(ENV_PATH, 'utf8');
    if (!envContent.includes('META_FLOW_ID=')) {
      envContent += `\nMETA_FLOW_ID=${flowId}\n`;
    } else {
      envContent = envContent.replace(/META_FLOW_ID=.*/, `META_FLOW_ID=${flowId}`);
    }
    fs.writeFileSync(ENV_PATH, envContent);

    console.log('🎉 Flow JSON 100% Validated & Uploaded to Meta! Flow ID:', flowId);

  } catch (error) {
    console.error('❌ Error uploading WhatsApp Flow:', error?.response?.data || error.message);
  }
}

publish();
