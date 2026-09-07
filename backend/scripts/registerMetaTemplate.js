import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const WABA_ID = process.env.WABA_ID || '1403552485021692';
const TOKEN = process.env.META_ACCESS_TOKEN;
const GRAPH_URL = `https://graph.facebook.com/v21.0/${WABA_ID}/message_templates`;

const headerImageUrl = process.env.META_ORDER_HEADER_IMAGE_URL || 'https://res.cloudinary.com/zavohueh/image/upload/v1787890832/iris_order_headers/order_request_header_banner.jpg';

async function registerTemplate() {
  console.log(`🚀 Submitting WhatsApp Image Header Template 'order_requested_notice' to Meta WABA (${WABA_ID})...`);

  // Meta v21.0 Payload for Outbound Image Header Template Message
  const templatePayload = {
    name: 'order_requested_notice',
    category: 'UTILITY',
    allow_category_change: true,
    language: 'en_US',
    components: [
      {
        type: 'HEADER',
        format: 'IMAGE',
        example: {
          header_url: [headerImageUrl]
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
            type: 'QUICK_REPLY',
            text: 'Choose Service'
          }
        ]
      }
    ]
  };

  try {
    const res = await axios.post(GRAPH_URL, templatePayload, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🎉 SUCCESS! Meta Image Header Template Created & Submitted for Approval!', res.data);
  } catch (err) {
    console.error('⚠️ Template Submission Result:', err?.response?.data || err.message);
  }
}

registerTemplate();
