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

/** 1. Choose Service Flow JSON (Version 6.0) — 8:1 Banner Ratio (1000x125) matching Kavitha_PG */
const chooseServiceFlowJson = {
  version: "6.0",
  screens: [
    {
      id: "SERVICE_MENU",
      title: "Select Service",
      data: {},
      terminal: true,
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Image",
            src: "https://res.cloudinary.com/zavohueh/image/upload/v1787627656/iris_premium_bottles/iris_reserve.jpg",
            width: 1000,
            height: 125,
            "scale-type": "cover",
            "alt-text": "Iris Premium Bottling Co."
          },
          {
            type: "TextSubheading",
            text: "Choose from one of the Iris Services"
          },
          {
            type: "Dropdown",
            name: "selected_service",
            label: "Select Iris Service",
            required: true,
            "data-source": [
              { id: "book_order", title: "📦 Book Order — Browse bottle catalog & 24K gold foil" },
              { id: "my_orders", title: "📋 My Orders — View history & custom proof status" },
              { id: "track_order", title: "🚚 Track Order — Live dispatch timeline" },
              { id: "contact_us", title: "📞 Contact Us — Plant address & Google Maps" }
            ]
          },
          {
            type: "Footer",
            label: "Confirm",
            "on-click-action": {
              name: "complete",
              payload: {
                selected_service: "${form.selected_service}"
              }
            }
          }
        ]
      }
    }
  ]
};

/** 2. Book Order Customization Flow JSON */
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
                label: "Contact Phone Number",
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

/** 3. My Orders Flow JSON */
const myOrdersFlowJson = {
  version: "6.0",
  screens: [
    {
      id: "MY_ORDERS",
      title: "Your Bottle Orders",
      data: {},
      terminal: true,
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "TextHeading",
            text: "📋 Order History & Status"
          },
          {
            type: "TextBody",
            text: "View your past orders, bottle quantities, and digital proof status below."
          },
          {
            type: "RadioButtonsGroup",
            name: "selected_order_action",
            label: "Order Action",
            required: true,
            "data-source": [
              { id: "view_latest_order", title: "View Latest Order Status", description: "See current dispatch step & total amount" },
              { id: "download_pdf_invoice", title: "Request PDF Invoice", description: "Receive dynamic formal tax invoice on WhatsApp" }
            ]
          },
          {
            type: "Footer",
            label: "View Order Details",
            "on-click-action": {
              name: "complete",
              payload: {
                order_action: "${form.selected_order_action}"
              }
            }
          }
        ]
      }
    }
  ]
};

/** 4. Track Order Flow JSON */
const trackOrderFlowJson = {
  version: "6.0",
  screens: [
    {
      id: "TRACK_ORDER",
      title: "Live Order Tracking",
      data: {},
      terminal: true,
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "TextHeading",
            text: "🚚 Shipment Tracking"
          },
          {
            type: "TextBody",
            text: "Select a tracking action to view live dispatch timeline and delivery ETA."
          },
          {
            type: "RadioButtonsGroup",
            name: "track_action",
            label: "Tracking Action",
            required: true,
            "data-source": [
              { id: "live_status", title: "Live Production Status", description: "Filling, 24K Gold Foil Printing & Quality Check" },
              { id: "dispatch_eta", title: "Delivery Fleet ETA", description: "Out for delivery timeline to your venue" }
            ]
          },
          {
            type: "Footer",
            label: "Get Live Tracking",
            "on-click-action": {
              name: "complete",
              payload: {
                track_action: "${form.track_action}"
              }
            }
          }
        ]
      }
    }
  ]
};

const FLOW_DEFINITIONS = [
  { key: 'META_FLOW_CHOOSE_SERVICE_ID', name: 'Iris Premium - 8:1 Banner Service Flow', json: chooseServiceFlowJson }
];

async function publishFlows() {
  console.log('🚀 Publishing 8:1 Banner Ratio Service Flow to Meta WABA:', WABA_ID);
  const envUpdates = {};

  for (const item of FLOW_DEFINITIONS) {
    try {
      console.log(`\n=== Creating Flow: "${item.name}" ===`);
      
      const createRes = await axios.post(
        `${GRAPH}/${WABA_ID}/flows`,
        {
          name: item.name,
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
      console.log(`✅ Flow Created! Flow ID: ${flowId}`);

      const form = new FormData();
      form.append('name', 'flow.json');
      form.append('asset_type', 'FLOW_JSON');
      form.append('file', Buffer.from(JSON.stringify(item.json, null, 2)), {
        filename: 'flow.json',
        contentType: 'application/json'
      });

      const assetRes = await axios.post(`${GRAPH}/${flowId}/assets`, form, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          ...form.getHeaders()
        }
      });
      console.log(`✅ Flow JSON Uploaded! Status:`, assetRes.data);

      const pubRes = await axios.post(
        `${GRAPH}/${flowId}/publish`,
        {},
        {
          headers: { 'Authorization': `Bearer ${TOKEN}` }
        }
      );
      console.log(`🎉 PUBLISHED LIVE ON META! Response:`, pubRes.data);

      envUpdates[item.key] = flowId;

    } catch (err) {
      console.error(`❌ Error on flow "${item.name}":`, err?.response?.data || err.message);
    }
  }

  let envContent = fs.readFileSync(ENV_PATH, 'utf8');
  for (const [k, v] of Object.entries(envUpdates)) {
    if (!envContent.includes(`${k}=`)) {
      envContent += `\n${k}=${v}`;
    } else {
      envContent = envContent.replace(new RegExp(`${k}=.*`), `${k}=${v}`);
    }
  }
  fs.writeFileSync(ENV_PATH, envContent);

  console.log('\n==================================================');
  console.log('🎉 8:1 BANNER RATIO SERVICE FLOW PUBLISHED LIVE ON META!');
  console.log('New Flow ID saved to backend/.env:', envUpdates);
  console.log('==================================================\n');
}

publishFlows();
